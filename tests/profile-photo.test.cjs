const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const load = require('./load-source.cjs');
const email = 'photo@example.invalid';
const storage = 'https://photo-storage.example.invalid';
const userId = 'test-owner';
const filename = '12345678-1234-4234-8234-123456789abc.webp';
const photoUrl = `${storage}/storage/v1/object/public/event-assets/avatars/${userId}/${filename}`;
const helpers = load('lib/server/profile-photo.ts', { sharp: { default: sharp } });
const png = () => sharp({ create: { width: 800, height: 600, channels: 3, background: '#6441bf' } }).png().toBuffer();

test('profile photos decode, rotate, crop square and re-encode without source metadata', async () => {
  for (const format of ['png', 'jpeg', 'webp']) {
    const bytes = await sharp(await png()).withMetadata({ orientation: 6 }).toFormat(format).toBuffer();
    const output = await helpers.prepareProfilePhoto(bytes);
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, 512); assert.equal(metadata.height, 512);
    assert.equal(metadata.exif, undefined); assert.equal(metadata.orientation, undefined);
    assert.ok(output.length < 1024 * 1024);
  }
});

test('empty, oversize, SVG, forged, damaged and excessive-pixel photos are rejected', async () => {
  const huge = await sharp({ create: { width: 5001, height: 5000, channels: 3, background: '#fff' } }).png().toBuffer();
  for (const bytes of [Buffer.alloc(0), Buffer.alloc(helpers.profilePhotoMaxBytes + 1), Buffer.from('<svg></svg>'), Buffer.from('not a photo'), (await png()).subarray(0, 28), huge]) {
    await assert.rejects(helpers.prepareProfilePhoto(bytes), error => error.status === 422);
  }
});

test('avatar URLs must point to the authenticated owner namespace on configured storage', () => {
  const previous = process.env.SUPABASE_URL;
  process.env.SUPABASE_URL = storage;
  try {
    assert.equal(helpers.isOwnProfilePhoto('', userId), true);
    assert.equal(helpers.isOwnProfilePhoto(photoUrl, userId), true);
    for (const value of [photoUrl.replace(storage, 'https://other.example'), photoUrl.replace(userId, 'other-owner'), photoUrl + '?x=1', photoUrl + '#x', photoUrl.replace('https:', 'http:'), photoUrl.replace(filename, '../x.webp'), photoUrl.replace(filename, 'x.svg'), '/local.jpg', 'data:image/png;base64,a', 'javascript:alert(1)']) assert.equal(helpers.isOwnProfilePhoto(value, userId), false, value);
    delete process.env.SUPABASE_URL;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) assert.equal(helpers.isOwnProfilePhoto(photoUrl, userId), false);
  } finally { if (previous === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous; }
});

function fixture({ role = 'participant', anonymous = false, limited = false, storageError = false } = {}) {
  const http = load('lib/server/http.ts', { '@/lib/supabase/server': { SupabaseConfigurationError: class extends Error {} } });
  const guards = load('lib/server/platform.ts', { './http': http, '@/lib/supabase/server': {} });
  const uploads = [];
  const client = { storage: { from: bucket => {
    assert.equal(bucket, 'event-assets');
    return { upload: async (...args) => { uploads.push(args); return { error: storageError ? new Error('secret server detail') : null }; }, getPublicUrl: path => ({ data: { publicUrl: `${storage}/storage/v1/object/public/event-assets/${path}` } }) };
  } } };
  const route = load('app/api/profile/photo/route.ts', {
    '@/lib/supabase/auth': { currentUser: async () => anonymous ? null : { id: userId, email, app_metadata: { role } } },
    '@/lib/server/platform': guards, '@/lib/supabase/server': { getServiceSupabaseClient: () => client },
    '@/lib/server/profile-photo': load('lib/server/profile-photo.ts', { './http': http, sharp: { default: sharp } }),
    '@/lib/server/http': { ...http, rateLimit: async (key, limit) => { assert.equal(key, 'profile-photo:' + userId); assert.equal(limit, 10); if (limited) throw new http.HttpError(429, 'Terlalu banyak permintaan.'); } },
  });
  async function upload(bytes, { origin = 'https://events.example', type = 'image/png', body, headers = {} } = {}) {
    const form = new FormData(); if (bytes) form.set('file', new File([bytes], '../../other.jpg', { type }));
    return route.POST(new Request('https://events.example/api/profile/photo', { method: 'POST', headers: { origin, ...headers }, body: body || form }));
  }
  return { uploads, upload };
}

test('participants and both admin roles upload only to server-chosen paths, without exposing private fields', async () => {
  for (const role of ['participant', 'operational', 'super']) {
    const f = fixture({ role }); const response = await f.upload(await png());
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.match(f.uploads[0][0], /^avatars\/test-owner\/[0-9a-f-]{36}\.webp$/);
    assert.equal(f.uploads[0][2].contentType, 'image/webp'); assert.equal(f.uploads[0][2].upsert, false);
    assert.deepEqual(Object.keys(await response.json()), ['url']);
  }
});

test('uploads enforce authentication, same origin, throttling, size, image decoding and storage failures', async () => {
  for (const [options, request, status] of [[{ anonymous: true }, {}, 401], [{}, { origin: 'https://other.example' }, 403], [{ limited: true }, {}, 429], [{}, { headers: { 'content-length': '6000000' } }, 413]]) {
    const f = fixture(options); assert.equal((await f.upload(await png(), request)).status, status); assert.equal(f.uploads.length, 0);
  }
  const f = fixture();
  assert.equal((await f.upload(null)).status, 422);
  assert.equal((await f.upload(Buffer.from('<svg></svg>'))).status, 422);
  assert.equal((await f.upload(null, { body: 'bad multipart', headers: { 'content-type': 'multipart/form-data' } })).status, 422);
  assert.equal(f.uploads.length, 0);
  const unavailable = fixture({ storageError: true }); const result = await unavailable.upload(await png());
  assert.equal(result.status, 503); assert.doesNotMatch(JSON.stringify(await result.json()), /secret server detail/);
});

test('profile saves preserve old clients, store own photo, reject foreign photos and remove without clearing biodata', async () => {
  const previous = process.env.SUPABASE_URL; process.env.SUPABASE_URL = storage;
  try {
    for (const role of ['participant', 'operational', 'super']) {
      const http = load('lib/server/http.ts', { '@/lib/supabase/server': { SupabaseConfigurationError: class extends Error {} } });
      const guards = load('lib/server/platform.ts', { './http': http, '@/lib/supabase/server': {} });
      let profile = { ...load('lib/platform-model.ts').blankProfile(email), name: 'Nama uji foto', phone: '08123456789', gender: 'female', birthPlace: 'Kota uji', birthDate: '1995-01-15', city: 'Kota uji', profession: 'Profesi uji', source: 'WhatsApp', avatarUrl: photoUrl };
      const route = load('app/api/platform/route.ts', {
        '@/lib/supabase/auth': { currentUser: async () => ({ id: userId, email, app_metadata: { role } }) },
        '@/lib/server/http': { ...http, rateLimit: async () => {} },
        '@/lib/server/platform': { ...guards, record: async () => ({ data: profile, revision: 1 }), commit: async changes => { profile = changes[0].data; }, snapshot: async () => ({ profile }) },
      });
      const save = data => route.PATCH(new Request('https://events.example/api/platform', { method: 'PATCH', headers: { origin: 'https://events.example', 'content-type': 'application/json' }, body: JSON.stringify({ changes: [{ collection: 'profiles', id: email, revision: 1, data }] }) }));
      const legacy = { ...profile }; delete legacy.avatarUrl;
      assert.equal((await save(legacy)).status, 200); assert.equal(profile.avatarUrl, photoUrl);
      assert.equal((await save({ ...profile, avatarUrl: photoUrl.replace(userId, 'other-user') })).status, 422);
      assert.equal((await save({ ...profile, avatarUrl: photoUrl })).status, 200);
      assert.equal((await save({ ...profile, avatarUrl: '' })).status, 200); assert.equal(profile.avatarUrl, ''); assert.equal(profile.name, 'Nama uji foto'); assert.equal(profile.city, 'Kota uji');
    }
  } finally { if (previous === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous; }
});

test('refresh preserves photo removal drafts and account switches discard them', () => {
  const { mergeProfileDraft } = load('lib/profile-draft.ts');
  const saved = mergeProfileDraft(email, { name: 'Nama foto', avatarUrl: photoUrl });
  const draft = { ...saved, avatarUrl: '' };
  assert.equal(mergeProfileDraft(email, { ...saved, city: 'Kota baru' }, draft, new Set(['avatarUrl'])).avatarUrl, '');
  const other = mergeProfileDraft('other@example.invalid', { avatarUrl: 'other-photo' }, draft, new Set(['avatarUrl']));
  assert.equal(other.avatarUrl, 'other-photo');
});
