const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');

test('event covers use one source with legacy fallback and preserve section images', () => {
  const {eventVisual} = load('lib/event-detail.ts');
  const hero={type:'Hero',image:'https://example.invalid/legacy.jpg'};
  const event={banner:'https://example.invalid/cover.jpg',blocks:[hero]};
  assert.equal(eventVisual(event,hero).src,event.banner);
  assert.equal(eventVisual(event).src,event.banner);
  assert.equal(eventVisual({...event,banner:''}).src,hero.image);
  assert.equal(eventVisual({...event,banner:'',blocks:[]}),null);
  assert.equal(eventVisual(event,{type:'Partner',image:'https://example.invalid/partner.jpg'}).src,'https://example.invalid/partner.jpg');
});

function serverFixture({failCommit=false,failBroadcast=false}={}) {
  const calls=[];
  const client={rpc:async()=>{calls.push('commit');return {error:failCommit?{code:'40001',message:'Conflict'}:null};},channel:topic=>({send:async(message,options)=>{calls.push({topic,message,options});if(failBroadcast)throw Error('Offline');return 'ok';}}),removeChannel:async()=>{calls.push('cleanup');return 'ok';}};
  const platform=load('lib/server/platform.ts',{'@/lib/supabase/server':{getServiceSupabaseClient:()=>client}});
  return {calls,platform};
}

test('only committed public content sends an empty invalidation, never record data', async()=>{
  const {calls,platform}=serverFixture();
  await platform.commit([{collection:'events',id:'event',data:{meetingPasscode:'private',banner:'https://example.invalid/cover.jpg'}}]);
  assert.equal(calls[0],'commit');
  assert.deepEqual(calls[1].message,{type:'broadcast',event:'content-changed',payload:{}});
  assert.equal(calls[1].topic,'awan-public-content');
  assert.equal(calls[2],'cleanup');
  calls.length=0;
  await platform.commit([{collection:'registrations',id:'person',data:{email:'private@example.invalid'}}]);
  assert.deepEqual(calls,['commit']);
  const failed=serverFixture({failCommit:true});
  await assert.rejects(()=>failed.platform.commit([{collection:'cms',id:'Home',data:{}}]),/Data sudah berubah/);
  assert.deepEqual(failed.calls,['commit']);
});

test('notification failure cannot turn a saved change into a failed save',async()=>{
  const {calls,platform}=serverFixture({failBroadcast:true});
  await platform.commit([{collection:'cms',id:'Home',data:{}}]);
  assert.equal(calls.at(-1),'cleanup');
});

test('live notifications, local tabs, fallback and reconnect refresh safely and clean up',async()=>{
  const saved=Object.fromEntries(['window','document','navigator','BroadcastChannel','setTimeout','clearTimeout','setInterval','clearInterval'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const timers=new Map(),intervals=new Map(),events=new Map();let serial=0,refreshes=0,removed=0;
  const target={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:(name)=>events.delete(name)};
  let receive,status,local;
  const channel={on:(_type,_filter,fn)=>{receive=fn;return channel;},subscribe:fn=>{status=fn;return channel;}};
  const client={channel:()=>channel,removeChannel:async value=>{assert.equal(value,channel);removed++;}};
  try {
    Object.defineProperty(globalThis,'window',{value:target,configurable:true});
    Object.defineProperty(globalThis,'document',{value:{...target,visibilityState:'visible'},configurable:true});
    Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
    Object.defineProperty(globalThis,'BroadcastChannel',{value:class {constructor(){local=this;}postMessage(value){this.sent=value;}close(){this.closed=true;}},configurable:true});
    globalThis.setTimeout=fn=>{const id=++serial;timers.set(id,fn);return id;};globalThis.clearTimeout=id=>timers.delete(id);
    globalThis.setInterval=fn=>{const id=++serial;intervals.set(id,fn);return id;};globalThis.clearInterval=id=>intervals.delete(id);
    const flush=()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());};
    const sync=load('lib/platform-sync.ts').listenForContentChanges(client,async()=>{refreshes++;});
    receive({payload:{state:'untrusted'}});receive({});status('SUBSCRIBED');flush();assert.equal(refreshes,1);
    sync.notify();assert.equal(local.sent,'content-changed');
    local.onmessage({data:{state:'forged'}});flush();assert.equal(refreshes,1);
    local.onmessage({data:'content-changed'});flush();assert.equal(refreshes,2);
    document.visibilityState='hidden';receive({});intervals.values().next().value();flush();assert.equal(refreshes,2);
    document.visibilityState='visible';events.get('visibilitychange')();flush();assert.equal(refreshes,3);
    navigator.onLine=false;receive({});flush();assert.equal(refreshes,3);
    navigator.onLine=true;events.get('online')();flush();assert.equal(refreshes,4);
    intervals.values().next().value();flush();assert.equal(refreshes,5);
    receive({});sync.dispose();flush();assert.equal(refreshes,5);assert.equal(removed,1);assert.equal(local.closed,true);assert.equal(intervals.size,0);assert.equal(events.size,0);
    receive({});flush();assert.equal(refreshes,5);
  } finally {
    for(const [key,descriptor] of Object.entries(saved))if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
  }
});
