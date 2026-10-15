const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');
const { ticketState, registrationStatusAt } = load('lib/event-detail.ts');
const { fromWibDateTimeLocal } = load('lib/event-time.ts');
const opening = Date.parse('2026-10-16T08:30:00Z');
const ticket = { id:'ticket', status:'active', quotaLeft:299, startsAt:'2026-10-16T08:30:00Z', endsAt:'2026-10-16T09:30:00Z' };
const event = { lifecycle:'upcoming', registrationStatus:'OPEN', quotaLeft:299, tickets:[ticket] };

test('open event with future ticket sales is scheduled until the exact opening instant', () => {
  assert.equal(ticketState(event,ticket,opening-1),'scheduled');
  assert.equal(registrationStatusAt(event,opening-1),'COMING_SOON');
  assert.equal(ticketState(event,ticket,opening),'available');
  assert.equal(registrationStatusAt(event,opening),'OPEN');
  assert.equal(Date.parse(fromWibDateTimeLocal('2026-10-16T15:30')),opening);
});

test('open-now removes only the opening restriction and preserves expiry, capacity and closure gates', () => {
  const openNow = {...ticket,startsAt:undefined};
  assert.equal(ticketState(event,openNow,opening-86400000),'available');
  assert.equal(ticketState(event,openNow,Date.parse(ticket.endsAt)+1),'expired');
  assert.equal(ticketState(event,{...openNow,quotaLeft:0},opening),'full');
  assert.equal(ticketState(event,{...openNow,status:'inactive'},opening),'closed');
  assert.equal(registrationStatusAt({...event,registrationStatus:'CLOSED'},opening),'CLOSED');
  assert.equal(registrationStatusAt({...event,lifecycle:'completed'},opening),'OPEN');
});

test('explicit ticket deadline overrides lifecycle while default closing time follows the event end',()=>{
  const endsAt='2026-10-17T09:30:00Z',deadline=Date.parse(endsAt);
  for(const lifecycle of ['upcoming','ongoing','completed']){
    const e={...event,lifecycle,endAt:'2026-10-16T09:30:00Z'};
    const t={...ticket,endsAt};
    assert.equal(ticketState(e,t,deadline-1),'available');
    assert.equal(ticketState(e,t,deadline),'expired');
    assert.equal(ticketState(e,t,deadline+1),'expired');
    assert.equal(ticketState(e,{...t,endsAt:undefined},Date.parse(e.endAt)),'expired');
  }
  assert.equal(ticketState({...event,publication:'draft'},ticket,opening),'closed');
});

test('catalog availability follows purchasable tickets rather than the raw event flag', () => {
  assert.equal(registrationStatusAt({...event,tickets:[ticket,{...ticket,id:'open',startsAt:undefined}]},opening-1),'OPEN');
  assert.equal(registrationStatusAt({...event,tickets:[{...ticket,quotaLeft:0}]},opening),'SOLD_OUT');
  assert.equal(registrationStatusAt(event,Date.parse(ticket.endsAt)+1),'CLOSED');
  assert.equal(registrationStatusAt({...event,tickets:[]},opening),'CLOSED');
  assert.equal(registrationStatusAt({registrationStatus:'COMING_SOON',quotaLeft:299},opening),'COMING_SOON');
});

test('server registration obeys the admin deadline regardless of event lifecycle and rejects at the exact cutoff', async t=>{
  let clock=Date.parse('2030-10-16T12:00:00Z');t.mock.method(Date,'now',()=>clock);
  const {exampleEvent}=load('lib/example-event.ts');
  const event={...structuredClone(exampleEvent),registrationStatus:'OPEN',startAt:'2030-10-16T08:00:00Z',endAt:'2030-10-16T09:00:00Z'};
  event.tickets[0].endsAt='2030-10-16T13:00:00Z';
  const {liveEvent,requireUser}=load('lib/server/platform.ts',{'@/lib/supabase/server':{}});
  let commits=0,published=true;
  const {runAction}=load('lib/server/actions.ts',{
    './platform':{requireUser,liveEvent,findEvent:async()=>({id:event.id,data:event,published,revision:1}),records:async()=>[],record:async()=>({data:{name:'Peserta pengujian',phone:'080000000000',gender:'prefer_not_to_say',birthPlace:'Kota Pengujian',birthDate:'1990-01-01',city:'Kota Pengujian',profession:'Pengujian',source:'Website'}}),commit:async()=>{commits++;}},
    './certificates':{issueCertificate:()=>false},
  });
  const user={email:'participant@example.invalid'},input={type:'register',eventSlug:event.slug,ticketId:event.tickets[0].id};
  assert.equal(liveEvent(event).lifecycle,'completed');
  assert.equal((await runAction(user,input)).registration.payment,'paid');assert.equal(commits,1);
  clock=Date.parse(event.tickets[0].endsAt);
  await assert.rejects(runAction(user,input),error=>error.status===409);assert.equal(commits,1);
  clock--;
  published=false;await assert.rejects(runAction(user,input),error=>error.status===409);published=true;
  event.publication='draft';await assert.rejects(runAction(user,input),error=>error.status===409);event.publication='published';
  event.registrationStatus='CLOSED';await assert.rejects(runAction(user,input),error=>error.status===409);
  assert.equal(commits,1);
});
