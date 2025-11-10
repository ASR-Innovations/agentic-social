import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAnalyticsTable1699900004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'analytics_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'postId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'socialAccountId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'eventType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'platform',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'int',
            default: 0,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'recordedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add indexes for efficient querying
    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_tenant_type_recorded',
        columnNames: ['tenantId', 'eventType', 'recordedAt'],
      }),
    );

    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_post_recorded',
        columnNames: ['postId', 'recordedAt'],
      }),
    );

    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_social_account',
        columnNames: ['socialAccountId'],
      }),
    );

    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_platform',
        columnNames: ['platform'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('analytics_events', true);
  }
}
