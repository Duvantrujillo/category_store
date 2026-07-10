// Normaliza a minúsculas y quita tildes/diacríticos para comparar palabras
// sin distinguir acentos, sin importar la collation configurada en MySQL.
function normSearch(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Stemmer español muy simple: solo maneja plurales comunes (-es, -s) para que
// "producto"/"productos" o "flor"/"flores" encuentren lo mismo.
function stemES(word) {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

// Divide una búsqueda en palabras (stems) individuales. Es la pieza clave para
// que una búsqueda de varias palabras ("porton rojo") encuentre resultados
// sin importar el orden ni en qué campo esté cada palabra — en vez de buscar
// la frase completa como un único substring literal, que solo matchea si el
// campo contiene exactamente esa secuencia de palabras en ese orden.
//
// Uso típico junto a Prisma: cada stem se busca por separado con OR entre
// campos, y todos los stems se combinan con AND (cada palabra debe aparecer
// en ALGÚN campo, no necesariamente en el mismo ni en el mismo orden):
//
//   const stems = buildSearchStems(q);
//   const where = {
//     ...(stems.length ? { AND: stems.map((s) => ({ OR: [
//       { name: { contains: s } },
//       { sku:  { contains: s } },
//     ] })) } : {}),
//   };
function buildSearchStems(query) {
  return (query || "").trim().split(/\s+/).filter(Boolean).map((w) => stemES(normSearch(w)));
}

module.exports = { normSearch, stemES, buildSearchStems };
