import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('integer')
  value: number;

  @Column('uuid')
  category_id: string;

  @ManyToOne(() => Category, category => category.transaction, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('timestamp')
  created_at: Date;

  @Column('timestamp')
  updated_at: Date;
}

export default Transaction;
