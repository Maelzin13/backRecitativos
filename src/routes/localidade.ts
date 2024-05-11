/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function localidadeRoutes(app: FastifyInstance) {
  app.get('/localidade', async (_: FastifyRequest, reply: FastifyReply) => {
    try {
      const localidades = await prisma.localidade.findMany();
      return localidades;
    } catch (error) {
      console.error('Erro ao buscar localidades:', error);
      return { error: 'Erro Interno do Servidor' };
    }
  });
}
