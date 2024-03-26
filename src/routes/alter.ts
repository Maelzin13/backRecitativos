/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

export async function alterUserRoutes(app: FastifyInstance) {
  // Define o esquema de validação para os dados de alteração de senha
  const changePasswordSchema = z.object({
    userId: z.string(), // Identificador do usuário
    currentPassword: z.string(), // Senha atual
    newPassword: z.string(), // Nova senha
  })

  // Rota para alterar a senha do usuário
  app.put('/users/change-password', async (request) => {
    try {
      // Validação dos dados de alteração de senha
      const { userId, currentPassword, newPassword } = changePasswordSchema.parse(request.body)

      // Busca o usuário no banco de dados
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return { status: 'error', message: 'Usuário não encontrado.' }
      }

      // Verifica se a senha atual está correta
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
        return { status: 'error', message: 'Senha atual incorreta.' }
      }

      // Hash da nova senha antes de atualizar no banco de dados
      const hashedNewPassword = await bcrypt.hash(newPassword, 10) // 10 é o número de rounds para o salt

      // Atualiza a senha do usuário no banco de dados
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      })

      return { status: 'success', message: 'Senha alterada com sucesso.' }
    } catch (error) {
      return { status: 'error', message: 'Erro ao alterar a senha.' }
    }
  })
}
