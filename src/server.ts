/* eslint-disable prettier/prettier */
import 'dotenv/config'
import fastifyCors from "@fastify/cors";
import fastify, { FastifyRegisterOptions } from 'fastify'
import { userRoutes } from './routes/user'
import { recitativosRoutes } from './routes/recitativos';
import { localidadeRoutes } from './routes/localidade';
import { cargoRoutes } from './routes/cargo';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

const app = fastify();

app.register(import('@fastify/swagger'));
app.register(import('@fastify/swagger-ui'), {
  routerPrefix: '/documentation',  
} as FastifyRegisterOptions<FastifySwaggerUiOptions>);

app.register(fastifyCors, {
  origin: '*',
})
app.register(userRoutes);
app.register(recitativosRoutes);
app.register(localidadeRoutes);
app.register(cargoRoutes);

app.listen({port: 3333, host: '0.0.0.0',}).then(() => {
  console.log('🚀 HTTP server running on port 3333')
})
