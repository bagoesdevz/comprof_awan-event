const test=require('node:test'),assert=require('node:assert/strict'),load=require('./load-source.cjs');
const {exampleEvent}=load('lib/example-event.ts');
const model=load('lib/platform-model.ts');
const token='12345678-1234-4234-8234-123456789012';
const email='participant@example.invalid';
function data(){
 const event={...structuredClone(exampleEvent),startAt:'2020-01-01T08:00:00Z',endAt:'2020-01-01T10:00:00Z',publication:'published',lifecycle:'completed',certificateEnabled:true,certificateTemplate:'/template.png',certificatePattern:'AWN-{year}-{sequence}',preTest:{enabled:false},postTest:{enabled:false}};
 const registration=model.newRegistration(event,event.tickets[0].id,model.blankProfile(email,'Nama pendaftaran'));
 registration.payment='paid';registration.progress.attendance=true;registration.progress.feedback=true;
 return {event,registration};
}
function actionFixture(config={}){
 const {event,registration}=data();Object.assign(event,config.event);Object.assign(registration,config.registration);
 let row={id:registration.id,data:structuredClone(registration),revision:1,owner_email:email};const writes=[];
 const http=load('lib/server/http.ts',{'@/lib/supabase/server':{SupabaseConfigurationError:class extends Error{}}});
 const guards=load('lib/server/platform.ts',{'./http':http,'@/lib/server/http':http,'@/lib/supabase/server':{}});
 const {runAction}=load('lib/server/actions.ts',{'./http':http,'./platform':{...guards,
  record:async()=>row,findEvent:async()=>({id:event.id,data:event,published:true,revision:1}),
  commit:async changes=>{if(config.conflict)throw new http.HttpError(409,'Conflict');writes.push(structuredClone(changes));row={...row,data:structuredClone(changes[0].data),revision:row.revision+1};},
 }});
 return {runAction,event,writes,row:()=>row,input:extra=>({type:'confirm-certificate-name',id:registration.id,name:'Nama Sertifikat, S.Kep.',confirmed:true,...extra}),user:config.user===undefined?{email,app_metadata:{role:'participant'}}:config.user};
}

test('feedback is stored before name verification, then confirmation issues a certificate with the corrected name only',async()=>{
 const f=actionFixture({registration:{progress:{attendance:true,feedback:false,'pre-test':false,'post-test':false}}});
 const feedback=await f.runAction(f.user,{type:'feedback',id:f.row().id,feedback:{overall:5,speaker:4,material:5,organization:4,comment:''}});
 assert.equal(feedback.registration.progress.feedback,true);assert.equal(feedback.registration.certificate,undefined);
 assert.equal(model.nextAction(feedback.registration,f.event).label,'Verifikasi nama sertifikat');
 const result=await f.runAction(f.user,f.input({name:'  Nama Sertifikat, S.Kep.  '}));
 assert.equal(result.registration.name,'Nama pendaftaran');assert.equal(result.registration.certificateName.name,'Nama Sertifikat, S.Kep.');
 assert.ok(Number.isFinite(Date.parse(result.registration.certificateName.verifiedAt)));
 assert.equal(result.registration.certificate.recipientName,'Nama Sertifikat, S.Kep.');assert.equal(f.writes.length,2);
 assert.equal(model.certificateRecipientName(result.registration),'Nama Sertifikat, S.Kep.');
 assert.equal(model.nextAction(result.registration,f.event).label,'Lihat sertifikat');
});

test('certificate name confirmation requires the owner and every activity/payment/event requirement',async()=>{
 for(const config of [
  {user:null},{user:{email:'other@example.invalid',app_metadata:{role:'super'}}},
  {registration:{payment:'pending'}},{registration:{progress:{attendance:true,feedback:false}}},
  {registration:{progress:{attendance:false,feedback:true}}},
  {event:{preTest:{enabled:true}}},{event:{postTest:{enabled:true}}},
  {event:{certificateEnabled:false}},{event:{publication:'draft'}},{event:{endAt:'2099-01-01T00:00:00Z'}},
  {registration:{certificate:{token,status:'revoked',number:'AWN-OLD',issuedAt:'2020-01-01T00:00:00Z'}}},
 ]){
  const f=actionFixture(config);await assert.rejects(f.runAction(f.user,f.input()),error=>[401,403,409].includes(error.status));assert.equal(f.writes.length,0);
 }
});

test('confirmation rejects missing acknowledgement, invalid names and forged certificate fields',async()=>{
 for(const extra of [{confirmed:false},{confirmed:undefined},{name:''},{name:'A'},{name:'x'.repeat(161)},{name:'Nama\nBaru'},{name:'Nama\u202eBaru'},{certificate:{number:'FORGED'}}]){
  const f=actionFixture();await assert.rejects(f.runAction(f.user,f.input(extra)),error=>!!error.issues);assert.equal(f.writes.length,0);
 }
});

test('confirmed names are immutable and retries preserve token and metadata, including legacy certificates',async()=>{
 const f=actionFixture({registration:{certificate:{token,number:'AWN-OLD',status:'valid',issuedAt:'2020-01-02T00:00:00Z',downloadCount:2,emailSentAt:'2020-01-02T00:01:00Z'}}});
 const result=await f.runAction(f.user,f.input());assert.equal(result.registration.certificate.token,token);assert.equal(result.registration.certificate.number,'AWN-OLD');assert.equal(result.registration.certificate.downloadCount,2);assert.ok(result.registration.certificate.emailSentAt);
 await f.runAction(f.user,f.input());assert.equal(f.writes.length,1);
 await assert.rejects(f.runAction(f.user,f.input({name:'Nama berbeda'})),e=>e.status===409);assert.equal(f.writes.length,1);
 const conflict=actionFixture({conflict:true});await assert.rejects(conflict.runAction(conflict.user,conflict.input()),e=>e.status===409);assert.equal(conflict.row().data.certificateName,undefined);
});

test('verification can be saved while a template is pending; missing or malformed verification never counts as ready',async()=>{
 const f=actionFixture({event:{certificateTemplate:''}});const result=await f.runAction(f.user,f.input());assert.equal(model.certificateNameVerified(result.registration),true);assert.equal(result.registration.certificate,undefined);
 const {issueCertificate}=load('lib/server/certificates.ts');assert.equal(issueCertificate(result.registration,{...f.event,certificateTemplate:'/later.png'}),true);
 for(const value of [undefined,{}, {name:'',verifiedAt:'2020-01-01'}, {name:'A',verifiedAt:'2020-01-01'}, {name:'Nama',verifiedAt:'bad-date'}])assert.equal(model.certificateNameVerified({certificateName:value}),false);
});

function downloadFixture(config={}){
 const {event,registration}=data();registration.certificateName={name:'Nama & Gelar <S.Kep.>',verifiedAt:'2020-01-02T00:00:00Z'};
 registration.certificate={token,number:'AWN-TEST',status:'valid',recipientName:registration.certificateName.name,issuedAt:'2020-01-02T00:00:00Z'};
 if(config.unverified)delete registration.certificateName;
 const writes=[];let queries=0;
 const client={from:()=>{const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:queries++%2===0?{id:registration.id,data:structuredClone(registration),owner_email:email}:{data:event},error:null})};return query;}};
 const server={'@/lib/supabase/server':{getServiceSupabaseClient:()=>client,SupabaseConfigurationError:class extends Error{}}};
 const http=load('lib/server/http.ts',server);
 const guards=load('lib/server/platform.ts',{'./http':http,'@/lib/server/http':http,...server});
 const stubs={...server,'@/lib/server/http':http,'@/lib/supabase/auth':{currentUser:async()=>({email:config.other?'other@example.invalid':email,app_metadata:{role:'participant'}})},
  '@/lib/server/certificate-template':{certificateTemplateData:async()=> 'data:image/png;base64,fixture'},
  '@/lib/server/platform':{...guards,record:async()=>({id:registration.id,data:{...structuredClone(registration),...config.fresh},revision:1,owner_email:email}),commit:async changes=>writes.push(changes)},
 };
 return {download:load('app/api/certificates/[token]/download/route.ts',stubs),verify:load('app/api/certificates/[token]/route.ts',stubs),writes,registration};
}

test('download and public verification use the confirmed snapshot; XML is escaped and download counters remain intact',async()=>{
 const f=downloadFixture(),params={params:Promise.resolve({token})};
 const response=await f.download.GET(new Request('https://events.example'),params);assert.equal(response.status,200);const svg=await response.text();
 assert.match(svg,/Nama &amp; Gelar &lt;S.Kep.&gt;/);assert.equal(svg.includes('Nama pendaftaran'),false);assert.equal(f.writes[0][0].data.certificate.downloadCount,1);
 assert.equal(response.headers.get('cache-control'),'private, no-store');
 const verified=await f.verify.GET(new Request('https://events.example'),params);assert.equal((await verified.json()).data.participantName,'Nama & Gelar <S.Kep.>');
});

test('direct download cannot bypass name verification, ownership or fresh-state checks',async()=>{
 for(const [config,status] of [[{unverified:true},409],[{other:true},403],[{fresh:{certificateName:undefined}},403],[{fresh:{payment:'refunded'}},403],[{fresh:{certificate:{token,status:'revoked'}}},403],[{fresh:{certificate:{token,status:'valid',recipientName:'Nama lain'}}},409]]){
  const f=downloadFixture(config);const response=await f.download.GET(new Request('https://events.example'),{params:Promise.resolve({token})});assert.equal(response.status,status);assert.equal(f.writes.length,0);
 }
});
