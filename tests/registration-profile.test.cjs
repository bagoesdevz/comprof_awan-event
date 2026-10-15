const test = require('node:test');
const assert = require('node:assert/strict');
const { renderToStaticMarkup } = require('react-dom/server');
const React = require('react');
const load = require('./load-source.cjs');
const { initialState, blankProfile } = load('lib/platform-model.ts');
const { exampleEvent } = load('lib/example-event.ts');

function render(options={}) {
  const state=initialState();state.session={loggedIn:options.loggedIn!==false,email:'participant@example.invalid',role:'participant'};
  const event={...structuredClone(exampleEvent),registrationStatus:options.status||'OPEN',lifecycle:options.lifecycle||'upcoming',endAt:'2099-01-01T00:00:00Z'};if(options.explicitDeadline)event.tickets[0].endsAt='2099-01-01T00:00:00Z';state.events=options.missing?[]:[event];
  if(options.group)event.whatsappGroupUrl='https://chat.whatsapp.com/FixtureInviteForTest123';
  state.profiles[state.session.email]=blankProfile(state.session.email);
  if(options.existing)state.registrations=[{eventSlug:event.slug,email:state.session.email,payment:'paid',id:'TEST',ticketName:'Tiket pengujian'}];
  const platform={usePlatform:()=>({state,ready:options.ready!==false,error:options.error||'',refresh:async()=>state,update:async()=>true,action:async()=>null,saving:false})};
  const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
  const stubs={'next/link':{default:Link},'next/navigation':{useRouter:()=>({push:()=>{throw new Error('Unexpected navigation')}})},'@/components/platform/provider':platform,'./provider':platform};
  const ui=load('components/platform/ui.tsx',stubs);stubs['./ui']=ui;stubs['@/components/platform/ui']=ui;
  stubs['@/components/dashboard/event-group-access']=load('components/dashboard/event-group-access.tsx',stubs);
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
  assert.match(html,/Tautan grup belum ditambahkan/);
  assert.match(render({existing:true,group:true}),/href="https:\/\/chat.whatsapp.com\/FixtureInviteForTest123"/);
});

test('inline profile form preserves sign-in and closed-event guards',()=>{
  assert.match(render({loggedIn:false}),/Masuk untuk mendaftar/);
  assert.doesNotMatch(render({loggedIn:false}),/Simpan data/);
  assert.match(render({status:'CLOSED'}),/Pendaftaran ditutup/);
  assert.doesNotMatch(render({status:'CLOSED'}),/Simpan data/);
});

test('registration form remains accessible during and after the event until the configured deadline',()=>{
  for(const lifecycle of ['ongoing','completed'])assert.match(render({lifecycle,explicitDeadline:true}),/Simpan data &amp; lanjutkan/);
});

test('missing or failed registration data offers retry instead of redirecting away',()=>{
  const missing=render({missing:true});assert.match(missing,/Muat ulang event/);assert.doesNotMatch(missing,/href="\/dashboard/);
  const failed=render({ready:false,error:'Koneksi pengujian gagal'});assert.match(failed,/Pendaftaran belum dapat dimuat/);assert.match(failed,/Coba lagi/);assert.doesNotMatch(failed,/Menyiapkan pendaftaran/);
});
