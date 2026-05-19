# 🧩 Prisma ORM – Métodos principales y cuándo usarlos

---

## 🔍 FIND (leer datos)

### 📌 findMany
Devuelve muchos registros

Uso:
- listar usuarios
- listar productos
- traer todo

Ejemplo:
prisma.user.findMany()

🧠 “Dame todos los registros”

---

### 📌 findUnique
Busca un solo registro por campo ÚNICO

Uso:
- buscar por email (@unique)
- buscar por id
- login

Ejemplo:
prisma.user.findUnique({ where: { email } })

🧠 “Dame uno exacto”

⚠️ Solo funciona con campos @unique

---

### 📌 findFirst
Busca el primer registro que coincida

Uso:
- cuando el campo NO es unique
- buscar por nombre, estado, etc.

Ejemplo:
prisma.role.findFirst({ where: { name: "customer" } })

🧠 “Dame el primero que coincida”

---

## ✍️ CREATE (crear datos)

### 📌 create
Crea un solo registro

Uso:
- registrar usuarios
- crear productos
- crear roles

Ejemplo:
prisma.user.create({ data: {...} })

🧠 “Crear un registro nuevo”

---

### 📌 createMany
Crea varios registros a la vez

Uso:
- insertar seed de datos
- cargar datos iniciales

Ejemplo:
prisma.user.createMany({ data: [...] })

🧠 “Crear muchos registros”

---

## ✏️ UPDATE (actualizar datos)

### 📌 update
Actualiza UN registro

Uso:
- cambiar nombre
- actualizar contraseña
- editar usuario

Ejemplo:
prisma.user.update({
  where: { id },
  data: { name: "nuevo" }
})

🧠 “Actualizar uno específico”

---

### 📌 updateMany
Actualiza varios registros

Uso:
- cambiar estado masivo
- activar/desactivar usuarios

Ejemplo:
prisma.user.updateMany({
  where: { status: true },
  data: { status: false }
})

🧠 “Actualizar muchos”

---

## ❌ DELETE (eliminar datos)

### 📌 delete
Elimina UN registro

Uso:
- borrar usuario
- eliminar producto

Ejemplo:
prisma.user.delete({ where: { id } })

🧠 “Eliminar uno”

---

### 📌 deleteMany
Elimina varios registros

Uso:
- borrar todo por condición
- limpiar datos

Ejemplo:
prisma.user.deleteMany({ where: { status: false } })

🧠 “Eliminar muchos”

---

## 🔗 RELACIONES (muy importante)

### 📌 include
Trae relaciones completas

Ejemplo:
prisma.user.findMany({
  include: { role: true }
})

🧠 “Trae datos relacionados”

---

### 📌 select
Selecciona campos específicos

Ejemplo:
prisma.user.findMany({
  select: { name: true, email: true }
})

🧠 “Trae solo lo que necesito”

---

### 📌 connect
Relaciona con un registro existente

Ejemplo:
role: {
  connect: { id: 1 }
}

🧠 “Conecta con algo que ya existe”

---

### 📌 disconnect
Desconecta una relación

🧠 “Quita la relación”

---

## 🧠 RESUMEN RÁPIDO

READ:
- findMany → todos
- findUnique → uno exacto
- findFirst → primer coincidencia

CREATE:
- create → uno
- createMany → muchos

UPDATE:
- update → uno
- updateMany → muchos

DELETE:
- delete → uno
- deleteMany → muchos

RELACIONES:
- include → traer relaciones
- select → filtrar campos
- connect → unir registros
- disconnect → separar

---

## 💡 REGLA SIMPLE

🧠 “Unique → findUnique  
No unique → findFirst  
Muchos → findMany  
Relaciones → include / connect”