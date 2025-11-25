# Drawing Prompter

Proyecto simple que ofrece ideas para dibujar. El backend busca ideas en la web y el frontend pide respuestas (colores, materiales, etc.) antes de mostrar 3 sugerencias aleatorias.

Instrucciones (Windows PowerShell):

```powershell
cd "C:\Users\vanii\OneDrive\Imágenes\Desktop\ALI CODE\codegem\paint3.0"
npm install
npm start
# Luego abre http://localhost:3000 en el navegador del dispositivo (móvil/tablet/laptop)
```

Notas:
- El servidor usa `axios` y `cheerio` para raspar algunas páginas públicas en busca de prompts.
- Si la extracción falla, se usan prompts de respaldo.
