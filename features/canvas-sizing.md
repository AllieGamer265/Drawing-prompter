# 📐 FEATURE SPECIFICATION: Canvas Sizing

## 🎯 Objetivo General

Permitir que los usuarios cambien dinámicamente el tamaño del canvas (área de dibujo) desde una interfaz intuitiva en la aplicación. Esto incluye opciones predefinidas, entrada personalizada y vista previa del cambio sin perder el contenido existente.

---

## 📋 Contexto del Proyecto

**Aplicación:** Drawing Prompter v1.0.0  
**Módulo Afectado:** Frontend (Canvas Interactive) - `public/app.js` y `public/index.html` y `public/style.css`  
**Dependencias:** HTML5 Canvas API, JavaScript vanilla, CSS3

---

## ✨ Descripción del Feature

### Funcionalidad Principal

El feature debe proporcionar a los usuarios:

1. **Panel de control de tamaño** con opciones predefinidas (pequeño, mediano, grande, personalizado)
2. **Entrada numérica personalizada** para ancho y alto del canvas en píxeles
3. **Vista previa en tiempo real** del nuevo tamaño antes de aplicar
4. **Opciones de escalado de contenido** (mantener, limpiar, o escalar contenido existente)
5. **Persistencia temporal** del tamaño en la sesión (localStorage opcional)

---

## 🏗️ Arquitectura de Implementación

### Ubicación de Cambios

```
public/
├── index.html        [MODIFICAR] - Agregar controles de tamaño
├── style.css         [MODIFICAR] - Estilos para panel de tamaño
└── app.js            [MODIFICAR] - Lógica de redimensionamiento
```

---

## 🔧 Especificación Técnica Detallada

### 1. INTERFAZ DE USUARIO (HTML)

#### Ubicación en el DOM
Se agregará un **nuevo panel (panel-canvas-sizing)** dentro del **right-panel** (donde está el canvas y herramientas), **arriba del canvas** o en una sección colapsable.

#### Estructura HTML requerida

```html
<!-- Canvas Sizing Control Panel -->
<div id="canvas-sizing-panel" class="canvas-control-panel">
  
  <!-- Título -->
  <h3 class="canvas-control-title">📐 Tamaño del Canvas</h3>
  
  <!-- Opciones Predefinidas -->
  <div class="canvas-presets">
    <button class="preset-btn" data-preset="small" title="Pequeño (400x300)">
      <span class="preset-icon">📱</span>
      <span>Pequeño</span>
    </button>
    <button class="preset-btn" data-preset="medium" title="Mediano (600x500)">
      <span class="preset-icon">🖥️</span>
      <span>Mediano</span>
    </button>
    <button class="preset-btn" data-preset="large" title="Grande (800x600)">
      <span class="preset-icon">🖨️</span>
      <span>Grande</span>
    </button>
    <button class="preset-btn" data-preset="xlarge" title="Extra Grande (1000x750)">
      <span class="preset-icon">📺</span>
      <span>Extra Gde</span>
    </button>
  </div>
  
  <!-- Entrada Personalizada -->
  <div class="canvas-custom-size">
    <label for="canvas-width-input">Ancho (px):</label>
    <input 
      type="number" 
      id="canvas-width-input" 
      class="size-input" 
      min="200" 
      max="1600" 
      value="600"
      placeholder="Ancho en píxeles"
    >
    
    <label for="canvas-height-input">Alto (px):</label>
    <input 
      type="number" 
      id="canvas-height-input" 
      class="size-input" 
      min="150" 
      max="1200" 
      value="500"
      placeholder="Alto en píxeles"
    >
    
    <!-- Botón para mantener proporción -->
    <button id="lock-aspect-ratio-btn" class="lock-btn" title="Bloquear proporción">
      🔓 Proporción libre
    </button>
  </div>
  
  <!-- Opciones de Contenido -->
  <div class="canvas-content-options">
    <label for="content-handling-select">¿Qué hacer con el contenido actual?</label>
    <select id="content-handling-select" class="content-select">
      <option value="keep">Mantener (conservar dibujo)</option>
      <option value="scale">Escalar (ajustar dibujo al nuevo tamaño)</option>
      <option value="clear">Limpiar (descartar dibujo actual)</option>
    </select>
  </div>
  
  <!-- Botones de Acción -->
  <div class="canvas-action-buttons">
    <button id="apply-canvas-size-btn" class="apply-btn primary-btn">
      ✅ Aplicar Cambios
    </button>
    <button id="preview-canvas-size-btn" class="preview-btn secondary-btn">
      👁️ Vista Previa
    </button>
    <button id="reset-canvas-size-btn" class="reset-btn tertiary-btn">
      🔄 Restaurar Tamaño Original
    </button>
  </div>
  
  <!-- Estado/Información -->
  <div id="canvas-size-info" class="size-info">
    <small>Tamaño actual: <strong id="current-size-display">600 × 500</strong> px</small>
  </div>
</div>
```

---

### 2. ESTILOS CSS

#### Variables de Espaciado (agregar a `:root`)

```css
:root {
  --canvas-control-padding: 16px;
  --canvas-control-gap: 12px;
  --canvas-button-height: 36px;
  --canvas-input-border-radius: 6px;
  --canvas-transition-duration: 0.3s;
}
```

#### Estilos del Panel

```css
/* Canvas Control Panel */
.canvas-control-panel {
  display: flex;
  flex-direction: column;
  gap: var(--canvas-control-gap);
  padding: var(--canvas-control-padding);
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px solid var(--primary-light);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  animation: slideIn 0.3s ease-out;
}

.canvas-control-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Preset Buttons */
.canvas-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-white);
  border: 2px solid var(--primary-light);
  border-radius: var(--canvas-input-border-radius);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--canvas-transition-duration) ease;
}

.preset-btn:hover {
  background: var(--primary-light);
  color: var(--bg-white);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.preset-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--bg-white);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.preset-icon {
  font-size: 18px;
}

/* Custom Size Input */
.canvas-custom-size {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.canvas-custom-size label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 4px;
}

.size-input {
  padding: 10px 12px;
  border: 2px solid var(--primary-light);
  border-radius: var(--canvas-input-border-radius);
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-white);
  transition: all var(--canvas-transition-duration) ease;
}

.size-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Lock Aspect Ratio Button */
.lock-btn {
  padding: 8px 12px;
  background: var(--bg-light);
  border: 2px solid #d1d5db;
  border-radius: var(--canvas-input-border-radius);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--canvas-transition-duration) ease;
  margin-top: 4px;
}

.lock-btn:hover {
  background: #e5e7eb;
  border-color: var(--primary-light);
}

.lock-btn.locked {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--bg-white);
}

/* Content Handling Options */
.canvas-content-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.canvas-content-options label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.content-select {
  padding: 10px 12px;
  border: 2px solid var(--primary-light);
  border-radius: var(--canvas-input-border-radius);
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-white);
  cursor: pointer;
  transition: all var(--canvas-transition-duration) ease;
}

.content-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Action Buttons */
.canvas-action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.apply-btn,
.preview-btn,
.reset-btn {
  padding: 10px 12px;
  border: 2px solid transparent;
  border-radius: var(--canvas-input-border-radius);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--canvas-transition-duration) ease;
}

.apply-btn {
  background: var(--primary);
  color: var(--bg-white);
  border-color: var(--primary);
}

.apply-btn:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.preview-btn {
  background: var(--bg-light);
  color: var(--text-primary);
  border-color: #d1d5db;
}

.preview-btn:hover {
  background: #e5e7eb;
  border-color: var(--primary-light);
}

.reset-btn {
  background: var(--bg-white);
  color: var(--text-primary);
  border-color: #d1d5db;
}

.reset-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* Size Info */
.size-info {
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.1);
  border-left: 4px solid var(--primary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-primary);
  margin-top: 4px;
}

#current-size-display {
  color: var(--primary);
  font-weight: 700;
}

/* Responsive - Mobile */
@media (max-width: 1024px) {
  .canvas-control-panel {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .canvas-presets {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .canvas-action-buttons {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .canvas-control-panel {
    padding: 10px;
    gap: 10px;
  }
  
  .canvas-presets {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .size-input,
  .content-select {
    font-size: 12px;
    padding: 8px 10px;
  }
}
```

---

### 3. LÓGICA EN JAVASCRIPT (app.js)

#### Variables Globales (agregar al inicio)

```javascript
// Canvas Sizing Configuration
const CANVAS_PRESETS = {
  small: { width: 400, height: 300, label: 'Pequeño' },
  medium: { width: 600, height: 500, label: 'Mediano' },
  large: { width: 800, height: 600, label: 'Grande' },
  xlarge: { width: 1000, height: 750, label: 'Extra Grande' }
};

const ORIGINAL_CANVAS_SIZE = {
  width: canvas.width,
  height: canvas.height
};

let canvasAspectRatio = ORIGINAL_CANVAS_SIZE.width / ORIGINAL_CANVAS_SIZE.height;
let isAspectRatioLocked = false;
let isPreviewMode = false;
let previousCanvasImageData = null;
```

#### Función: Obtener referencia de elementos del DOM

```javascript
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
```

#### Función: Inicializar listeners

```javascript
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
```

#### Función: Manejar selección de preset

```javascript
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
```

#### Función: Manejar cambio de ancho (con lock de proporción)

```javascript
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
```

#### Función: Manejar cambio de alto (con lock de proporción)

```javascript
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
```

#### Función: Alternar bloqueo de proporción

```javascript
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
```

#### Función: Actualizar display de tamaño

```javascript
function updateSizeDisplay(width, height) {
  window.currentSizeDisplay.textContent = `${width} × ${height}`;
}
```

#### Función: Guardar contenido del canvas

```javascript
function saveCanvasContent() {
  try {
    previousCanvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('✅ Canvas content saved for resize operation');
  } catch (error) {
    console.error('❌ Error saving canvas content:', error);
    previousCanvasImageData = null;
  }
}
```

#### Función: Restaurar contenido del canvas

```javascript
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
```

#### Función: Aplicar cambios de tamaño

```javascript
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
  
  // Change canvas size
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // Reset canvas context properties (they're lost when resizing)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSizeSlider.value;
  
  // Restore content based on selected method
  restoreCanvasContent(method);
  
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
```

#### Función: Alternar vista previa

```javascript
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
```

#### Función: Restaurar tamaño original

```javascript
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
```

#### Integración: Llamar inicialización en el evento window.load

```javascript
// En la función init() existente o dentro de window.addEventListener('load', ...)
window.addEventListener('load', function() {
  // ... código existente ...
  
  // Canvas Sizing Feature
  initCanvasSizingElements();
  setupCanvasSizingListeners();
  updateSizeDisplay(canvas.width, canvas.height);
  
  console.log('✅ All features initialized successfully');
});
```

---

## 🎯 Casos de Uso

### Caso 1: Artista Rápido
1. Abre la app
2. Selecciona preset "Pequeño" (400x300)
3. Dibuja rapidamente
4. Descarga

### Caso 2: Trabajo Detallado
1. Selecciona preset "Extra Grande" (1000x750)
2. Activa "Bloquear Proporción"
3. Dibuja con detalles
4. Cambiar a "Mediano" - selecciona "Escalar"
5. Continúa dibujando

### Caso 3: Prototipado Iterativo
1. Comienza con "Mediano"
2. Dibuja boceto
3. Usa "Vista Previa" para ver en "Grande"
4. Aplica el cambio con "Mantener"
5. Refina detalles

---

## 🔐 Consideraciones Técnicas

### Limitaciones de Canvas Resizing
- **Pérdida de contexto**: Al cambiar `canvas.width` o `canvas.height`, se pierde toda la información del contexto (color, tamaño de brush, etc.)
- **Solución**: Guardar y restaurar propiedades del contexto después del resize

### Escalado de Contenido
- **Método "keep"**: Coloca el contenido antiguo en la esquina superior izquierda (no rellena todo)
- **Método "scale"**: Usa `OffscreenCanvas` + `drawImage` para escalar contenido
- **Método "clear"**: Simplemente limpia (ya está limpio después del resize)

### Manejo de Aspect Ratio
- Se calcula como `width / height`
- Se almacena cuando se activa el bloqueo
- Se recalcula cuando se selecciona un preset

### Persistencia (Opcional - Future)
Agregar localStorage:
```javascript
localStorage.setItem('lastCanvasWidth', canvas.width);
localStorage.setItem('lastCanvasHeight', canvas.height);
```

---

## ✅ Checklist de Implementación

- [ ] Crear estructura HTML en `index.html` (antes del canvas o en nuevo section)
- [ ] Agregar estilos CSS en `style.css` (variables + clases del panel)
- [ ] Agregar variables globales en `app.js` (presets, original size, estado)
- [ ] Crear función `initCanvasSizingElements()` en `app.js`
- [ ] Crear función `setupCanvasSizingListeners()` en `app.js`
- [ ] Implementar `handlePresetSelect()` en `app.js`
- [ ] Implementar `handleWidthChange()` y `handleHeightChange()` en `app.js`
- [ ] Implementar `toggleAspectRatioLock()` en `app.js`
- [ ] Implementar `updateSizeDisplay()` en `app.js`
- [ ] Implementar `saveCanvasContent()` en `app.js`
- [ ] Implementar `restoreCanvasContent()` en `app.js` (con 3 métodos)
- [ ] Implementar `applyCanvasSize()` en `app.js`
- [ ] Implementar `toggleCanvasSizePreview()` en `app.js`
- [ ] Implementar `resetCanvasToOriginal()` en `app.js`
- [ ] Llamar `initCanvasSizingElements()` en el evento `load`
- [ ] Llamar `setupCanvasSizingListeners()` en el evento `load`
- [ ] Probar flujo completo (presets, custom, lock ratio, preview, apply, reset)
- [ ] Verificar responsividad en mobile
- [ ] Probar manejo de errores (valores inválidos)
- [ ] Documentar cambios en `CONSTITUCION.md`

---

## 🧪 Testing Manual

### Prueba 1: Presets
```
1. Abrir app
2. Clickear "Pequeño" → Canvas debe cambiar a 400x300
3. Clickear "Mediano" → Canvas debe cambiar a 600x500
4. Verificar que se actualiza el display "Tamaño actual"
```

### Prueba 2: Input Personalizado
```
1. Cambiar "Ancho" a 500 → Debe actualizar display
2. Cambiar "Alto" a 400 → Debe actualizar display
3. Ingresar valores fuera de rango (199, 1601) → Debe mostrar error al aplicar
```

### Prueba 3: Bloquear Proporción
```
1. Activar "Bloquear Proporción"
2. Cambiar ancho a 800 → Alto debe calcularse automáticamente (manteniendo ratio)
3. Cambiar alto a 600 → Ancho debe calcularse automáticamente
```

### Prueba 4: Vista Previa
```
1. Dibujar algo en el canvas
2. Cambiar tamaño a "Grande" 
3. Clickear "Vista Previa" → Canvas se agranda, dibujo se mantiene
4. Clickear "Vista Previa" nuevamente → Canvas vuelve al tamaño original
```

### Prueba 5: Manejo de Contenido
```
1. Dibujar en el canvas
2. Cambiar a tamaño "Grande" con método "Mantener" → Dibujo se mantiene arriba-izquierda
3. Cambiar a tamaño "Pequeño" con método "Limpiar" → Canvas se limpia
4. Cambiar a tamaño "Mediano" con método "Escalar" → Dibujo se escala
```

### Prueba 6: Reset
```
1. Cambiar tamaño, dibujar
2. Clickear "Restaurar Tamaño Original" → Canvas vuelve al tamaño inicial
3. Verificar que inputs vuelven a valores originales
```

---

## 🔄 Integración con Funcionalidades Existentes

### Canvas Drawing (app.js)
- El resize **NO debe** interferir con `drawLine()`, `eraser()`, `clearCanvas()`
- Después de resize, el brush sigue funcionando normalmente
- Se restauran todas las propiedades del contexto

### Download Canvas (app.js)
- `downloadCanvas()` debe funcionar con cualquier tamaño
- El PNG descargado será del tamaño actual del canvas

### Color Picker y Brush Size (app.js)
- Deben seguir funcionando después del resize
- Se mantienen los valores seleccionados

### Suggestions Display (app.js)
- No hay interferencia, son elementos separados

---

## 📝 Notas Importantes para Implementadores

1. **Context Reset Critical**: Después de cambiar `canvas.width` o `canvas.height`, SIEMPRE restaurar propiedades del contexto
2. **ImageData Limitations**: `getImageData`/`putImageData` no permiten insertar parcialmente - usar `drawImage` con `OffscreenCanvas` para escalar
3. **Event Delegation**: Usar delegación de eventos si se agregan/remueven dinámicamente preset buttons
4. **Accessibility**: Agregar `aria-label`, `title` y asegurar que los inputs sean accesibles por teclado
5. **Performance**: Para canvas muy grandes (>2000px), considerar throttle en event listeners

---

## 📚 Referencias de APIs Utilizadas

- **Canvas API**: `canvas.width`, `canvas.height`, `getImageData()`, `putImageData()`, `drawImage()`
- **OffscreenCanvas**: Para escalado de imagen sin renderizar inmediatamente
- **DOM API**: `querySelector`, `addEventListener`, `classList`
- **Web Storage API**: `localStorage` (para future persistence)

---

## 🚀 Próximas Mejoras

1. Presets adicionales (A4, A3, cuadrado, horizontal, vertical)
2. Persistencia de último tamaño usado (localStorage)
3. Historial de cambios de tamaño (undo/redo)
4. Opciones de relleno de fondo (color, transparencia)
5. Herramientas de transformación post-resize (rotate, flip)
6. Presets de redes sociales (Instagram, TikTok, Twitter)

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025  
**Estado:** Ready for Implementation  
**Complejidad:** Media  
**Tiempo estimado:** 2-3 horas
