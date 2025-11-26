const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// Base de datos de ideas locales como respaldo
const DRAWING_IDEAS = {
  animals: [
    'Un animal en su hábitat natural con detalles realistas',
    'Retrato de un animal con expresión emocional',
    'Animal mitológico o fantástico hibrido',
    'Fauna marina en las profundidades oceánicas',
    'Insectos macro con patrones intrincados',
    'Rebaño en movimiento durante la migración',
    'Criatura nocturna emergiendo de las sombras',
    'Animales domésticos interactuando entre sí',
    'Criatura pequeña en primer plano dentro de un bosque',
    'Depredador cazando bajo la lluvia'
  ],
  portrait: [
    'Rostro humano con emociones intensas',
    'Retrato de perfil con detalles en el cabello',
    'Rostro parcialmente oculto por sombras',
    'Expresión de sorpresa o asombro',
    'Retrato de personaje histórico o legendario',
    'Rostro envejecido mostrando historias de vida',
    'Gesto de contemplación o meditación',
    'Rostro con maquillaje artístico o tribal',
    'Mirada penetrante hacia el observador',
    'Doble exposición de rostro con naturaleza'
  ],
  landscape: [
    'Montaña al atardecer con cielo dramático',
    'Bosque antiguo con luz filtrándose entre árboles',
    'Acantilado junto al mar tempestuoso',
    'Valle en diferentes estaciones del año',
    'Desierto infinito con dunas de arena',
    'Lluvia cayendo sobre un pueblo abandonado',
    'Cascada potente en medio de la selva',
    'Aurora boreal iluminando el cielo nocturno',
    'Puente antiguo cruzando un río brumoso',
    'Paisaje lunar o de otro planeta'
  ],
  objects: [
    'Objeto vintage fotografiado con luz dramática',
    'Bodegón con frutas y objetos cotidianos',
    'Máquina o mecanismo con detalles técnicos',
    'Joyería elaborada con gemas resplandecientes',
    'Libro antiguo con páginas remojadas',
    'Instrumento musical con énfasis en texturas',
    'Herramientas de artista dispersas en mesa',
    'Objeto roto mostrando su interior',
    'Vidrio transparente reflejando luz',
    'Tela con pliegues y sombras complejas'
  ],
  fantasy: [
    'Castillo flotante en las nubes',
    'Dragón sentado sobre un tesoro',
    'Portal mágico abierto en medio del bosque',
    'Criatura mitológica en el agua',
    'Hechicero lanzando hechizo de luz',
    'Mundo dentro de una burbuja mágica',
    'Árbol antiguo habitado por espíritus',
    'Batalla épica entre criaturas mágicas',
    'Ciudad subterránea luminiscente',
    'Criatura de otro reino manifestándose'
  ]
};

const MODIFIERS = [
  'con énfasis en iluminación dramática',
  'con composición centrada en el primer plano',
  'con texturas visibles y detalladas',
  'con contraste alto entre luces y sombras',
  'minimalista con pocos elementos principales',
  'con patrones repetitivos como fondo',
  'desde una perspectiva inusual o ángulo extremo',
  'con un punto focal claro y el fondo desenfocado',
  'en escala monumental',
  'con atmósfera misteriosa o melancólica'
];

// Función para obtener ideas de la web
async function fetchPromptsFromWeb(url) {
  try {
    console.log(`   📡 Intentando obtener de: ${url}`);
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 5000
    });
    
    const $ = cheerio.load(res.data);
    const texts = new Set();

    // Función para limpiar texto
    const cleanText = (t) => {
      if (!t) return '';
      // Remover HTML tags
      let clean = t.replace(/<[^>]*>/g, ' ');
      // Remover entidades HTML
      clean = clean.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      clean = clean.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      // Limpiar espacios múltiples
      clean = clean.replace(/\s+/g, ' ').trim();
      return clean;
    };

    // Palabras clave a ignorar (contenido basura)
    const badKeywords = [
      'broken', 'fixed', 'subscribe', 'comment', 'reply', 'author', 'posted',
      'share', 'like', 'follow', 'support', 'patreon', 'fund', 'donation',
      'click here', 'read more', 'learn more', 'sign up', 'log in', 'copyright',
      'all rights reserved', 'terms of service', 'privacy policy', 'contact us',
      'newsletter', 'email', '@', 'http', 'www', 'admin', 'moderator'
    ];

    const isValidPrompt = (text) => {
      const lower = text.toLowerCase();
      // Verificar si contiene palabras malas
      for (let keyword of badKeywords) {
        if (lower.includes(keyword)) return false;
      }
      // Verificar que tenga al menos una palabra relacionada con arte/dibujo o sea una idea válida
      // Aceptar cualquier texto que sea razonablemente largo y no sea basura
      return text.length > 15 && text.length < 250;
    };

    // Buscar en listas
    $('li').each((i, el) => {
      const t = cleanText($(el).text());
      if (isValidPrompt(t)) {
        texts.add(t);
      }
    });

    // Buscar en párrafos
    $('p').each((i, el) => {
      const t = cleanText($(el).text());
      if (isValidPrompt(t)) {
        texts.add(t);
      }
    });

    // Buscar en divs con clase common
    $('div.wp-content, div.entry-content, div.post-content, article').each((i, el) => {
      const t = cleanText($(el).text());
      // Tomar solo los primeros 200 caracteres
      if (t && t.length > 20) {
        const chunks = t.split(/[.!?]+/).filter(chunk => {
          const trimmed = chunk.trim();
          return isValidPrompt(trimmed);
        });
        chunks.slice(0, 3).forEach(chunk => texts.add(chunk.trim()));
      }
    });

    const result = Array.from(texts).slice(0, 20);
    console.log(`   ✓ Obtenidas ${result.length} ideas válidas de ${url}`);
    return result;
  } catch (err) {
    console.log(`   ✗ Error al obtener de ${url}: ${err.message}`);
    return [];
  }
}

// Función principal para recopilar prompts de la web
async function gatherPromptsFromWeb() {
  console.log('🌐 Buscando ideas en la web...');
  
  const sources = [
    'https://artprompts.org/',
    'https://www.reddit.com/r/drawing/comments/drawing_prompts/',
    'https://www.deviantart.com/art-prompts/'
  ];

  const allPrompts = new Set();
  
  // Intentar obtener de múltiples fuentes en paralelo
  const results = await Promise.all(
    sources.map(url => fetchPromptsFromWeb(url))
  );
  
  results.forEach(prompts => {
    prompts.forEach(p => allPrompts.add(p));
  });

  const promptArray = Array.from(allPrompts);
  console.log(`✅ Total de ideas obtenidas de la web: ${promptArray.length}`);
  
  return promptArray.length > 5 ? promptArray : null;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIdea(promptText, answers) {
  const { colors = [], materials = [], time = '', difficulty = '', style = '', subject = '', mood = '' } = answers;
  
  const modifier = pickRandom(MODIFIERS);

  // Construir descripción personalizada
  let description = `💡 <strong>${promptText}</strong>\n\n`;

  description += `📋 <strong>Configuración:</strong>\n`;
  
  if (difficulty) description += `• Dificultad: ${difficulty}\n`;
  if (style) description += `• Estilo: ${style}\n`;
  if (time) description += `• Tiempo: ${time}\n`;
  
  if (colors.length > 0) {
    description += `• Paleta sugerida: ${colors.join(', ')}\n`;
  }
  
  if (materials.length > 0) {
    description += `• Materiales: ${materials.join(', ')}\n`;
  }

  description += `\n✨ <strong>Modificadores de dibujo:</strong>\n`;
  description += `${modifier}`;

  if (mood) {
    description += `\n\n💭 <strong>Mood/Atmósfera:</strong>\n${mood}`;
  }

  return {
    title: promptText,
    description: description,
    source: 'web'
  };
}

function generateFallbackIdea(answers) {
  const { subject = '' } = answers;
  
  // Seleccionar categoría basada en tema
  let category = 'portrait';
  if (subject) {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('animal')) category = 'animals';
    else if (subjectLower.includes('paisaje')) category = 'landscape';
    else if (subjectLower.includes('objeto')) category = 'objects';
    else if (subjectLower.includes('fantasía') || subjectLower.includes('ficción')) category = 'fantasy';
    else category = 'portrait';
  }

  const baseIdea = pickRandom(DRAWING_IDEAS[category] || DRAWING_IDEAS.portrait);
  return generateIdea(baseIdea, answers);
}

app.get('/api/prompts', async (req, res) => {
  console.log('📋 Solicitud de prompts');
  try {
    const webPrompts = await gatherPromptsFromWeb();
    
    if (webPrompts && webPrompts.length > 0) {
      console.log('✅ Devolviendo prompts de la web');
      res.json({ prompts: webPrompts });
    } else {
      // Si falla la web, usar respaldo local
      const allIdeas = [];
      Object.keys(DRAWING_IDEAS).forEach(category => {
        allIdeas.push(...DRAWING_IDEAS[category]);
      });
      console.log('⚠️ Usando respaldo local: ' + allIdeas.length + ' prompts');
      res.json({ prompts: allIdeas });
    }
  } catch (err) {
    console.error('❌ Error en /api/prompts:', err);
    const allIdeas = [];
    Object.keys(DRAWING_IDEAS).forEach(category => {
      allIdeas.push(...DRAWING_IDEAS[category]);
    });
    res.json({ prompts: allIdeas });
  }
});

app.post('/api/suggestions', async (req, res) => {
  try {
    const answers = req.body.answers || {};
    
    console.log('📨 Solicitud recibida en /api/suggestions');
    console.log('   Datos:', JSON.stringify(answers, null, 2));
    
    // Intentar obtener ideas de la web
    let webPrompts = await gatherPromptsFromWeb();
    
    const suggestions = [];
    
    if (webPrompts && webPrompts.length > 0) {
      // Usar ideas de la web
      console.log('🌐 Generando ideas de la WEB');
      for (let i = 0; i < 3 && webPrompts.length > 0; i++) {
        const idx = Math.floor(Math.random() * webPrompts.length);
        const prompt = webPrompts.splice(idx, 1)[0];
        suggestions.push(generateIdea(prompt, answers));
      }
    } else {
      // Respaldo: usar ideas locales
      console.log('💾 Usando ideas LOCALES como respaldo');
      for (let i = 0; i < 3; i++) {
        suggestions.push(generateFallbackIdea(answers));
      }
    }

    console.log('✅ Enviando', suggestions.length, 'sugerencias');
    res.json({ suggestions });
  } catch (err) {
    console.error('❌ Error generating suggestions:', err);
    
    // Respaldo en caso de error
    const suggestions = [];
    for (let i = 0; i < 3; i++) {
      suggestions.push(generateFallbackIdea(req.body.answers || {}));
    }
    res.json({ suggestions });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en http://localhost:${PORT}`));
