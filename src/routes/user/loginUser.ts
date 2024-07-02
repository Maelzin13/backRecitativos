/* eslint-disable prettier/prettier */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());
interface LoginRequestBody {
  username: string
  password_: string
}
const login = (app: FastifyInstance) => {
  app.post(
    '/login',
    async (
      request: FastifyRequest<{ Body: LoginRequestBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { username, password_ } = request.body

        if (!username || !password_) {
          return reply.status(400).send({
            status: 'error',
            message: 'Usuario e senha são obrigatórios.',
          })
        }

        const user = await prisma.usuarios.findUnique({
          where: { username },
          cacheStrategy: { ttl: 60 },
        })

        if (!user) {
          return reply
            .status(404)
            .send({ status: 'error', message: 'Credenciais inválidas.' })
        }

        const userPassword = user.password_ ?? ''
        const passwordMatch = await bcrypt.compare(password_, userPassword)

        if (!passwordMatch) {
          return reply
            .status(401)
            .send({ status: 'error', message: 'Credenciais inválidas.' })
        }

        const userDataWithoutPassword = {
          user_id: user.user_id,
          username: user.username,
        }
        return reply.send({
          status: 'success',
          message: 'Login bem-sucedido.',
          data: userDataWithoutPassword,
        })
      } catch (error) {
        return reply
          .status(500)
          .send({ status: 'error', message: 'Erro ao efetuar o login.' })
      }
    },
  )
}

export { login }
