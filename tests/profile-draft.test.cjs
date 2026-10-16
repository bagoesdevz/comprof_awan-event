const test=require('node:test'),assert=require('node:assert/strict'),load=require('./load-source.cjs');
const {mergeProfileDraft}=load('lib/profile-draft.ts');
const email='participant@example.invalid';
test('background snapshots retain edited fields, including intentionally cleared values',()=>{
 const initial=mergeProfileDraft(email,{name:'Nama tersimpan',phone:'08123456789',city:'Kota lama'});
 const draft={...initial,name:'Nama belum disimpan',phone:''};
 const merged=mergeProfileDraft(email,{...initial,city:'Kota baru',institution:'Institusi terbaru'},draft,new Set(['name','phone']));
 assert.equal(merged.name,draft.name);assert.equal(merged.phone,'');assert.equal(merged.city,'Kota baru');assert.equal(merged.institution,'Institusi terbaru');assert.equal(merged.email,email);
});
test('saving merges selected edits onto the latest profile instead of overwriting untouched fields',()=>{
 const draft=mergeProfileDraft(email,{name:'Nama lokal',city:'Kota lama'});
 const latest=mergeProfileDraft(email,{name:'Nama sebelumnya',city:'Domisili terbaru',position:'Jabatan terbaru'});
 const saved=mergeProfileDraft(email,latest,draft,new Set(['name']));
 assert.equal(saved.name,'Nama lokal');assert.equal(saved.city,latest.city);assert.equal(saved.position,latest.position);
});
test('switching accounts never copies personal data or changes the authenticated email',()=>{
 const old=mergeProfileDraft(email,{name:'Nama akun pertama',phone:'08123456789'});
 const next=mergeProfileDraft('second@example.invalid',{email:'forged@example.invalid',name:'Akun kedua'},old,new Set(['name','phone','email']));
 assert.equal(next.email,'second@example.invalid');assert.equal(next.name,'Akun kedua');assert.equal(next.phone,'');
 const same=mergeProfileDraft(email,undefined,{...old,email},new Set(['email']));assert.equal(same.email,email);
});
