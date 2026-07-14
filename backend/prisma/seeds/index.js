// Corre todos los seeds en el orden correcto según sus dependencias reales:
//   1. roles            — no depende de nada.
//   2. permissions      — necesita que ya existan los roles 'super_admin' y
//                         'admin' (permissions.seed.js lanza error si no).
//   3. users            — necesita que ya existan los roles (busca sus ids
//                         por nombre para asignarle el rol al usuario).
//   4. payment-methods  — independiente, no depende de nada de lo anterior.
//
// Cada archivo sigue funcionando solo (`node prisma/seeds/roles.seed.js`)
// para poder correrlo suelto si hace falta — esto solo los encadena en el
// orden correcto y detiene todo si alguno falla (execSync lanza si el hijo
// termina con código distinto de 0).
const { execSync } = require("child_process");
const path = require("path");

const SEEDS_IN_ORDER = [
  "roles.seed.js",
  "permissions.seed.js",
  "users.seed.js",
  "payment-methods.seed.js",
];

for (const seed of SEEDS_IN_ORDER) {
  const fullPath = path.join(__dirname, seed);
  console.log(`\n▶ Ejecutando ${seed}...`);
  execSync(`node "${fullPath}"`, { stdio: "inherit" });
}

console.log("\n✅ Todos los seeds se ejecutaron correctamente, en orden.");
