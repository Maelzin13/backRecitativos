/* eslint-disable prettier/prettier */
import { FastifyInstance,  FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate';
const prisma = new PrismaClient().$extends(withAccelerate());

interface RequestParams {
  id: string;
  userId: number;
}

const deleteRecitativo = (app: FastifyInstance) => {
  app.delete('/recitativos/:id', async(request: FastifyRequest<{ Params: RequestParams }>, reply) => {
    try {
      const recitativoId = parseInt(request.params.id);
      await prisma.recitativos.delete({
        where: { id: recitativoId },
      });
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar recitativo:', error);
      return reply.status(500).send({ error: 'Erro Interno do Servidor' });
    }
  });
  
}

export { deleteRecitativo }
