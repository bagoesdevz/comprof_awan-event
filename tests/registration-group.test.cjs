const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('./load-source.cjs');
const {manageEvent}=load('lib/platform-model.ts');

test('group booking reserves all seats and creates independently owned enrollments atomically',async()=>{
  const event=manageEvent({id:'event',slug:'group-event',title:'Group event',type:'ONLINE',startAt:'2030-01-01T08:00:00Z',price:10000,quotaLeft:10,tickets:[],speakers:[],learningOutcomes:[],sessions:[]});event.publication='published';event.registrationStatus='OPEN';
  event.lifecycle='upcoming';event.tickets=[{id:'group',name:'Group',quota:10,quotaLeft:10,price:10000,attendance:'ONLINE',quantityLimit:5,benefits:[]}];
  let committed;
  const {runAction}=load('lib/server/actions.ts',{
    './platform':{
      requireUser:u=>u,findEvent:async()=>({id:'event',published:true,revision:1,data:event}),liveEvent:e=>e,records:async()=>[],
      record:async()=>({data:{name:'Buyer',phone:'081234567890',gender:'female',birthPlace:'Jakarta',birthDate:'1990-01-01',city:'Jakarta',profession:'Nurse',source:'Website'}}),
      commit:async changes=>{committed=changes;},
    },
    './http':{HttpError:class extends Error {constructor(status,message){super(message);this.status=status;}}},
    './certificates':{issueCertificate:()=>false},
  });
  const result=await runAction({email:'buyer@example.com'},{type:'register',eventSlug:event.slug,ticketId:'group',members:[{name:'Member One',email:'member@example.com'}]});
  assert.equal(result.registration.amount,20000);
  assert.equal(result.registration.quantity,2);
  assert.equal(committed.length,3);
  assert.equal(committed[0].data.tickets[0].quotaLeft,8);
  const member=committed[2];
  assert.equal(member.owner_email,'member@example.com');
  assert.equal(member.data.orderId,result.registration.id);
  assert.equal(member.data.payment,'pending');
  assert.equal(member.data.amount,0);
  assert.equal(member.data.quantity,1);
  assert.notEqual(member.data.progress,result.registration.progress);
});
