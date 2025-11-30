# 📜 CONSTITUCIÓN - Drawing Prompter

## 🎯 Propósito General del Proyecto

**Drawing Prompter** es una aplicación web interactiva diseñada para **artistas, estudiantes y entusiastas del dibujo** que buscan inspiración y dirección creativa. El proyecto actúa como un **generador de prompts de dibujo personalizado** que adapta sus sugerencias según las preferencias del usuario (colores disponibles, materiales, dificultad, etc.).

La aplicación combina un **backend Node.js** que extrae ideas de la web con un **frontend interactivo** que incluye un lienzo de dibujo integrado, permitiendo a los usuarios recibir inspiración y ejecutar sus creaciones en el mismo lugar.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    DRAWING PROMPTER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              FRONTEND (Cliente)                       │   │
│  │ • HTML5 (index.html)                                 │   │
│  │ • CSS3 moderno con gradientes (style.css)            │   │
│  │ • JavaScript vanilla (app.js)                        │   │
│  │ • Canvas HTML5 para dibujo                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                   │
│              (REST API - JSON sobre HTTP)                    │
│                           ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              BACKEND (Servidor)                       │   │
│  │ • Express.js (server.js)                             │   │
│  │ • Web scraping con axios + cheerio                   │   │
│  │ • Base de datos local (fallback)                     │   │
│  │ • Generación de prompts personalizados               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Estructura de Archivos

```
paint3.0/
├── package.json              # Dependencias del proyecto (Express, axios, cheerio, cors)
├── server.js                 # Backend principal - lógica de servidor y web scraping
├── README.md                 # Instrucciones básicas de instalación
├── CONSTITUCION.md          # Este archivo - documentación completa
└── public/                   # Carpeta servida estáticamente
    ├── index.html           # Estructura HTML de la aplicación
    ├── style.css            # Estilos CSS (diseño responsivo)
    └── app.js               # Lógica del cliente (Canvas, eventos, API calls)
```

---

## 🔧 Funcionalidades Principales

### 1. **Generación de Prompts Personalizado** (`/api/suggestions`)

**Descripción:** Endpoint POST que recibe preferencias del usuario y retorna 3 ideas de dibujo personalizadas.

**Entrada (POST body):**
```json
{
  "answers": {
    "colors": ["Rojo", "Azul"],
    "materials": ["Lápiz", "Acuarela"],
    "time": "1 hora",
    "difficulty": "Intermedio",
    "style": "Realista",
    "subject": "Personas/Retrato",
    "mood": "melancólico"
  }
}
```

**Salida:**
```json
{
  "suggestions": [
    {
      "title": "Rostro humano con emociones intensas",
      "description": "💡 **Rostro humano con emociones intensas**\n\n📋 **Configuración:**\n• Dificultad: Intermedio\n• Estilo: Realista\n• Tiempo: 1 hora\n• Paleta sugerida: Rojo, Azul\n• Materiales: Lápiz, Acuarela\n\n✨ **Modificadores de dibujo:**\ncon énfasis en iluminación dramática",
      "source": "web"
    },
    ...
  ]
}
```

**Flujo:**
1. Intenta obtener ideas de sitios web externos (scraping)
2. Si falla, usa base de datos local como fallback
3. Genera 3 prompts personalizados añadiendo modificadores
4. Retorna con información de configuración del usuario

---

### 2. **Extracción de Ideas de la Web** (Web Scraping)

**Descripción:** El servidor intenta obtener prompts de dibujo de fuentes en internet.

**Sitios objetivo:**
- `https://artprompts.org/`
- `https://www.reddit.com/r/drawing/comments/drawing_prompts/`
- `https://www.deviantart.com/art-prompts/`

**Tecnologías:**
- **axios**: Para realizar requests HTTP
- **cheerio**: Para parsear HTML y extraer texto

**Lógica de limpieza:**
- Extrae texto de elementos `<li>`, `<p>`, `<div>` con clases comunes
- Filtra palabras clave negativas (publicidad, metadata, etc.)
- Valida que el texto tenga entre 15 y 250 caracteres
- Evita duplicados usando `Set`

**Mecanismo de fallback:**
Si el web scraping falla después de 5 segundos de timeout, utiliza la base de datos local.

---

### 3. **Base de Datos Local de Fallback**

**Estructura:** Base de datos hardcodeada en memoria con 5 categorías y ~50 prompts

**Categorías:**
```javascript
DRAWING_IDEAS = {
  animals: [10 prompts],      // Fauna, depredadores, insectos, criaturas
  portrait: [10 prompts],     // Retratos, expresiones, emociones
  landscape: [10 prompts],    // Montañas, bosques, acantilados, paisajes
  objects: [10 prompts],      // Bodegones, máquinas, texturas
  fantasy: [10 prompts]       // Dragones, castillos, criaturas mágicas
}
```

**Mapeo automático:**
El servidor detecta el tema (subject) del usuario y selecciona la categoría más apropiada.

---

### 4. **Sistema de Modificadores de Dibujo**

**Descripción:** Modifiers que enriquecen cada prompt con indicaciones artísticas

**Array de modificadores (10 opciones):**
- Con énfasis en iluminación dramática
- Con composición centrada en el primer plano
- Con texturas visibles y detalladas
- Con contraste alto entre luces y sombras
- Minimalista con pocos elementos principales
- Con patrones repetitivos como fondo
- Desde una perspectiva inusual o ángulo extremo
- Con un punto focal claro y el fondo desenfocado
- En escala monumental
- Con atmósfera misteriosa o melancólica

Se elige **aleatoriamente uno** para cada sugerencia.

---

### 5. **Lienzo de Dibujo Interactivo** (HTML5 Canvas)

**Características:**
- Canvas responsivo que se adapta al tamaño de la ventana
- Soporte para **lápiz/pincel** y **borrador**
- Selector de color personalizado (color picker)
- Control de tamaño del pincel (1-50px)
- Botón para **limpiar** el lienzo
- Botón para **descargar** el dibujo como PNG

**Herramientas:**
1. **Pincel**: Dibuja usando el color seleccionado
2. **Borrador**: Borra contenido usando composición `destination-out`

**Eventos de puntero:**
- `pointerdown`: Inicia el dibujo
- `pointermove`: Dibuja líneas suaves entre puntos
- `pointerup`: Finaliza el dibujo

---

### 6. **Interfaz de Preferencias del Usuario**

**Formulario con secciones:**

#### Colores (hasta 4)
- Checkbox multiselector: Rojo, Azul, Verde, Amarillo, Morado, Naranja, Blanco, Negro
- Visual interactivo con color dots animados

#### Materiales Disponibles
- Checkbox multiselector: Lápiz, Carboncillo, Acuarela, Rotuladores, Óleo, Digital

#### Selectores individuales
- **Tiempo**: 15 min, 30 min, 1 hora, 2 horas, sin límite
- **Dificultad**: Principiante, Intermedio, Avanzado
- **Estilo**: Realista, Cartoon, Abstracto, Ilustración, Estilizado
- **Tema**: Animales, Personas/Retrato, Paisaje, Objetos, Ciencia ficción/Fantasía, Sin preferencia

#### Campo de texto opcional
- **Mood**: Input libre para atmósfera deseada (ej: "melancólico", "colorido")

---

## 🌐 Endpoints de la API

### `POST /api/suggestions`
Genera 3 prompts personalizados basados en preferencias del usuario.

**Request Headers:** 
```
Content-Type: application/json
```

**Response:** 
```json
{
  "suggestions": [
    { "title": "...", "description": "...", "source": "web|local" }
  ]
}
```

**Códigos HTTP:**
- `200 OK`: Éxito
- `500 Error`: Si ocurre una excepción, pero aún así retorna sugerencias del fallback

---

### `GET /api/prompts` (No utilizado en frontend, pero disponible)
Retorna lista de prompts disponibles (para debugging).

---

## 🎨 Diseño Visual

### Paleta de Colores
```css
--primary: #6366f1          /* Índigo (botones principales)
--primary-dark: #4f46e5     /* Índigo oscuro
--primary-light: #818cf8    /* Índigo claro
--success: #10b981          /* Verde (descargar)
--danger: #ef4444           /* Rojo (error)
--text-primary: #1f2937     /* Texto oscuro
--bg-light: #f9fafb         /* Fondo gris claro
--bg-white: #ffffff         /* Fondo blanco
```

### Componentes CSS
- **Header**: Logo animado (bounce) + título con gradiente
- **Left Panel**: Formulario de preferencias + resultados
- **Right Panel**: Canvas y herramientas (sticky/posición fija)
- **Tarjetas de resultados**: Gradiente suave con borde izquierdo coloreado
- **Responsive**: Diseño de 2 columnas (desktop) → 1 columna (mobile)

### Animaciones
- `bounce`: Logo del header (infinito)
- `slideIn`: Tarjetas de sugerencias (cascada de 0.1s)
- `floatTiny`: Dots de color (movimiento sutil)

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js** (^4.18.2): Framework web minimalista
- **axios** (^1.6.0): Cliente HTTP para web scraping
- **cheerio** (^1.0.0-rc.12): Parser HTML tipo jQuery
- **CORS** (^2.8.5): Middleware para permitir requests cross-origin

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Flexbox, Grid, Gradientes, Variables CSS
- **JavaScript Vanilla**: Manipulación del DOM, Canvas API, Fetch API
- **Canvas API**: Dibujo 2D

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- **Node.js** (v14+) instalado
- **npm** (generalmente viene con Node)
- Terminal (PowerShell en Windows)

### Pasos de Instalación

```powershell
# 1. Navegar a la carpeta del proyecto
cd "C:\Users\vanii\OneDrive\Imágenes\Desktop\ALI CODE\codegem\paint3.0"

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
npm start
```

### Resultado
```
✅ Servidor escuchando en http://localhost:3000
```

### Acceso
- Abrir navegador en `http://localhost:3000`
- La aplicación cargará en cualquier dispositivo (móvil, tablet, laptop)

---

## 🔍 Flujo de Usuario

1. **Usuario abre la aplicación** → Carga index.html + estilos + script
2. **Rellena preferencias** → Selecciona colores, materiales, dificultad, etc.
3. **Hace clic en "Obtener 3 ideas"** → Valida que tenga ≥1 color o material
4. **Envía POST a `/api/suggestions`** → Backend procesa y retorna prompts
5. **Ve 3 tarjetas con ideas** → Cada una incluye configuración + modificador
6. **Dibuja en el canvas** → Usa pincel/borrador, controla color y tamaño
7. **Guarda su obra** → Descarga PNG

---

## 🐛 Mecanismos de Error Handling

### Backend (`server.js`)

**Timeout en web scraping:**
```javascript
timeout: 5000  // 5 segundos máximo por request
```

**Filtrado de contenido basura:**
- Elimina palabras como "subscribe", "click here", "copyright"
- Valida rango de caracteres (15-250)

**Fallback en cascada:**
1. Intenta obtener de la web
2. Si falla → Usa base de datos local
3. Si hay error → Aún retorna sugerencias (status 200)

### Frontend (`app.js`)

**Validación de entrada:**
```javascript
if (colors === 0 && materials === 0) {
  alert('Por favor selecciona al menos 1 color o material');
  return;
}
```

**Captura de errores:**
```javascript
try {
  const json = await fetchSuggestions(answers);
  // Procesar...
} catch (error) {
  suggestionsDiv.innerHTML = `<div>Error: ${error.message}</div>`;
}
```

**Logging extensivo:**
- Todos los eventos importantes se loguean a la consola del navegador
- Útil para debugging

---

## 📝 Información de Configuración

### `package.json`
```json
{
  "name": "drawing-prompter",
  "version": "1.0.0",
  "description": "Responsive drawing app con prompts personalizados",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": { ... }
}
```

### Variables de entorno (opcional)
```javascript
const PORT = process.env.PORT || 3000;
```
Permite cambiar puerto si es necesario.

---

## 🔐 Consideraciones de Seguridad

1. **CORS habilitado**: Acepta requests de cualquier origen (configurable)
2. **User-Agent falso**: Incluye User-Agent para evitar bloqueos en web scraping
3. **Sanitización de HTML**: Remueve tags HTML antes de mostrar prompts
4. **Validación de entrada**: Filtra textos basura
5. **Timeout en requests**: Evita bloqueos indefinidos

---

## 🎯 Casos de Uso

### Caso 1: Artista Experimentado
- Selecciona dificultad "Avanzado" y estilo "Realista"
- Elige materiales digitales
- Obtiene prompts complejos con modificadores sofisticados

### Caso 2: Principiante
- Selecciona dificultad "Principiante"
- Elige lápiz como material
- Dibuja directamente en el canvas
- Descarga su primer dibujo

### Caso 3: Sesión de Sketching
- Selecciona "Sin límite" de tiempo
- Genera 3 ideas, dibuja cada una
- Descarga los 3 PNGs secuencialmente

---

## 🚧 Limitaciones Actuales

1. **Web scraping frágil**: Depende de estructura HTML de sitios externos
2. **Almacenamiento local**: Sin persistencia de dibujos (se pierden al recargar)
3. **Sin autenticación**: No hay usuarios registrados
4. **Sin base de datos persistente**: Los prompts no se guardan
5. **Canvas sin capas**: Dibujo simple sin historial de edición

---

## 💡 Posibles Mejoras Futuras

1. **Persistencia de dibujos**: LocalStorage o servidor backend
2. **Base de datos**: MongoDB/PostgreSQL para prompts creados por comunidad
3. **Autenticación**: Login para guardar galería de dibujos
4. **Compartir**: Exportar sugerencia + dibujo en redes
5. **Histórico**: Acceder a prompts anteriores
6. **Categorías personalizadas**: Usuarios creen sus propios prompts
7. **Galería comunitaria**: Ver dibujos de otros usuarios
8. **Duración de sesiones**: Guardar sesión de dibujo en progreso

---

## 📞 Contacto y Contribución

**Repositorio:** Drawing-prompter  
**Propietario:** AllieGamer265  
**Rama activa:** main

Para contribuir, asegúrate de:
1. Mantener coherencia con la arquitectura
2. Seguir el patrón de naming español
3. Incluir logging para debugging
4. Documentar cambios en CONSTITUCION.md

---

## 📚 Referencias de Código

### Componentes clave a entender

**`server.js` - Funciones principales:**
- `fetchPromptsFromWeb(url)`: Web scraping de una URL
- `gatherPromptsFromWeb()`: Obtiene de múltiples fuentes en paralelo
- `generateIdea(promptText, answers)`: Genera prompt personalizado con modificadores
- `generateFallbackIdea(answers)`: Usa base de datos local
- POST `/api/suggestions`: Orquesta todo el proceso

**`app.js` - Funciones principales:**
- `collectAnswers()`: Recopila preferencias del formulario
- `fetchSuggestions(answers)`: Envía POST al servidor
- `showSuggestions(list)`: Renderiza tarjetas de sugerencias
- Listeners del canvas: Maneja dibujo, borrador, descarga

**`style.css` - Variables clave:**
- CSS variables para tema unificado
- Media queries para responsividad (1024px y 768px breakpoints)

---

## 🎓 Para Agentes de IA / Desarrolladores

### Antes de Iniciar Cambios

1. Lee este documento completamente
2. Ejecuta la aplicación localmente (`npm start`)
3. Prueba todas las funcionalidades en navegador
4. Revisa la consola del navegador (F12) para entender el flujo
5. Revisa los logs del servidor en terminal

### Estructura de Commits Sugerida

```
[FEATURE] Nombre de la característica
[BUGFIX] Descripción del bug corregido
[DOCS] Actualización de documentación
[REFACTOR] Mejora de código existente
```

### Testing Manual

**Flujo de prueba completo:**
```
1. npm start
2. Abrir http://localhost:3000
3. Seleccionar preferencias
4. Hacer clic en "Obtener 3 ideas"
5. Verificar que aparezcan 3 tarjetas
6. Dibujar en el canvas
7. Cambiar color y tamaño
8. Usar borrador
9. Limpiar lienzo
10. Descargar PNG
```

---

## ✅ Checklist para Nuevos Desarrolladores

- [ ] Cloné el repositorio
- [ ] Instalé Node.js y npm
- [ ] Ejecuté `npm install`
- [ ] Ejecuté `npm start` exitosamente
- [ ] Accedí a http://localhost:3000
- [ ] Probé el formulario de preferencias
- [ ] Generé sugerencias exitosamente
- [ ] Dibujé en el canvas
- [ ] Descargué un PNG
- [ ] Leí completamente este documento
- [ ] Entiendo la arquitectura general

---

**Última actualización:** Noviembre 2025  
**Versión del proyecto:** 1.0.0  
**Estado:** Activo en desarrollo

