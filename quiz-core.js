(()=>{'use strict';
const $=id=>document.getElementById(id),mode=document.body.dataset.mode||'phonology',final=mode==='final',textbook=mode==='textbook';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels=['','①','②','③','④','⑤'];
const meta=window.FINAL_META||[],media=window.FINAL_MEDIA||{};
let Q=[],chapters=[],chMap={},byId={};
const heading={phonology:'음운 수업자료 핵심 응용',textbook:'교과서 핵심·응용 테스트',final:'최종 파이널 테스트 · 원문 62문항'};
const descriptions={phonology:'「음운단원 수업자료 수정.pdf」에서 지나치게 단순한 문항과 반복 문항을 줄였습니다.',textbook:'「박시언교과서 시험범위.pdf」의 기존 문항 중 개념 정의·단순 반복을 제외한 적용·응용 문항입니다.',final:'「박시언 시험 테스트」 1~62번을 원문 이미지 그대로 사용합니다. 번호를 클릭하면 바로 아래에 원본 해설이 나타납니다.'};
const nav=[['index.html','음운 학습','phonology'],['textbook.html','교과서 핵심 테스트','textbook'],['final62.html','최종 파이널 62문항','final'],['teacher.html','교사용 성적 관리','teacher']];
if(final){
 if(meta.length!==62||!meta.every((m,i)=>m.id===i+1&&m.answer>=1&&m.answer<=5&&media['q'+m.id]&&media['a'+m.id])){error('원본 62문항 및 해설 이미지를 불러오지 못했습니다. 페이지를 다시 불러오세요.');return}
 Q=meta.map(m=>({id:'f'+m.id,serial:m.id,topic:'최종 파이널',page:m.page,explainPage:m.explain_page,kind:'원문 객관식',stem:m.id+'번',answer:m.answer-1,options:labels.slice(1),explain:'첨부된 원본 정답 및 해설 페이지를 그대로 표시합니다.',image:media['q'+m.id],explainImage:media['a'+m.id]}));
 const sets=[['1~10번',1,10],['11~20번',11,20],['21~27번',21,27],['28~33번',28,33],['34~43번',34,43],['44~50번',44,50],['51~62번',51,62]];
 chapters=sets.map((it,i)=>({id:'c'+(i+1),title:it[0],sub:'원문 문제 '+it[1]+'~'+it[2]+'번',qs:Q.filter(q=>q.serial>=it[1]&&q.serial<=it[2])}));
}else if(textbook){
 const list=(window.TEXTBOOK_Q_PARTS||[]).flat(),allowed=new Set(window.GCH_CURATED_TEXTBOOK||[]);
 Q=list.filter(q=>allowed.has(q.id)).map(q=>({...q,id:'t'+q.id,kind:'객관식'}));
 const topics=[...new Set(Q.map(x=>x.topic))];chapters=topics.map((t,i)=>({id:'c'+(i+1),title:t.replace(/^\d+\s+/,''),sub:'교과서 핵심 적용 · '+Q.filter(q=>q.topic===t).length+'문항',qs:Q.filter(q=>q.topic===t)}));
}else{
 const list=window.QUESTIONS||[],allowed=new Set(window.GCH_CURATED_PHONOLOGY||[]);
 Q=list.filter(q=>allowed.has(q.id)).map(q=>({...q,id:'p'+q.id,kind:'객관식'}));
 const topics=[...new Set(Q.map(x=>x.topic))];chapters=topics.map((t,i)=>({id:'c'+(i+1),title:t,sub:'음운 자료 핵심 · '+Q.filter(q=>q.topic===t).length+'문항',qs:Q.filter(q=>q.topic===t)}));
}
if(!Q.length||Q.some(q=>!Array.isArray(q.options)||q.answer<0||q.answer>=q.options.length)){error('문항 데이터 점검에 실패했습니다. 사이트 관리 담당자에게 알려 주세요.');return}
chapters.forEach(c=>c.qs.forEach(q=>{q.chapter=c.id;byId[q.id]=q}));chMap=Object.fromEntries(chapters.map(c=>[c.id,c]));
const key='gch-quiz-list-v3-'+mode,profileKey='gch-student-profile-v2-'+mode;
const safeParse=(txt,fallback)=>{try{return JSON.parse(txt)||fallback}catch(e){return fallback}};
let state=safeParse(localStorage.getItem(key),{answers:{},wrongs:{},attempts:{},chapter:chapters[0].id,start:Date.now(),submitted:false});
for(const name of ['answers','wrongs','attempts'])if(!state[name]||typeof state[name]!=='object')state[name]={};
if(!chMap[state.chapter])state.chapter=chapters[0].id;if(!Number.isFinite(state.start))state.start=Date.now();
if(final&&Object.keys(state.answers).length===0){const old=safeParse(localStorage.getItem('gch-final62-original-20261014'),{});if(Array.isArray(old.answers)&&old.answers.length===62){old.answers.forEach((n,i)=>{const q=Q[i];if(Number.isInteger(n)&&n>=1&&n<=5){const ok=n-1===q.answer;state.answers[q.id]={choice:n-1,correct:ok};if(!ok)state.wrongs[q.id]={choice:n-1};}});state.start=old.start||Date.now();}}
// One student registration per tab. Migrate an existing student profile for convenience,
// then keep future changes separate in the three learning tabs.
const priorProfile=safeParse(localStorage.getItem('gch-student-profile-v1'),{name:'',group:''});
let profile=safeParse(localStorage.getItem(profileKey),null)||priorProfile;
if(!profile||typeof profile!=='object')profile={name:'',group:''};
profile={name:String(profile.name||'').slice(0,30),group:String(profile.group||'').slice(0,30)};
let editingProfile=!profile.name.trim();

const CH=()=>chMap[state.chapter];
const correctFor=q=>q.options[q.answer];
const count=(arr)=>({answered:arr.filter(q=>state.answers[q.id]).length,correct:arr.filter(q=>state.answers[q.id]?.correct).length});
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){console.warn('풀이 기록 저장 실패',e)}};
function error(msg){document.body.innerHTML='<main class="wrap"><div class="panel error">'+esc(msg)+'</div></main>'}
function renderFrame(){const badges=[chapters.length+'개 영역',Q.length+'문항',final?'원본 62문항 무변형':'적용·응용 중심','선택 즉시 해설','자동 오답노트'];
 $('app').innerHTML=`<div class="wrap"><header class="hero"><div style="font-size:13px;color:#d6e3ff">과천외고 2학년 · 화법과 언어</div><h1>${heading[mode]}</h1><p>${descriptions[mode]}</p><div class="badges">${badges.map(x=>`<span class="badge">${esc(x)}</span>`).join('')}</div></header><nav class="mainnav" aria-label="학습 메뉴">${nav.map(([href,text,n])=>`<a href="${href}" class="${mode===n?'active':''}" ${mode===n?'aria-current="page"':''}>${text}</a>`).join('')}</nav><div class="dashboard"><aside class="sidebar panel"><div class="sidehead">단원별 문제 · <span id="overallProgress"></span></div><div id="studentProfile" class="student-profile"></div><div id="chapterList" class="chapter-list"></div><div class="side-tools"><button type="button" class="tool-btn" data-scrollwrong>오답노트 보기 (<span id="sideWrong">0</span>)</button><button type="button" class="tool-btn danger" data-reset>전체 풀이 기록 초기화</button></div></aside><main class="main"><section id="chapterHead" class="chapter-head panel"></section><div id="questions"></div><section id="wrongbook" class="wrongbook panel"><h2>오답노트</h2><p class="notice">틀린 문항은 이곳에 자동 저장됩니다. 다시 풀어 맞히면 오답노트에서 사라집니다.</p><div id="wrongList"></div></section><section class="submit-card panel"><h3>선생님께 성적 제출</h3><div class="meta"><span id="resultStat"></span></div><div class="submit-actions"><button type="button" class="primary" id="submitResults">성적·오답 제출</button><button type="button" class="primary alt" id="exportCsv">성적 CSV 저장</button></div><p class="status" id="submitStatus" role="status"></p><p class="notice">선택 즉시 채점되고 기록은 이 기기에 자동 보관됩니다. 모든 문항을 푼 뒤 성적 제출을 누르면 선생님 관리 페이지로 전송됩니다.</p></section></main></div><div class="footer">더소피국어학원 · 과천외고 화법과 언어</div></div><button type="button" class="float-wrong" data-scrollwrong>오답 <span id="floatingWrong">0</span></button>`;
 $('app').addEventListener('click',onClick);
 renderProfile();
}
function renderProfile(){
 const box=$('studentProfile');if(!box)return;
 if(!editingProfile&&profile.name.trim()){
  box.innerHTML=`<div class="profile-heading">응시 학생 <span class="saved-mark">✓ 등록됨</span></div><div class="profile-display"><strong>${esc(profile.name)}</strong><span>${esc(profile.group||'반 미입력')}</span></div><button type="button" class="profile-edit" data-edit-profile>학생 정보 수정</button><p class="profile-note">이 탭에서는 한 번만 등록하면 됩니다. 모든 회차와 재시험에 자동 적용됩니다.</p>`;
 }else{
  box.innerHTML=`<div class="profile-heading">처음 한 번 학생 등록</div><label class="profile-field">학생 이름 <input id="studentName" maxlength="30" autocomplete="name" placeholder="이름 입력" value="${esc(profile.name)}"></label><label class="profile-field">반 / 그룹 <input id="studentGroup" maxlength="30" placeholder="예: 2학년 1반" value="${esc(profile.group)}"></label><button type="button" class="profile-save" data-save-profile>이름 저장하고 시작</button><p class="profile-note">저장 후에는 회차마다 다시 입력하지 않습니다. 이 기기의 현재 시험 탭에만 적용됩니다.</p>`;
 }
}
function saveProfile(){
 const name=$('studentName')?.value.trim()||'',group=$('studentGroup')?.value.trim()||'';
 if(!name){$('studentName')?.focus();alert('학생 이름을 입력해 주세요.');return}
 const changed=Boolean(profile.name.trim()&&profile.name!==name);
 if(changed&&Object.keys(state.answers).length>0){
  if(!confirm('다른 학생으로 변경하면 이 시험 탭의 풀이·오답 기록이 초기화됩니다. 변경하시겠습니까?'))return;
  state={answers:{},wrongs:{},attempts:{},chapter:chapters[0].id,start:Date.now(),submitted:false};save();
 }
 profile={name,group};try{localStorage.setItem(profileKey,JSON.stringify(profile))}catch(e){console.warn('학생 정보 저장 실패',e)}
 editingProfile=false;renderProfile();if(changed)render();
}
function renderNav(){const box=$('chapterList');box.innerHTML=chapters.map((c,i)=>{const p=count(c.qs);return `<button type="button" class="chapter-btn ${c.id===state.chapter?'active':''}" data-chapter="${c.id}"><b>${String(i+1).padStart(2,'0')}.</b><span>${esc(c.title)}<small>${p.answered}/${c.qs.length} 완료 · 정답 ${p.correct}</small></span></button>`}).join('');const all=count(Q);$('overallProgress').textContent=all.answered+'/'+Q.length;}
function renderHead(){const c=CH(),p=count(c.qs);$('chapterHead').innerHTML=`<h2>${esc(c.title)}</h2><div class="meta"><span>${esc(c.sub)}</span><span>정답 ${p.correct} / 응답 ${p.answered}</span></div><div class="summary">${final?'문제 본문·선택지는 원본 PDF를 그대로 표시합니다. 해당 문항의 ①~⑤ 번호만 선택하세요.':esc(c.sub)+' · 보기를 클릭하는 즉시 문항 아래에 정오답과 해설이 나타납니다.'}</div><div class="progress"><div class="progress-line"><span>학습 진행률</span><span>${Math.round(p.answered/c.qs.length*100)}%</span></div><div class="bar"><span style="width:${Math.round(p.answered/c.qs.length*100)}%"></span></div></div>`;}
function contextPages(n,p){if(n>=28&&n<=30)return [8,9];if(n>=31&&n<=33)return [9];if(n>=34&&n<=43)return [10,11,12,13];if(n>=44&&n<=46)return [14,15];if(n>=47&&n<=50)return [16,17];if(n>=51&&n<=62)return [18,19];return [p]}
function questionMarkup(q){const a=state.answers[q.id],wrong=!a?false:!a.correct;
 let stem=final?`<div class="source-info">첨부 원본 PDF ${q.page}쪽 · ${q.serial}번</div><img class="stem-image" loading="lazy" alt="${q.serial}번 문제 원문과 보기" src="${q.image}">`:`<div class="stem">${esc(q.stem)}</div><div class="source-info">${textbook?'교과서 '+q.page+'쪽':'음운 수업자료'} · 원문 문제은행 문항</div>`;
 if(final&&q.serial>=28){const pages=contextPages(q.serial,q.page);stem+=`<details class="source-expand"><summary>이 문항의 공통 제시문 보기 · PDF ${pages.join(', ')}쪽</summary>${pages.map(p=>`<p class="source-caption">원본 PDF ${p}쪽 전체</p><img class="source-img" loading="lazy" alt="공통 제시문 ${p}쪽" src="${media['p'+p]}">`).join('')}</details>`}
 const buttons=q.options.map((option,j)=>{let cls='choice';if(a){if(j===q.answer)cls+=' correct';else if(j===a.choice&&wrong)cls+=' wrong'}return `<button type="button" class="${cls}" data-select="${q.id}" data-choice="${j}" ${a?'disabled':''} aria-label="${final?labels[j+1]+' 보기':String(j+1)+'번 답'}"><span class="sym">${labels[j+1]}</span>${final?'':`<span>${esc(option)}</span>`}</button>`}).join('');
 let answerHtml='';if(a){const explain=final?`<p class="source-caption">첨부 PDF ${q.explainPage}쪽의 원본 상세 해설</p><img class="feedback-image" loading="lazy" src="${q.explainImage}" alt="${q.serial}번 원본 상세 해설">`:`<p class="explain">${esc(q.explain)}</p>`;
 answerHtml=`<div class="feedback ${a.correct?'good':'bad'}" role="status"><strong>${a.correct?'✓ 정답입니다.':'✕ 오답입니다.'}</strong><span class="answer-diff">내 선택: ${final?labels[a.choice+1]:esc(q.options[a.choice])} &nbsp;·&nbsp; 정답: ${final?labels[q.answer+1]:esc(correctFor(q))}</span>${explain}<button type="button" class="retry" data-retry="${q.id}">이 문제 다시 풀기</button></div>`}
 return `<section class="qcard" id="q-${q.id}"><div class="qtop"><span class="qnum">${final?q.serial+'번':esc(q.topic.replace(/^\d+\s+/,''))+' · '+(CH().qs.indexOf(q)+1)+'번'}</span><span class="tag">${final?'원문 그대로':textbook?'교과서 '+q.page+'쪽 · '+esc(q.level):'개념·발음 응용'}</span></div>${stem}<div class="choices ${final?'number-choices':''}">${buttons}</div>${answerHtml}</section>`;}
function renderQuestions(){ $('questions').innerHTML=CH().qs.map(questionMarkup).join('') }
function renderWrong(){const items=Object.keys(state.wrongs).map(id=>byId[id]).filter(Boolean).sort((a,b)=>a.chapter.localeCompare(b.chapter)||a.id.localeCompare(b.id));$('sideWrong').textContent=items.length;$('floatingWrong').textContent=items.length;
 $('wrongList').innerHTML=items.length?items.map(q=>{const a=state.wrongs[q.id],detail=final?`<details><summary>원본 해설 펼치기</summary><img loading="lazy" alt="${q.serial}번 해설" src="${q.explainImage}"></details>`:`<p>${esc(q.explain)}</p>`;
 return `<div class="wrong-item"><strong>${esc(chMap[q.chapter].title)} · ${final?q.serial+'번':esc(q.stem)}</strong><div class="wrong-answer">내가 고른 답: ${final?labels[a.choice+1]:esc(q.options[a.choice])}</div><div class="right-answer">정답: ${final?labels[q.answer+1]:esc(correctFor(q))}</div>${detail}<button class="jump" type="button" data-goto="${q.id}">오답 다시 풀기</button></div>`}).join(''):'<div class="wrong-empty">현재 남아 있는 오답이 없습니다. 틀린 문항은 자동으로 이곳에 모입니다.</div>';
 const all=count(Q);$('resultStat').textContent=`응답 ${all.answered}/${Q.length} · 정답 ${all.correct} · 오답 ${all.answered-all.correct} · 미응답 ${Q.length-all.answered}`;
}
function render(){renderNav();renderHead();renderQuestions();renderWrong()}
function choose(id,n){const q=byId[id];if(!q||state.answers[id])return;if(!(n>=0&&n<q.options.length))return;
 const ok=n===q.answer;state.answers[id]={choice:n,correct:ok};state.attempts[id]=(state.attempts[id]||0)+1;
 if(ok){delete state.wrongs[id]}else{state.wrongs[id]={choice:n};}state.submitted=false;save();
 const card=$('q-'+id);if(card)card.outerHTML=questionMarkup(q);renderNav();renderHeadProgress();renderWrong();const feedback=$('q-'+id)?.querySelector('.feedback');if(feedback)feedback.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function renderHeadProgress(){const c=CH(),p=count(c.qs);const old=$('chapterHead');if(!old)return;const val=old.querySelector('.progress-line span:last-child'),txt=old.querySelector('.meta span:last-child'),bar=old.querySelector('.bar span');if(val)val.textContent=Math.round(p.answered/c.qs.length*100)+'%';if(txt)txt.textContent=`정답 ${p.correct} / 응답 ${p.answered}`;if(bar)bar.style.width=Math.round(p.answered/c.qs.length*100)+'%';}
function retry(id){const q=byId[id];if(!q)return;delete state.answers[id];state.submitted=false;save();if(q.chapter!==state.chapter){state.chapter=q.chapter;save();render()}else{const card=$('q-'+id);if(card)card.outerHTML=questionMarkup(q);renderNav();renderHeadProgress();renderWrong()};setTimeout(()=> $('q-'+id)?.scrollIntoView({block:'center',behavior:'smooth'}),0);}
function goto(id){retry(id)}
function setChapter(id){if(!chMap[id])return;state.chapter=id;save();render();window.scrollTo({top:0,behavior:'smooth'})}
function reset(){if(!confirm('이 시험 탭의 모든 풀이와 오답 기록을 초기화하시겠습니까? 다른 시험의 기록은 유지됩니다.'))return;state={answers:{},wrongs:{},attempts:{},chapter:chapters[0].id,start:Date.now(),submitted:false};save();render();window.scrollTo({top:0,behavior:'smooth'})}
function csv(){const rows=[['문항','단원','원본쪽','학생선택','정답','정오','해설']];Q.forEach(q=>{const a=state.answers[q.id];rows.push([final?q.serial:q.id,chMap[q.chapter].title,q.page,a?(final?labels[a.choice+1]:q.options[a.choice]):'미응답',final?labels[q.answer+1]:correctFor(q),!a?'미응답':a.correct?'정답':'오답',final?'첨부 원본 PDF '+q.explainPage+'쪽 해설':q.explain])});let result='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([result],{type:'text/csv;charset=utf-8'}));link.download='과천외고_'+(final?'파이널62':textbook?'교과서핵심':'음운핵심')+'_성적오답.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1500)}
async function submit(){const status=$('submitStatus'),done=count(Q),cfg=window.EXAM_CONFIG||{},name=(profile.name||'').trim(),group=(profile.group||'').trim();
 if(!name){status.textContent='왼쪽 응시 학생 칸에서 이름을 한 번 등록해 주세요.';editingProfile=true;renderProfile();$('studentName')?.focus();$('studentProfile')?.scrollIntoView({block:'center',behavior:'smooth'});return}
 if(done.answered!==Q.length){status.textContent=`미응답 ${Q.length-done.answered}문항이 남았습니다. 전부 선택한 후 제출해 주세요.`;return}
 if(state.submitted){status.textContent='이미 제출한 답안입니다. 다시 제출하려면 문제를 다시 풀어 주세요.';return}
 if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){status.textContent='데이터베이스 연결 정보가 없습니다. CSV 파일을 저장해 선생님께 전달하세요.';return}
 const record={student_name:name,student_group:group,exam_source:final?'박시언 파이널 원문 62문항':textbook?'박시언교과서 핵심 선별문항':'음운 수업자료 핵심 선별문항',exam_mode:'practice',topic:final?'최종 파이널 62문항':'전체 핵심 단원',score:Math.round(done.correct/Q.length*100),correct_count:done.correct,total_count:Q.length,elapsed_seconds:Math.max(0,Math.round((Date.now()-state.start)/1000)),answers:Q.map((q,i)=>{const a=state.answers[q.id];return {number:final?q.serial:i+1,question_id:q.id,topic:chMap[q.chapter].title,stem:final?'원본 PDF '+q.page+'쪽 '+q.serial+'번':q.stem,source_page:q.page,chosen:a?(final?labels[a.choice+1]:q.options[a.choice]):null,correct_answer:final?labels[q.answer+1]:correctFor(q),is_correct:!!a?.correct,explanation:final?'원본 시험지 PDF '+q.explainPage+'쪽 상세해설 이미지 참조':q.explain}}),submitted_at:new Date().toISOString()};
 status.textContent='교사용 성적 관리 서버로 전송 중입니다…';$('submitResults').disabled=true;
 try{const res=await fetch(cfg.supabaseUrl.replace(/\/$/,'')+'/rest/v1/exam_results',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+cfg.supabaseAnonKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(record)});if(!res.ok)throw Error('HTTP '+res.status);state.submitted=true;save();status.textContent='✓ 제출 완료: '+done.correct+'/'+Q.length+' 정답 · '+record.score+'점. 교사용 성적 관리 페이지에서 확인할 수 있습니다.'}catch(e){status.textContent='서버 전송 실패: '+e.message+' · CSV를 저장해 선생님께 전달하세요.'}finally{$('submitResults').disabled=false}
}
function onClick(e){const target=e.target.closest('button');if(!target)return;const d=target.dataset;
 if(target.hasAttribute('data-save-profile')){saveProfile();return}if(target.hasAttribute('data-edit-profile')){editingProfile=true;renderProfile();$('studentName')?.focus();return}
 if(d.chapter){setChapter(d.chapter);return}if(d.select){choose(d.select,Number(d.choice));return}if(d.retry){retry(d.retry);return}if(d.goto){goto(d.goto);return}if(target.hasAttribute('data-scrollwrong')){$('wrongbook').scrollIntoView({behavior:'smooth'});return}if(target.hasAttribute('data-reset')){reset();return}if(target.id==='submitResults'){submit();return}if(target.id==='exportCsv'){csv();return}}
renderFrame();render();save();
})();