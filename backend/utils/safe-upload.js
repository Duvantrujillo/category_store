const crypto = require('crypto')

// El nombre de archivo NUNCA debe depender de lo que el cliente mandó en
// `originalname` — un multipart bien armado puede declarar
// Content-Type: image/png con filename: "algo.html", y como fileFilter solo
// valida el mimetype (no el contenido real del archivo), preservar esa
// extensión permitiría guardar y servir un .html/.js desde /uploads en el
// mismo origen de la API (XSS almacenado). La extensión se deriva SIEMPRE
// del mimetype ya validado por fileFilter, nunca del nombre original.
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

function extensionForMime(mimetype) {
  return MIME_TO_EXT[mimetype] || ''
}

// Callback `filename` para multer.diskStorage — mismo prefijo timestamp que
// se usaba antes, pero con una extensión segura y un sufijo aleatorio corto
// para evitar colisiones entre uploads en el mismo milisegundo.
function safeFilename(req, file, cb) {
  const ext = extensionForMime(file.mimetype)
  const random = crypto.randomBytes(4).toString('hex')
  cb(null, `${Date.now()}-${random}${ext}`)
}

module.exports = { MIME_TO_EXT, extensionForMime, safeFilename }
