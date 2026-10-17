const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = require('./load-source.cjs');

const { getSidebarNavigation, isActivePath } = load('components/app-sidebar.tsx', {
  'next/image': {}, 'next/link': {}, 'next/navigation': {},
  '@/components/brand/brand-elements': {}, '@/components/platform/provider': {},
  '@/components/ui/collapsible': {}, '@/components/ui/sidebar': {},
});
const links = groups => groups.flatMap(group => group.items).map(item => item.href);

test('sidebar regrouping preserves participant destinations and isolates superadmin menus', () => {
  assert.deepEqual(links(getSidebarNavigation('participant', 'participant')), [
    '/dashboard', '/dashboard/events', '/dashboard/tickets', '/dashboard/certificates', '/dashboard/profile',
  ]);
  const operational = links(getSidebarNavigation('admin', 'operational'));
  const superadmin = links(getSidebarNavigation('admin', 'super'));
  assert.equal(operational.length, 14);
  assert.ok(operational.includes('/admin/profile'));
  assert.deepEqual(superadmin.filter(href => !operational.includes(href)), ['/admin/users', '/admin/operations/settings']);
  assert.equal(getSidebarNavigation('participant', 'participant').find(group => group.icon).label, 'Kegiatan saya');
});

test('current menu matches nested routes without selecting overview or similarly prefixed paths', () => {
  assert.equal(isActivePath('/admin/events/webinar', '/admin/events'), true);
  assert.equal(isActivePath('/dashboard/tickets/ticket', '/dashboard/tickets'), true);
  assert.equal(isActivePath('/admin/events', '/admin'), false);
  assert.equal(isActivePath('/dashboard/profile', '/dashboard'), false);
  assert.equal(isActivePath('/admin/events-archive', '/admin/events'), false);
  assert.equal(isActivePath('/dashboard', '/dashboard'), true);
});

test('every sidebar destination resolves to an existing page including supported operations modules', () => {
  for (const href of [...links(getSidebarNavigation('participant', 'participant')), ...links(getSidebarNavigation('admin', 'super'))]) {
    const module = href.match(/^\/admin\/operations\/(.+)$/)?.[1];
    if (module) {
      assert.ok(['leads', 'participants', 'waitlist', 'evaluations', 'finance', 'settings'].includes(module));
      assert.ok(fs.existsSync(path.resolve(__dirname, '../app/admin/operations/[module]/page.tsx')));
    } else {
      assert.ok(fs.existsSync(path.resolve(__dirname, '../app' + href + '/page.tsx')), href);
    }
  }
});
