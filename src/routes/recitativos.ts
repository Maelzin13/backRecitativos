/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import { create } from './recitativos/create';
import { read } from './recitativos/read';
import { update } from './recitativos/update';
import { deleteRecitativo } from './recitativos/delet';
import { alterPasswrod } from './user/alterPassword';

export async function recitativosRoutes(app: FastifyInstance) {
  create(app);
  read(app);
  update(app);
  deleteRecitativo(app);
  alterPasswrod(app);
}
