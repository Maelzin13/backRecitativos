/* eslint-disable prettier/prettier */
import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import multipart from '@fastify/multipart'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'node:path'

const app = fastify()


// HTTP Method : GET, POST,  PUT, PATCH, DELET, HEAD, OPTION,

app.register(multipart)

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',

})

app.register(cors, {
  origin: true
})

app.register(jwt, {
  secret: 'spacetime',
})


app.register(memoriesRoutes)
app.register(uploadRoutes)
app.register(authRoutes)


app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🎈 HTTP serve running on http://localhost:3333')
  })
