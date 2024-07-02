/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate';
const prisma = new PrismaClient().$extends(withAccelerate());

interface CreateRecitativoRequest {
  name: string;
  book: string;
  chapter: number;
  verse: string;
  data: string;
  auxiliar_name: string;
}

interface RequestParams {
  id: string;
  userId: number;
}

const update = (app: FastifyInstance) => {
  app.put('/recitativos/:id', async (request: FastifyRequest<{ Params: RequestParams, Body: CreateRecitativoRequest }>, reply: FastifyReply) => {
    try {
      const recitativoId = parseInt(request.params.id);
      const { userId } = request.params;
      const { name, book, chapter, verse, data, auxiliar_name } = request.body;
      const recitativoExistente = await prisma.recitativos.findUnique({
        where: { id: recitativoId },
        cacheStrategy: { ttl: 60 },
      });
      if (!recitativoExistente) {
        return reply.status(404).send({ error: 'Recitativo não encontrado' });
      }

      let auxiliarRow = await prisma.auxiliares.findFirst({
        where: { auxiliar_name, user_id: userId },
      });

      if (!auxiliarRow) {
        auxiliarRow = await prisma.auxiliares.create({
          data: {
            auxiliar_name,
            user_id: userId
          }
        });
      }

      await prisma.recitativos.update({
        where: { id: recitativoId },
        data: {
          name,
          book,
          chapter,
          verse,
          data: new Date(data).toISOString(),
          auxiliar_id: auxiliarRow.auxiliar_id
        }
      });

      return reply.status(200).send({
        message: 'Recitativo atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar recitativo:', error);
      return reply.status(500).send({ error: 'Erro Interno do Servidor' });
    }
  });
}

export { update }
