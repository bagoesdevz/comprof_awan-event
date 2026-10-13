const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');
const { readBody, sameOrigin } = load('lib/server/http.ts', {
  '@/lib/supabase/server': { SupabaseConfigurationError: class extends Error {} },
});
const { providerPaymentStatus, canChangePayment } = load('lib/payment-state.ts');

test('request size is enforced while streaming without Content-Length', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(40)); },
    cancel() { cancelled = true; },
  });
  const request = new Request('https://events.example/api', { method: 'POST', body: stream, duplex: 'half' });
  await assert.rejects(readBody(request, 20), error => error.status === 413);
  assert.equal(cancelled, true);
});

test('stream decoding supports split UTF-8 characters and rejects invalid JSON', async () => {
  const bytes = new TextEncoder().encode('{"message":"belajar ☀"}');
  const stream = new ReadableStream({start(c) {
    for (const byte of bytes) c.enqueue(Uint8Array.of(byte));
    c.close();
  }});
  const request = new Request('https://events.example/api', {method:'POST',body:stream,duplex:'half'});
  assert.deepEqual(await readBody(request), {message:'belajar ☀'});
  await assert.rejects(readBody(new Request('https://events.example/api',{method:'POST',body:'{'})), error=>error.status===400);
});

test('mutation requests reject cross-origin and absent Origin', () => {
  assert.throws(()=>sameOrigin(new Request('https://events.example/api')), error=>error.status===403);
  assert.throws(()=>sameOrigin(new Request('https://events.example/api',{headers:{origin:'https://attacker.example'}})), error=>error.status===403);
  sameOrigin(new Request('https://events.example/api',{headers:{origin:'https://events.example'}}));
});

test('refunds and completed payment states cannot regress on provider replay', () => {
  for (const state of ['pending','paid','failed','expired','cancelled','refunded']) assert.equal(canChangePayment('refunded',state),false);
  assert.equal(canChangePayment('paid','pending'),false);
  assert.equal(canChangePayment('paid','refunded'),true);
  assert.equal(canChangePayment('expired','paid'),false);
  assert.equal(canChangePayment('pending','paid'),true);
  assert.equal(providerPaymentStatus('partial_refund'),null);
  assert.equal(providerPaymentStatus('unexpected'),null);
  assert.equal(providerPaymentStatus('capture','challenge'),'pending');
  assert.equal(providerPaymentStatus('capture','accept'),'paid');
  assert.equal(providerPaymentStatus('deny'),'pending');
  assert.equal(canChangePayment('failed','paid'),true);
});
