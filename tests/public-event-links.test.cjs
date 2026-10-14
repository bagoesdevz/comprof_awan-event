const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('./load-source.cjs');
const {exampleEvent}=load('lib/example-event.ts');
const {isEventPublicCode,publicEventLink}=load('lib/event-sharing.ts');

test('legacy event link initialization is authorized, batched, unique and idempotent without changing slugs',async()=>{
  const guards=load('lib/server/platform.ts',{'@/lib/supabase/server':{}});
  const rows=Array.from({length:102},(_,i)=>({id:'event-'+i,revision:3,published:i%2===0,owner_email:null,data:{...structuredClone(exampleEvent),id:'event-'+i,slug:'legacy-'+i}}));
  rows.push({id:'existing',revision:4,published:true,owner_email:null,data:{...structuredClone(exampleEvent),publicCode:'a'.repeat(32)}});
  const batches=[];let reads=0;
  const {ensureEventPublicLinks}=load('lib/server/event-links.ts',{'./platform':{
    requireAdmin:guards.requireAdmin,
    records:async()=>{reads++;return rows;},
    commit:async changes=>{batches.push(changes);for(const change of changes)rows.find(row=>row.id===change.id).data=change.data;},
  }});
  await assert.rejects(ensureEventPublicLinks({email:'participant@example.invalid',app_metadata:{role:'participant'}}),error=>error.status===403);
  assert.equal(reads,0);
  const result=await ensureEventPublicLinks({email:'admin@example.invalid',app_metadata:{role:'operational'}});
  assert.equal(result.created,102);assert.deepEqual(batches.map(batch=>batch.length),[100,2]);
  const codes=rows.map(row=>row.data.publicCode);assert.equal(new Set(codes).size,103);assert.ok(codes.every(isEventPublicCode));
  assert.equal(rows[0].data.slug,'legacy-0');assert.equal(rows[0].data.id,'event-0');assert.equal(rows[1].published,false);
  assert.equal(rows.at(-1).data.publicCode,'a'.repeat(32));
  assert.equal((await ensureEventPublicLinks({email:'admin@example.invalid',app_metadata:{role:'super'}})).created,0);
  assert.equal(batches.length,2);
});

test('event write generates the public code on the server and preserves it across edits despite client supplied codes',async()=>{
  const http=load('lib/server/http.ts',{'@/lib/supabase/server':{SupabaseConfigurationError:class extends Error{}}});
  const guards=load('lib/server/platform.ts',{'./http':http,'@/lib/supabase/server':{}});
  let existing=null,committed;
  const route=load('app/api/platform/route.ts',{
    '@/lib/supabase/auth':{currentUser:async()=>({id:'admin',email:'admin@example.invalid',app_metadata:{role:'super'}})},
    '@/lib/server/http':{...http,rateLimit:async()=>{}},
    '@/lib/server/platform':{...guards,record:async()=>existing,records:async()=>existing?[existing]:[],commit:async changes=>{committed=changes;existing={...changes[0],revision:1};},snapshot:async()=>({state:{},revisions:{}})},
  });
  function request(data,revision){return new Request('https://events.example/api/platform',{method:'PATCH',headers:{origin:'https://events.example','Content-Type':'application/json'},body:JSON.stringify({changes:[{collection:'events',id:data.id,revision,data}]})});}
  assert.equal((await route.PATCH(request({...exampleEvent,publicCode:'b'.repeat(32)},0))).status,200);
  const code=committed[0].data.publicCode;assert.ok(isEventPublicCode(code));assert.notEqual(code,'b'.repeat(32));
  assert.equal((await route.PATCH(request({...existing.data,title:'Judul event yang diperbarui',publicCode:'c'.repeat(32)},1))).status,200);
  assert.equal(committed[0].data.publicCode,code);assert.equal(committed[0].data.slug,exampleEvent.slug);
  assert.equal(publicEventLink(committed[0].data),'https://awanevent.com/e/'+code);
});

test('public code lookup rejects malformed codes before querying and requires a published event',async()=>{
  let result=null,queries=0;const clauses=[];
  const client={from(){queries++;return {select(){return this;},eq(key,value){clauses.push([key,value]);return this;},async maybeSingle(){return {data:result,error:null};}};}};
  const {findPublicEvent}=load('lib/server/platform.ts',{'@/lib/supabase/server':{getServiceSupabaseClient:()=>client}});
  for(const code of ['legacy-event','../../admin','f'.repeat(31),'F'.repeat(32),'f'.repeat(33)])await assert.rejects(findPublicEvent(code),error=>error.status===404);
  assert.equal(queries,0);
  const code='d'.repeat(32);await assert.rejects(findPublicEvent(code),error=>error.status===404);
  assert.deepEqual(clauses,[['collection','events'],['published',true],['data->>publicCode',code]]);
  result={data:{...exampleEvent,publicCode:code,publication:'draft'}};
  await assert.rejects(findPublicEvent(code),error=>error.status===404);
  result={data:{...exampleEvent,publicCode:code}};
  assert.equal((await findPublicEvent(code)).slug,exampleEvent.slug);
});

test('public link request gate selects only the id, rejects draft/missing codes and returns retryable service errors',async()=>{
  const {publicEventLinkStatus}=load('lib/public-event-link-status.ts');
  let result={data:{id:'published'},error:null},queries=0;const clauses=[];
  const client={from(){queries++;return {select(columns){assert.equal(columns,'id');return this;},eq(key,value){clauses.push([key,value]);return this;},async maybeSingle(){return result;}};}};
  assert.equal(await publicEventLinkStatus(client,'invalid'),404);assert.equal(queries,0);
  const code='e'.repeat(32);assert.equal(await publicEventLinkStatus(client,code),200);
  assert.deepEqual(clauses,[['collection','events'],['published',true],['data->>publication','published'],['data->>publicCode',code]]);
  result={data:null,error:null};assert.equal(await publicEventLinkStatus(client,code),404);
  result={data:null,error:{message:'Fixture service failure'}};assert.equal(await publicEventLinkStatus(client,code),503);
});

test('unavailable public links return an explicit uncached HTML response with no scripts',async()=>{
  const {publicEventUnavailable}=load('lib/public-event-unavailable.ts');
  for(const status of [404,503]){
    const response=publicEventUnavailable(status);assert.equal(response.status,status);
    assert.equal(response.headers.get('cache-control'),'private, no-store');
    assert.ok(response.headers.get('content-security-policy').includes("default-src 'none'"));
    const html=await response.text();assert.ok(html.includes('href="/events"'));assert.ok(!html.includes('<script'));
  }
});
