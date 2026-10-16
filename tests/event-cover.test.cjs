const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),load=require('./load-source.cjs');
const {initialState}=load('lib/platform-model.ts'),{exampleEvent}=load('lib/example-event.ts');
function render(event){const state=initialState();state.events=[event];const stubs={'next/link':{default:({href,children,...props})=>React.createElement('a',{href,...props},children)},'next/image':{default:({fill,unoptimized,sizes,...props})=>React.createElement('img',props)},'@/components/platform/provider':{usePlatform:()=>({state,ready:true,error:''})}};const cover=load('components/events/event-cover.tsx',stubs);stubs['@/components/events/event-cover']=cover;stubs['./event-cover']=cover;return [renderToStaticMarkup(React.createElement(load('components/landing/featured-programs.tsx',stubs).FeaturedPrograms)),renderToStaticMarkup(React.createElement(load('components/events/event-card.tsx',stubs).EventCard,{event,index:0}))];}
test('landing and catalogue show the same canonical cover, legacy fallback or logo',()=>{
 for(const [banner,legacy,expected] of [['/cover.jpg','/legacy.jpg','/cover.jpg'],['','/legacy.jpg','/legacy.jpg'],['','','/awan-event-logo.jpeg']]){
  const event={...structuredClone(exampleEvent),publication:'published',lifecycle:'upcoming',banner};event.blocks=event.blocks.map(block=>block.type==='Hero'?{...block,image:legacy}:block);
  const [landing,catalogue]=render(event);for(const html of [landing,catalogue]){assert.match(html,new RegExp(`src="${expected.replaceAll('.','\\.')}"`));assert.match(html,/event-cover-image/);}assert.doesNotMatch(catalogue,/event-cross|event-ring/);
 }
});
test('changing the admin cover changes both card renderings without changing event links or metadata',()=>{
 const event={...structuredClone(exampleEvent),publication:'published',lifecycle:'upcoming',banner:'/cover-before.jpg'};
 for(const html of render(event))assert.match(html,/src="\/cover-before\.jpg"/);
 event.banner='/cover-after.jpg';for(const html of render(event)){assert.match(html,/src="\/cover-after\.jpg"/);assert.ok(html.includes(event.title));assert.ok(html.includes(event.slug));assert.doesNotMatch(html,/cover-before/);}
});
