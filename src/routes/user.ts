/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface LoginRequestBody {
  username: string
  password_: string
}

export async function userRoutes(app: FastifyInstance) {

  const createUserSchema = z.object({
    username: z.string(),
    password_: z.string().min(6),
  })

  // Rota para criar um novo usuário
  app.post('/users', async (request) => {
    try {
      const userData = createUserSchema.parse(request.body)
      const existingUser = await prisma.usuarios.findUnique({
        where: { username: userData.username },
      })

      if (existingUser) {
        return { status: 'error', message: 'Este Usuario já está em uso.' }
      }
    
      const hashedPassword = await bcrypt.hash(userData.password_, 10)
      const newUser = await prisma.usuarios.create({
        data: {
          username: userData.username,
          password_: hashedPassword,
        },
      })

      return { status: 'success', data: newUser }
    } catch (error) {
      return { status: 'error', message: 'Erro ao criar usuário.' }
    }
  })

  // Rota para efetuar o login do usuário
  app.post('/login', async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
    try {
      console.log('Received login request:', request.body);
      const { username, password_ } = request.body;
  
      // Verifica se o email ou a senha estão vazios
      if (!username || !password_) {
        console.log('Empty user or password');
        return reply.status(400).send({ status: 'error', message: 'Usuario e senha são obrigatórios.' });
      }
  
      const user = await prisma.usuarios.findUnique({
        where: { username },
      });
  
      if (!user) {
        console.log('User not found');
        return reply.status(404).send({ status: 'error', message: 'Credenciais inválidas.' });
      }

      const userPassword = user.password_ ?? '';
      const passwordMatch = await bcrypt.compare(password_, userPassword);
  
      if (!passwordMatch) {
        console.log('Password does not match');
        return reply.status(401).send({ status: 'error', message: 'Credenciais inválidas.' });
      }
  
      console.log('Login successful');
      return reply.send({ status: 'success', message: 'Login bem-sucedido.', data: user });
    } catch (error) {
      console.error('Error processing login:', error);
      return reply.status(500).send({ status: 'error', message: 'Erro ao efetuar o login.' });
    }
  });
}
