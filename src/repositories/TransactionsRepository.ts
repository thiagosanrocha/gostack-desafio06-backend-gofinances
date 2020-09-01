import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import Balance from '../models/Balance';

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = new Balance({
      income: 0,
      outcome: 0,
      total: 0,
    });

    const balanceReduce = transactions.reduce((acumulator, transaction) => {
      const income =
        transaction.type === 'income'
          ? transaction.value + acumulator.income
          : acumulator.income;

      const outcome =
        transaction.type === 'outcome'
          ? transaction.value + acumulator.outcome
          : acumulator.outcome;

      const total = income - outcome;

      return {
        income,
        outcome,
        total,
      };
    }, balance);

    return balanceReduce;
  }
}

export default TransactionsRepository;
