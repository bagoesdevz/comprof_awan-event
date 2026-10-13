const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const load=require('./load-source.cjs');

test('authoritative provider reconciliation revokes group certificates and releases seats once',async()=>{
 const originalFetch=global.fetch;
 const originalKey=process.env.MIDTRANS_SERVER_KEY,originalMode=process.env.MIDTRANS_IS_PRODUCTION;
 process.env.MIDTRANS_SERVER_KEY='fixture-server-key';process.env.MIDTRANS_IS_PRODUCTION='false';
 const parent={id:'AWN-1234567890',eventSlug:'event',ticketId:'ticket',quantity:2,amount:20000,payment:'paid',certificate:{status:'valid'}};
 const member={id:'member',orderId:parent.id,payment:'paid',certificate:{status:'valid'}};
 const rows=new Map([
  ['registrations:'+parent.id,{id:parent.id,revision:1,owner_email:'buyer@example.com',data:parent}],
  ['registrations:member',{id:'member',revision:1,owner_email:'member@example.com',data:member}],
  ['events:event',{id:'event',revision:1,published:true,data:{tickets:[{id:'ticket',quota:10,quotaLeft:8}],quotaLeft:8}}],
 ]);
 let providerStatus='refund',commits=0;
 class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
 const payments=load('lib/server/payments.ts',{
  './http':{HttpError,readBytes:async response=>Buffer.from(await response.arrayBuffer())},
  './platform':{
   record:async(collection,id)=>structuredClone(rows.get(collection+':'+id)||null),
   findEvent:async()=>structuredClone(rows.get('events:event')),
   commit:async changes=>{commits++;for(const change of changes){assert.equal(change.revision,rows.get(change.collection+':'+change.id).revision);}for(const change of changes)rows.set(change.collection+':'+change.id,{...change,revision:change.revision+1});},
  },
  '@/lib/supabase/server':{getServiceSupabaseClient:()=>({from:()=>({select:()=>({eq:()=>({eq:async()=>({data:[structuredClone(rows.get('registrations:member'))],error:null})})})})})},
 });
 global.fetch=async()=>Response.json({order_id:parent.id,gross_amount:'20000.00',currency:'IDR',transaction_status:providerStatus,payment_type:'bank_transfer'});
 try{
  const signatureInput={order_id:parent.id,status_code:'200',gross_amount:'20000.00'};
  const signature=createHash('sha512').update(signatureInput.order_id+'200'+'20000.00'+'fixture-server-key').digest('hex');
  payments.verifySignature({...signatureInput,signature_key:signature.toUpperCase()});
  assert.throws(()=>payments.verifySignature({...signatureInput,signature_key:'f'.repeat(128)}),error=>error.status===401);
  const refunded=await payments.reconcilePayment(parent.id);
  assert.equal(refunded.payment,'refunded');
  assert.equal(refunded.certificate.status,'revoked');
  assert.equal(rows.get('registrations:member').data.certificate.status,'revoked');
  assert.equal(rows.get('events:event').data.tickets[0].quotaLeft,10);
  await payments.reconcilePayment(parent.id);
  providerStatus='settlement';await payments.reconcilePayment(parent.id);
  assert.equal(commits,1);
  assert.equal(rows.get('registrations:'+parent.id).data.payment,'refunded');
 }finally{
  global.fetch=originalFetch;
  if(originalKey===undefined)delete process.env.MIDTRANS_SERVER_KEY;else process.env.MIDTRANS_SERVER_KEY=originalKey;
  if(originalMode===undefined)delete process.env.MIDTRANS_IS_PRODUCTION;else process.env.MIDTRANS_IS_PRODUCTION=originalMode;
 }
});
