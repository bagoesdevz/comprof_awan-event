const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
test('certificate candidates exclude unverified names before limiting the queue and keep service-only execution',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create table public.platform_records(collection text,id text,data jsonb,owner_email text,published boolean default false,revision bigint default 1,updated_at timestamptz default now(),primary key(collection,id));`);
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/202610130001_production_guards.sql'),'utf8'));
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/202610160001_certificate_name_verification.sql'),'utf8'));
  const event={slug:'event',certificateEnabled:true,certificateTemplate:'/template.png',endAt:'2020-01-01T00:00:00Z',preTest:{enabled:false},postTest:{enabled:false}};
  await db.query(`insert into public.platform_records(collection,id,data,published) values('events','event',$1,true)`,[JSON.stringify(event)]);
  const base={eventSlug:'event',payment:'paid',progress:{attendance:true,feedback:true}};
  for(let i=0;i<55;i++)await db.query(`insert into public.platform_records(collection,id,data,owner_email) values('registrations',$1,$2,$3)`,['unverified-'+i,JSON.stringify(base),`unverified-${i}@example.invalid`]);
  assert.equal((await db.query('select * from public.platform_certificate_candidates(50)')).rows.length,0);
  const verified={...base,certificateName:{name:'Nama terverifikasi',verifiedAt:'2020-01-02T00:00:00Z'}};
  await db.query(`insert into public.platform_records(collection,id,data,owner_email) values('registrations','verified',$1,'verified@example.invalid')`,[JSON.stringify(verified)]);
  assert.deepEqual((await db.query('select * from public.platform_certificate_candidates(50)')).rows,[{registration_id:'verified'}]);
  await db.query(`update public.platform_records set data=data||$1::jsonb where id='verified'`,[JSON.stringify({certificate:{status:'valid',emailSentAt:'2020-01-03T00:00:00Z'}})]);
  assert.equal((await db.query('select * from public.platform_certificate_candidates(50)')).rows.length,0);
  for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(db.query('select * from public.platform_certificate_candidates(50)'),e=>e.code==='42501');await db.exec('reset role');}
 }finally{await db.close();}
});
