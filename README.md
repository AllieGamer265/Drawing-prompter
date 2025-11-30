# 📜 Drawing Prompter

**Drawing Prompter** es una aplicación web interactiva diseñada para **artistas, estudiantes y entusiastas del dibujo** que buscan inspiración y dirección creativa. El proyecto actúa como un **generador de prompts de dibujo personalizado** que adapta sus sugerencias según las preferencias del usuario (colores disponibles, materiales, dificultad, etc.).

La aplicación combina un **backend Node.js** que extrae ideas de la web con un **frontend interactivo** que incluye un lienzo de dibujo integrado, permitiendo a los usuarios recibir inspiración y ejecutar sus creaciones en el mismo lugar.

---

## 🏗️ Arquitectura

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
├── CONSTITUCION.md          # Documentación completa
└── public/                   # Carpeta servida estáticamente
    ├── index.html           # Estructura HTML de la aplicación
    ├── style.css            # Estilos CSS (diseño responsivo)
    └── app.js               # Lógica del cliente (Canvas, eventos, API calls)
```

---

## 🔧 Funcionalidades Principales

- **Generación de Prompts Personalizado**: Un endpoint recibe las preferencias del usuario y devuelve 3 ideas de dibujo personalizadas.
- **Web Scraping de Ideas**: El servidor intenta obtener prompts de dibujo de fuentes en internet (`artprompts.org`, `reddit`, `deviantart`).
- **Base de Datos Local de Fallback**: Una base de datos en memoria con ~50 prompts en 5 categorías se utiliza si el web scraping falla.
- **Sistema de Modificadores de Dibujo**: Modificadores que enriquecen cada prompt con indicaciones artísticas (ej: "con énfasis en iluminación dramática").
- **Lienzo de Dibujo Interactivo**: Un lienzo responsivo con pincel/borrador, selector de color, control de tamaño y funcionalidad de descarga como PNG.
- **Interfaz de Preferencias del Usuario**: Un formulario con secciones para colores, materiales, tiempo, dificultad, estilo y tema.

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
- Abrir un navegador en `http://localhost:3000`
- La aplicación cargará en cualquier dispositivo (móvil, tablet, laptop)

---

## 🌐 Endpoints de la API

### `POST /api/suggestions`
Genera 3 prompts personalizados basados en las preferencias del usuario.

**Request Body:** 
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

**Response:** 
```json
{
  "suggestions": [
    { "title": "...", "description": "...", "source": "web|local" }
  ]
}
```

---

## 🎨 Stack Tecnológico

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework Web
- **axios**: Cliente HTTP para web scraping
- **cheerio**: Parser de HTML
- **CORS**: Middleware para peticiones cross-origin

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Flexbox, Grid, Gradientes, Variables CSS
- **JavaScript Vanilla**: Manipulación del DOM, Canvas API, Fetch API

---

## 🌍 Desplegar en Vercel (Recomendado)

La forma más simple de publicar esta aplicación en línea es usando **Vercel** (es gratis):

### Opción 1: Usando Vercel CLI

```powershell
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Desplegar (en la carpeta del proyecto)
vercel
```

Vercel te guiará a través de la configuración. El proyecto se configurará automáticamente con el archivo `vercel.json`.

### Opción 2: Conectar repositorio GitHub

1. Push a GitHub (ya hecho ✅)
2. Ve a https://vercel.com
3. Haz login con tu cuenta de GitHub
4. Haz clic en "New Project"
5. Selecciona tu repositorio `Drawing-prompter`
6. Vercel detectará automáticamente que es un proyecto Node.js
7. Haz clic en "Deploy"

**¡Listo!** Tu aplicación estará disponible en una URL de Vercel como:
```
https://drawing-prompter-xxxxx.vercel.app
```

Puedes personalizar el nombre en los settings de Vercel.

---

## 💡 Posibles Mejoras Futuras

-   **Persistencia de Dibujos**: Usar LocalStorage o un backend para guardar los dibujos.
-   **Base de Datos**: Usar MongoDB/PostgreSQL para prompts creados por la comunidad.
-   **Autenticación**: Login de usuario para guardar una galería de dibujos.
-   **Compartir**: Exportar sugerencia + dibujo en redes sociales.
-   **Historial**: Acceder a prompts anteriores.

---
Para información más detallada, por favor consulta el archivo `CONSTITUCION.md`.