import path from 'path';
import { promises as fs } from 'fs';
import { getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';
import uploadConfig from '../config/upload';

interface RequestDTO {
  file: Express.Multer.File;
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
interface newTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
}

class ImportTransactionsService {
  private async removeFile(pathFile: string): Promise<void> {
    const checkFileExists = await fs.stat(pathFile);

    if (checkFileExists) await fs.unlink(pathFile);
  }

  public async execute({ file }: RequestDTO): Promise<Transaction[]> {
    if (!file) throw new AppError('CSV file not send');

    const csvPath = path.join(uploadConfig.csv.directory, file.filename);

    const csvExtension = path.extname(file.originalname);

    if (csvExtension !== '.csv') {
      this.removeFile(csvPath);

      throw new AppError('File extension invalid');
    }

    const csvFile = await fs.readFile(csvPath);

    const csvInArray = csvFile.toString().slice(29).trim().split('\n');

    const transactions = csvInArray.map(stringTransaction => {
      const [title, type, value, category] = stringTransaction.split(', ');

      if (type !== 'income' && type !== 'outcome') {
        this.removeFile(csvPath);

        throw new AppError('The file has fields with an invalid type');
      }

      return {
        title,
        type: type as 'income' | 'outcome',
        value: Number(value),
        category,
      };
    });

    const categories = transactions
      .map(transaction => transaction.category)
      .filter((category, index, array) => index === array.indexOf(category));

    const categoriesRepository = getRepository(Category);

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) },
      select: ['title', 'id'],
    });

    const existentCategoriesTitles = existentCategories.map(
      category => category.title,
    );

    const nonExistentCategories = categories.filter(
      category => !existentCategoriesTitles.includes(category),
    );

    const createNewCategories = categoriesRepository.create(
      nonExistentCategories.map(category => ({
        title: category,
      })),
    );

    const newCategories = await categoriesRepository.save(createNewCategories);

    const dataCategories = [...existentCategories, ...newCategories];

    const transactionsRepository = getRepository(Transaction);

    const newTransactions: newTransaction[] = [];

    transactions.forEach(transaction => {
      const findCorrectCategory = dataCategories.find(
        category => category.title === transaction.category,
      );

      if (findCorrectCategory) {
        newTransactions.push({
          title: transaction.title,
          value: transaction.value,
          type: transaction.type,
          category_id: findCorrectCategory.id,
        });
      }
    });

    const createTransactions = transactionsRepository.create(newTransactions);

    const dataTransactions = await transactionsRepository.save(
      createTransactions,
    );

    await this.removeFile(csvPath);

    return dataTransactions;
  }
}

export default ImportTransactionsService;
