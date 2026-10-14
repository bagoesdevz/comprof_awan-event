const test = require('node:test');
const assert = require('node:assert/strict');
const { renderToStaticMarkup } = require('react-dom/server');
const React = require('react');
const load = require('./load-source.cjs');
const { initialState, blankProfile } = load('lib/platform-model.ts');
const { exampleEvent } = load('lib/example-event.ts');

function render(options={}) {
  const state=initialState();state.session={loggedIn:options.loggedIn!==false,email:'participant@example.invalid',role:'participant'};
  const event={...structuredClone(exampleEvent),registrationStatus:options.status||'OPEN'};state.events=[event];
  state.profiles[state.session.email]=blankProfile(state.session.email);
  if(options.existing)state.registrations=[{eventSlug:event.slug,email:state.session.email,payment:'paid',id:'TEST',ticketName:'Tiket pengujian'}];
  const platform={usePlatform:()=>({state,ready:true,update:async()=>true,action:async()=>null,saving:false})};
  const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
  const stubs={'next/link':{default:Link},'next/navigation':{useRouter:()=>({push:()=>{throw new Error('Unexpected navigation')}})},'@/components/platform/provider':platform,'./provider':platform};
  const ui=load('components/platform/ui.tsx',stubs);stubs['./ui']=ui;stubs['@/components/platform/ui']=ui;
  stubs['@/components/platform/profile-editor']=load('components/platform/profile-editor.tsx',stubs);
  stubs['@/components/registration/registration-group-dialog']={RegistrationGroupDialog:()=>null};
  const {RegistrationWizard}=load('components/registration/registration-wizard.tsx',stubs);
  return renderToStaticMarkup(React.createElement(RegistrationWizard,{eventSlug:event.slug,ticketId:event.tickets[0].id}));
}

test('signed-in participant with an incomplete profile receives a real form on the registration page',()=>{
  const html=render();assert.match(html,/<form/);assert.match(html,/Lengkapi data pendaftaran/);assert.match(html,/Simpan data &amp; lanjutkan/);
  for(const label of ['Nama lengkap','No. WhatsApp','Jenis kelamin','Tempat lahir','Tanggal lahir','Domisili','Profesi','Mengetahui event dari'])assert.ok(html.includes(label),label);
  assert.doesNotMatch(html,/href="\/dashboard\/profile/);
});

test('existing enrollment remains accessible even if the participant profile is incomplete',()=>{
  const html=render({existing:true});assert.match(html,/Pendaftaran Anda sudah tersimpan/);assert.doesNotMatch(html,/Simpan data/);
});

test('inline profile form preserves sign-in and closed-event guards',()=>{
  assert.match(render({loggedIn:false}),/Masuk untuk mendaftar/);
  assert.doesNotMatch(render({loggedIn:false}),/Simpan data/);
  assert.match(render({status:'CLOSED'}),/Pendaftaran belum tersedia/);
  assert.doesNotMatch(render({status:'CLOSED'}),/Simpan data/);
});
