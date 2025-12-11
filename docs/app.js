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
const brushSizeSlider = sizeEl;
const colorPicker = picker;

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
      <button class="draw-idea-btn" data-idea-index="${i}" style="margin-top: 12px; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; width: 100%;">
        🎨 Empezar a Dibujar
      </button>
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

// ============== Canvas Sizing Configuration ==============
const CANVAS_PRESETS = {
  small: { width: 400, height: 300, label: 'Pequeño' },
  medium: { width: 600, height: 500, label: 'Mediano' },
  large: { width: 800, height: 600, label: 'Grande' },
  xlarge: { width: 1000, height: 750, label: 'Extra Grande' }
};

const ORIGINAL_CANVAS_SIZE = {
  width: 600,
  height: 500
};

let canvasAspectRatio = ORIGINAL_CANVAS_SIZE.width / ORIGINAL_CANVAS_SIZE.height;
let isAspectRatioLocked = false;
let isPreviewMode = false;
let previousCanvasImageData = null;

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

// ============== Canvas Sizing Functions ==============

function initCanvasSizingElements() {
  // Elements
  window.canvasSizingPanel = document.getElementById('canvas-sizing-panel');
  window.canvasWidthInput = document.getElementById('canvas-width-input');
  window.canvasHeightInput = document.getElementById('canvas-height-input');
  window.lockAspectRatioBtn = document.getElementById('lock-aspect-ratio-btn');
  window.contentHandlingSelect = document.getElementById('content-handling-select');
  window.applyCanvasSizeBtn = document.getElementById('apply-canvas-size-btn');
  window.previewCanvasSizeBtn = document.getElementById('preview-canvas-size-btn');
  window.resetCanvasSizeBtn = document.getElementById('reset-canvas-size-btn');
  window.currentSizeDisplay = document.getElementById('current-size-display');
  
  // Preset buttons
  window.presetButtons = document.querySelectorAll('.preset-btn');
}

function setupCanvasSizingListeners() {
  // Preset buttons
  window.presetButtons.forEach(btn => {
    btn.addEventListener('click', handlePresetSelect);
  });
  
  // Width input - trigger aspect ratio lock
  window.canvasWidthInput.addEventListener('input', handleWidthChange);
  window.canvasHeightInput.addEventListener('input', handleHeightChange);
  
  // Aspect ratio lock button
  window.lockAspectRatioBtn.addEventListener('click', toggleAspectRatioLock);
  
  // Action buttons
  window.applyCanvasSizeBtn.addEventListener('click', applyCanvasSize);
  window.previewCanvasSizeBtn.addEventListener('click', toggleCanvasSizePreview);
  window.resetCanvasSizeBtn.addEventListener('click', resetCanvasToOriginal);
  
  console.log('✅ Canvas sizing listeners initialized');
}

function handlePresetSelect(event) {
  const presetName = event.currentTarget.dataset.preset;
  const preset = CANVAS_PRESETS[presetName];
  
  if (!preset) return;
  
  // Update inputs
  window.canvasWidthInput.value = preset.width;
  window.canvasHeightInput.value = preset.height;
  canvasAspectRatio = preset.width / preset.height;
  
  // Update active state
  window.presetButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  // Update size display
  updateSizeDisplay(preset.width, preset.height);
  
  console.log(`📐 Preset selected: ${presetName} (${preset.width}x${preset.height})`);
}

function handleWidthChange(event) {
  const newWidth = parseInt(event.target.value) || 0;
  
  if (isAspectRatioLocked && newWidth > 0) {
    const newHeight = Math.round(newWidth / canvasAspectRatio);
    window.canvasHeightInput.value = newHeight;
    updateSizeDisplay(newWidth, newHeight);
  } else {
    updateSizeDisplay(newWidth, parseInt(window.canvasHeightInput.value) || 0);
  }
  
  // Remove active preset since custom values were entered
  window.presetButtons.forEach(btn => {
    btn.classList.remove('active');
  });
}

function handleHeightChange(event) {
  const newHeight = parseInt(event.target.value) || 0;
  
  if (isAspectRatioLocked && newHeight > 0) {
    const newWidth = Math.round(newHeight * canvasAspectRatio);
    window.canvasWidthInput.value = newWidth;
    updateSizeDisplay(newWidth, newHeight);
  } else {
    updateSizeDisplay(parseInt(window.canvasWidthInput.value) || 0, newHeight);
  }
  
  // Remove active preset
  window.presetButtons.forEach(btn => {
    btn.classList.remove('active');
  });
}

function toggleAspectRatioLock() {
  isAspectRatioLocked = !isAspectRatioLocked;
  
  // Update button appearance
  window.lockAspectRatioBtn.classList.toggle('locked', isAspectRatioLocked);
  window.lockAspectRatioBtn.textContent = isAspectRatioLocked 
    ? '🔒 Proporción bloqueada' 
    : '🔓 Proporción libre';
  
  // Store current aspect ratio when locking
  if (isAspectRatioLocked) {
    const width = parseInt(window.canvasWidthInput.value);
    const height = parseInt(window.canvasHeightInput.value);
    canvasAspectRatio = width / height;
  }
  
  console.log(`🔒 Aspect ratio lock: ${isAspectRatioLocked ? 'ON' : 'OFF'}`);
}

function updateSizeDisplay(width, height) {
  window.currentSizeDisplay.textContent = `${width} × ${height}`;
}

function saveCanvasContent() {
  try {
    previousCanvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('✅ Canvas content saved for resize operation');
  } catch (error) {
    console.error('❌ Error saving canvas content:', error);
    previousCanvasImageData = null;
  }
}

function restoreCanvasContent(method = 'keep') {
  if (!previousCanvasImageData) {
    console.warn('⚠️ No saved canvas content to restore');
    return;
  }
  
  switch (method) {
    case 'keep':
      // Copy the old image data to the new canvas at the top-left corner
      ctx.putImageData(previousCanvasImageData, 0, 0);
      console.log('✅ Canvas content kept (placed at top-left)');
      break;
      
    case 'scale':
      // Scale the old image to fit the new canvas size
      const scaledImage = new OffscreenCanvas(
        previousCanvasImageData.width,
        previousCanvasImageData.height
      );
      const scaledCtx = scaledImage.getContext('2d');
      scaledCtx.putImageData(previousCanvasImageData, 0, 0);
      
      ctx.drawImage(
        scaledImage,
        0,
        0,
        previousCanvasImageData.width,
        previousCanvasImageData.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      console.log('✅ Canvas content scaled to new size');
      break;
      
    case 'clear':
      // Clear the canvas (do nothing, it's already cleared)
      console.log('✅ Canvas cleared');
      break;
  }
}

function applyCanvasSize() {
  const newWidth = parseInt(window.canvasWidthInput.value);
  const newHeight = parseInt(window.canvasHeightInput.value);
  
  // Validations
  if (!newWidth || !newHeight) {
    alert('⚠️ Por favor ingresa valores válidos de ancho y alto');
    return;
  }
  
  if (newWidth < 200 || newWidth > 1600) {
    alert('⚠️ El ancho debe estar entre 200 y 1600 píxeles');
    return;
  }
  
  if (newHeight < 150 || newHeight > 1200) {
    alert('⚠️ El alto debe estar entre 150 y 1200 píxeles');
    return;
  }
  
  // Save current content
  saveCanvasContent();
  
  // Get content handling method
  const method = window.contentHandlingSelect.value;
  
  // Change canvas size (both attribute and style)
  canvas.width = newWidth;
  canvas.height = newHeight;
  canvas.style.width = newWidth + 'px';
  canvas.style.height = newHeight + 'px';
  
  // Reset canvas context properties (they're lost when resizing)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSizeSlider.value;
  
  // Restore content based on selected method
  restoreCanvasContent(method);
  
  // Update size display
  updateSizeDisplay(newWidth, newHeight);
  
  // Update preview mode if active
  if (isPreviewMode) {
    isPreviewMode = false;
    window.previewCanvasSizeBtn.classList.remove('active');
  }
  
  // Clear saved data
  previousCanvasImageData = null;
  
  console.log(
    `✅ Canvas resized to ${newWidth}x${newHeight}px (method: ${method})`
  );
}

function toggleCanvasSizePreview() {
  const newWidth = parseInt(window.canvasWidthInput.value);
  const newHeight = parseInt(window.canvasHeightInput.value);
  
  if (!newWidth || !newHeight) {
    alert('⚠️ Por favor ingresa valores válidos');
    return;
  }
  
  if (!isPreviewMode) {
    // Enter preview mode
    isPreviewMode = true;
    saveCanvasContent();
    
    // Temporarily resize canvas
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // Reset context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSizeSlider.value;
    
    // Restore content
    restoreCanvasContent('keep');
    
    window.previewCanvasSizeBtn.classList.add('active');
    window.previewCanvasSizeBtn.textContent = '✓ Presualizando';
    
    console.log('👁️ Canvas preview mode ON');
  } else {
    // Exit preview mode - restore original canvas
    isPreviewMode = false;
    canvas.width = ORIGINAL_CANVAS_SIZE.width;
    canvas.height = ORIGINAL_CANVAS_SIZE.height;
    canvas.style.width = ORIGINAL_CANVAS_SIZE.width + 'px';
    canvas.style.height = ORIGINAL_CANVAS_SIZE.height + 'px';
    
    // Reset context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSizeSlider.value;
    
    // Restore previous content
    restoreCanvasContent('keep');
    
    previousCanvasImageData = null;
    
    window.previewCanvasSizeBtn.classList.remove('active');
    window.previewCanvasSizeBtn.textContent = '👁️ Vista Previa';
    
    console.log('👁️ Canvas preview mode OFF');
  }
}

function resetCanvasToOriginal() {
  const confirmed = confirm(
    '¿Estás seguro de que deseas restaurar el tamaño original del canvas? ' +
    'El contenido actual se perderá.'
  );
  
  if (!confirmed) return;
  
  // Reset to original size
  canvas.width = ORIGINAL_CANVAS_SIZE.width;
  canvas.height = ORIGINAL_CANVAS_SIZE.height;
  
  // Reset inputs
  window.canvasWidthInput.value = ORIGINAL_CANVAS_SIZE.width;
  window.canvasHeightInput.value = ORIGINAL_CANVAS_SIZE.height;
  
  // Reset buttons
  window.presetButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Reset aspect ratio
  canvasAspectRatio = ORIGINAL_CANVAS_SIZE.width / ORIGINAL_CANVAS_SIZE.height;
  isAspectRatioLocked = false;
  window.lockAspectRatioBtn.classList.remove('locked');
  window.lockAspectRatioBtn.textContent = '🔓 Proporción libre';
  
  // Reset context
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSizeSlider.value;
  
  // Clear saved content
  previousCanvasImageData = null;
  
  // Update display
  updateSizeDisplay(ORIGINAL_CANVAS_SIZE.width, ORIGINAL_CANVAS_SIZE.height);
  
  // Close preview if active
  if (isPreviewMode) {
    isPreviewMode = false;
    window.previewCanvasSizeBtn.classList.remove('active');
    window.previewCanvasSizeBtn.textContent = '👁️ Vista Previa';
  }
  
  console.log('🔄 Canvas reset to original size');
}

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
document.head.appendChild(style);

// ============== Initialize Canvas Sizing on Load ==============
window.addEventListener('load', function() {
  // Canvas Sizing Feature
  initCanvasSizingElements();
  setupCanvasSizingListeners();
  updateSizeDisplay(canvas.width, canvas.height);
  
  // Drawing Mode Feature
  initDrawingMode();
  
  console.log('✅ All features initialized successfully');
});

// ============== Drawing Mode ==============
function initDrawingMode() {
  // Listen for draw idea buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('draw-idea-btn')) {
      const ideaIndex = e.target.dataset.ideaIndex;
      enterDrawingMode();
      console.log(`🎨 Entering drawing mode for idea ${ideaIndex}`);
    }
  });
  
  // Setup back button
  const backBtn = document.getElementById('back-to-ideas-btn');
  if (backBtn) {
    backBtn.addEventListener('click', exitDrawingMode);
  }
}

function enterDrawingMode() {
  document.body.classList.add('drawing-mode', 'active');
  const backBtn = document.getElementById('back-to-ideas-btn');
  if (backBtn) {
    backBtn.style.display = 'block';
  }
  console.log('📱 Drawing mode activated');
}

function exitDrawingMode() {
  document.body.classList.remove('drawing-mode', 'active');
  const backBtn = document.getElementById('back-to-ideas-btn');
  if (backBtn) {
    backBtn.style.display = 'none';
  }
  console.log('📋 Drawing mode deactivated');
}
