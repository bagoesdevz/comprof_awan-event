const test=require('node:test'),assert=require('node:assert/strict'),load=require('./load-source.cjs');
const http=load('lib/server/http.ts',{'@/lib/supabase/server':{SupabaseConfigurationError:class extends Error{}}});
const guards=load('lib/server/platform.ts',{'./http':http,'@/lib/supabase/server':{}});
const user=role=>({id:'super-id',email:'admin@example.invalid',app_metadata:{role},user_metadata:{role:'super'}});
const original=()=>({collection:'events',id:'event-id',revision:7,owner_email:null,published:true,data:{id:'event-id',slug:'uji-hapus',title:'Event pengujian',publication:'published',registrationStatus:'OPEN',publicCode:'a'.repeat(32),banner:'/cover.jpg'}});
function fixture({registered=false,conflict=false,row=original()}={}){
 const commits=[];const platform={...guards,record:async()=>row,hasEventRegistrations:async()=>registered,commit:async changes=>{if(conflict)throw new http.HttpError(409,'Data sudah berubah.');commits.push(structuredClone(changes));Object.assign(row,changes[0],{revision:row.revision+1});}};
 const {runAction}=load('lib/server/actions.ts',{'./platform':platform,'./http':http});
 return {row,commits,runAction};
}
const input=type=>({type,id:'event-id',confirmed:true});
test('only app_metadata superadmins may delete or restore, including direct action requests',async()=>{
 for(const type of ['delete-event','restore-event'])for(const role of ['operational','participant','SUPER',undefined]){
  const f=fixture();await assert.rejects(()=>f.runAction(user(role),input(type)),error=>error.status===403);assert.equal(f.commits.length,0);
 }
 const f=fixture();await assert.rejects(()=>f.runAction(null,input('delete-event')),error=>error.status===401);
});
test('delete retains the event in trash, restore keeps its identifiers and requires deliberate publication',async()=>{
 const f=fixture();await f.runAction(user('super'),input('delete-event'));
 assert.equal(f.row.published,false);assert.equal(f.row.data.publication,'draft');assert.equal(f.row.data.registrationStatus,'CLOSED');assert.ok(Number.isFinite(Date.parse(f.row.data.deletedAt)));assert.equal(f.row.data.deletedBy,'super-id');
 assert.equal(f.commits[0][0].revision,7);assert.equal(f.row.data.publicCode,'a'.repeat(32));assert.equal(f.row.data.banner,'/cover.jpg');
 await f.runAction(user('super'),input('delete-event'));assert.equal(f.commits.length,1);
 await f.runAction(user('super'),input('restore-event'));assert.equal(f.commits[1][0].revision,8);assert.equal(f.row.data.deletedAt,undefined);assert.equal(f.row.data.deletedBy,undefined);assert.equal(f.row.published,false);assert.equal(f.row.data.publication,'draft');assert.equal(f.row.data.registrationStatus,'CLOSED');
 await assert.rejects(()=>f.runAction(user('super'),input('restore-event')),error=>error.status===409);
});
test('registrations and concurrent changes block deletion without altering the event',async()=>{
 for(const options of [{registered:true},{conflict:true}]){
  const f=fixture(options),before=structuredClone(f.row);await assert.rejects(()=>f.runAction(user('super'),input('delete-event')),error=>error.status===409);assert.deepEqual(f.row,before);assert.equal(f.commits.length,0);
 }
});
test('confirmation, identifiers and strict payload are required; missing events return 404',async()=>{
 for(const raw of [{type:'delete-event',id:'event-id'},{...input('delete-event'),confirmed:false},{...input('delete-event'),id:''},{...input('delete-event'),deletedBy:'forged'}]){
  const f=fixture();await assert.rejects(()=>f.runAction(user('super'),raw));assert.equal(f.commits.length,0);
 }
 const f=fixture({row:null});await assert.rejects(()=>f.runAction(user('super'),input('delete-event')),error=>error.status===404);
});
test('generic PATCH cannot delete or restore events, even for superadmins',async()=>{
 for(const role of ['operational','super'])for(const deleted of [false,true]){
  const row=original();if(deleted)row.data.deletedAt=new Date().toISOString();
  const route=load('app/api/platform/route.ts',{'@/lib/supabase/auth':{currentUser:async()=>user(role)},'@/lib/server/http':{...http,rateLimit:async()=>{}},'@/lib/server/platform':{...guards,record:async()=>row,commit:async()=>assert.fail('must not commit'),snapshot:async()=>({})}});
  const response=await route.PATCH(new Request('https://events.example/api/platform',{method:'PATCH',headers:{origin:'https://events.example','Content-Type':'application/json'},body:JSON.stringify({changes:[{collection:'events',id:row.id,revision:7,data:deleted?{}:{deletedAt:'forged'}}]})}));assert.equal(response.status,403);
 }
});
test('trash is separated from active snapshots and is visible only to superadmins; links reject trash',async()=>{
 const {exampleEvent}=load('lib/example-event.ts');const active={...original(),data:{...structuredClone(exampleEvent),id:'event-id',slug:'uji-hapus',publicCode:'a'.repeat(32)}};
 const trash={...active,id:'trash-id',published:true,data:{...active.data,id:'trash-id',slug:'uji-sampah',deletedAt:new Date().toISOString()}};
 const rows=[active,trash];let target=trash;
 const client={rpc:async()=>({data:[],error:null}),from:()=>{const filters={};const q={select:()=>q,eq:(key,value)=>{filters[key]=value;return q;},order:()=>q,range:()=>q,then:resolve=>Promise.resolve({data:rows.filter(row=>Object.entries(filters).every(([key,value])=>row[key]===value)),error:null}).then(resolve),maybeSingle:async()=>({data:target,error:null})};return q;}};
 const platform=load('lib/server/platform.ts',{'@/lib/supabase/server':{getServiceSupabaseClient:()=>client}});
 for(const role of ['super','operational','participant',null]){const {state,revisions}=await platform.snapshot(role?user(role):null);assert.deepEqual(state.events.map(event=>event.slug),['uji-hapus']);assert.equal(state.eventTrash.length,role==='super'?1:0);assert.equal(revisions['events:trash-id'],undefined);}
 await assert.rejects(()=>platform.findEvent('uji-sampah'),error=>error.status===404);
 target={data:trash.data};await assert.rejects(()=>platform.findPublicEvent('a'.repeat(32)),error=>error.status===404);
});
