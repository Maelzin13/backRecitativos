/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function alterUserRoutes(app: FastifyInstance) {
  
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
