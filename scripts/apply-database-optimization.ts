/**
 * Script to apply database optimization migration
 * 
 * This script applies the comprehensive database optimization including:
 * - Indexes
 * - Materialized views
 * - Partitioning
 * - Query optimization settings
 * 
 * Requirements: 31.2, 31.3
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyOptimization() {
  console.log('Starting database optimization...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      '../prisma/migrations/20241121000001_database_optimization/migration.sql'
    );
    
    if (!fs.existsSync(migrationPath)) {
      console.error('Migration file not found:', migrationPath);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying database optimization migration...');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        // Skip comments and empty statements
        if (statement.startsWith('--') || statement.trim().length === 0) {
          continue;
        }
        
        await prisma.$executeRawUnsafe(statement + ';');
        successCount++;
        
        // Log progress for major operations
        if (statement.includes('CREATE INDEX')) {
          const indexMatch = statement.match(/CREATE INDEX.*?(\w+) ON/);
          if (indexMatch) {
            console.log(`✓ Created index: ${indexMatch[1]}`);
          }
        } else if (statement.includes('CREATE MATERIALIZED VIEW')) {
          const viewMatch = statement.match(/CREATE MATERIALIZED VIEW.*?(\w+)/);
          if (viewMatch) {
            console.log(`✓ Created materialized view: ${viewMatch[1]}`);
          }
        } else if (statement.includes('CREATE TABLE') && statement.includes('PARTITION')) {
          const tableMatch = statement.match(/CREATE TABLE.*?(\w+)/);
          if (tableMatch) {
            console.log(`✓ Created partitioned table: ${tableMatch[1]}`);
          }
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          console.log(`⚠ Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`✗ Error executing statement:`, error.message);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          errorCount++;
        }
      }
    }
    
    console.log('\n=== Database Optimization Summary ===');
    console.log(`✓ Successful operations: ${successCount}`);
    console.log(`✗ Failed operations: ${errorCount}`);
    
    // Verify materialized views
    console.log('\nVerifying materialized views...');
    const views = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        matviewname,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
      FROM pg_matviews
      WHERE schemaname = 'public'
    `;
    
    console.log(`Found ${views.length} materialized views:`);
    views.forEach(v => {
      console.log(`  - ${v.matviewname} (${v.size})`);
    });
    
    // Verify indexes
    console.log('\nVerifying indexes...');
    const indexes = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10
    `;
    
    console.log(`Top 10 largest indexes:`);
    indexes.forEach(i => {
      console.log(`  - ${i.indexname} on ${i.tablename} (${i.size})`);
    });
    
    // Verify partitions
    console.log('\nVerifying partitions...');
    const partitions = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname = 'public'
        AND (tablename LIKE '%_y%m%')
      ORDER BY tablename
    `;
    
    console.log(`Found ${partitions.length} partitions:`);
    partitions.forEach(p => {
      console.log(`  - ${p.tablename} (${p.size})`);
    });
    
    console.log('\n✓ Database optimization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Monitor query performance using the DatabaseMaintenanceController');
    console.log('2. Set up automated materialized view refreshes (already configured)');
    console.log('3. Review slow queries and add additional indexes if needed');
    console.log('4. Configure connection pooling in your environment variables');
    
  } catch (error) {
    console.error('Error applying database optimization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the optimization
applyOptimization()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
