const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),load=require('./load-source.cjs');
const {Button}=load('components/ui/button.tsx');
const {Input}=load('components/ui/input.tsx');
const {Field}=load('components/platform/ui.tsx',{'next/link':{},'@/components/ui/input':{Input}});
const render=props=>renderToStaticMarkup(React.createElement(Button,props,'Simpan perubahan'));

test('pending buttons expose a busy state and block submission without losing their action label after retry',()=>{
 const busy=render({loading:true,loadingLabel:'Menyimpan…',type:'submit'});
 assert.match(busy,/disabled=""/);assert.match(busy,/aria-busy="true"/);assert.match(busy,/Menyimpan…/);
 const ready=render({loading:false,type:'submit'});assert.doesNotMatch(ready,/disabled=|aria-busy=/);assert.match(ready,/Simpan perubahan/);
 assert.match(render({disabled:true}),/disabled=""/);
 assert.match(render({'aria-disabled':true}),/disabled=""/);
});

test('disabled link buttons keep their destination and accessible semantics without invalid HTML disabled attributes',()=>{
 const html=renderToStaticMarkup(React.createElement(Button,{asChild:true,disabled:true},React.createElement('a',{href:'/events'},'Buka event')));
 assert.match(html,/href="\/events"/);assert.match(html,/aria-disabled="true"/);assert.match(html,/tabindex="-1"/);
 assert.doesNotMatch(html,/\sdisabled=/);assert.match(html,/Buka event/);
});

test('field labels and hints associate with shared inputs while retaining explicit accessible names and ids',()=>{
 const html=renderToStaticMarkup(React.createElement(Field,{label:'Nama peserta',hint:'Ikuti identitas peserta'},React.createElement(Input,{id:'participant-name',required:true})));
 assert.match(html,/for="participant-name"/);assert.match(html,/id="participant-name"/);
 const labelId=html.match(/<label id="([^"]+)"/)[1],hintId=html.match(/<small id="([^"]+)"/)[1];
 assert.ok(html.includes('aria-labelledby="'+labelId+'"'));assert.ok(html.includes('aria-describedby="'+hintId+'"'));
 const explicit=renderToStaticMarkup(React.createElement(Field,{label:'Nama'},React.createElement(Input,{'aria-label':'Nama pada sertifikat'})));
 assert.match(explicit,/aria-label="Nama pada sertifikat"/);assert.doesNotMatch(explicit,/aria-labelledby=/);
});
