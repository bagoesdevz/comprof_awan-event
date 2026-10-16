const test=require('node:test'),assert=require('node:assert/strict'),load=require('./load-source.cjs');
const {eventHeroSpeaker,eventLifecycleAt,eventHeroTitleParts}=load('lib/event-detail.ts');
const {eventSchema}=load('lib/server/validation.ts');
const {exampleEvent}=load('lib/example-event.ts');
const speaker=(name,role,extra={})=>({name,role,organization:'',bio:'',...extra});

test('hero title styling preserves every word for empty, short, long and custom event names',()=>{
 for(const title of ['', 'Seminar', 'Pelatihan Klinis', 'Workshop Komunikasi Tenaga Kesehatan', 'Webinar Pembekalan Kesehatan Reproduksi menuju Pernikahan bagi Gen Z', '  Acara\n dengan   spasi berlebih  ', 'JudulTanpaSpasi'.repeat(20)]){
  const parts=eventHeroTitleParts(title);
  assert.equal([parts.lead,parts.highlight,parts.tail].filter(Boolean).join(' '),title.trim().split(/\s+/).filter(Boolean).join(' '));
 }
 const reference=eventHeroTitleParts('Webinar Pembekalan Kesehatan Reproduksi menuju Pernikahan bagi Gen Z');
 assert.equal(reference.highlight,'Kesehatan Reproduksi');
});

test('hero follows the selected speaker, otherwise prefers a named presenter over the moderator',()=>{
 const moderator=speaker('Moderator pengujian','Moderator'),first=speaker('Pemateri satu','Dokter'),second=speaker('Pemateri dua','Psikolog',{photo:'/foto-pengujian.png',heroFeatured:true});
 assert.equal(eventHeroSpeaker({speakers:[moderator,first],speaker:''}),first);
 assert.equal(eventHeroSpeaker({speakers:[moderator,first,second],speaker:''}),second);
 assert.equal(eventHeroSpeaker({speakers:[speaker('','Pemateri',{heroFeatured:true}),moderator],speaker:''}),moderator);
 assert.equal(eventHeroSpeaker({speakers:[],speaker:'Nama lama'}).name,'Nama lama');
 assert.equal(eventHeroSpeaker({speakers:[],speaker:''}),undefined);
});

test('speaker photo and hero selection survive server validation, duplicate selection and unsafe image are rejected',()=>{
 const event=structuredClone(exampleEvent);event.speakers=[speaker('Pemateri pengujian','Dokter',{photo:'https://example.invalid/photo.png',heroFeatured:true})];
 const parsed=eventSchema.parse(event);assert.equal(parsed.speakers[0].heroFeatured,true);assert.equal(parsed.speakers[0].photo,event.speakers[0].photo);
 event.speakers.push(speaker('Pemateri dua','Psikolog',{heroFeatured:true}));assert.equal(eventSchema.safeParse(event).success,false);
 event.speakers.pop();event.speakers[0].photo='javascript:alert(1)';assert.equal(eventSchema.safeParse(event).success,false);
});

test('lifecycle changes exactly at the admin start and end times, invalid dates retain the supplied status',()=>{
 const event={startAt:'2030-10-23T08:30:00Z',endAt:'2030-10-23T09:30:00Z',lifecycle:'upcoming'};
 for(const [time,status] of [['2030-10-23T08:29:59Z','upcoming'],[event.startAt,'ongoing'],['2030-10-23T09:29:59Z','ongoing'],[event.endAt,'completed']])assert.equal(eventLifecycleAt(event,Date.parse(time)),status);
 assert.equal(eventLifecycleAt({...event,startAt:''},Date.now()),'upcoming');
 assert.equal(eventLifecycleAt({...event,endAt:event.startAt,lifecycle:'completed'},Date.now()),'completed');
});
