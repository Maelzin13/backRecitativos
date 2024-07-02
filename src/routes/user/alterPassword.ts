/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { withAccelerate } from '@prisma/extension-accelerate';
const prisma = new PrismaClient().$extends(withAccelerate());

const alterPasswrod = (app: FastifyInstance) => {
  const changePasswordSchema = z.object({
    userId: z.number(),
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  })
  app.put('/users/change-password', async (request) => {
    try {  
      const { userId, currentPassword, newPassword } = changePasswordSchema.parse(request.body)
      
      const user = await prisma.usuarios.findUnique({
        where: { user_id: userId },
        cacheStrategy: { ttl: 60 },
      })

      if (!user) {
        return { status: 'error', message: 'Usuário não encontrado.' }
      }

  
      const userPassword = user.password_ ?? '';
      const passwordMatch = await bcrypt.compare(currentPassword, userPassword)

      if (!passwordMatch) {
        return { status: 'error', message: 'Senha atual incorreta.' }
      }

      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)      
      await prisma.usuarios.update({
        where: { user_id: userId },
        data: { password_: hashedNewPassword },
      })

      return { status: 'success', message: 'Senha alterada com sucesso.' }
    } catch (error) {
      return { status: 'error', message: 'Erro ao alterar a senha.' }
    }
  })
}

export { alterPasswrod }
