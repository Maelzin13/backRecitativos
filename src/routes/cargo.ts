/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function cargoRoutes(app: FastifyInstance) {
  app.get('/cargo', async (_: FastifyRequest, reply: FastifyReply) => {
    try {
      const cargos = await prisma.cargo.findMany();
      return cargos;
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      return { error: 'Erro Interno do Servidor' };
    }
  });
}
