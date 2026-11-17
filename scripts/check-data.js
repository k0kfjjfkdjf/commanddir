global.window = global; 
const fs=require('fs');
for (const f of ['commands-unix','commands-linux','commands-macos','commands-windows','concepts','recipes']) eval(fs.readFileSync('' + __dirname + '/../www/data/'+f+'.js','utf8'));
const ids=new Set(); const dup=[];
for (const c of KD.commands){ if(ids.has(c.id)) dup.push(c.id); ids.add(c.id); }
const kids=new Set(KD.concepts.map(c=>c.id)), rids=new Set(KD.recipes.map(r=>r.id));
const all=x=>ids.has(x)||kids.has(x)||rids.has(x);
const miss={};
[...KD.commands,...KD.concepts,...KD.recipes].forEach(o=>(o.r||[]).forEach(x=>{ if(!all(x)) (miss[x]=miss[x]||[]).push(o.id); }));
console.log('commands',KD.commands.length,'concepts',KD.concepts.length,'recipes',KD.recipes.length,'dup',dup);
console.log('missing refs', JSON.stringify(miss));
console.log('no sym', KD.concepts.filter(c=>c.sym===undefined).map(c=>c.id));
const counts={}; KD.commands.forEach(c=>c.os.split('').forEach(o=>counts[o]=(counts[o]||0)+1)); console.log(counts);
for (const k of ['pipe','redirect','andor','jobs','heredoc']) if(!kids.has(k)) console.log('op concept missing',k);
if (dup.length || Object.keys(KD).some(k => !KD[k].length)) process.exit(1);
