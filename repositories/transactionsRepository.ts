import fs from 'fs';
import path from 'path';

export interface TransactionInput {
  title: string;
  amount: number;
  bank: string;
  date?: Date | string;
}

export interface Transaction extends Omit<TransactionInput, 'date'> {
  id: number;
  date: string;
}

const DB_FILE = path.resolve(process.cwd(), 'transactions.json');

function readDB(): Transaction[] {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw) as Transaction[];
}

function writeDB(data: Transaction[]): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function listTransactions(): Transaction[] {
  return readDB();
}

export function createTransaction(input: TransactionInput): Transaction {
  const data = readDB();
  const newTransaction: Transaction = {
    id: Date.now(),
    date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
    title: input.title,
    amount: input.amount,
    bank: input.bank,
  };
  data.push(newTransaction);
  writeDB(data);
  return newTransaction;
}

export function updateTransaction(
  id: number,
  patch: Partial<TransactionInput>
): Transaction | null {
  const data = readDB();
  const index = data.findIndex((t) => t.id === id);
  if (index === -1) return null;

  data[index] = { ...data[index], ...patch } as Transaction;
  writeDB(data);
  return data[index];
}

export function deleteTransaction(id: number): boolean {
  const data = readDB();
  const next = data.filter((t) => t.id !== id);
  if (next.length === data.length) return false;
  writeDB(next);
  return true;
}
