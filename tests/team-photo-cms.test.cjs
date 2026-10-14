const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');

function cmsRoute(role = 'super') {
  const http = load('lib/server/http.ts', {
    '@/lib/supabase/server': { SupabaseConfigurationError: class extends Error {} },
  });
  const guards = load('lib/server/platform.ts', {
    '@/lib/server/http': http,
    './http': http,
    '@/lib/supabase/server': {},
  });
  const commits = [];
  const route = load('app/api/platform/route.ts', {
    '@/lib/supabase/auth': { currentUser: async () => role ? { id:'test-user', email:'admin@example.invalid', app_metadata:{role} } : null },
    '@/lib/server/http': { ...http, rateLimit: async () => {} },
    '@/lib/server/platform': {
      ...guards,
      record: async () => null,
      commit: async changes => commits.push(changes),
      snapshot: async () => ({ state:{}, revisions:{} }),
    },
  });
  return { route, commits };
}

function patch(id, image = '/team-photo.jpg', origin = 'https://events.example') {
  return new Request('https://events.example/api/platform', {
    method:'PATCH', headers:{ origin, 'Content-Type':'application/json' },
    body:JSON.stringify({changes:[{collection:'cms',id,revision:0,data:{title:'Anggota tim',body:'Peran tim',image,status:'Published'}}]}),
  });
}

test('team portraits use CMS validation and publish all six supported member slots', async () => {
  const { route, commits } = cmsRoute();
  for (let member=1; member<=6; member++) {
    assert.equal((await route.PATCH(patch(`TeamMember-${member}`))).status,200);
    assert.equal(commits.at(-1)[0].published,true);
    assert.equal(commits.at(-1)[0].collection,'cms');
  }
  assert.equal((await route.PATCH(patch('Team'))).status,200);
  assert.equal(commits.length,7);
});

test('team portrait slots do not allow arbitrary CMS keys or unsafe image URLs', async () => {
  const { route, commits } = cmsRoute();
  for (const id of ['TeamMember-0','TeamMember-7','TeamMember-01','TeamMember-1-extra','Unrecognized']) {
    assert.equal((await route.PATCH(patch(id))).status,422);
  }
  assert.equal((await route.PATCH(patch('TeamMember-1','//attacker.example/photo.jpg'))).status,422);
  assert.equal((await route.PATCH(patch('TeamMember-1','javascript:alert(1)'))).status,422);
  assert.equal(commits.length,0);
});

test('team portrait writes preserve superadmin and same-origin requirements', async () => {
  for (const [role,status] of [['operational',403],['participant',403],[null,401]]) {
    const { route, commits } = cmsRoute(role);
    assert.equal((await route.PATCH(patch('TeamMember-1'))).status,status);
    assert.equal(commits.length,0);
  }
  const { route, commits } = cmsRoute();
  assert.equal((await route.PATCH(patch('TeamMember-1','/team-photo.jpg','https://attacker.example'))).status,403);
  assert.equal(commits.length,0);
});
