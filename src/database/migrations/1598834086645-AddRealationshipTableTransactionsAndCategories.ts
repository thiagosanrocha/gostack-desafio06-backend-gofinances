import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AddRealationshipTableTransactionsAndCategories1598834086645
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'RealationshipTableTransactionsAndCategories',
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'transactions',
      'RealationshipTableTransactionsAndCategories',
    );
  }
}
