const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');
const actorId = '12345678-1234-4234-8234-123456789001';
const targetId = '12345678-1234-4234-8234-123456789002';

function fixture(options = {}) {
  const calls = { client:0, updates:[], invites:0, lookups:[], lists:[], limits:[] };
  const user = options.actor === undefined ? { id:actorId, email:'super@example.invalid', app_metadata:{role:'super'} } : options.actor;
  const target = { id:targetId, email:'registered@example.invalid', app_metadata:{role:options.targetRole || 'participant',provider:'email',providers:['email'],other:'preserved'}, user_metadata:{name:'Akun pengujian',private:'not returned'} };
  const http = load('lib/server/http.ts', { '@/lib/supabase/server':{SupabaseConfigurationError:class extends Error{}} });
  const guards = load('lib/server/platform.ts', { '@/lib/server/http':http,'./http':http,'@/lib/supabase/server':{} });
  const route = load('app/api/admin/users/route.ts', {
    '@/lib/supabase/auth':{currentUser:async()=>user},
    '@/lib/server/platform':guards,
    '@/lib/server/http':{...http,rateLimit:async(...args)=>{calls.limits.push(args);if(options.limited)throw new http.HttpError(429,'Terlalu banyak permintaan.');}},
    '@/lib/supabase/server':{getServiceSupabaseClient:()=>{
      calls.client++;
      return {auth:{admin:{
        getUserById:async id=>{calls.lookups.push(id);return options.missing?{data:{user:null},error:{status:404}}:{data:{user:target},error:null};},
        updateUserById:async(id,attrs)=>{calls.updates.push({id,attrs});return options.updateFails?{data:{user:null},error:new Error('SDK failure')}:{data:{user:{...target,app_metadata:attrs.app_metadata}},error:null};},
        inviteUserByEmail:async()=>{calls.invites++;throw new Error('Role updates must not send invitations');},
        listUsers:async args=>{calls.lists.push(args);return {data:{users:options.empty?[]:[target],total:options.total || 1},error:null};},
      }}};
    }},
  });
  return {route,calls,target};
}
function patch(body = {userId:targetId,role:'operational'}, origin='https://events.example') {
  return new Request('https://events.example/api/admin/users',{method:'PATCH',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
}

test('superadmin changes an existing account role directly, preserving trusted metadata without an email invitation',async()=>{
  for(const [before,after] of [['participant','operational'],['participant','super'],['operational','participant'],['super','operational']]){
    const {route,calls}=fixture({targetRole:before});
    const response=await route.PATCH(patch({userId:targetId,role:after}));
    assert.equal(response.status,200);
    assert.deepEqual((await response.json()).user,{id:targetId,email:'registered@example.invalid',name:'Akun pengujian',role:after});
    assert.deepEqual(calls.updates,[{id:targetId,attrs:{app_metadata:{role:after,provider:'email',providers:['email'],other:'preserved'}}}]);
    assert.equal(calls.invites,0);
    assert.equal(response.headers.get('cache-control'),'private, no-store');
    assert.deepEqual(calls.limits,[[`user-role:${actorId}`,20]]);
  }
});

test('anonymous, participant, operational and user-metadata impersonators cannot change roles or list accounts',async()=>{
  for(const [actor,status] of [[null,401],[{id:actorId,email:'p@example.invalid',app_metadata:{role:'participant'}},403],[{id:actorId,email:'o@example.invalid',app_metadata:{role:'operational'}},403],[{id:actorId,email:'forged@example.invalid',user_metadata:{role:'super'},app_metadata:{}},403]]){
    const {route,calls}=fixture({actor});
    assert.equal((await route.PATCH(patch())).status,status);
    assert.equal((await route.GET(new Request('https://events.example/api/admin/users'))).status,status);
    assert.equal(calls.client,0);
  }
});

test('role writes require same origin, a UUID and a permitted role, rejecting other account changes',async()=>{
  for(const origin of ['https://attacker.example','']){
    const {route,calls}=fixture();assert.equal((await route.PATCH(patch(undefined,origin))).status,403);assert.equal(calls.client,0);
  }
  for(const body of [{userId:'not-an-id',role:'super'},{userId:targetId,role:'owner'},{userId:targetId,role:'super',email:'other@example.invalid'},{userId:targetId,role:'super',app_metadata:{role:'super'}},{userId:targetId}]){
    const {route,calls}=fixture();assert.equal((await route.PATCH(patch(body))).status,422);assert.equal(calls.client,0);
  }
});

test('self changes, missing accounts and throttled requests never write a role',async()=>{
  const self=fixture();assert.equal((await self.route.PATCH(patch({userId:actorId,role:'participant'}))).status,403);assert.equal(self.calls.client,0);
  const missing=fixture({missing:true});assert.equal((await missing.route.PATCH(patch())).status,404);assert.equal(missing.calls.updates.length,0);
  const limited=fixture({limited:true});assert.equal((await limited.route.PATCH(patch())).status,429);assert.equal(limited.calls.client,0);
});

test('unchanged roles are idempotent and provider write failures are reported without success or invitations',async()=>{
  const same=fixture({targetRole:'operational'});assert.equal((await same.route.PATCH(patch())).status,200);assert.equal(same.calls.updates.length,0);assert.equal(same.calls.invites,0);
  const failed=fixture({updateFails:true});const response=await failed.route.PATCH(patch());assert.equal(response.status,500);assert.ok((await response.json()).error.message);assert.equal(failed.calls.invites,0);
});

test('account lists support later pages and expose only the account summary and current admin id',async()=>{
  const {route,calls}=fixture({total:851});
  const response=await route.GET(new Request('https://events.example/api/admin/users?page=17'));
  assert.equal(response.status,200);
  const body=await response.json();assert.equal(body.page,17);assert.equal(body.hasNext,true);assert.equal(body.currentUserId,actorId);
  assert.deepEqual(calls.lists,[{page:17,perPage:50}]);assert.deepEqual(Object.keys(body.users[0]).sort(),['email','id','name','role']);
  assert.equal(JSON.stringify(body).includes('preserved'),false);assert.equal(JSON.stringify(body).includes('not returned'),false);
  const empty=fixture({empty:true});assert.equal((await (await empty.route.GET(new Request('https://events.example/api/admin/users?page=2'))).json()).hasNext,false);
  for(const page of ['0','NaN','-1','1.5'])assert.equal((await route.GET(new Request('https://events.example/api/admin/users?page='+page))).status,422);
});
