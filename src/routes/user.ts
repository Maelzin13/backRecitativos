/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface LoginRequestBody {
  username: string;
  password_: string;
}

interface RequestParams {
  id: string;
  userId: number;
}

export async function userRoutes(app: FastifyInstance) {
  const createUserSchema = z.object({
    username: z.string(),
    password_: z.string().min(6),
  })
  
  app.post('/users', async (request, reply) => {
    try {
      const userData = createUserSchema.parse(request.body)
      const existingUser = await prisma.usuarios.findUnique({
        where: { username: userData.username },
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
  
  app.post('/login', async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
    try {
      const { username, password_ } = request.body;
  
      if (!username || !password_) {
        return reply.status(400).send({ status: 'error', message: 'Usuario e senha são obrigatórios.' });
      }
  
      const user = await prisma.usuarios.findUnique({
        where: { username },
      });
  
      if (!user) {
        return reply.status(404).send({ status: 'error', message: 'Credenciais inválidas.' });
      }
  
      const userPassword = user.password_ ?? '';
      const passwordMatch = await bcrypt.compare(password_, userPassword);
  
      if (!passwordMatch) {
        return reply.status(401).send({ status: 'error', message: 'Credenciais inválidas.' });
      }
      
      const userDataWithoutPassword = {
        user_id: user.user_id,
        username: user.username
      };
      return reply.send({ status: 'success', message: 'Login bem-sucedido.', data: userDataWithoutPassword });
    } catch (error) {
      return reply.status(500).send({ status: 'error', message: 'Erro ao efetuar o login.' });
    }
  });

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

  app.put('/users/:id', async (request: FastifyRequest<{ Params: RequestParams; Body: { cargo_id?: number; localidade_id?: number } }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id);
      const { cargo_id, localidade_id } = request.body;
  
      // Verifique se o usuário existe
      const existingUser = await prisma.usuarios.findUnique({
        where: { user_id: userId },
      });
  
      if (!existingUser) {
        return reply.status(404).send({ status: 'error', message: 'Usuário não encontrado.' });
      }
  
      // Atualize o cargo do usuário, se fornecido
      if (cargo_id !== undefined) {
        await prisma.usuarios.update({
          where: { user_id: userId },
          data: { cargo_id },
        });
      }
  
      // Atualize a localidade do usuário, se fornecida
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
