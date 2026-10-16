const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('./load-source.cjs');

test('certificate issuance requires published ended event and all configured activities',()=>{
 const {issueCertificate}=load('lib/server/certificates.ts');
 const event={publication:'published',endAt:'2020-01-01T00:00:00Z',certificateEnabled:true,certificateTemplate:'/template.png',certificatePattern:'AWN-{year}-{sequence}',preTest:{enabled:true},postTest:{enabled:false}};
 const registration={id:'AWN-ABCD1234',payment:'paid',progress:{attendance:true,feedback:true,'pre-test':false}};
 assert.equal(issueCertificate(registration,event),false);
 registration.progress['pre-test']=true;
 assert.equal(issueCertificate(registration,event),false);
 registration.certificateName={name:'Nama terverifikasi',verifiedAt:'2020-01-01T00:00:00Z'};
 assert.equal(issueCertificate(registration,{...event,publication:'draft'}),false);
 assert.equal(issueCertificate(registration,{...event,endAt:'invalid'}),false);
 assert.equal(issueCertificate(registration,{...event,endAt:'2099-01-01T00:00:00Z'}),false);
 assert.equal(issueCertificate(registration,event),true);
 assert.equal(registration.certificate.recipientName,'Nama terverifikasi');
 const token=registration.certificate.token;
 assert.equal(issueCertificate(registration,event),false);
 assert.equal(registration.certificate.token,token);
});

test('certificate templates reject foreign storage and path traversal; embed validated raster bytes',async()=>{
 const previous=process.env.SUPABASE_URL;
 process.env.SUPABASE_URL='https://fixture-project.supabase.co';
 const {certificateTemplateData}=load('lib/server/certificate-template.ts',{
  'node:fs/promises':{readFile:async()=>Buffer.from([137,80,78,71,13,10,26,10])},
  './http':{HttpError:class extends Error{constructor(status,message){super(message);this.status=status;}}},
 });
 try{
  await assert.rejects(certificateTemplateData('https://foreign.supabase.co/storage/v1/object/public/event-assets/x.png'),error=>error.status===422);
  await assert.rejects(certificateTemplateData('http://127.0.0.1/private'),error=>error.status===422);
  await assert.rejects(certificateTemplateData('/../private'),error=>error.status===422);
  await assert.rejects(certificateTemplateData('/%2e%2e/private'),error=>error.status===422);
  await assert.rejects(certificateTemplateData(''),error=>error.status===409);
  assert.equal(await certificateTemplateData('/template.png'),'data:image/png;base64,iVBORw0KGgo=');
 }finally{if(previous===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previous;}
});
