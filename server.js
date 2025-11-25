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

const FALLBACK_PROMPTS = [
  'A fox exploring a neon city at night',
  'A quiet library with floating books',
  'Portrait of a person made of leaves',
  'A small boat on a mirror-like lake at sunrise',
  'A surreal teacup landscape',
  'An astronaut planting a tree on another planet',
  'A close-up of an eye reflecting a tiny scene',
  'A cat wearing a vintage pilot helmet',
  'A whimsical storefront on a rainy day',
  'An ancient door covered in ivy and glyphs'
];

async function fetchPromptsFrom(url) {
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Drawing-Prompter/1.0' }, timeout: 8000 });
    const $ = cheerio.load(res.data);
    const texts = new Set();

    $('li').each((i, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 8 && t.length < 200) texts.add(t.replace(/\s+/g, ' '));
    });

    $('p').each((i, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 20 && t.length < 200) texts.add(t.replace(/\s+/g, ' '));
    });

    return Array.from(texts);
  } catch (err) {
    return [];
  }
}

async function gatherPrompts() {
  const sources = [
    'https://artprompts.org/',
    'https://conceptartempire.com/drawing-prompts/',
    'https://www.creativebloq.com/inspiration/drawing-prompts'
  ];

  const all = new Set();
  await Promise.all(sources.map(async (s) => {
    const p = await fetchPromptsFrom(s);
    p.forEach(x => all.add(x));
  }));

  const arr = Array.from(all);
  if (arr.length < 8) return FALLBACK_PROMPTS;
  return arr;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeSuggestion(promptText, answers) {
  const colors = (answers.colors && answers.colors.length) ? answers.colors.slice(0,3) : [];
  const materials = (answers.materials && answers.materials.length) ? answers.materials : ['lápiz y papel'];
  const time = answers.time || 'sin límite de tiempo';
  const difficulty = answers.difficulty || 'intermedio';
  const style = answers.style || 'estilizado';
  const subject = answers.subject || 'a elección';
  const mood = answers.mood || '';

  const modifiers = [
    'enfoque en iluminación dramática',
    'centra la composición en el primer plano',
    'usa texturas visibles',
    'trabaja con contraste alto',
    'limita la paleta a los colores elegidos',
    'añade elementos pequeños repetidos como patrón'
  ];

  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

  const title = `${promptText}`;
  let desc = `Prompt: ${promptText}. `;
  desc += `Usa estilo: ${style}, dificultad: ${difficulty}. `;
  desc += `Materiales sugeridos: ${materials.join(', ')}. `;
  if (colors.length) desc += `Paleta: ${colors.join(', ')}. `;
  desc += `Tiempo sugerido: ${time}. `;
  if (subject) desc += `Tema preferido: ${subject}. `;
  if (mood) desc += `Estado/mood: ${mood}. `;
  desc += `Extra: ${modifier}.`;

  return { title, description: desc, prompt: promptText };
}

app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await gatherPrompts();
    res.json({ prompts });
  } catch (err) {
    res.json({ prompts: FALLBACK_PROMPTS });
  }
});

app.post('/api/suggestions', async (req, res) => {
  const answers = req.body.answers || {};
  let prompts = [];
  try {
    prompts = await gatherPrompts();
  } catch (err) {
    prompts = FALLBACK_PROMPTS;
  }

  const picks = [];
  const pool = prompts.slice();
  for (let i = 0; i < 6 && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }

  const suggestions = [];
  for (let i = 0; i < 3; i++) {
    const p = picks[i % picks.length] || pickRandom(prompts);
    suggestions.push(makeSuggestion(p, answers));
  }

  res.json({ suggestions });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
