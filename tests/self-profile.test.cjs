const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const load = require('./load-source.cjs');
const { blankProfile, initialState, profileComplete } = load('lib/platform-model.ts');
const email = 'self@example.invalid';
const complete = () => ({ ...blankProfile(email), name: 'Nama pengujian', phone: '08123456789', gender: 'female', birthPlace: 'Kota uji', birthDate: '1995-01-15', city: 'Kota uji', profession: 'Profesi uji', source: 'WhatsApp' });

function fixture({ role = 'participant', anonymous = false, revision = 4, limited = false, forged = false } = {}) {
  const http = load('lib/server/http.ts', { '@/lib/supabase/server': { SupabaseConfigurationError: class extends Error {} } });
  const guards = load('lib/server/platform.ts', { './http': http, '@/lib/supabase/server': {} });
  const user = anonymous ? null : { id: 'self-id', email, app_metadata: forged ? {} : { role }, user_metadata: { role: 'super' } };
  let stored = complete();
  const commits = [];
  const route = load('app/api/platform/route.ts', {
    '@/lib/supabase/auth': { currentUser: async () => user },
    '@/lib/server/http': { ...http, rateLimit: async () => { if (limited) throw new http.HttpError(429, 'Terlalu banyak permintaan.'); } },
    '@/lib/server/platform': {
      ...guards,
      record: async () => revision === 0 ? null : { revision, data: stored, owner_email: email },
      commit: async changes => { commits.push(changes); stored = changes[0].data; },
      snapshot: async () => ({ state: { profiles: { [email]: stored } } }),
    },
  });
  async function save(data, { id = email, rev = revision, origin = 'https://events.example' } = {}) {
    return route.PATCH(new Request('https://events.example/api/platform', {
      method: 'PATCH', headers: { origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes: [{ collection: 'profiles', id, revision: rev, data }] }),
    }));
  }
  return { save, commits, route };
}

test('participants and both admin roles can persist their own profile with authenticated ownership', async () => {
  for (const role of ['participant', 'operational', 'super']) {
    const f = fixture({ role });
    const response = await f.save({ ...complete(), name: 'Nama yang diperbarui', email: 'forged@example.invalid', role: 'super' });
    assert.equal(response.status, 200);
    const saved = (await response.json()).state.profiles[email];
    assert.equal(saved.name, 'Nama yang diperbarui');
    assert.equal(saved.email, email);
    assert.equal(saved.role, undefined);
    assert.equal(f.commits[0][0].owner_email, email);
    assert.equal(f.commits[0][0].revision, 4);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal((await (await f.route.GET()).json()).state.profiles[email].name, saved.name);
  }
});

test('admin first save needs only a name and keeps existing participant fields when provided', async () => {
  for (const role of ['operational', 'super']) {
    const f = fixture({ role, revision: 0 });
    assert.equal((await f.save({ ...blankProfile(email), name: 'Admin pengujian' })).status, 200);
    assert.equal(f.commits[0][0].data.phone, '');
    assert.equal(profileComplete(f.commits[0][0].data), false);
    const existing = fixture({ role });
    await existing.save({ ...complete(), name: 'Nama admin baru' });
    assert.equal(existing.commits[0][0].data.birthDate, '1995-01-15');
    assert.equal(existing.commits[0][0].data.source, 'WhatsApp');
  }
});

test('admin validation cannot be selected by participant claims and registration completeness stays required', async () => {
  for (const options of [{ role: 'participant' }, { role: 'super', forged: true }]) {
    const f = fixture(options);
    assert.equal((await f.save({ ...blankProfile(email), name: 'Nama peserta', role: 'super' })).status, 422);
    assert.equal(f.commits.length, 0);
  }
});

test('all roles are blocked from editing another account; sign-in and same-origin are required', async () => {
  for (const role of ['participant', 'operational', 'super']) {
    const f = fixture({ role });
    assert.equal((await f.save(complete(), { id: 'other@example.invalid' })).status, 403);
    assert.equal((await f.save(complete(), { origin: 'https://other.example' })).status, 403);
    assert.equal(f.commits.length, 0);
  }
  const anonymous = fixture({ anonymous: true });
  assert.equal((await anonymous.save(complete())).status, 401);
  assert.equal(anonymous.commits.length, 0);
});

test('invalid values, stale profiles and throttling fail without writes', async () => {
  for (const role of ['participant', 'operational', 'super']) {
    for (const invalid of [{ name: 'A' }, { name: ' '.repeat(4) }, { phone: '123' }, { birthDate: 'not-a-date' }, { gender: 'invalid' }]) {
      const f = fixture({ role });
      assert.equal((await f.save({ ...complete(), ...invalid })).status, 422);
      assert.equal(f.commits.length, 0);
    }
    const stale = fixture({ role });
    assert.equal((await stale.save(complete(), { rev: 3 })).status, 409);
    assert.equal(stale.commits.length, 0);
    const limited = fixture({ role, limited: true });
    assert.equal((await limited.save(complete())).status, 429);
    assert.equal(limited.commits.length, 0);
  }
});

test('profile editor shows admin account fields, participant biodata and a real password recovery link', () => {
  for (const role of ['participant', 'operational', 'super']) {
    const state = initialState(); state.session = { loggedIn: true, email, role }; state.profiles[email] = complete();
    const platform = { usePlatform: () => ({ state, ready: true, update: async () => true, refresh: async () => state, error: '' }) };
    const Link = ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
    const stubs = { 'next/link': { default: Link }, 'next/navigation': { useRouter: () => ({}) }, './provider': platform, '@/components/platform/provider': platform };
    const { ProfileEditor } = load('components/platform/profile-editor.tsx', stubs);
    const html = renderToStaticMarkup(React.createElement(ProfileEditor));
    assert.match(html, /Profil saya/);
    assert.match(html, /href="\/forgot-password"/);
    assert.match(html, /Email akun/);
    assert.match(html, /Simpan profil/);
    if (role === 'participant') assert.match(html, /Tanggal lahir/);
    else { assert.doesNotMatch(html, /Tanggal lahir|Info webinar dari|Jenis kelamin/); assert.match(html, /Jabatan/); }
  }
});
