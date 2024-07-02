/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';


const prisma = new PrismaClient().$extends(withAccelerate());
interface RequestParams {
  id: string;
  userId: number;
}
const listUser = (app: FastifyInstance) => {
  app.get('/users/:id', async (request: FastifyRequest<{ Params: RequestParams }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id);

      const users = await prisma.usuarios.findMany({
        where: {
          user_id: userId,
        },
        include: {
          cargo: true,
          localidade: true,
        },
        cacheStrategy: { ttl: 60 },
      });

      const formattedUsers = users.map(user => ({
        user_id: user.user_id,
        username: user.username,
        cargo: user.cargo ? user.cargo.cargo_type : null,
        localidade: user.localidade ? user.localidade.noma_local : null,
      }));

      return reply.send({ status: 'success', data: formattedUsers });
    } catch (error) {
      console.error('Erro ao buscar recitativos por ID do usuário:', error);
      return reply.status(500).send({ status: 'error', message: 'Erro ao listar usuários.' });
    }
  });

  app.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await prisma.usuarios.findMany({
        include: {
          cargo: true,
          localidade: true,
        },
        cacheStrategy: { ttl: 60 },
      });

      const formattedUsers = users.map(user => ({
        user_id: user.user_id,
        username: user.username,
        cargo: user.cargo ? user.cargo.cargo_type : null,
        localidade: user.localidade ? user.localidade.noma_local : null,
      }));

      return reply.send({ status: 'success', data: formattedUsers });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return reply.status(500).send({ status: 'error', message: 'Erro ao listar usuários.' });
    }
  });
}

export { listUser }
