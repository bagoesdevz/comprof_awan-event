const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

test('production migration applies and protects active registrations and waitlist', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create table public.platform_records(collection text,id text,data jsonb,owner_email text,published boolean default false,revision bigint default 1,updated_at timestamptz default now(),primary key(collection,id));`);
    const migration=fs.readFileSync(path.join(__dirname,'../supabase/migrations/202610130001_production_guards.sql'),'utf8');
    await db.exec(migration);
    await db.query(`insert into public.platform_records(collection,id,data,owner_email) values ('registrations','r1',$1,'p@example.com')`, [JSON.stringify({eventSlug:'event',payment:'paid',quantity:3})]);
    await assert.rejects(db.query(`insert into public.platform_records(collection,id,data,owner_email) values ('registrations','r2',$1,'p@example.com')`, [JSON.stringify({eventSlug:'event',payment:'pending'})]), error=>error.code==='23505');
    await db.query(`insert into public.platform_records(collection,id,data,owner_email) values ('registrations','r3',$1,'p@example.com')`, [JSON.stringify({eventSlug:'event',payment:'expired'})]);
    assert.deepEqual((await db.query('select * from public.platform_participant_counts()')).rows,[{event_slug:'event',participants:3}]);
    await db.query(`insert into public.platform_records(collection,id,data,owner_email) values ('waitlist','w1',$1,'p@example.com')`,[JSON.stringify({eventSlug:'event',status:'waiting'})]);
    await assert.rejects(db.query(`insert into public.platform_records(collection,id,data,owner_email) values ('waitlist','w2',$1,'p@example.com')`,[JSON.stringify({eventSlug:'event',status:'waiting'})]), error=>error.code==='23505');
    const event={slug:'event',certificateEnabled:true,certificateTemplate:'/template.png',endAt:'2020-01-01T00:00:00Z',preTest:{enabled:false},postTest:{enabled:false}};
    await db.query(`insert into public.platform_records(collection,id,data,published) values('events','e1',$1,true)`,[JSON.stringify(event)]);
    await db.query(`update public.platform_records set data=data||$1::jsonb where id='r1'`,[JSON.stringify({progress:{attendance:true,feedback:true}})]);
    assert.deepEqual((await db.query('select * from public.platform_certificate_candidates(50)')).rows,[{registration_id:'r1'}]);
    await db.query(`update public.platform_records set data=data||$1::jsonb where id='r1'`,[JSON.stringify({certificate:{status:'valid',emailSentAt:'2020-01-02T00:00:00Z'}})]);
    assert.equal((await db.query('select * from public.platform_certificate_candidates(50)')).rows.length,0);
    for (const id of ['pending1','pending2']) await db.query(`insert into public.platform_records(collection,id,data,owner_email) values('registrations',$1,$2,$3)`,[id,JSON.stringify({eventSlug:'event',payment:'pending',createdAt:'2020-01-01T00:00:00Z'}),id+'@example.com']);
    assert.equal((await db.query('select * from public.platform_pending_payments(1)')).rows[0].registration_id,'pending1');
    await db.query("select public.platform_mark_payment_checked('pending1')");
    assert.equal((await db.query('select * from public.platform_pending_payments(1)')).rows[0].registration_id,'pending2');
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.platform_participant_counts()'),error=>error.code==='42501');
  } finally { await db.close(); }
});
