// ============== DOM Elements ==============
const form = document.getElementById('prefs');
const getIdeasBtn = document.getElementById('getIdeas');
const suggestionsDiv = document.getElementById('suggestions');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const picker = document.getElementById('picker');
const sizeEl = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');
const toolEl = document.getElementById('tool');
const clearBtn = document.getElementById('clear');
const downloadBtn = document.getElementById('download');

console.log('✅ App.js cargado correctamente');
console.log('Elementos del DOM:', { form, getIdeasBtn, suggestionsDiv, canvas });

// ============== Preferences Collection ==============
async function collectAnswers() {
  const colors = Array.from(document.querySelectorAll('#colorChoices input:checked')).map(i => i.value);
  const materials = Array.from(document.querySelectorAll('.materials input:checked')).map(i => i.value);
  const time = form.time.value;
  const difficulty = form.difficulty.value;
  const style = form.style.value;
  const subject = form.subject.value;
  const mood = form.mood.value;

  const answers = { colors, materials, time, difficulty, style, subject, mood };
  console.log('📋 Respuestas recolectadas:', answers);
  return answers;
}

// ============== API Calls ==============
async function fetchSuggestions(answers) {
  console.log('🌐 Enviando solicitud al servidor...', answers);
  
  try {
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    
    console.log('📡 Respuesta del servidor:', res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }
    
    const json = await res.json();
    console.log('✅ Datos recibidos:', json);
    return json;
  } catch (error) {
    console.error('❌ Error en fetchSuggestions:', error);
    throw error;
  }
}

// ============== UI Rendering ==============
function showSuggestions(list) {
  console.log('🎨 Mostrando sugerencias:', list);
  suggestionsDiv.innerHTML = '';
  
  if (!list || list.length === 0) {
    suggestionsDiv.innerHTML = '<div style="color: #6b7280; padding: 20px; text-align: center;">No se encontraron sugerencias. Intenta cambiar tus preferencias.</div>';
    return;
  }

  list.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    
    // Convertir saltos de línea a <br>
    const description = (s.description || 'Sin descripción disponible')
      .replace(/\n/g, '<br>')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;strong&gt;/g, '<strong>')
      .replace(/&lt;\/strong&gt;/g, '</strong>')
      .replace(/&lt;br&gt;/g, '<br>');
    
    el.innerHTML = `
      <strong>💡 Idea ${i + 1}</strong>
      <div style="margin-top: 12px; line-height: 1.6;">${description}</div>
    `;
    el.style.animation = `slideIn 0.3s ease ${i * 0.1}s forwards`;
    el.style.opacity = '0';
    suggestionsDiv.appendChild(el);
    console.log(`  ✓ Idea ${i + 1} añadida al DOM`);
  });
}

function escapeHtml(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============== Event Listeners ==============
if (getIdeasBtn) {
  console.log('📍 Event listener agregado al botón');
  
  getIdeasBtn.addEventListener('click', async (e) => {
    console.log('🔘 Click en botón "Obtener ideas"');
    e.preventDefault();
    
    const colors = Array.from(document.querySelectorAll('#colorChoices input:checked')).length;
    const materials = Array.from(document.querySelectorAll('.materials input:checked')).length;

    console.log(`📊 Colores seleccionados: ${colors}, Materiales: ${materials}`);

    if (colors === 0 && materials === 0) {
      alert('Por favor selecciona al menos 1 color o material');
      console.warn('⚠️ No hay colores ni materiales seleccionados');
      return;
    }

    getIdeasBtn.disabled = true;
    getIdeasBtn.innerHTML = '⏳ Buscando...';
    
    try {
      const answers = await collectAnswers();
      console.log('📤 Enviando al servidor:', answers);
      
      const json = await fetchSuggestions(answers);
      console.log('📥 Respuesta recibida:', json);
      
      if (json && json.suggestions && json.suggestions.length > 0) {
        console.log('✅ Mostrando', json.suggestions.length, 'sugerencias');
        showSuggestions(json.suggestions);
      } else {
        console.error('❌ No hay sugerencias en la respuesta:', json);
        suggestionsDiv.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">No se pudieron obtener sugerencias. Verifica la consola para más detalles.</div>';
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      suggestionsDiv.innerHTML = `<div style="color: #ef4444; padding: 20px; text-align: center;">Error: ${error.message}</div>`;
    } finally {
      getIdeasBtn.disabled = false;
      getIdeasBtn.innerHTML = '✨ Obtener 3 ideas';
    }
  });
} else {
  console.error('❌ No se encontró el botón getIdeas');
}

// ============== Canvas Setup ==============
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  ctx.scale(ratio, ratio);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ============== Drawing Logic ==============
let drawing = false;
let last = null;

canvas.addEventListener('pointerdown', e => {
  drawing = true;
  last = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener('pointerup', () => {
  drawing = false;
  last = null;
});

canvas.addEventListener('pointermove', e => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;
  const tool = toolEl.value;
  const size = parseInt(sizeEl.value, 10);

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = picker.value;
  }

  ctx.lineWidth = size;

  if (last) {
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  last = { x, y };
});

// ============== Tool Controls ==============
sizeEl.addEventListener('input', e => {
  const size = e.target.value;
  sizeValue.textContent = size;
});

clearBtn.addEventListener('click', () => {
  if (confirm('¿Estás seguro de que quieres limpiar el lienzo?')) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `dibujo_${new Date().getTime()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// ============== Color Preferences ==============
document.querySelectorAll('#colorChoices input').forEach(inp => {
  inp.addEventListener('change', () => {
    const checked = Array.from(document.querySelectorAll('#colorChoices input:checked')).map(i => i.value.toLowerCase());
    
    if (checked.length === 1) {
      const colorMap = {
        'rojo': '#d9534f',
        'azul': '#1e90ff',
        'verde': '#2ecc71',
        'amarillo': '#f1c40f',
        'morado': '#8e44ad',
        'naranja': '#e67e22',
        'blanco': '#ffffff',
        'negro': '#000000'
      };
      const hex = colorMap[checked[0]] || '#000000';
      picker.value = hex;
    }
  });
});

// ============== Animations ==============
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);;
