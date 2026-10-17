const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const load = require('./load-source.cjs');
const { SelectInput } = load('components/ui/select.tsx');
const { Field } = load('components/platform/ui.tsx', { 'next/link': {}, '@/components/ui/select': { SelectInput } });
const options = [React.createElement('option', { key: '', value: '' }, 'Pilih tiket'), React.createElement('option', { key: 'online', value: 'online' }, 'Akses online')];

test('Field upgrades native selects with associated combobox labels and preserves required form controls', () => {
  const html = renderToStaticMarkup(React.createElement(Field, { label: 'Tiket', hint: 'Pilih akses kegiatan' }, React.createElement('select', { id: 'ticket', name: 'ticket', required: true, defaultValue: '' }, options)));
  assert.match(html, /role="combobox"/);
  assert.match(html, /for="ticket"/);
  assert.match(html, /id="ticket"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-labelledby=/);
  assert.match(html, /aria-describedby=/);
  assert.match(html, /class="ux-select-native"[^>]*name="ticket"[^>]*required=""/);
  assert.match(html, /<option value="" selected="">Pilih tiket<\/option>/);
});

test('shared selects retain the selected text, explicit name, disabled state and numeric option values', () => {
  const html = renderToStaticMarkup(React.createElement(SelectInput, { name: 'score', value: 0, disabled: true, 'aria-label': 'Jawaban benar' }, [0, 1].map(n => React.createElement('option', { key: n, value: n }, `Pilihan ${n + 1}`))));
  assert.match(html, /aria-label="Jawaban benar"/);
  assert.match(html, /role="combobox"[^>]*disabled=""/);
  assert.match(html, /Pilihan 1/);
  assert.match(html, /<option value="0" selected="">Pilihan 1<\/option>/);
  assert.match(html, /name="score"[^>]*disabled=""/);
});
