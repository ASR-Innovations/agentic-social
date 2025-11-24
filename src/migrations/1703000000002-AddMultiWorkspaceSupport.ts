import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddMultiWorkspaceSupport1703000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create workspace_templates table
    await queryRunner.createTable(
      new Table({
        name: 'workspace_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'config',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isPublic',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create client_portal_access table
    await queryRunner.createTable(
      new Table({
        name: 'client_portal_access',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'workspaceId',
            type: 'uuid',
          },
          {
            name: 'accessLevel',
            type: 'enum',
            enum: ['VIEW_ONLY', 'VIEW_AND_COMMENT', 'VIEW_AND_APPROVE'],
            default: "'VIEW_ONLY'",
          },
          {
            name: 'permissions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'inviteToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'inviteExpiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastAccessAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key for client_portal_access -> workspaces
    await queryRunner.createForeignKey(
      'client_portal_access',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workspaces',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_client_portal_access_workspace" ON "client_portal_access" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_client_portal_access_email" ON "client_portal_access" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_client_portal_access_token" ON "client_portal_access" ("inviteToken")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_workspace_templates_public" ON "workspace_templates" ("isPublic")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_workspace_templates_created_by" ON "workspace_templates" ("createdBy")`,
    );

    // Create unique constraint for email + workspace
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_client_portal_access_email_workspace" ON "client_portal_access" ("email", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_client_portal_access_email_workspace"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_workspace_templates_created_by"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_workspace_templates_public"`);
    await queryRunner.query(`DROP INDEX "IDX_client_portal_access_token"`);
    await queryRunner.query(`DROP INDEX "IDX_client_portal_access_email"`);
    await queryRunner.query(
      `DROP INDEX "IDX_client_portal_access_workspace"`,
    );

    // Drop foreign key
    const table = await queryRunner.getTable('client_portal_access');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('workspaceId') !== -1,
    );
    await queryRunner.dropForeignKey('client_portal_access', foreignKey);

    // Drop tables
    await queryRunner.dropTable('client_portal_access');
    await queryRunner.dropTable('workspace_templates');
  }
}
