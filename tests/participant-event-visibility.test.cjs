const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const load=require('./load-source.cjs');
const {initialState,blankProfile,newRegistration}=load('lib/platform-model.ts');
const {exampleEvent}=load('lib/example-event.ts');
function render(payment){
 const state=initialState();state.session={loggedIn:true,email:'participant@example.invalid',role:'participant'};
 state.profiles[state.session.email]=blankProfile(state.session.email,'Peserta pengujian');
 state.events=['upcoming','ongoing','completed','draft'].map((phase,index)=>{
  const event={...structuredClone(exampleEvent),id:'event-'+index,slug:'event-'+phase,title:'Program '+phase,publication:phase==='draft'?'draft':'published',lifecycle:phase==='draft'?'upcoming':phase,registrationStatus:'OPEN'};
  event.tickets[0].endsAt='2099-01-01T00:00:00Z';return event;
 });
 if(payment){const reg=newRegistration(state.events[1],state.events[1].tickets[0].id,state.profiles[state.session.email]);reg.payment=payment;state.registrations=[reg];}
 const platform={usePlatform:()=>({state,ready:true,refresh:async()=>null,update:async()=>true,error:''})};
 const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
 const stubs={'next/link':{default:Link},'next/image':{default:()=>null},'./provider':platform,'@/components/platform/provider':platform,'@/components/dashboard/eligibility-panel':{EligibilityPanel:()=>null}};
 stubs['./ui']=load('components/platform/ui.tsx',stubs);
 stubs['@/components/events/event-action']=load('components/events/event-action.tsx',stubs);
 const {ParticipantWorkspace}=load('components/platform/participant-workspace.tsx',stubs);
 return renderToStaticMarkup(React.createElement(ParticipantWorkspace,{view:'recommendations'}));
}
test('published programs remain visible throughout lifecycle with registration links instead of a join shortcut',()=>{
 const html=render();for(const phase of ['upcoming','ongoing','completed']){assert.ok(html.includes('Program '+phase));assert.ok(html.includes('/events/event-'+phase+'/register'));}
 assert.doesNotMatch(html,/Program draft/);assert.doesNotMatch(html,/href="\/dashboard\/events\/event-ongoing"/);
});
test('expired, cancelled and refunded registrations do not hide a program that can be registered again',()=>{
 for(const payment of ['expired','cancelled','refunded'])assert.match(render(payment),/Program ongoing/);
 assert.doesNotMatch(render('paid'),/Program ongoing/);
});
