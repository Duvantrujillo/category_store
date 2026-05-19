///////////////////////////////////
USO DE CADA DEPENDENCIA
///////////////////////////////////

"@prisma/client": "^5.22.0"

Cliente oficial de Prisma para Node.js.
Se usa para interactuar con la base de datos mediante métodos como create, findMany, findUnique, update y delete.


"axios": "^1.16.0"

Cliente HTTP para hacer peticiones desde el frontend o backend.
Se usa para consumir APIs externas, enviar datos y obtener respuestas mediante GET, POST, PUT y DELETE.


"bcrypt": "^6.0.0"

Librería para encriptar contraseñas.
Se usa para generar hashes seguros y comparar contraseñas durante el login.


"cors": "^2.8.6"

Middleware de Express para habilitar CORS.
Permite que aplicaciones frontend puedan conectarse al backend sin bloqueos de seguridad del navegador.


"express": "^5.2.1"

Framework de servidor web para Node.js.
Se usa para crear rutas, manejar peticiones HTTP, middlewares y construir APIs REST.


"jsonwebtoken": "^9.0.3"

Librería para autenticación mediante JWT.
Se usa para generar y validar tokens de acceso en sistemas de login y rutas protegidas.


"prisma": "^5.22.0"

ORM moderno para Node.js.
Se usa para definir modelos de base de datos, realizar migraciones y administrar la conexión con MySQL, PostgreSQL o SQLite.



# 🧩 Prisma ORM – Command Guide

Guía de referencia rápida para los comandos más usados en Prisma dentro del proyecto.

---

## 🚀 Migrations (Cambios en la base de datos)

npm run db:migrate

Uso:
- Crear nuevas tablas (models)
- Modificar estructuras existentes
- Agregar campos o relaciones

Concepto:
Sincroniza el esquema con la base de datos y guarda el historial de cambios.

---

## ⚡ DB Push (Sin migraciones)

npm run db:push

Uso:
- Prototipado rápido
- Desarrollo inicial
- Sin historial de migraciones

Concepto:
Sincroniza el schema directamente a la base de datos sin crear migraciones.

---

## 🧪 Prisma Studio (Interfaz visual)

npm run db:studio

Uso:
- Visualizar datos de la base de datos
- Depuración
- Edición manual de registros

Concepto:
Interfaz tipo “Excel” para explorar la base de datos.

---

## 🔧 Generate Client

npm run db:generate

Uso:
- Después de cambios en schema.prisma
- Cuando se agregan modelos o campos nuevos

Concepto:
Regenera el cliente de Prisma para reflejar los cambios del schema.

---

## 🔄 Reset Database (Solo desarrollo)

npm run db:reset

Uso:
- Reiniciar base de datos
- Limpiar datos corruptos
- Reaplicar migraciones desde cero

⚠️ ADVERTENCIA:
Elimina todos los datos existentes.

---

## 🧠 Quick Reference

migrate  → Cambios estructurales con historial (PRODUCCIÓN)
push     → Sincronización rápida sin historial (DESARROLLO)
studio   → Exploración visual de datos
generate → Actualización del cliente Prisma
reset    → Reinicio completo de la base de datos

---

## 💡 Best Practice

- Usa `migrate` para cambios reales en el sistema
- Usa `push` solo en desarrollo o prototipos
- Usa `studio` para debugging
- Usa `generate` después de cambios en el schema
- Usa `reset` únicamente en entornos de desarrollo