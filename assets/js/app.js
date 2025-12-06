
/* =========================
   Config à personnaliser
   ========================= */
let PLAYER_NAME = 'KALIFA DIABY';
let ACADEMY_NAME = 'Académie X U19';
let RECEIVING_EMAIL = 'contact@joueur.com';      // email de réception
let WHATSAPP_NUMBER_INTL = '+32465807642';       // numéro WhatsApp (E.164)
const PORTFOLIO_URL = window.location.href;
let HIGHLIGHTS_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
let FULL_MATCH_1 = 'https://example.com/fullmatch1';
let FULL_MATCH_2 = 'https://example.com/fullmatch2';

/* ====== Helpers & UI ====== */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const toast = msg => { const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(), 2600); };

/* ===== Load player data ===== */
let currentPlayer = null;
async function loadPlayerData(){
  try {
    console.log('Loading player data...');
    let players = null;
    
    // Try to use embedded data first (from HTML script tag)
    if(typeof window.playersData !== 'undefined'){
      console.log('Using embedded player data');
      players = window.playersData;
    } else {
      // Fallback to fetch
      console.log('Attempting to fetch players.json...');
      const response = await fetch('data/players.json');
      if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      players = await response.json();
    }
    
    console.log('Players data:', players);
    if(players && players.length > 0) {
      // Prefer selecting BLADE Oumar when available
      const selected = players.find(p => (p.Nom && p.Nom.toString().toUpperCase() === 'BLADE') && (p.Prénom && (p.Prénom.toString() === 'Oumar' || p.Prénom.toString().toUpperCase() === 'OUMAR')));
      currentPlayer = selected || players[0];
      console.log('Selected player:', currentPlayer.Prénom, currentPlayer.Nom);
      populatePlayerData(currentPlayer);
    } else {
      console.warn('No players found');
    }
  } catch(e) {
    console.error('Error loading player data:', e);
    console.error('Stack:', e.stack);
  }
}

function calculateAge(birthDate){
  const today = new Date();
  let age = today.getFullYear() - new Date(birthDate).getFullYear();
  const monthDiff = today.getMonth() - new Date(birthDate).getMonth();
  if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < new Date(birthDate).getDate())) age--;
  return age;
}

function populatePlayerData(player){
  if(!player) {
    console.error('No player data provided');
    return;
  }
  
  console.log('Starting population with player:', player.Nom, player.Prénom);
  
  // Basic info
  const fullName = `${player.Prénom} ${player.Nom}`.toUpperCase();
  PLAYER_NAME = fullName;
  ACADEMY_NAME = player['Clubs actuel'] || 'Académie X U19';
  
  console.log('Full name:', fullName);
  
  const nameEl = $('#PLAYER_NAME_H1');
  if(nameEl) {
    nameEl.textContent = fullName;
    console.log('Name element updated');
  } else {
    console.warn('Name element not found');
  }
  
  const badgeEl = $('#academyBadge');
  if(badgeEl) badgeEl.textContent = `${player['Clubs actuel']} • ${player.Position}`;
  
  const posEl = $('#positionBadge');
  if(posEl) posEl.textContent = `${player.Position} • Pied droit`;
  
  // Birthdate & age
  const birthDate = player['Date Naissance'];
  const birthEl = $('#birthDate');
  if(birthEl) birthEl.textContent = birthDate;
  
  const age = calculateAge(birthDate);
  const ageEl = $('#ageDisplay');
  if(ageEl) ageEl.textContent = age;
  
  // Physical attributes
  const heightEl = $('#heightDisplay');
  if(heightEl) heightEl.textContent = player.Taille;
  
  const weightEl = $('#weightDisplay');
  if(weightEl) weightEl.textContent = player.Poids;
  
  const posStatsEl = $('#positionStats');
  if(posStatsEl) posStatsEl.textContent = player.Position;
  
  // Nationality
  const natEl = $('#nationality');
  if(natEl) natEl.textContent = player.Nationnalité;
  
  // Links - CV links now use local assets folder (HTML has href set)
  // Images link still uses player data if available
  const imagesLink = $('#imagesLink');
  if(imagesLink && player['Liens images'] && player['Liens images'] !== 'nan'){
    imagesLink.href = player['Liens images'];
  }
  
  // Helper to handle nan values
  const getNumericValue = (val) => {
    if(val === null || val === undefined || val === 'nan' || val === 'nan' || isNaN(val)) return '0';
    const num = parseFloat(val);
    return isNaN(num) ? '0' : Math.round(num);
  };

  // Stats
  const matchesEl = $('#stat-matches');
  if(matchesEl) {
    const matches = getNumericValue(player['Nbr matchs']);
    matchesEl.textContent = matches;
    console.log('Matches updated to:', matches);
  }
  
  const minEl = $('#stat-minutes');
  if(minEl) minEl.textContent = getNumericValue(player.Minutes);
  
  const goalsEl = $('#stat-goals');
  if(goalsEl) goalsEl.textContent = getNumericValue(player['Nbr buts']);
  
  const assistsEl = $('#stat-assists');
  if(assistsEl) assistsEl.textContent = getNumericValue(player['Nbr passe']);
  
  // Populate clubs list
  populateClubsList(player['Clubs & Parcours']);
  
  // Update form inputs for stats
  const calcMinEl = $('#calcMin');
  if(calcMinEl) calcMinEl.value = getNumericValue(player.Minutes);
  
  const calcGEl = $('#calcG');
  if(calcGEl) calcGEl.value = getNumericValue(player['Nbr buts']);
  
  const calcAEl = $('#calcA');
  if(calcAEl) calcAEl.value = getNumericValue(player['Nbr passe']);
  
  const totalMatchesEl = $('#totalMatches');
  if(totalMatchesEl) totalMatchesEl.textContent = getNumericValue(player['Nbr matchs']);
  
  recalcPer90();
  console.log('Population complete');
}

function populateClubsList(clubsData){
  if(!clubsData || clubsData === 'nan') return;
  
  const clubsList = $('#clubsList');
  clubsList.innerHTML = '';
  
  const lines = clubsData.split('\\n').filter(l => l.trim());
  lines.forEach(line => {
    const li = document.createElement('li');
    li.textContent = line.trim();
    clubsList.appendChild(li);
  });
}

/* ===== THEME (persistant) ===== */
function applyTheme(isDark){
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  $('#themeToggle')?.setAttribute('aria-pressed', String(isDark));
  $('#themeIcon').textContent = isDark ? '🌙' : '☀️';
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if(metaTheme) metaTheme.setAttribute('content', isDark ? '#0b1220' : '#ffffff');
}
function initTheme(){
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
}

/* ===== Reveal on scroll ===== */
function initReveal(){
  const io = new IntersectionObserver(entries => entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('is-visible'); }), {threshold:.2});
  $$('.reveal').forEach(el => io.observe(el));
}

/* ===== Stats interactions ===== */
function filterStats(){
  const min = Number($('#minFilter').value || 0);
  $$('#statsTable tbody tr').forEach(r=>{
    const minutes = Number(r.children[2].textContent.trim()||0);
    r.style.display = minutes >= min ? '' : 'none';
  });
}
function recalcPer90(){
  const min = Number($('#calcMin').value||0);
  const g = Number($('#calcG').value||0);
  const a = Number($('#calcA').value||0);
  const per90 = min>0 ? ((g+a)/min)*90 : 0;
  $('#per90').textContent = per90.toFixed(2);
}
function initStats(){
  $('#minFilter')?.addEventListener('input', filterStats);
  ['calcMin','calcG','calcA'].forEach(id => $('#'+id)?.addEventListener('input', recalcPer90));
}

/* ===== Match filters ===== */
function filterMatchs(){
  const role = $('#roleFilter').value;
  const min = Number($('#minMatchFilter').value||0);
  $$('#matchTable tbody tr').forEach(tr=>{
    const r = tr.children[3].textContent.trim();
    const m = Number(tr.children[4].textContent.trim()||0);
    tr.style.display = (!role || r===role) && m>=min ? '' : 'none';
  });
}
function initMatchFilters(){
  $('#roleFilter')?.addEventListener('change', filterMatchs);
  $('#minMatchFilter')?.addEventListener('input', filterMatchs);
}

/* ===== Highlights copy ===== */
async function copyLinks(){
  const txt = `Highlights: ${HIGHLIGHTS_URL}
Full match 1: ${FULL_MATCH_1}
Full match 2: ${FULL_MATCH_2}`;
  try { await navigator.clipboard.writeText(txt); toast('Liens copiés'); }
  catch(e){ alert(txt); }
}

/* ===== Contact: build + actions ===== */
function buildMessage(fields){
  return [
    `Objet: ${fields.subject || 'Contact scouting'}`,
    `Organisation: ${fields.org} (${fields.role})`,
    fields.when ? `Période souhaitée: ${fields.when}` : null,
    '',
    fields.message,
    '',
    `—`,
    `Coordonnées: ${fields.email}${fields.tel? ' | '+fields.tel:''}`,
    `Candidat: ${PLAYER_NAME} • ${ACADEMY_NAME}`,
    `Portfolio: ${PORTFOLIO_URL}`,
    `Highlights: ${HIGHLIGHTS_URL}`,
    `Full match 1: ${FULL_MATCH_1}`,
    `Full match 2: ${FULL_MATCH_2}`
  ].filter(Boolean).join('\\n');
}
function collectForm(){
  return {
    org: $('#org').value.trim(),
    role: $('#role').value.trim(),
    email: $('#email').value.trim(),
    tel: $('#tel').value.trim(),
    subject: $('#subject').value.trim(),
    when: $('#when').value.trim(),
    message: $('#message').value.trim(),
    sendWA: $('#sendWA').checked
  };
}
function validateForm(f){
  if(!f.org || !f.role || !f.email || !f.subject || !f.message){ toast('Merci de compléter les champs requis.'); return false; }
  return true;
}
function openMailto(subject, body){
  const url = `mailto:${encodeURIComponent(RECEIVING_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}
function openWhatsApp(text){
  const phone = WHATSAPP_NUMBER_INTL.replace(/\\+/g,'').replace(/\\s/g,'');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}
function openDirectWA(){
  const body = buildMessage({ subject: 'Message WhatsApp direct', org: '—', role:'—', when:'', message: 'Bonjour, souhaitons échanger au sujet du joueur.', email:'', tel:'' });
  openWhatsApp(body);
}
function initContact(){
  $('#waDirectBtn')?.addEventListener('click', (e)=>{ e.preventDefault(); openDirectWA(); });
  $('#waDirectBtnMobile')?.addEventListener('click', (e)=>{ e.preventDefault(); openDirectWA(); });

  $('#contactForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = collectForm();
    if(!validateForm(f)) return;
    const body = buildMessage(f);
    const subject = `[${f.subject}] ${PLAYER_NAME} – ${f.org}`;
    openMailto(subject, body);
    if(f.sendWA){ setTimeout(()=>openWhatsApp(body), 450); }
    toast('Préparation de votre message…');
  });

  $('#previewBtn')?.addEventListener('click', ()=>{
    const f = collectForm(); if(!validateForm(f)) return;
    $('#previewSubject').textContent = `[${f.subject}] ${PLAYER_NAME} – ${f.org}`;
    $('#previewBody').textContent = buildMessage(f);
    $('#previewModal').style.display = 'flex';
  });
  $('#modalClose')?.addEventListener('click', ()=> $('#previewModal').style.display='none');
  $('#previewModal')?.addEventListener('click', (e)=>{ if(e.target.id==='previewModal') $('#previewModal').style.display='none'; });

  $('#copyLinksBtn')?.addEventListener('click', copyLinks);

  // Statistics gallery
  $('#imagesLink')?.addEventListener('click', (e)=>{ 
    e.preventDefault(); 
    $('#statsModal').style.display = 'flex'; 
  });
  $('#statsModalClose')?.addEventListener('click', ()=> $('#statsModal').style.display='none');
  $('#statsModal')?.addEventListener('click', (e)=>{ if(e.target.id==='statsModal') $('#statsModal').style.display='none'; });
}

/* ===== Radar ===== */
function initRadar(){
  const ctx = document.getElementById('radar');
  if(!ctx || typeof Chart === 'undefined') return;
  new Chart(ctx, {
    type: 'radar',
    data: { labels: ['Buts/90','xG/90','Tirs cadrés','Duels aériens','Pressing','Dribbles'],
      datasets: [
        { label: 'Joueur', data:[78,74,70,82,76,66], fill:true, backgroundColor:'rgba(96,165,250,.18)', borderColor:'rgba(96,165,250,.9)' },
        { label: 'Repère poste (9)', data:[70,68,65,70,60,55], fill:true, backgroundColor:'rgba(2,132,199,.08)', borderColor:'rgba(2,132,199,.45)' }
      ]},
    options: { responsive:true, scales:{ r:{ angleLines:{color:'rgba(148,163,184,.2)'}, grid:{color:'rgba(148,163,184,.2)'}, suggestedMin:0, suggestedMax:100, pointLabels:{ color:'rgba(148,163,184,.95)' } } }, plugins:{ legend:{ labels:{ color:'rgba(148,163,184,.95)' } } } }
  });
}

/* ===== Placeholder year ===== */
function setYear(){ const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); }

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  loadPlayerData().then(() => {
    initTheme();
    $('#themeToggle')?.addEventListener('click', ()=> applyTheme(!document.documentElement.classList.contains('dark')));
    initReveal();
    initStats();
    initMatchFilters();
    initContact();
    initRadar();
    setYear();
  });
});
