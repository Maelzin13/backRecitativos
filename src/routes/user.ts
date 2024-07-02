/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify';
import { updateUser } from './user/updateUser';
import { listUser } from './user/listUser';
import { login } from './user/loginUser';
import { creatUser } from './user/creatUser';

export async function userRoutes(app: FastifyInstance) { 
  creatUser(app)
  login(app)
  listUser(app)
  updateUser(app)
}
