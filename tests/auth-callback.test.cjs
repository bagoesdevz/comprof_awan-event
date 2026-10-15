const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./load-source.cjs');
const {authEmailRedirectUrl}=load('lib/auth-redirect.ts');

function handler({reject=false,unavailable=false,logoutFails=false,exchangeError='bad_code_verifier'}={}){
 const calls=[];
 const auth={verifyOtp:async input=>{calls.push(['verify',input]);return{error:reject?{code:'otp_expired'}:null};},exchangeCodeForSession:async code=>{calls.push(['exchange',code]);return{error:reject?{code:exchangeError}:null};},signOut:async input=>{calls.push(['signOut',input]);return{error:logoutFails?new Error('Fixture sign out failed'):null};}};
 const {GET}=load('app/auth/callback/route.ts',{'@/lib/supabase/auth':{sessionClient:async()=>{if(unavailable)throw new Error('Fixture service unavailable');return{auth};}}});
 return{calls,get:path=>GET(new Request('https://awanevent.com/auth/callback'+path))};
}

test('all outgoing email links use the reachable canonical site and explicit purpose',()=>{
 for(const type of ['signup','email','recovery','invite'])assert.equal(authEmailRedirectUrl(type),'https://awanevent.com/auth/callback?type='+type);
});

test('email confirmation verifies before sending the participant to login and closes only that session',async()=>{
 for(const type of ['signup','email']){
  const h=handler(),response=await h.get('?token_hash=fixture-token&type='+type+'&next=https://attacker.invalid');
  assert.equal(response.status,303);assert.equal(response.headers.get('location'),'https://awanevent.com/login?confirmed=1');
  assert.deepEqual(h.calls,[['verify',{token_hash:'fixture-token',type}],['signOut',{scope:'local'}]]);
  assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');
 }
});

test('recovery and invite keep the verified session and open the password form',async()=>{
 for(const type of ['recovery','invite']){
  const h=handler(),response=await h.get('?token_hash=fixture-token&type='+type);
  assert.equal(response.headers.get('location'),'https://awanevent.com/reset-password');assert.deepEqual(h.calls,[['verify',{token_hash:'fixture-token',type}]]);
 }
});

test('existing PKCE links remain supported, including the legacy reset next parameter',async()=>{
 for(const query of ['?code=fixture-code&type=recovery','?code=fixture-code&next=/reset-password']){
  const h=handler(),response=await h.get(query);assert.equal(response.headers.get('location'),'https://awanevent.com/reset-password');assert.deepEqual(h.calls,[['exchange','fixture-code']]);
 }
 const h=handler();assert.equal((await h.get('?code=fixture-code')).headers.get('location'),'https://awanevent.com/login?confirmed=1');
});

test('invalid, reused and missing credentials never authenticate and have an actionable destination',async()=>{
 for(const type of ['signup','recovery']){
  const h=handler({reject:true}),response=await h.get('?token_hash=expired-fixture&type='+type);
  assert.equal(response.headers.get('location'),'https://awanevent.com/'+(type==='recovery'?'forgot-password?error=recovery':'login?error=confirmation'));
  assert.equal(h.calls.length,1);
 }
 for(const query of ['','?token_hash=fixture&type=unsupported','?error=access_denied&error_code=otp_expired']){
  const h=handler();assert.equal((await h.get(query)).headers.get('location'),'https://awanevent.com/login?error=confirmation');assert.equal(h.calls.length,0);
 }
 const h=handler({reject:true});assert.equal((await h.get('?code=fixture')).headers.get('location'),'https://awanevent.com/login?error=browser');assert.deepEqual(h.calls,[['exchange','fixture']]);
 const missing=handler({reject:true,exchangeError:'pkce_code_verifier_not_found'});assert.equal((await missing.get('?code=fixture&type=recovery')).headers.get('location'),'https://awanevent.com/forgot-password?error=browser');
});

test('service failure produces a usable page and successful confirmation survives signout failure',async()=>{
 const unavailable=handler({unavailable:true});assert.equal((await unavailable.get('?token_hash=fixture&type=recovery')).headers.get('location'),'https://awanevent.com/forgot-password?error=service');
 const confirmed=handler({logoutFails:true});assert.equal((await confirmed.get('?token_hash=fixture&type=signup')).headers.get('location'),'https://awanevent.com/login?confirmed=1');
});

test('legacy provider errors at the site root lead to a usable login without contacting Auth',async()=>{
 const {NextRequest}=require('next/server');
 const unexpected=()=>{throw new Error('Root navigation must not contact Supabase');};
 const {middleware}=load('middleware.ts',{'@supabase/ssr':{createServerClient:unexpected},'@supabase/supabase-js':{createClient:unexpected}});
 const response=await middleware(new NextRequest('https://awanevent.com/?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'));
 assert.equal(response.status,303);assert.equal(response.headers.get('location'),'https://awanevent.com/login?error=confirmation');
 assert.equal(response.headers.get('cache-control'),'private, no-store');
 assert.equal((await middleware(new NextRequest('https://awanevent.com/'))).headers.get('x-middleware-next'),'1');
});
