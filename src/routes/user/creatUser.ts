/* eslint-disable prettier/prettier */
import { FastifyInstance, } from 'fastify'
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs'
import { withAccelerate } from '@prisma/extension-accelerate';
const prisma = new PrismaClient().$extends(withAccelerate());

const creatUser = (app: FastifyInstance) => {
  const createUserSchema = z.object({
    username: z.string(),
    password_: z.string().min(6),
  })
  app.post('/users', async (request, reply) => {
    try {
      const userData = createUserSchema.parse(request.body)
      const existingUser = await prisma.usuarios.findUnique({
        where: { username: userData.username },
        cacheStrategy: { ttl: 60 },
      })
  
      if (existingUser) {
        return reply.status(400).send({ status: 'error', message: 'Este Usuario já está em uso.' });
      }
    
      const hashedPassword = await bcrypt.hash(userData.password_, 10);
      await prisma.usuarios.create({
        data: {
          username: userData.username,
          password_: hashedPassword,
        },
      })
  
      return reply.send({ status: 'success', message: 'Usuario criado com sucesso.' });
    } catch (error) {
      return reply.status(500).send({ status: 'error', message: 'Erro ao criar usuário.' });
    }
  });
}

export { creatUser }
