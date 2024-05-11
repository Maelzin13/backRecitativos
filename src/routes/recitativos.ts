/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RequestQuery {
  search?: string;
}

interface RequestParams {
  id: string;
}

interface CreateRecitativoRequest {
  name: string;
  book: string;
  chapter: number;
  verse: string;
  data: string;
  auxiliar_name: string;
}

export async function recitativosRoutes(app: FastifyInstance) {
  // Rota para criar um novo recitativo
  app.post('/recitativos', async (request: FastifyRequest<{ Body: CreateRecitativoRequest }>, reply: FastifyReply) => {
    try {      
      const { name, book, chapter, verse, data, auxiliar_name } = request.body;
  
      // Verifica se o auxiliar existe, caso contrário, cria um novo
      let auxiliarRow = await prisma.auxiliares.findFirst({
        where: { auxiliar_name },
      });
      
      if (!auxiliarRow) {
        auxiliarRow = await prisma.auxiliares.create({
          data: {
            auxiliar_name
          }
        });
      }

      // Cria o recitativo
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
      console.log(recitativo)

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

  // Rota para listar recitativos
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

  // Rota para atualizar um recitativo
  app.put('/recitativos/:id', async (request: FastifyRequest<{ Params: RequestParams, Body: CreateRecitativoRequest }>, reply: FastifyReply) => {
    try {
      const recitativoId = parseInt(request.params.id);
      const { name, book, chapter, verse, data, auxiliar_name } = request.body;
      
      // Verifica se o recitativo existe
      const recitativoExistente = await prisma.recitativos.findUnique({
        where: { id: recitativoId },
      });
      if (!recitativoExistente) {
        return reply.status(404).send({ error: 'Recitativo não encontrado' });
      }

      // Verifica se o auxiliar existe, caso contrário, cria um novo
      let auxiliarRow = await prisma.auxiliares.findFirst({
        where: { auxiliar_name },
      });
      
      if (!auxiliarRow) {
        auxiliarRow = await prisma.auxiliares.create({
          data: {
            auxiliar_name
          }
        });
      }

      // Atualiza o recitativo
      await prisma.recitativos.update({
        where: { id: recitativoId },
        data: {
          name,
          book,
          chapter,
          verse,
          data,
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

  // Rota para deletar um recitativo
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
