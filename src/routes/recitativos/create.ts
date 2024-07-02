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
  user_id: number;
}

const create = (app: FastifyInstance) => {
  app.post('/recitativos', async (request: FastifyRequest<{ Body: CreateRecitativoRequest }>, reply: FastifyReply) => {
    try {      
      const { name, book, chapter, verse, data, auxiliar_name, user_id  } = request.body;

      const userExists = await prisma.usuarios.findUnique({
        where: { user_id },
        cacheStrategy: { ttl: 60 },
      });

      if (!userExists) {
        return reply.status(400).send({ error: 'Usuário não encontrado' });
      }
      let auxiliarRow = await prisma.auxiliares.findFirst({
        where: { auxiliar_name },
        cacheStrategy: { ttl: 60 },
      });
      
      if (!auxiliarRow) {
        auxiliarRow = await prisma.auxiliares.create({
          data: {
            auxiliar_name,
            user_id
          }
        });
      }

      const recitativo = await prisma.recitativos.create({
        data: {
            name,
            book,
            chapter,
            verse,
            data,
            auxiliar_id: auxiliarRow.auxiliar_id
        }
      });

      return reply.status(201).send({
        recitativoId: recitativo.id,
        auxiliarName: auxiliarRow.auxiliar_name,
        message: 'Recitativo criado com sucesso',
    });
    } catch (error) {
      console.error('Erro ao criar recitativo:', error);
      return reply.status(500).send({ error: 'Erro Interno do Servidor' });
    }
  });
  
}

export { create }
