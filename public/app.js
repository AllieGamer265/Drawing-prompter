// ============== DOM Elements ==============
const form = document.getElementById('prefs');
const getIdeasBtn = document.getElementById('getIdeas');
const suggestionsDiv = document.getElementById('suggestions');

console.log('✅ App.js cargado correctamente');
console.log('Elementos del DOM:', { form, getIdeasBtn, suggestionsDiv });

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
      // picker.value = hex; // picker no longer exists
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


// ============== Drawing Canvas Logic ==============
document.addEventListener('DOMContentLoaded', () => {
  const drawingModeBtn = document.getElementById('drawingModeBtn');
  const drawingControls = document.getElementById('drawing-controls');
  const canvas = document.getElementById('drawing-canvas');
  const rightPanel = document.getElementById('right-panel');

  if (!canvas || !drawingModeBtn || !drawingControls || !rightPanel) {
    console.error('Drawing elements not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearBtn = document.getElementById('clearBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const saveBtn = document.getElementById('saveBtn');

  // Gallery Elements
  const galleryBtn = document.getElementById('galleryBtn');
  const galleryModal = document.getElementById('galleryModal');
  const closeModal = document.querySelector('.close-modal');
  const galleryGrid = document.getElementById('galleryGrid');
  const emptyGalleryMsg = document.getElementById('emptyGalleryMsg');

  // Theme Elements
  const themeBtn = document.getElementById('themeBtn');
  const themeModal = document.getElementById('themeModal');
  const closeThemeModal = document.querySelector('.close-theme-modal');
  const themeGrid = document.getElementById('themeGrid');
  const resetThemesBtn = document.getElementById('resetThemesBtn');

  // Themes Configuration
  const THEMES = [
    { id: 'original', name: 'Original', color: '#6366f1', free: true },
    { id: 'theme-dark', name: 'Modo Noche', color: '#1f2937', free: true },
    { id: 'theme-ocean', name: 'Ocean', color: '#0ea5e9', free: false, password: 'agua' },
    { id: 'theme-retro', name: 'Retro 80s', color: '#f472b6', free: false, password: '1980' },
    { id: 'theme-forest', name: 'Bosque', color: '#22c55e', free: false, password: 'arbol' },
    { id: 'theme-royal', name: 'Royal', color: '#9333ea', free: false, password: 'reina' },
    { id: 'theme-matrix', name: 'Matrix', color: '#00ff00', free: false, password: '2.0' },
    { id: 'theme-hacker', name: 'Hacker', color: '#00cc00', free: false, password: 'root' },
    { id: 'theme-candy', name: 'Candy', color: '#ec4899', free: false, password: 'dulce' }
  ];

  // Undo/Redo State
  let historyStack = [];
  let currentStep = -1;
  const MAX_HISTORY = 20;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function updateButtons() {
    if (!undoBtn || !redoBtn) return;
    undoBtn.disabled = currentStep <= 0;
    redoBtn.disabled = currentStep >= historyStack.length - 1;
  }

  function saveState() {
    if (currentStep < historyStack.length - 1) {
      // Truncate history if we draw after undoing
      historyStack = historyStack.slice(0, currentStep + 1);
    }

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStack.push(state);

    if (historyStack.length > MAX_HISTORY) {
      historyStack.shift();
    } else {
      currentStep++;
    }

    updateButtons();
    console.log(`💾 Estado guardado. Paso: ${currentStep}, Historial: ${historyStack.length}`);
  }

  function undo() {
    if (currentStep > 0) {
      currentStep--;
      const state = historyStack[currentStep];
      ctx.putImageData(state, 0, 0);
      updateButtons();
      console.log(`↩️ Deshacer. Paso: ${currentStep}`);
    }
  }

  function redo() {
    if (currentStep < historyStack.length - 1) {
      currentStep++;
      const state = historyStack[currentStep];
      ctx.putImageData(state, 0, 0);
      updateButtons();
      console.log(`↪️ Rehacer. Paso: ${currentStep}`);
    }
  }

  // ============== Gallery Functions ==============
  function loadGallery() {
    const drawings = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    galleryGrid.innerHTML = '';

    if (drawings.length === 0) {
      emptyGalleryMsg.style.display = 'block';
      return;
    }

    emptyGalleryMsg.style.display = 'none';

    drawings.forEach((d, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const date = new Date(d.date).toLocaleDateString();

      item.innerHTML = `
        <div class="load-overlay">
          <span class="load-text">Cargar en Lienzo</span>
        </div>
        <img src="${d.image}" alt="Dibujo del ${date}">
        <div class="gallery-item-footer">
          <span>📅 ${date}</span>
          <button class="delete-btn" title="Eliminar" data-index="${index}">🗑️</button>
        </div>
      `;

      item.querySelector('.load-overlay').addEventListener('click', (e) => {
        e.stopPropagation();
        loadImageToCanvas(d.image);
        galleryModal.style.display = 'none';
      });

      item.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de que quieres eliminar este dibujo?')) {
          deleteDrawing(index);
        }
      });

      galleryGrid.appendChild(item);
    });
  }

  function saveDrawing() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');

    tCtx.fillStyle = '#FFFFFF';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(canvas, 0, 0);

    const image = tempCanvas.toDataURL('image/png');
    const drawings = JSON.parse(localStorage.getItem('myDrawings') || '[]');

    drawings.unshift({
      date: new Date().toISOString(),
      image: image
    });

    localStorage.setItem('myDrawings', JSON.stringify(drawings));
    alert('¡Dibujo guardado en tu galería personal! 💾');
  }

  function deleteDrawing(index) {
    const drawings = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    drawings.splice(index, 1);
    localStorage.setItem('myDrawings', JSON.stringify(drawings));
    loadGallery();
  }

  function loadImageToCanvas(dataUrl) {
    const img = new Image();
    img.onload = () => {
      // Determine clear color based on theme
      let bgColor = '#FFFFFF';
      if (document.body.classList.contains('theme-dark')) bgColor = '#1f2937';
      else if (document.body.classList.contains('theme-ocean')) bgColor = '#082f49';
      else if (document.body.classList.contains('theme-retro')) bgColor = '#1e1b4b';
      else if (document.body.classList.contains('theme-forest')) bgColor = '#064e3b';
      else if (document.body.classList.contains('theme-royal')) bgColor = '#2e1065';
      else if (document.body.classList.contains('theme-matrix')) bgColor = '#000000';
      else if (document.body.classList.contains('theme-hacker')) bgColor = '#000000';
      else if (document.body.classList.contains('theme-candy')) bgColor = '#fff1f2';

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ideally we would fill with bg color first, but images are saved with white bg currently
      // so drawing them over transparent is fine.

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveState();

      if (!document.body.classList.contains('drawing-mode-active')) {
        document.body.classList.add('drawing-mode-active');
        setTimeout(resizeCanvas, 50);
      }
    };
    img.src = dataUrl;
  }

  // ============== Theme Functions ==============
  function initThemes() {
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) {
      applyTheme(savedTheme, false);
    }
  }

  function applyTheme(themeId, save = true) {
    // Remove all theme classes
    THEMES.forEach(t => {
      if (t.id !== 'original') document.body.classList.remove(t.id);
    });

    // Add new theme class
    if (themeId !== 'original') {
      document.body.classList.add(themeId);
    }

    if (save) {
      localStorage.setItem('currentTheme', themeId);
      resizeCanvas(); // Resize to update background color
    }
  }

  function renderThemes() {
    themeGrid.innerHTML = '';
    const unlocked = JSON.parse(localStorage.getItem('unlockedThemes') || '[]');
    const current = localStorage.getItem('currentTheme') || 'original';

    THEMES.forEach(theme => {
      const isLocked = !theme.free && !unlocked.includes(theme.id);
      const isActive = current === theme.id;

      const el = document.createElement('div');
      el.className = 'gallery-item';
      if (isActive) el.style.border = '2px solid var(--primary)';

      el.innerHTML = `
        <div class="theme-preview" style="background-color: ${theme.color}"></div>
        <div class="gallery-item-footer" style="justify-content: center;">
            <strong>${theme.name}</strong>
        </div>
        ${isLocked ? '<div class="locked-overlay">🔒</div>' : ''}
      `;

      el.addEventListener('click', () => {
        if (isLocked) {
          const pass = prompt(`🔒 El tema "${theme.name}" está bloqueado.\nIntroduce la contraseña secreta:`);
          if (pass === theme.password) {
            alert('🔓 ¡Contraseña correcta! Tema desbloqueado.');
            unlocked.push(theme.id);
            localStorage.setItem('unlockedThemes', JSON.stringify(unlocked));
            renderThemes(); // Re-render to remove lock
            applyTheme(theme.id);
          } else if (pass !== null) {
            alert('❌ Contraseña incorrecta.');
          }
        } else {
          applyTheme(theme.id);
          themeModal.style.display = 'none';
        }
      });

      themeGrid.appendChild(el);
    });
  }

  // Initialize themes on load
  initThemes();

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = rightPanel.getBoundingClientRect();

    // Determine background color based on theme
    let bgColor = '#FFFFFF';
    if (document.body.classList.contains('theme-dark')) bgColor = '#1f2937';
    else if (document.body.classList.contains('theme-ocean')) bgColor = '#082f49';
    else if (document.body.classList.contains('theme-retro')) bgColor = '#1e1b4b';
    else if (document.body.classList.contains('theme-forest')) bgColor = '#064e3b';
    else if (document.body.classList.contains('theme-royal')) bgColor = '#2e1065';
    else if (document.body.classList.contains('theme-matrix')) bgColor = '#000000';
    else if (document.body.classList.contains('theme-hacker')) bgColor = '#000000';
    else if (document.body.classList.contains('theme-candy')) bgColor = '#fff1f2';

    // Set a background for the canvas
    canvas.style.backgroundColor = bgColor;

    canvas.width = rect.width * dpr;
    canvas.height = (window.innerHeight - drawingControls.offsetHeight - 80) * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${window.innerHeight - drawingControls.offsetHeight - 80}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;

    // Reset history on resize/init (since canvas forces clear)
    historyStack = [];
    currentStep = -1;
    saveState(); // Save the initial blank state
  }

  function draw(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      saveState(); // Save state after stroke
    }
  });
  canvas.addEventListener('mouseout', () => {
    if (isDrawing) {
      isDrawing = false;
      saveState(); // Save state after stroke
    }
  });

  colorPicker.addEventListener('change', (e) => {
    ctx.strokeStyle = e.target.value;
  });

  brushSize.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
  });

  eraserBtn.addEventListener('click', () => {
    ctx.strokeStyle = '#FFFFFF'; // Set brush to white to act as an eraser
  });

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save blank state after clearing
  });

  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);

  if (saveBtn) saveBtn.addEventListener('click', saveDrawing);

  // Theme Listeners
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      renderThemes();
      themeModal.style.display = 'block';
    });
  }

  if (closeThemeModal) {
    closeThemeModal.addEventListener('click', () => {
      themeModal.style.display = 'none';
    });
  }

  if (resetThemesBtn) {
    resetThemesBtn.addEventListener('click', () => {
      if (confirm('¿Quieres bloquear todos los temas de nuevo? Tendrás que poner las contraseñas otra vez.')) {
        localStorage.removeItem('unlockedThemes');
        // If current theme is not free, revert to original
        const currentThemeId = localStorage.getItem('currentTheme');
        const currentThemeConfig = THEMES.find(t => t.id === currentThemeId);

        if (currentThemeConfig && !currentThemeConfig.free) {
          applyTheme('original');
        }

        renderThemes();
        alert('🔒 ¡Todos los temas bloqueados!');
      }
    });
  }

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
      galleryModal.style.display = 'none';
    }
    if (e.target === themeModal) {
      themeModal.style.display = 'none';
    }
  });

  if (galleryBtn) {
    galleryBtn.addEventListener('click', () => {
      loadGallery();
      galleryModal.style.display = 'block';
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      galleryModal.style.display = 'none';
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('drawing-mode-active')) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    }
  });

  drawingModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('drawing-mode-active');
    // After the class is toggled, the browser needs a moment to reflow,
    // then we can resize the canvas.
    setTimeout(resizeCanvas, 50);
  });

  window.addEventListener('resize', () => {
    if (document.body.classList.contains('drawing-mode-active')) {
      resizeCanvas();
    }
  });

  // Initial setup for drawing mode, but hidden
  if (document.body.classList.contains('drawing-mode-active')) {
    resizeCanvas();
  }
});