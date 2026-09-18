
(() => {
  const WORDS = window.SAFEER_WORDS;
  const CATS = window.SAFEER_CATEGORIES;
  const app = document.getElementById('app');
  const toast = document.getElementById('toast');
  const byId = id => WORDS.find(w => w.id === Number(id));
  const state = {
    route: 'home',
    learnCategory: 'all',
    learnIndex: 0,
    quizCategory: 'all',
    quizCount: 10,
    quizMode: 'mixed',
    quiz: null,
    wordSearch: '',
    wordCategory: 'all'
  };
  const store = {
    get learned(){ try{return new Set(JSON.parse(localStorage.getItem('safeerLearned')||'[]'))}catch{return new Set()} },
    set learned(set){ localStorage.setItem('safeerLearned', JSON.stringify([...set])) },
    get best(){ return Number(localStorage.getItem('safeerBest')||0) },
    set best(v){ localStorage.setItem('safeerBest', String(v)) },
    get played(){ return Number(localStorage.getItem('safeerPlayed')||0) },
    set played(v){ localStorage.setItem('safeerPlayed', String(v)) }
  };

  function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function catWords(key){ return key==='all' ? WORDS : WORDS.filter(w=>w.category===key) }
  function shuffle(a){ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]} return x }
  function catOptions(selected, allLabel='All Categories'){
    return `<option value="all" ${selected==='all'?'selected':''}>${allLabel} (150)</option>`+Object.values(CATS).map(c=>`<option value="${c.key}" ${selected===c.key?'selected':''}>${c.icon} ${c.en} (${catWords(c.key).length})</option>`).join('');
  }
  function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1800)}
  function setRoute(route){state.route=route;document.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===route));render();app.focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'})}
  document.addEventListener('click',e=>{const r=e.target.closest('[data-route]');if(r){setRoute(r.dataset.route)}});

  function speak(text, lang='ar-SA'){
    if(!('speechSynthesis' in window)){showToast('Audio is not supported in this browser');return}
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=lang.startsWith('ar')?.72:.86;speechSynthesis.speak(u)
  }
  function toggleLearned(id){const s=store.learned;s.has(id)?s.delete(id):s.add(id);store.learned=s;showToast(s.has(id)?'Marked as learned ✅':'Learned mark removed');render()}
  function confetti(n=70){const colors=['#ff8a00','#ffd12f','#ff3b2f','#19aa65','#3a86ff','#8338ec'];for(let i=0;i<n;i++){const d=document.createElement('i');d.className='confetti';d.style.left=Math.random()*100+'vw';d.style.background=colors[i%colors.length];d.style.setProperty('--drift',(Math.random()*220-110)+'px');d.style.animationDelay=(Math.random()*.55)+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}}

  function renderHome(){
    const learned=store.learned.size;
    app.innerHTML=`
      <section class="panel hero">
        <div>
          <span class="hero-kicker">✨ Joyful Qur'anic Arabic Learning for Children</span>
          <h1>Learn Through Play <span>150 Words</span></h1>
          <p>Learn with pictures, Arabic pronunciation, and Bangla and English meanings. Explore flashcards by category, answer four-option quizzes, and track your progress.</p>
          <div class="hero-actions"><button class="btn btn-primary" data-route="quiz">🎮 Play Quiz Now</button><button class="btn btn-secondary" data-route="learn">📖 Learn Words First</button></div>
          <div class="stats-grid"><div class="stat"><strong>150</strong><span>Qur'anic Words</span></div><div class="stat"><strong>13</strong><span>Categories</span></div><div class="stat"><strong>${learned}</strong><span>Words Learned</span></div><div class="stat"><strong>${store.best}%</strong><span>Best Score</span></div></div>
        </div>
        <div class="hero-visual"><div class="hero-title-card"><div class="mini">Kiddy Safeerul Qur'an</div><h3>150 Qur'anic Words</h3><div class="sub">Based on Children-Friendly Topics</div><div class="credit">Compiled & Designed by Dr. Abul Kalam Azad & Eng. Mishrat Azad</div></div><span class="hero-badge badge-a arabic">قُرْآنٌ</span><span class="hero-badge badge-b arabic">عِلْمٌ</span></div>
      </section>
      <div class="section-title"><div><h2>Choose a Category</h2><p>Learn and practise the words from each topic separately.</p></div></div>
      <section class="category-grid">${Object.values(CATS).map(c=>`<button class="category-card" style="background:linear-gradient(145deg,${c.color},${c.color}d9)" data-cat-learn="${c.key}"><span class="count">${catWords(c.key).length}</span><span class="cat-icon">${c.icon}</span><strong>${c.en}</strong><small>Learn &amp; Quiz</small></button>`).join('')}</section>`;
    app.querySelectorAll('[data-cat-learn]').forEach(b=>b.onclick=()=>{state.learnCategory=b.dataset.catLearn;state.learnIndex=0;setRoute('learn')});
  }

  function renderLearn(){
    const list=catWords(state.learnCategory); if(state.learnIndex>=list.length)state.learnIndex=0;const w=list[state.learnIndex];const c=CATS[w.category];const learned=store.learned;const pct=Math.round(learned.size/WORDS.length*100);
    app.innerHTML=`<section class="panel"><div class="page-head"><div><h1>📖 Learn with Flashcards</h1><p>Look at the picture, listen to the Arabic, and remember the Bangla and English meanings.</p></div><div class="filters"><select id="learnCat" class="select">${catOptions(state.learnCategory)}</select></div></div>
    <div class="learn-layout"><article class="flashcard" style="background:linear-gradient(145deg,${c.color},${c.color}cc)"><div class="flash-top"><span class="pill">${c.icon} ${c.en}</span><span class="pill">${state.learnIndex+1}/${list.length}</span></div><div><div class="visual-emoji" role="img" aria-label="${esc(w.english)}">${w.emoji}</div><div class="arabic arabic-main">${w.arabic}</div><div class="meaning-line"><span class="meaning-chip">🇧🇩 ${w.bangla}</span><span class="meaning-chip">🇬🇧 ${w.english}</span></div></div><div class="flash-actions"><button class="ghost-btn" id="prevWord">← Previous</button><button class="ghost-btn" id="speakWord">🔊 Listen to Arabic</button><button class="ghost-btn" id="markLearned">${learned.has(w.id)?'✅ Learned':'☆ Mark as Learned'}</button><button class="ghost-btn" id="nextWord">Next →</button></div></article>
    <aside class="side-card"><h3>My Progress</h3><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><p><strong>${learned.size}/150</strong> words learned</p><div class="mini-list">${list.map((x,i)=>`<button class="mini-item ${i===state.learnIndex?'active':''}" data-index="${i}"><span>${x.emoji}</span><span><span class="arabic">${x.arabic}</span><small>${x.bangla}</small></span><i class="learned-dot ${learned.has(x.id)?'on':''}"></i></button>`).join('')}</div></aside></div></section>`;
    document.getElementById('learnCat').onchange=e=>{state.learnCategory=e.target.value;state.learnIndex=0;renderLearn()};
    document.getElementById('prevWord').onclick=()=>{state.learnIndex=(state.learnIndex-1+list.length)%list.length;renderLearn()};
    document.getElementById('nextWord').onclick=()=>{state.learnIndex=(state.learnIndex+1)%list.length;renderLearn()};
    document.getElementById('speakWord').onclick=()=>speak(w.arabic);
    document.getElementById('markLearned').onclick=()=>toggleLearned(w.id);
    app.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{state.learnIndex=Number(b.dataset.index);renderLearn()});
  }

  function renderQuizSetup(){
    app.innerHTML=`<section class="panel"><div class="page-head"><div><h1>🎮 Quiz Game</h1><p>Choose the correct answer from four options. The options are shuffled every time.</p></div></div><div class="quiz-setup"><div class="setup-card"><h2>Game Settings</h2><div class="field-grid"><div class="field"><label>Category</label><select id="quizCat" class="select">${catOptions(state.quizCategory)}</select></div><div class="field"><label>Question Type</label><select id="quizMode" class="select"><option value="mixed" ${state.quizMode==='mixed'?'selected':''}>🎲 Mixed Quiz</option><option value="picture_ar" ${state.quizMode==='picture_ar'?'selected':''}>🖼️ Picture → Arabic</option><option value="arabic_bn" ${state.quizMode==='arabic_bn'?'selected':''}>ع Arabic → Bangla</option><option value="arabic_en" ${state.quizMode==='arabic_en'?'selected':''}>ع Arabic → English</option><option value="bn_ar" ${state.quizMode==='bn_ar'?'selected':''}>🇧🇩 Bangla → Arabic</option><option value="en_ar" ${state.quizMode==='en_ar'?'selected':''}>🇬🇧 English → Arabic</option></select></div></div><div class="field" style="margin-top:18px"><label>How many questions?</label><div class="choice-row">${[10,20,50].map(n=>`<button class="choice-card ${state.quizCount===n?'selected':''}" data-qcount="${n}">${n} Questions</button>`).join('')}</div></div><button id="startQuiz" class="btn btn-primary" style="width:100%;margin-top:22px">🚀 Start Quiz</button></div><div class="setup-card quiz-preview"><div><div class="preview-emoji">🌳</div><div class="arabic preview-arabic">شَجَرَةٌ</div><strong>Choose the correct answer from the picture or word</strong><p>Earn points and streak bonuses for correct answers.</p></div></div></div></section>`;
    document.getElementById('quizCat').onchange=e=>state.quizCategory=e.target.value;
    document.getElementById('quizMode').onchange=e=>state.quizMode=e.target.value;
    app.querySelectorAll('[data-qcount]').forEach(b=>b.onclick=()=>{state.quizCount=Number(b.dataset.qcount);renderQuizSetup()});
    document.getElementById('startQuiz').onclick=startQuiz;
  }

  const quizTypes=['picture_ar','arabic_bn','arabic_en','bn_ar','en_ar'];
  function makeQuestion(w,mode,pool){
    const type=mode==='mixed'?quizTypes[Math.floor(Math.random()*quizTypes.length)]:mode;
    let answerKey, display, prompt, isArabic=false, visual='';
    if(type==='picture_ar'){answerKey='arabic';visual=w.emoji;display='';prompt='Which Arabic word matches this picture?';isArabic=true}
    if(type==='arabic_bn'){answerKey='bangla';display=w.arabic;prompt='Choose the correct Bangla meaning.'}
    if(type==='arabic_en'){answerKey='english';display=w.arabic;prompt='Choose the correct English meaning.'}
    if(type==='bn_ar'){answerKey='arabic';display=w.bangla;prompt='Choose the correct Arabic word for this Bangla meaning.';isArabic=true}
    if(type==='en_ar'){answerKey='arabic';display=w.english;prompt='Choose the correct Arabic word.';isArabic=true}
    const same=pool.filter(x=>x.id!==w.id && x[answerKey]!==w[answerKey]);
    let wrong=shuffle(same).slice(0,3);
    if(wrong.length<3)wrong=wrong.concat(shuffle(WORDS.filter(x=>x.id!==w.id && !wrong.some(y=>y[answerKey]===x[answerKey]) && x[answerKey]!==w[answerKey])).slice(0,3-wrong.length));
    const options=shuffle([w,...wrong]).map(x=>({id:x.id,text:x[answerKey]}));
    return {word:w,type,answerKey,display,prompt,visual,isArabic,options};
  }
  function startQuiz(){
    const pool=catWords(state.quizCategory);const count=Math.min(state.quizCount,pool.length);const selected=shuffle(pool).slice(0,count);state.quiz={questions:selected.map(w=>makeQuestion(w,state.quizMode,pool)),index:0,score:0,correct:0,streak:0,bestStreak:0,answered:false,selected:null};renderQuizQuestion();
  }
  function renderQuizQuestion(){
    const qz=state.quiz;if(qz.index>=qz.questions.length){finishQuiz();return}const q=qz.questions[qz.index];const pct=Math.round(qz.index/qz.questions.length*100);
    app.innerHTML=`<section class="quiz-wrap"><div class="quiz-bar"><span class="score-chip">⭐ ${qz.score} Points</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><span class="score-chip">${qz.index+1}/${qz.questions.length}</span></div><article class="question-card"><span class="question-label">${CATS[q.word.category].icon} ${CATS[q.word.category].en}</span>${q.visual?`<div class="question-visual">${q.visual}</div>`:''}${q.display?`<div class="question-text ${['arabic_bn','arabic_en'].includes(q.type)?'arabic':''}">${q.display}</div>`:''}<div class="question-prompt">${q.prompt}</div><div class="options">${q.options.map((o,i)=>`<button class="option ${qz.answered?(o.id===q.word.id?'correct':(i===qz.selected?'wrong':'')):''}" data-option="${i}" ${qz.answered?'disabled':''}>${q.isArabic?`<span class="arabic">${o.text}</span>`:o.text}</button>`).join('')}</div><div class="feedback ${qz.answered?(qz.selectedAnswerCorrect?'good':'bad'):''}">${qz.answered?(qz.selectedAnswerCorrect?`MashaAllah! Correct answer 🎉 +${qz.lastPoints} points`:`Keep trying—the correct answer is: <strong class="${q.answerKey==='arabic'?'arabic':''}">${q.word[q.answerKey]}</strong>`):''}</div>${qz.answered?`<div class="next-row"><button id="nextQ" class="btn btn-primary">${qz.index===qz.questions.length-1?'View Results':'Next Question →'}</button></div>`:''}</article></section>`;
    if(!qz.answered)app.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>answerQuestion(Number(b.dataset.option)));
    const next=document.getElementById('nextQ');if(next)next.onclick=()=>{qz.index++;qz.answered=false;qz.selected=null;renderQuizQuestion()};
  }
  function answerQuestion(index){const qz=state.quiz,q=qz.questions[qz.index],opt=q.options[index];qz.answered=true;qz.selected=index;qz.selectedAnswerCorrect=opt.id===q.word.id;if(qz.selectedAnswerCorrect){qz.streak++;qz.bestStreak=Math.max(qz.bestStreak,qz.streak);qz.lastPoints=10+Math.min(10,(qz.streak-1)*2);qz.score+=qz.lastPoints;qz.correct++;if(qz.streak%5===0)confetti(25)}else{qz.streak=0;qz.lastPoints=0}speak(q.word.arabic);renderQuizQuestion()}
  function finishQuiz(){const qz=state.quiz;const percent=Math.round(qz.correct/qz.questions.length*100);store.played=store.played+1;if(percent>store.best)store.best=percent;if(percent>=80)confetti(90);app.innerHTML=`<section class="panel result"><div class="result-cup">${percent>=90?'🏆':percent>=70?'🌟':'🌱'}</div><h1>${percent>=90?'Excellent!':percent>=70?'Very Good!':'Keep Practising!'}</h1><div class="result-score">${percent}% Score</div><p>You answered ${qz.correct} out of ${qz.questions.length} questions correctly.</p><div class="result-grid"><div class="result-stat"><strong>${qz.score}</strong><span>Total Points</span></div><div class="result-stat"><strong>${qz.correct}</strong><span>Correct Answers</span></div><div class="result-stat"><strong>${qz.bestStreak}</strong><span>Best Streak</span></div></div><div class="hero-actions" style="justify-content:center"><button class="btn btn-primary" id="retryQuiz">🔁 Play Again</button><button class="btn btn-secondary" data-route="learn">📖 Learn More</button><button class="btn btn-green" id="printResult">🖨️ Print Result</button></div></section>`;document.getElementById('retryQuiz').onclick=startQuiz;document.getElementById('printResult').onclick=()=>window.print()}

  function renderWords(){
    const q=state.wordSearch.trim().toLowerCase();let list=catWords(state.wordCategory).filter(w=>!q||w.arabic.includes(q)||w.english.toLowerCase().includes(q)||w.bangla.includes(q));const learned=store.learned;
    app.innerHTML=`<section class="panel"><div class="page-head"><div><h1>🔎 Complete Word Bank</h1><p>Explore all 150 words in one place. Search, listen, and mark words as learned.</p></div></div><div class="word-tools"><input id="wordSearch" class="search" value="${esc(state.wordSearch)}" placeholder="Search in Arabic, Bangla, or English"><select id="wordCat" class="select">${catOptions(state.wordCategory)}</select></div>${list.length?`<div class="word-grid">${list.map(w=>`<article class="word-card"><span class="num">#${w.id}</span><div class="emoji">${w.emoji}</div><div class="arabic">${w.arabic}</div><strong>${w.bangla}</strong><small>${w.english} · ${CATS[w.category].en}</small><div class="word-card-actions"><button class="icon-btn" data-speak="${w.id}">🔊 Listen</button><button class="icon-btn ${learned.has(w.id)?'on':''}" data-learn="${w.id}">${learned.has(w.id)?'✅ Learned':'☆ Mark Learned'}</button></div></article>`).join('')}</div>`:`<div class="empty"><div class="emoji">🔍</div><h3>No words found</h3></div>`}</section>`;
    document.getElementById('wordSearch').oninput=e=>{state.wordSearch=e.target.value;renderWords()};document.getElementById('wordCat').onchange=e=>{state.wordCategory=e.target.value;renderWords()};app.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speak(byId(b.dataset.speak).arabic));app.querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>toggleLearned(Number(b.dataset.learn)));
  }

  function renderProgress(){const learned=store.learned;const pct=Math.round(learned.size/WORDS.length*100);app.innerHTML=`<section class="panel"><div class="page-head"><div><h1>🏆 My Progress</h1><p>Your learned words and best quiz results are saved here.</p></div></div><div class="progress-layout"><div class="big-meter"><div class="ring" style="--p:${pct}"><strong>${pct}%</strong></div><h2>${learned.size}/150 words learned</h2><p>Learn a few words every day and you will master all 150 quickly.</p><div class="stats-grid" style="grid-template-columns:1fr 1fr"><div class="stat"><strong>${store.best}%</strong><span>Best Quiz Score</span></div><div class="stat"><strong>${store.played}</strong><span>Quizzes Played</span></div></div></div><div class="side-card"><h3>By Category</h3><div class="category-progress">${Object.values(CATS).map(c=>{const list=catWords(c.key),n=list.filter(w=>learned.has(w.id)).length,p=Math.round(n/list.length*100);return `<div class="cat-progress-row"><div class="cat-progress-head"><span>${c.icon} ${c.en}</span><span>${n}/${list.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${p}%;background:${c.color}"></div></div></div>`}).join('')}</div><button id="resetProgress" class="btn btn-danger" style="width:100%;margin-top:18px">Reset Progress</button></div></div></section>`;document.getElementById('resetProgress').onclick=()=>{if(confirm('Delete all learned marks and quiz records?')){localStorage.removeItem('safeerLearned');localStorage.removeItem('safeerBest');localStorage.removeItem('safeerPlayed');renderProgress();showToast('Progress has been reset')}}}

  function render(){if(state.route==='home')renderHome();else if(state.route==='learn')renderLearn();else if(state.route==='quiz')renderQuizSetup();else if(state.route==='words')renderWords();else if(state.route==='progress')renderProgress()}
  render();
})();
