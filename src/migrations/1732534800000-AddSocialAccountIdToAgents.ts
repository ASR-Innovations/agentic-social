import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddSocialAccountIdToAgents1732534800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add socialAccountId column
    await queryRunner.addColumn(
      'agent_configs',
      new TableColumn({
        name: 'socialAccountId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add index on socialAccountId
    await queryRunner.createIndex(
      'agent_configs',
      new TableIndex({
        name: 'IDX_agent_configs_socialAccountId',
        columnNames: ['socialAccountId'],
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'agent_configs',
      new TableForeignKey({
        columnNames: ['socialAccountId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'social_accounts',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('agent_configs');
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('socialAccountId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('agent_configs', foreignKey);
    }

    // Drop index
    await queryRunner.dropIndex('agent_configs', 'IDX_agent_configs_socialAccountId');

    // Drop column
    await queryRunner.dropColumn('agent_configs', 'socialAccountId');
  }
}
