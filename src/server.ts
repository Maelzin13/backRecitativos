/* eslint-disable prettier/prettier */
import 'dotenv/config'
import fastifyCors from "@fastify/cors";
import fastify from 'fastify'

import { alterUserRoutes } from './routes/alter'
import { userRoutes } from './routes/user'
import { recitativosRoutes } from './routes/recitativos';
import { localidadeRoutes } from './routes/localidade';
import { cargoRoutes } from './routes/cargo';


const app = fastify();
app.register(fastifyCors, {
    origin: '*',
})
// HTTP Method : GET, POST,  PUT, PATCH, DELET, HEAD, OPTION,

app.register(userRoutes)
app.register(alterUserRoutes)
app.register(recitativosRoutes)
app.register(localidadeRoutes)
app.register(cargoRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🚀 HTTP server running on port http://localhost:3333')
  })
