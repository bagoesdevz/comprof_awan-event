const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const load=require('./load-source.cjs');
const {initialState,blankProfile,newRegistration}=load('lib/platform-model.ts');
const {exampleEvent}=load('lib/example-event.ts');
const groupUrl='https://chat.whatsapp.com/FixtureInviteForTest123';

function render({payment='paid',url=groupUrl,compact=false,owner='participant@example.invalid',loggedIn=true,view='group'}={}){
 const state=initialState();state.session={loggedIn,email:'participant@example.invalid',role:'participant'};
 const event=structuredClone(exampleEvent);event.whatsappGroupUrl=url;state.events=[event];
 const profile=blankProfile(owner,'Peserta pengujian');state.profiles[state.session.email]=profile;
 const reg=newRegistration(event,event.tickets[0].id,profile);reg.payment=payment;state.registrations=[reg];
 const platform={usePlatform:()=>({state,ready:true,error:'',refresh:async()=>state,update:async()=>true})};
 const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
 const stubs={'@/components/platform/provider':platform,'./provider':platform,'next/link':{default:Link},'next/image':{default:()=>null},'@/components/dashboard/eligibility-panel':{EligibilityPanel:()=>null}};
 stubs['@/components/platform/ui']=load('components/platform/ui.tsx',stubs);stubs['./ui']=stubs['@/components/platform/ui'];
 const {EventGroupAccess}=load('components/dashboard/event-group-access.tsx',stubs);
 stubs['@/components/dashboard/event-group-access']={EventGroupAccess};
 stubs['@/components/events/event-action']=load('components/events/event-action.tsx',stubs);
 const element=view==='events'?React.createElement(load('components/platform/participant-workspace.tsx',stubs).ParticipantWorkspace,{view:'events'}):React.createElement(EventGroupAccess,{slug:event.slug,compact});
 return renderToStaticMarkup(element);
}

test('active participants can reopen the invite from their event cards and group panel',()=>{
 for(const payment of ['paid','pending'])for(const view of ['events','group']){
  const html=render({payment,view});assert.ok(html.includes(groupUrl));assert.match(html,/Gabung grup WhatsApp/);assert.match(html,/target="_blank"/);assert.match(html,/rel="noopener noreferrer"/);
 }
 assert.ok(render({owner:'Participant@Example.Invalid'}).includes(groupUrl));
});

test('inactive, signed-out and unrelated viewers never receive a group link',()=>{
 for(const payment of ['cancelled','expired','refunded'])assert.equal(render({payment}),'');
 assert.equal(render({loggedIn:false}),'');assert.equal(render({owner:'someone-else@example.invalid'}),'');
});

test('missing or invalid invitations give an honest status without a dead join button',()=>{
 for(const url of ['','javascript:alert(1)','https://example.invalid/invite']){
  const html=render({url});assert.match(html,/Tautan grup belum ditambahkan/);assert.doesNotMatch(html,/<a /);assert.equal(render({url,compact:true}),'');
 }
});
