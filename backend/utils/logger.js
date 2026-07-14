// Logger mínimo sin dependencias nuevas (nada de winston/pino todavía —
// no hay forma de instalar/probar un paquete nuevo en este entorno). Da
// timestamp + nivel consistente en vez de console.log/error sueltos, y
// queda como un solo punto para swapear por una librería real más adelante
// sin tocar cada controller.
function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message, meta) {
    console.log(`[${timestamp()}] [INFO] ${message}`, meta ?? '');
  },
  warn(message, meta) {
    console.warn(`[${timestamp()}] [WARN] ${message}`, meta ?? '');
  },
  error(message, error) {
    console.error(`[${timestamp()}] [ERROR] ${message}`, error?.stack || error || '');
  },
};

module.exports = { logger };
