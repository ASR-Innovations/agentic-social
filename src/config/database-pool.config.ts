/**
 * Database Connection Pooling Configuration
 * 
 * Implements connection pooling for PostgreSQL to optimize database connections
 * and improve performance under high load.
 * 
 * Requirements: 31.2, 31.3
 */

import { Pool, PoolConfig } from 'pg';

/**
 * Connection pool configuration based on environment and load requirements
 */
export interface DatabasePoolConfig extends PoolConfig {
  // Connection limits
  min?: number;
  max?: number;
  
  // Timeout settings
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  
  // Statement timeout
  statement_timeout?: number;
  
  // Query timeout
  query_timeout?: number;
  
  // Application name for monitoring
  application_name?: string;
}

/**
 * Get database pool configuration based on environment
 */
export function getDatabasePoolConfig(): DatabasePoolConfig {
  const env = process.env.NODE_ENV || 'development';
  
  const baseConfig: DatabasePoolConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'social_media_platform',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    
    // SSL configuration for production
    ssl: env === 'production' ? {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_SSL_CA,
    } : false,
    
    // Application name for monitoring
    application_name: `social-media-platform-${env}`,
  };
  
  // Environment-specific configurations
  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        // Production: Higher connection limits for scalability
        min: 10,
        max: 100,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        statement_timeout: 30000, // 30 seconds
        query_timeout: 30000,
      };
      
    case 'staging':
      return {
        ...baseConfig,
        // Staging: Moderate connection limits
        min: 5,
        max: 50,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        statement_timeout: 30000,
        query_timeout: 30000,
      };
      
    case 'test':
      return {
        ...baseConfig,
        // Test: Minimal connections
        min: 1,
        max: 5,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 10000,
        statement_timeout: 10000,
        query_timeout: 10000,
      };
      
    default: // development
      return {
        ...baseConfig,
        // Development: Moderate settings
        min: 2,
        max: 20,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        statement_timeout: 60000, // 60 seconds for debugging
        query_timeout: 60000,
      };
  }
}

/**
 * Create and configure a connection pool
 */
export function createDatabasePool(): Pool {
  const config = getDatabasePoolConfig();
  const pool = new Pool(config);
  
  // Event handlers for monitoring
  pool.on('connect', (client) => {
    console.log('Database client connected');
    
    // Set session-level parameters
    client.query(`SET statement_timeout = ${config.statement_timeout || 30000}`);
    client.query(`SET lock_timeout = 10000`); // 10 seconds
    client.query(`SET idle_in_transaction_session_timeout = 60000`); // 60 seconds
  });
  
  pool.on('acquire', (client) => {
    console.log('Database client acquired from pool');
  });
  
  pool.on('remove', (client) => {
    console.log('Database client removed from pool');
  });
  
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err);
  });
  
  return pool;
}

/**
 * Prisma connection pool configuration
 * 
 * This configuration is used in the Prisma schema connection string
 */
export function getPrismaConnectionString(): string {
  const config = getDatabasePoolConfig();
  
  const baseUrl = process.env.DATABASE_URL || 
    `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
  
  // Add connection pool parameters to the connection string
  const poolParams = new URLSearchParams({
    connection_limit: config.max?.toString() || '20',
    pool_timeout: (config.connectionTimeoutMillis! / 1000).toString() || '5',
    // Prisma-specific parameters
    connect_timeout: '10',
    socket_timeout: '30',
    // Performance parameters
    statement_cache_size: '100',
    prepared_statements: 'true',
  });
  
  return `${baseUrl}?${poolParams.toString()}`;
}

/**
 * Connection pool health check
 */
export async function checkPoolHealth(pool: Pool): Promise<{
  healthy: boolean;
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}> {
  try {
    const client = await pool.connect();
    
    // Test query
    await client.query('SELECT 1');
    
    client.release();
    
    return {
      healthy: true,
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  } catch (error) {
    console.error('Pool health check failed:', error);
    return {
      healthy: false,
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  }
}

/**
 * Gracefully close the connection pool
 */
export async function closeDatabasePool(pool: Pool): Promise<void> {
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}

/**
 * Connection pool metrics for monitoring
 */
export interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingRequests: number;
  maxConnections: number;
  utilizationPercent: number;
}

/**
 * Get current pool metrics
 */
export function getPoolMetrics(pool: Pool): PoolMetrics {
  const totalConnections = pool.totalCount;
  const idleConnections = pool.idleCount;
  const waitingRequests = pool.waitingCount;
  const maxConnections = (pool as any).options.max || 20;
  const activeConnections = totalConnections - idleConnections;
  const utilizationPercent = (totalConnections / maxConnections) * 100;
  
  return {
    totalConnections,
    idleConnections,
    activeConnections,
    waitingRequests,
    maxConnections,
    utilizationPercent,
  };
}

/**
 * Monitor pool and log warnings if utilization is high
 */
export function monitorPool(pool: Pool, intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    const metrics = getPoolMetrics(pool);
    
    if (metrics.utilizationPercent > 80) {
      console.warn('Database pool utilization high:', metrics);
    }
    
    if (metrics.waitingRequests > 10) {
      console.warn('High number of waiting database requests:', metrics);
    }
    
    // Log metrics for monitoring systems
    console.log('Database pool metrics:', metrics);
  }, intervalMs);
}

/**
 * Read replica pool configuration for read-heavy workloads
 */
export function createReadReplicaPool(): Pool | null {
  const readReplicaUrl = process.env.DATABASE_READ_REPLICA_URL;
  
  if (!readReplicaUrl) {
    console.log('No read replica configured');
    return null;
  }
  
  const config = getDatabasePoolConfig();
  
  const replicaPool = new Pool({
    connectionString: readReplicaUrl,
    min: config.min,
    max: config.max,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    idleTimeoutMillis: config.idleTimeoutMillis,
    application_name: `${config.application_name}-read-replica`,
  });
  
  console.log('Read replica pool created');
  
  return replicaPool;
}

export default {
  getDatabasePoolConfig,
  createDatabasePool,
  getPrismaConnectionString,
  checkPoolHealth,
  closeDatabasePool,
  getPoolMetrics,
  monitorPool,
  createReadReplicaPool,
};
