import { Router } from 'express';
import * as transactionsController from '../controllers/transactionsController';

export const transactionsRoutes = Router();

transactionsRoutes.get('/transactions', transactionsController.list);
transactionsRoutes.post('/transactions', transactionsController.create);
transactionsRoutes.patch('/transactions/:id', transactionsController.patch);
transactionsRoutes.delete('/transactions/:id', transactionsController.remove);

