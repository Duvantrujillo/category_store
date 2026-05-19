const express = require('express')
const app = express()
const cors = require("cors");
const userRouter = require('./routes/users.routes.js')
const formRouter = require('./routes/form.routes.js')
require('dotenv').config();
const Jwt = require('jsonwebtoken')
app.use(cors());
app.use(express.json());

//ruta de usuarios
app.use('/user', userRouter);

//rutas de form information
app.use('/form',formRouter);

//comprobar si el servidor esta levandado
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo`);
});