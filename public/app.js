// Frontend logic: collect preferences, call backend, show suggestions, and simple canvas
const form = document.getElementById('prefs');
const getIdeasBtn = document.getElementById('getIdeas');
const suggestionsDiv = document.getElementById('suggestions');

async function collectAnswers() {
  const colors = Array.from(document.querySelectorAll('#colorChoices input:checked')).map(i=>i.value);
  const materials = Array.from(document.querySelectorAll('.materials input:checked')).map(i=>i.value);
  const time = form.time.value;
  const difficulty = form.difficulty.value;
  const style = form.style.value;
  const subject = form.subject.value;
  const mood = form.mood.value;

  return { colors, materials, time, difficulty, style, subject, mood };
}

async function fetchSuggestions(answers) {
  const res = await fetch('/api/suggestions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ answers }) });
  return await res.json();
}

function showSuggestions(list) {
  suggestionsDiv.innerHTML = '';
  list.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<strong>Idea ${i+1}:</strong> <div style="margin-top:6px">${escapeHtml(s.description)}</div>`;
    suggestionsDiv.appendChild(el);
  });
}

function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

getIdeasBtn.addEventListener('click', async ()=>{
  getIdeasBtn.disabled = true; getIdeasBtn.textContent = 'Buscando...';
  const answers = await collectAnswers();
  try{
    const json = await fetchSuggestions(answers);
    if (json && json.suggestions) showSuggestions(json.suggestions);
    else suggestionsDiv.textContent = 'No se encontraron sugerencias.';
  }catch(e){ suggestionsDiv.textContent = 'Error al obtener sugerencias.' }
  getIdeasBtn.disabled = false; getIdeasBtn.textContent = 'Obtener 3 ideas';
});

// Canvas simple
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(ratio, ratio);
  ctx.lineCap = 'round';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let drawing = false, last = null;
const picker = document.getElementById('picker');
const sizeEl = document.getElementById('size');
const toolEl = document.getElementById('tool');

canvas.addEventListener('pointerdown', e=>{ drawing=true; last = {x:e.offsetX, y:e.offsetY}; });
canvas.addEventListener('pointerup', ()=>{ drawing=false; last=null; });
canvas.addEventListener('pointermove', e=>{
  if(!drawing) return;
  const x=e.offsetX, y=e.offsetY;
  const tool = toolEl.value;
  if(tool==='eraser'){ ctx.globalCompositeOperation='destination-out'; ctx.strokeStyle='rgba(0,0,0,1)'; }
  else { ctx.globalCompositeOperation='source-over'; ctx.strokeStyle = picker.value; }
  ctx.lineWidth = parseInt(sizeEl.value,10);
  if(last){ ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(x,y); ctx.stroke(); }
  last = {x,y};
});

document.getElementById('clear').addEventListener('click', ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

document.getElementById('download').addEventListener('click', ()=>{
  const link = document.createElement('a');
  link.download = 'mi_dibujo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// If the user selected color checkboxes, set picker and restrict palette
document.querySelectorAll('#colorChoices input').forEach(inp=>{
  inp.addEventListener('change', ()=>{
    const checked = Array.from(document.querySelectorAll('#colorChoices input:checked')).map(i=>i.value.toLowerCase());
    if(checked.length===1){ // map basic names to hex for convenience
      const map = { rojo:'#d9534f', azul:'#1e90ff', verde:'#2ecc71', amarillo:'#f1c40f', morado:'#8e44ad', naranja:'#e67e22', blanco:'#ffffff', negro:'#000000' };
      const hex = map[checked[0]] || '#000000';
      picker.value = hex;
    }
  });
});
