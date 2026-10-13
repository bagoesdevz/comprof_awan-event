const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');

test('record commit rejects stale revisions and rolls back an entire conflicting batch',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;
   create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/202609200001_platform_records.sql'),'utf8'));
  const change=(id,revision,value)=>({collection:'events',id,revision,data:{slug:id,value},published:false});
  await db.query('select public.commit_platform_changes($1::jsonb)',[JSON.stringify([change('a',0,1),change('b',0,1)])]);
  await assert.rejects(db.query('select public.commit_platform_changes($1::jsonb)',[JSON.stringify([change('a',1,2),change('b',0,2)])]),error=>error.code==='40001');
  assert.equal((await db.query("select data->>'value' as value,revision from public.platform_records where id='a'")).rows[0].value,'1');
  await db.query('select public.commit_platform_changes($1::jsonb)',[JSON.stringify([change('a',1,2)])]);
  await assert.rejects(db.query('select public.commit_platform_changes($1::jsonb)',[JSON.stringify([change('a',1,3)])]),error=>error.code==='40001');
 }finally{await db.close();}
});
