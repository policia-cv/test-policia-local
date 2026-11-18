// Validador del banco de preguntas. Uso:  node validar.js
// Comprueba que cada tema enlazado en index.html carga, que cada pregunta tiene 4 opciones distintas,
// todos los campos, id único y que ninguna opción depende del orden (p. ej. "a y b son correctas").
const fs = require("fs");
global.window = {};
require("./data/temas.js");
const html = fs.readFileSync("index.html", "utf8");
const enlazados = [...html.matchAll(/data\/(tema\d+)\.js/g)].map(m => m[1]);
for (const t of enlazados) require("./data/" + t + ".js");

let errores = 0;
const ids = new Set();
const combo = /(las|todas las) (respuestas|opciones) anteriores|^[a-d]\) y [a-d]\)|son correctas las/i;
for (const [tema, preguntas] of Object.entries(window.BANCO)) {
  for (const q of preguntas) {
    const fallo = msg => { errores++; console.log(`✗ Tema ${tema} · ${q.id || "(sin id)"}: ${msg}`); };
    if (ids.has(q.id)) fallo("id duplicado");
    ids.add(q.id);
    for (const k of ["id", "p", "o", "e", "a", "f"]) if (!q[k]) fallo(`falta el campo ${k}`);
    if (!Array.isArray(q.o) || q.o.length !== 4) fallo("no tiene exactamente 4 opciones");
    else if (new Set(q.o).size !== 4) fallo("opciones repetidas");
    else if (q.o.some(x => combo.test(x))) fallo("opción que depende del orden (se barajan)");
  }
  const n = preguntas.length;
  const oficiales = preguntas.filter(q => q.f.startsWith("Examen oficial")).length;
  console.log(`Tema ${tema}: ${n} preguntas (${oficiales} de examen oficial)${n < 100 ? "  ⚠ menos de 100" : ""}`);
}
const sinEnlazar = fs.readdirSync("data").filter(f => /^tema\d+\.js$/.test(f) && !enlazados.includes(f.replace(".js", "")));
if (sinEnlazar.length) { errores++; console.log("✗ Archivos de tema no enlazados en index.html:", sinEnlazar.join(", ")); }
console.log(errores ? `\n${errores} error(es).` : "\nTodo correcto.");
process.exit(errores ? 1 : 0);
