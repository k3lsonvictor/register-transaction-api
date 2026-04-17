import { RequestHandler } from 'express';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  TransactionInput,
  updateTransaction,
} from '../repositories/transactionsRepository';

export const list: RequestHandler = (req, res) => {
  const data = listTransactions();
  res.json(data);
};

export const create: RequestHandler<{}, any, TransactionInput> = (req, res) => {
  const newTransaction = createTransaction(req.body);
  res.status(201).json(newTransaction);
};

export const patch: RequestHandler<{ id: string }, any, Partial<TransactionInput>> = (
  req,
  res
) => {
  const id = Number(req.params.id);
  const updated = updateTransaction(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Transação não encontrada' });
    return;
  }
  res.json(updated);
};

export const remove: RequestHandler<{ id: string }> = (req, res) => {
  const id = Number(req.params.id);
  const ok = deleteTransaction(id);
  if (!ok) {
    res.status(404).json({ error: 'Transação não encontrada' });
    return;
  }
  res.status(204).end();
};
