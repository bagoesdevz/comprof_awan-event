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
  assert.equal(registrationStatusAt({...event,lifecycle:'completed'},opening),'CLOSED');
});

test('catalog availability follows purchasable tickets rather than the raw event flag', () => {
  assert.equal(registrationStatusAt({...event,tickets:[ticket,{...ticket,id:'open',startsAt:undefined}]},opening-1),'OPEN');
  assert.equal(registrationStatusAt({...event,tickets:[{...ticket,quotaLeft:0}]},opening),'SOLD_OUT');
  assert.equal(registrationStatusAt(event,Date.parse(ticket.endsAt)+1),'CLOSED');
  assert.equal(registrationStatusAt({...event,tickets:[]},opening),'CLOSED');
  assert.equal(registrationStatusAt({registrationStatus:'COMING_SOON',quotaLeft:299},opening),'COMING_SOON');
});
