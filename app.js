import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.STUDYFLOW_CONFIG || {};
const connected = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
const db = connected ? createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
const demoSubjects = [
  { id:'ds', name:'Data Structures', materials:3, topics:2, color:'Violet' },
  { id:'dbms', name:'Database Management', materials:2, topics:3, color:'Blue' },
  { id:'maths', name:'Mathematics', materials:4, topics:1, color:'Rose' }
];
let subjects = JSON.parse(localStorage.getItem('studyflow-subjects') || 'null') || demoSubjects;
let events = JSON.parse(localStorage.getItem('studyflow-events') || 'null') || [
  { title:'Revision: DBMS Unit 2', date:'2026-12-25' }, { title:'Practical examination', date:'2026-12-26' }, { title:'Preparation leave', date:'2026-12-30' }
];
let month = new Date(2026,11,1), seconds=25*60, timerRunning=false, timerId=null, sessions=+(localStorage.getItem('studyflow-sessions')||0), focusMinutes=+(localStorage.getItem('studyflow-focus-minutes')||0);
const $ = s => document.querySelector(s);

$('#connection-status').textContent = connected ? 'Supabase connected' : 'Demo mode';
if(connected) document.querySelector('.dot').style.background='#4ade80';
document.querySelectorAll('.nav').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.go)));

function showPage(name){
  document.querySelectorAll('.page,.nav').forEach(x=>x.classList.remove('active'));
  $('#'+name).classList.add('active'); document.querySelector(`.nav[data-page="${name}"]`).classList.add('active');
  const titles={today:['STUDY SMARTER','Good evening, Zaid'],subjects:['YOUR LIBRARY','My subjects'],calendar:['YOUR TIME','Study calendar'],focus:['DEEP WORK','Focus session']};
  $('#page-kicker').textContent=titles[name][0]; $('#page-title').textContent=titles[name][1];
  if(name==='subjects') renderSubjects(); if(name==='calendar') renderCalendar(); if(name==='focus') renderTimer();
  window.scrollTo({top:0,behavior:'smooth'});
}
function save(){localStorage.setItem('studyflow-subjects',JSON.stringify(subjects));localStorage.setItem('studyflow-events',JSON.stringify(events));}
function renderSubjects(){
  $('#subject-list').innerHTML=subjects.map(s=>`<article class="card subject-card"><p class="eyebrow purple">${s.color.toUpperCase()}</p><h2>${escapeHtml(s.name)}</h2><p class="muted">${s.materials} materials · ${s.topics} topics to revise</p><div><span class="chip">Notes</span><span class="chip">AI material</span></div><button class="secondary open-subject" data-id="${s.id}">Open study material</button></article>`).join('');
  document.querySelectorAll('.open-subject').forEach(b=>b.addEventListener('click',()=>openSubject(subjects.find(s=>s.id===b.dataset.id))));
}
function openSubject(subject){
  openModal(`${subject.name} · study material`, `<p class="muted">Upload books and notes, then turn them into useful learning material.</p><div class="field"><label>Upload PDF or photo</label><input id="file-upload" type="file" accept="application/pdf,image/*"></div><div class="field"><label>Material name</label><input id="material-name" placeholder="e.g. Unit 3 textbook"></div><div class="modal-actions"><button id="save-material" class="primary" value="default">Save material</button></div><hr><p class="eyebrow purple">CREATE WITH AI</p><div class="modal-actions ai-actions"><button class="secondary" data-ai="Short notes">Short notes</button><button class="secondary" data-ai="Flashcards">Flashcards</button><button class="secondary" data-ai="MCQ quiz">MCQ quiz</button></div>`);
  $('#save-material').addEventListener('click',e=>{e.preventDefault(); const name=$('#material-name').value.trim(); if(!name) return alert('Give your material a name first.'); subject.materials++; save(); $('#modal').close(); renderSubjects(); alert(`${name} saved to ${subject.name}.`);});
  document.querySelectorAll('[data-ai]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault(); generateAI(b.dataset.ai,subject); }));
}
async function generateAI(kind,subject){
  if(!connected){alert(`Demo mode: “${kind}” will be generated after you add Supabase details in config.js and deploy the included AI function.`);return;}
  alert(`Ready to request ${kind}. Connect the ai-study-material Edge Function before enabling this in production.`);
}
function renderCalendar(){
  const y=month.getFullYear(), m=month.getMonth(); $('#month-name').textContent=month.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const first=new Date(y,m,1).getDay(), last=new Date(y,m+1,0).getDate(); let html='';
  for(let i=0;i<first;i++)html+='<div class="day empty"></div>';
  for(let d=1;d<=last;d++){const iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, todayEvents=events.filter(e=>e.date===iso);html+=`<div class="day ${todayEvents.length?'has-event':''}">${d}${todayEvents.map(e=>`<span class="event-pill">${escapeHtml(e.title)}</span>`).join('')}</div>`;}
  $('#calendar-days').innerHTML=html; $('#event-list').innerHTML=events.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<div class="list-row"><b>${new Date(e.date+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'})}</b><span>${escapeHtml(e.title)}</span></div>`).join('');
}
function renderTimer(){const m=Math.floor(seconds/60),s=seconds%60;$('#timer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;$('#focus-count').textContent=`${sessions} ${sessions===1?'session':'sessions'}`;$('#focus-minutes').textContent=`${focusMinutes} focused minutes`;}
function tick(){if(!timerRunning)return;seconds--;renderTimer();if(seconds<=0){timerRunning=false;clearInterval(timerId);sessions++;focusMinutes+=25;localStorage.setItem('studyflow-sessions',sessions);localStorage.setItem('studyflow-focus-minutes',focusMinutes);seconds=25*60;$('#timer-start').textContent='Start';alert('Focus session complete. Take a short break!');renderTimer();}}
$('#timer-start').addEventListener('click',()=>{timerRunning=!timerRunning;$('#timer-start').textContent=timerRunning?'Pause':'Start';if(timerRunning)timerId=setInterval(tick,1000);else clearInterval(timerId);});
$('#timer-reset').addEventListener('click',()=>{timerRunning=false;clearInterval(timerId);seconds=25*60;$('#timer-start').textContent='Start';renderTimer();});
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{timerRunning=false;clearInterval(timerId);seconds=+b.dataset.minutes*60;$('#timer-label').textContent=+b.dataset.minutes===10?'Short break':'Focus session';$('#timer-start').textContent='Start';renderTimer();}));
$('#add-subject').addEventListener('click',()=>openModal('Add subject',form('Subject name','e.g. Operating Systems','Save subject','new-subject')));
$('#add-event').addEventListener('click',()=>openModal('Schedule study session',`<div class="field"><label>Session title</label><input id="event-title" placeholder="e.g. Revise binary trees"></div><div class="field"><label>Date</label><input id="event-date" type="date" value="2026-12-25"></div><div class="modal-actions"><button id="new-event" class="primary" value="default">Schedule</button></div>`));
$('#previous-month').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);renderCalendar();});$('#next-month').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);renderCalendar();});
$('#theme-toggle').addEventListener('click',()=>document.body.classList.toggle('light'));
function openModal(title,body){$('#modal-title').textContent=title;$('#modal-body').innerHTML=body;$('#modal').showModal();if($('#new-subject'))$('#new-subject').addEventListener('click',e=>{e.preventDefault();const name=$('#field-value').value.trim();if(!name)return;subjects.push({id:crypto.randomUUID(),name,materials:0,topics:0,color:'New'});save();$('#modal').close();renderSubjects();});if($('#new-event'))$('#new-event').addEventListener('click',e=>{e.preventDefault();const title=$('#event-title').value.trim(),date=$('#event-date').value;if(!title||!date)return;events.push({title,date});save();$('#modal').close();renderCalendar();});}
function form(label,placeholder,button,id){return `<div class="field"><label>${label}</label><input id="field-value" placeholder="${placeholder}"></div><div class="modal-actions"><button id="${id}" class="primary" value="default">${button}</button></div>`;}
function escapeHtml(value){const div=document.createElement('div');div.textContent=value;return div.innerHTML;}
renderTimer();renderSubjects();renderCalendar();
