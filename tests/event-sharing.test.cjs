const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');
const { whatsappGroupLink } = load('lib/event-sharing.ts');
const { exampleEvent } = load('lib/example-event.ts');
const { initialState, blankProfile, newRegistration } = load('lib/platform-model.ts');
const { eventSchema } = load('lib/server/validation.ts');
const groupUrl = 'https://chat.whatsapp.com/FixtureInviteForTest123';

test('event updates accept optional WhatsApp invites and reject unrelated or unsafe destinations', () => {
  assert.equal(eventSchema.parse(exampleEvent).whatsappGroupUrl,undefined);
  assert.equal(eventSchema.parse({...exampleEvent,whatsappGroupUrl:''}).whatsappGroupUrl,'');
  assert.equal(eventSchema.parse({...exampleEvent,whatsappGroupUrl:groupUrl}).whatsappGroupUrl,groupUrl);
  for(const value of ['https://wa.me/123','https://chat.whatsapp.com.attacker.example/token','https://user:password@chat.whatsapp.com/token','https://chat.whatsapp.com:8443/token','javascript:alert(1)','http://chat.whatsapp.com/token','https://chat.whatsapp.com/']) {
    assert.equal(eventSchema.safeParse({...exampleEvent,whatsappGroupUrl:value}).success,false,value);
    assert.equal(whatsappGroupLink(value),'');
  }
  assert.equal(whatsappGroupLink(' '+groupUrl+'#fragment '),groupUrl);
});

test('event snapshots expose the invite only to admins or the owner of an active registration', () => {
  const { eventForViewer } = load('lib/server/platform.ts',{'@/lib/supabase/server':{}});
  const event = {...exampleEvent,whatsappGroupUrl:groupUrl};
  const state = initialState();
  assert.equal(eventForViewer(event,state,false).whatsappGroupUrl,'');
  state.session={loggedIn:true,email:'participant@example.invalid',role:'participant'};
  assert.equal(eventForViewer(event,state,false).whatsappGroupUrl,'');
  const profile=blankProfile(state.session.email,'Participant');
  const registration=newRegistration(event,event.tickets[0].id,profile);
  state.registrations=[registration];
  for(const payment of ['paid','pending']) {
    registration.payment=payment;
    assert.equal(eventForViewer(event,state,false).whatsappGroupUrl,groupUrl);
  }
  for(const payment of ['cancelled','expired','refunded']) {
    registration.payment=payment;
    assert.equal(eventForViewer(event,state,false).whatsappGroupUrl,'');
  }
  registration.payment='paid';registration.email='someone-else@example.invalid';
  assert.equal(eventForViewer(event,state,false).whatsappGroupUrl,'');
  assert.equal(eventForViewer(event,state,true).whatsappGroupUrl,groupUrl);
  assert.equal(event.whatsappGroupUrl,groupUrl);
});

test('successful registration returns the invite after commit for free and paid tickets, never on failure', async () => {
  for(const price of [0,100000]) {
    const event=structuredClone(exampleEvent);event.registrationStatus='OPEN';event.whatsappGroupUrl=groupUrl;
    event.tickets[0].price=price;
    let committed=false,shouldFail=false;
    const { runAction }=load('lib/server/actions.ts',{
      './platform':{
        requireUser:u=>u,findEvent:async()=>({id:event.id,published:true,revision:1,data:event}),liveEvent:e=>structuredClone(e),records:async()=>[],
        record:async()=>({data:{name:'Participant',phone:'08123456789',gender:'female',birthPlace:'Jakarta',birthDate:'1990-01-01',city:'Jakarta',profession:'Nurse',source:'Website'}}),
        commit:async()=>{if(shouldFail)throw new Error('Fixture commit failed');committed=true;},
      },
      './http':{HttpError:class extends Error{constructor(status,message){super(message);this.status=status;}}},
      './certificates':{issueCertificate:()=>false},
    });
    const input={type:'register',eventSlug:event.slug,ticketId:event.tickets[0].id};
    const result=await runAction({email:'participant@example.invalid'},input);
    assert.equal(committed,true);
    assert.equal(result.whatsappGroupUrl,groupUrl);
    assert.equal(result.registration.payment,price===0?'paid':'pending');
    shouldFail=true;
    await assert.rejects(runAction({email:'participant@example.invalid'},input),/Fixture commit failed/);
    shouldFail=false;event.whatsappGroupUrl='';
    assert.equal((await runAction({email:'participant@example.invalid'},input)).whatsappGroupUrl,'');
  }
});
