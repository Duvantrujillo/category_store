const express = require('express')
const app = express()
const cors = require("cors");


//rutas de los enpoints
const userRouter = require('./routes/users.routes.js')
const formRouter = require('./routes/form.routes.js')
const categoryRouter = require ('./routes/category.routes.js')
const attributeRouter = require('./routes/attribute.routes.js')
const attributeValuesRouter = require('./routes/attribute-values.routes.js')


require('dotenv').config();
const Jwt = require('jsonwebtoken')
app.use(cors());
app.use(express.json());

//ruta de usuarios
app.use('/user', userRouter);

//rutas de form information
app.use('/form',formRouter);
app.use('/category',categoryRouter);
app.use('/attribute',attributeRouter)
app.use('/attribute-values',attributeValuesRouter)






//comprobar si el servidor esta levandado
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo`);
});

