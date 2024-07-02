/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate';
const prisma = new PrismaClient().$extends(withAccelerate());

interface RequestQuery {
  search?: string;
}

interface RequestParams {
  id: string;
  userId: number;
}

const read = (app: FastifyInstance) => {
  app.get('/recitativos', async (request: FastifyRequest<{ Querystring: RequestQuery }>, reply: FastifyReply) => {
    try {
      const search = request.query.search;
      const recitativos = await prisma.recitativos.findMany({
        where: {
          name: {
            contains: search || '',
          },
        },
        include: {
          auxiliares: true,
        },
      });
      return recitativos;
    } catch (error) {
      console.error('Erro ao buscar recitativos:', error);
      return { error: 'Erro Interno do Servidor' };
    }
  });

  app.get('/recitativos/:id', async (request: FastifyRequest<{ Params: RequestParams }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id);
      const auxiliar = await prisma.auxiliares.findFirst({
        where: {
          user_id: userId,
        },
        cacheStrategy: { ttl: 60 },
        include: {
          recitativos: {
            include: {              
              auxiliares: {
                select: {
                  auxiliar_name: true,
                },
              },
            },
          },
        },
      });
      if (!auxiliar) {
        return reply.status(404).send({ error: 'Auxiliar não encontrado para o usuário especificado' });
      }

      return auxiliar.recitativos; 
    } catch (error) {
      console.error('Erro ao buscar recitativos por ID do usuário:', error);
      return reply.status(500).send({ error: 'Erro Interno do Servidor' });
    }
  });  
}

export { read }
