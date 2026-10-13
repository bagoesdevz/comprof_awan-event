const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('./load-source.cjs');

test('abandoned orders release group seats atomically and fence payment initiation',async()=>{
 let changes;
 const registration={id:'order',eventSlug:'event',ticketId:'ticket',payment:'pending',createdAt:'2020-01-01T00:00:00Z',quantity:2};
 const event={tickets:[{id:'ticket',quota:10,quotaLeft:8}],quotaLeft:8};
 const {expireUnstartedRegistration}=load('lib/server/payment-expiry.ts',{
  './platform':{
   record:async(collection)=>collection==='payment_sessions'?null:{id:'order',revision:1,owner_email:'buyer@example.com',data:registration},
   findEvent:async()=>({id:'event',revision:1,published:true,data:event}),commit:async batch=>{changes=batch;},
  },
  '@/lib/supabase/server':{getServiceSupabaseClient:()=>({from:()=>({select:()=>({eq:()=>({eq:async()=>({data:[{id:'member',revision:1,data:{orderId:'order',payment:'pending'},owner_email:'member@example.com'}],error:null})})})})})},
  './http':{HttpError:class extends Error {}},
 });
 assert.equal(await expireUnstartedRegistration('order'),true);
 assert.equal(changes[0].collection,'payment_sessions');
 assert.equal(changes[0].revision,0);
 assert.equal(changes[0].data.closed,true);
 assert.equal(changes[1].data.tickets[0].quotaLeft,10);
 assert.equal(changes[2].data.payment,'expired');
 assert.equal(changes[3].data.payment,'expired');
 assert.equal(await expireUnstartedRegistration('order'),false);
});
