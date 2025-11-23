import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePostsTables1699900002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create posts table
    await queryRunner.createTable(
      new Table({
        name: 'posts',
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
            name: 'createdBy',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            default: "'text'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
          },
          {
            name: 'mediaUrls',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'mediaMetadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'scheduledAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'publishedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'aiGeneratedData',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'aiModel',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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

    // Create post_platforms table
    await queryRunner.createTable(
      new Table({
        name: 'post_platforms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'postId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'socialAccountId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'platformPostId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'platformPostUrl',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'customContent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'platformSettings',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'retryCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'publishedAt',
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

    // Add foreign keys
    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_platforms',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_platforms',
      new TableForeignKey({
        columnNames: ['socialAccountId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'social_accounts',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes for better performance
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_scheduled_at',
        columnNames: ['scheduledAt'],
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_created_at',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'post_platforms',
      new TableIndex({
        name: 'IDX_post_platforms_post_id',
        columnNames: ['postId'],
      }),
    );

    await queryRunner.createIndex(
      'post_platforms',
      new TableIndex({
        name: 'IDX_post_platforms_social_account',
        columnNames: ['socialAccountId'],
      }),
    );

    await queryRunner.createIndex(
      'post_platforms',
      new TableIndex({
        name: 'IDX_post_platforms_status',
        columnNames: ['status'],
      }),
    );

    // Enable RLS on posts table
    await queryRunner.query(`ALTER TABLE posts ENABLE ROW LEVEL SECURITY;`);

    // Create RLS policy for posts (tenant isolation)
    await queryRunner.query(`
      CREATE POLICY posts_tenant_isolation ON posts
      USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policy
    await queryRunner.query(`DROP POLICY IF EXISTS posts_tenant_isolation ON posts;`);

    // Drop foreign keys
    const postsTable = await queryRunner.getTable('posts');
    const postPlatformsTable = await queryRunner.getTable('post_platforms');

    if (postsTable) {
      const postsForeignKeys = postsTable.foreignKeys;
      for (const fk of postsForeignKeys) {
        await queryRunner.dropForeignKey('posts', fk);
      }
    }

    if (postPlatformsTable) {
      const platformsForeignKeys = postPlatformsTable.foreignKeys;
      for (const fk of platformsForeignKeys) {
        await queryRunner.dropForeignKey('post_platforms', fk);
      }
    }

    // Drop tables
    await queryRunner.dropTable('post_platforms', true);
    await queryRunner.dropTable('posts', true);
  }
}
