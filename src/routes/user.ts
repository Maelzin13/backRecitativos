/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

interface LoginRequestBody {
  email: string
  password: string
}

export async function userRoutes(app: FastifyInstance) {

  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  // Rota para criar um novo usuário
  app.post('/users', async (request) => {
    try {
      const userData = createUserSchema.parse(request.body)
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existingUser) {
        return { status: 'error', message: 'Este e-mail já está em uso.' }
      }
    
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const newUser = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
      })

      return { status: 'success', data: newUser }
    } catch (error) {
      return { status: 'error', message: 'Erro ao criar usuário.' }
    }
  })

  // Rota para efetuar o login do usuário
  app.post('/login',async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
      try {
        console.log('Received login request:', request.body);
        const { email, password } = request.body;
  
        // Verifica se o email ou a senha estão vazios
        if (!email || !password) {
          console.log('Empty email or password');
          return reply.status(400).send({ status: 'error', message: 'Email e senha são obrigatórios.' });
        }
  
        const user = await prisma.user.findUnique({
          where: { email },
        });
  
        if (!user) {
          console.log('User not found');
          return reply.status(404).send({ status: 'error', message: 'Credenciais inválidas.' });
        }
       
        const passwordMatch = await bcrypt.compare(password, user.password);
  
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
    },
  );
}
