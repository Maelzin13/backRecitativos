/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
const prisma = new PrismaClient().$extends(withAccelerate());

interface RequestParams {
  id: string;
  userId: number;
}

const updateUser = (app: FastifyInstance) => {
  app.put('/users/:id', async (request: FastifyRequest<{ Params: RequestParams; Body: { cargo_id?: number; localidade_id?: number } }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id);
      const { cargo_id, localidade_id } = request.body;
      const existingUser = await prisma.usuarios.findUnique({
        where: { user_id: userId },
        cacheStrategy: { ttl: 60 },
      });
  
      if (!existingUser) {
        return reply.status(404).send({ status: 'error', message: 'Usuário não encontrado.' });
      }

      if (cargo_id !== undefined) {
        await prisma.usuarios.update({
          where: { user_id: userId },
          data: { cargo_id },
        });
      }

      if (localidade_id !== undefined) {
        await prisma.usuarios.update({
          where: { user_id: userId },
          data: { localidade_id },
        });
      }
  
      return reply.send({ status: 'success', message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return reply.status(500).send({ status: 'error', message: 'Erro ao atualizar usuário.' });
    }
  });
  
}

export { updateUser }