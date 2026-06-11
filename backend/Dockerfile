FROM node:20

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar TODO el proyecto correctamente
RUN npm install

# FORZAR versiones correctas de Prisma (IMPORTANTE)
RUN npm install prisma@5.22.0 @prisma/client@5.22.0

# Instalar nodemon (solo dev)
RUN npm install -g nodemon

# Copiar código
COPY . .

# Generar Prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]