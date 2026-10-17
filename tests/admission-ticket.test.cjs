const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server'),load=require('./load-source.cjs');
const model=load('lib/platform-model.ts'),tickets=load('lib/admission-ticket.ts');
const {exampleEvent}=load('lib/example-event.ts');
const email='participant@example.invalid',id='AWN-ABCDEFGHIJ123456';
function data({price=0,attendance='ONLINE',type='ONLINE',payment='paid'}={}){
 const event={...model.manageEvent(structuredClone(exampleEvent)),type,registrationStatus:'OPEN',lifecycle:'ongoing',startAt:'2026-10-23T08:30:00Z',endAt:'2026-10-23T09:30:00Z',venue:'Gedung pengujian',venueAddress:'Alamat pengujian',city:'Kota pengujian'};
 Object.assign(event.tickets[0],{price,pricingMode:price?'paid':'free',attendance,quantityLimit:5,startsAt:'2000-01-01T00:00:00Z',endsAt:'2099-01-01T00:00:00Z'});
 const reg={...model.newRegistration(event,event.tickets[0].id,model.blankProfile(email,'Nama peserta pengujian')),id,payment};
 return{event,reg};
}
test('tickets require settled payment and a paid seat or physical attendance, including hybrid selections',()=>{
 for(const [options,allowed]of [[{},false],[{price:50000},true],[{attendance:'ONSITE',type:'ONSITE'},true],[{type:'HYBRID'},false],[{type:'HYBRID',attendance:'ONSITE'},true],[{type:'HYBRID',price:50000},true],[{type:'ONSITE'},true]]){
  const {event,reg}=data(options);assert.equal(tickets.hasAdmissionTicket(reg,event),allowed,JSON.stringify(options));
  for(const payment of ['pending','failed','expired','cancelled','refunded'])assert.equal(tickets.hasAdmissionTicket({...reg,payment},event),false);
  assert.equal(tickets.hasAdmissionTicket(reg,{...event,deletedAt:new Date().toISOString()}),false);
 }
 assert.equal(tickets.hasAdmissionTicket(data().reg,undefined),false);
});
test('historical seat prices survive event edits and zero-amount group members remain eligible',()=>{
 const paid=data({price:75000}),free=data();
 paid.event.tickets[0].price=0;free.event.tickets[0].price=75000;
 assert.equal(tickets.hasAdmissionTicket(paid.reg,paid.event),true);assert.equal(tickets.hasAdmissionTicket(free.reg,free.event),false);
 assert.equal(tickets.hasAdmissionTicket({...paid.reg,amount:0,orderId:'order'},paid.event),true);
 const legacy={...paid.reg,ticketPrice:undefined,quantity:3,amount:225000};assert.equal(tickets.registrationTicketPrice(legacy),75000);
 assert.equal(tickets.registrationTicketPrice({...legacy,amount:NaN}),0);
});
test('ticket data excludes email, phone, meeting secrets and uses WIB even across calendar days',()=>{
 const {event,reg}=data({price:50000});event.meetingUrl='https://meeting.example.invalid/private';event.meetingPasscode='private';
 const ticket=tickets.admissionTicket(reg,event);assert.equal(ticket.participant,reg.name);assert.equal(ticket.reference,id);
 assert.equal(ticket.location,'Online melalui Zoom');assert.equal(ticket.status,'Siap digunakan');
 assert.equal(ticket.email,undefined);assert.equal(ticket.phone,undefined);assert.equal(ticket.meetingUrl,undefined);assert.equal(ticket.meetingPasscode,undefined);
 assert.deepEqual(tickets.ticketSchedule(ticket),{date:'Jumat, 23 Oktober 2026',time:'15.30 s.d. 16.30 WIB'});
 assert.match(tickets.ticketSchedule({...ticket,endAt:'2026-10-24T02:00:00Z'}).time,/Sabtu, 24 Oktober 2026, 09.00 WIB/);
 assert.equal(tickets.admissionTicket({...reg,progress:{...reg.progress,attendance:true}},event).status,'Kehadiran tercatat');
 assert.equal(tickets.admissionTicket(reg,{...event,lifecycle:'completed'}).status,'Event selesai');
});
function routeFixture(options={}){
 const {event,reg}=data({price:50000,...options});Object.assign(reg,options.reg);
 const http=load('lib/server/http.ts',{'@/lib/supabase/server':{SupabaseConfigurationError:class extends Error{}}});
 const guards=load('lib/server/platform.ts',{'./http':http,'@/lib/supabase/server':{}});
 let reads=0;const row={id,data:reg,owner_email:options.owner||email};
 const route=load('app/api/tickets/[id]/route.ts',{
  '@/lib/supabase/auth':{currentUser:async()=>options.anonymous?null:{id:'user',email,app_metadata:{role:options.role||'participant'}}},
  '@/lib/server/platform':{...guards,record:async(_collection,key)=>{reads++;return key===id?(options.missing?null:row):(options.parent?{data:options.parent}:null);},findEvent:async()=>{if(options.deleted)throw new http.HttpError(404,'Event tidak ditemukan.');return{data:event};},liveEvent:e=>e},
  '@/lib/server/http':{...http,rateLimit:async()=>{if(options.limited)throw new http.HttpError(429,'Terlalu banyak permintaan.');}},
 });
 return{get:(key=id)=>route.GET(new Request('https://events.example/api/tickets/'+key),{params:Promise.resolve({id:key})}),reads:()=>reads,reg,event};
}
test('ticket endpoint verifies owner for all roles and rejects anonymous, invalid, missing, deleted and non-admission records',async()=>{
 for(const role of ['participant','operational','super']){
  const response=await routeFixture({role}).get();assert.equal(response.status,200);assert.equal((await response.json()).data.reference,id);assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.equal((await routeFixture({role,owner:'other@example.invalid'}).get()).status,404);
 }
 for(const [options,status]of [[{anonymous:true},401],[{missing:true},404],[{deleted:true},404],[{price:0},404],[{payment:'pending'},404],[{payment:'refunded'},404],[{limited:true},429],[{reg:{email:'other@example.invalid'}},404]])assert.equal((await routeFixture(options).get()).status,status,JSON.stringify(options));
 const f=routeFixture();assert.equal((await f.get('invalid')).status,422);assert.equal(f.reads(),0);
 assert.equal((await routeFixture({price:0,type:'ONSITE',attendance:'ONSITE'}).get()).status,200);
});
test('legacy group endpoint derives paid-seat eligibility from its matching paid order and never current event pricing',async()=>{
 const base=data({price:50000});const parent={...base.reg,id:'order',quantity:3,amount:150000,ticketPrice:undefined};
 const options={price:0,reg:{amount:0,ticketPrice:undefined,orderId:'order'},parent};
 assert.equal((await routeFixture(options).get()).status,200);
 for(const changed of [null,{...parent,payment:'pending'},{...parent,eventSlug:'other-event'},{...parent,ticketId:'other-ticket'}])assert.equal((await routeFixture({...options,parent:changed}).get()).status,409);
 assert.equal((await routeFixture({...options,parent:{...parent,amount:0}}).get()).status,404);
});
function actionFixture(options={}){
 const {event,reg}=data(options);Object.assign(reg,options.reg);const writes=[];
 const http=load('lib/server/http.ts',{'@/lib/supabase/server':{SupabaseConfigurationError:class extends Error{}}});
 const guards=load('lib/server/platform.ts',{'./http':http,'@/lib/supabase/server':{}});
 const platform={...guards,liveEvent:e=>e,findEvent:async()=>({id:event.id,data:event,published:true,revision:1}),records:async()=>[],record:async(collection)=>collection==='profiles'?{data:{name:'Nama pengujian',phone:'08123456789',gender:'female',birthPlace:'Kota',birthDate:'1995-01-01',city:'Kota',profession:'Profesi',source:'WhatsApp'}}:{id,data:reg,owner_email:email,revision:1},commit:async changes=>writes.push(...changes)};
 const {runAction}=load('lib/server/actions.ts',{'./platform':platform,'./http':http,'./certificates':{issueCertificate(){}}});return{event,reg,writes,runAction};
}
test('registration snapshots ticket price for the purchaser and every group participant without duplicating amounts',async()=>{
 const f=actionFixture({price:50000});const result=await f.runAction({email,app_metadata:{}},{type:'register',eventSlug:f.event.slug,ticketId:f.event.tickets[0].id,members:[{name:'Anggota pengujian',email:'member@example.invalid'}]});
 assert.equal(result.registration.ticketPrice,50000);const rows=f.writes.filter(r=>r.collection==='registrations');assert.equal(rows.length,2);assert.equal(rows[1].data.ticketPrice,50000);assert.equal(rows[1].data.amount,0);assert.equal(rows[0].data.amount,100000);
});
test('admin check-in denies free online tickets while free onsite and settled paid seats still work',async()=>{
 for(const [options,allowed]of [[{},false],[{price:50000},true],[{type:'ONSITE',attendance:'ONSITE'},true]]){
  const f=actionFixture(options);const promise=f.runAction({email:'admin@example.invalid',app_metadata:{role:'operational'}},{type:'check-in',id,eventSlug:f.event.slug});
  if(allowed){assert.equal((await promise).registration.progress.attendance,true);assert.equal(f.writes.length,1);}else{await assert.rejects(promise,/E-tiket hanya tersedia/);assert.equal(f.writes.length,0);}
 }
 const f=actionFixture();f.event.accessOpensAt='2000-01-01T00:00:00Z';f.event.meetingUrl='https://meeting.example.invalid';
 assert.equal((await f.runAction({email,app_metadata:{}},{type:'attendance',id})).registration.progress.attendance,true);
});
test('ticket UI hides free online and foreign registrations, shows Download without an event link and explains empty/loading/error states',()=>{
 function html(options={}){const state=model.initialState(),{event,reg}=data(options);state.session={loggedIn:true,email,role:'participant'};state.events=[event];state.registrations=[{...reg,email:options.foreign?'other@example.invalid':email}];const {Tickets}=load('components/dashboard/tickets.tsx',{'@/components/platform/provider':{usePlatform:()=>({state,ready:options.ready!==false,error:options.error||'',refresh(){}})},'@/lib/ticket-export':{downloadTicket(){}}});return renderToStaticMarkup(React.createElement(Tickets));}
 assert.match(html(),/Belum ada e-tiket/);assert.doesNotMatch(html(),/QR tiket|Unduh tiket|Buka event/);
 const paid=html({price:50000});assert.match(paid,/Unduh tiket/);assert.match(paid,/E-tiket berbayar/);assert.doesNotMatch(paid,/Buka event|href="\/dashboard\/events/);
 assert.match(html({type:'ONSITE',attendance:'ONSITE'}),/E-tiket gratis/);assert.match(html({foreign:true,price:50000}),/Belum ada e-tiket/);
 assert.match(html({ready:false}),/Menyiapkan tiket/);assert.match(html({error:'Gangguan pengujian'}),/Muat ulang tiket/);
});

test('snapshot enriches legacy group ticket prices once per order without exposing purchaser records or writing data',async()=>{
 const {event,reg}=data({price:50000});event.tickets[0].price=0;
 const parent={...reg,id:'order',email:'purchaser@example.invalid',name:'Private purchaser',amount:150000,quantity:3,ticketPrice:undefined};
 const children=[{...reg,amount:0,ticketPrice:undefined,orderId:'order'},{...reg,id:'AWN-SECONDCHILD1234',amount:0,ticketPrice:undefined,orderId:'order'}];
 const rows=[{collection:'events',id:event.id,data:event,published:true},{collection:'registrations',id:'order',owner_email:parent.email,data:parent},...children.map(data=>({collection:'registrations',id:data.id,owner_email:email,data}))];
 let parentReads=0;
 class Query{
  constructor(){this.filters=[];}select(){return this;}eq(key,value){this.filters.push([key,value]);return this;}order(){return this;}range(){return this;}
  result(){return rows.filter(row=>this.filters.every(([key,value])=>row[key]===value));}
  then(resolve,reject){return Promise.resolve({data:this.result(),error:null}).then(resolve,reject);}
  async maybeSingle(){if(this.filters.some(([k,v])=>k==='id'&&v==='order'))parentReads++;return{data:this.result()[0]||null,error:null};}
 }
 const platform=load('lib/server/platform.ts',{'@/lib/supabase/server':{getServiceSupabaseClient:()=>({from:()=>new Query(),rpc:async name=>{assert.equal(name,'platform_participant_counts');return{data:[],error:null};}})}});
 const {state}=await platform.snapshot({id:'self',email,app_metadata:{}});
 assert.equal(parentReads,1);assert.equal(state.registrations.length,2);assert.ok(state.registrations.every(r=>r.ticketPrice===50000&&tickets.hasAdmissionTicket(r,state.events[0])));
 assert.doesNotMatch(JSON.stringify(state),/Private purchaser|purchaser@example.invalid/);assert.equal(children[0].ticketPrice,undefined);
});
