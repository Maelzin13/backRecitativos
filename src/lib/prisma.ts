/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient({
  log: ['query'],
}).$extends(withAccelerate());
