import { validate, EnvironmentVariables } from './env.validation';

describe('Environment Validation', () => {
  const validConfig = {
    NODE_ENV: 'development',
    PORT: 3001,
    FRONTEND_URL: 'http://localhost:3000',
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_USERNAME: 'postgres',
    DB_PASSWORD: 'password',
    DB_NAME: 'testdb',
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/testdb',
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_DB: 0,
    MONGODB_URI: 'mongodb://localhost:27017/testdb',
    JWT_SECRET: 'test-secret-key',
    JWT_EXPIRES_IN: '24h',
  };

  describe('validate', () => {
    it('should validate correct configuration', () => {
      const result = validate(validConfig);

      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3001);
      expect(result.DB_HOST).toBe('localhost');
    });

    it('should throw error for missing required fields', () => {
      const invalidConfig = {
        NODE_ENV: 'development',
        PORT: 3001,
        // Missing DATABASE_URL and other required fields
      };

      expect(() => validate(invalidConfig)).toThrow('Environment validation failed');
    });

    it('should throw error for invalid NODE_ENV', () => {
      const invalidConfig = {
        ...validConfig,
        NODE_ENV: 'invalid',
      };

      expect(() => validate(invalidConfig)).toThrow('Environment validation failed');
      expect(() => validate(invalidConfig)).toThrow('NODE_ENV');
    });

    it('should throw error for invalid PORT', () => {
      const invalidConfig = {
        ...validConfig,
        PORT: 99999, // Out of valid range
      };

      expect(() => validate(invalidConfig)).toThrow('Environment validation failed');
      expect(() => validate(invalidConfig)).toThrow('PORT');
    });

    it('should throw error for invalid URL format', () => {
      const invalidConfig = {
        ...validConfig,
        FRONTEND_URL: 'not-a-url',
      };

      expect(() => validate(invalidConfig)).toThrow('Environment validation failed');
      expect(() => validate(invalidConfig)).toThrow('FRONTEND_URL');
    });

    it('should accept optional fields', () => {
      const configWithOptionals = {
        ...validConfig,
        OPENAI_API_KEY: 'sk-test-key',
        ANTHROPIC_API_KEY: 'ant-test-key',
        AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
        AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        AWS_REGION: 'us-east-1',
        AWS_S3_BUCKET_NAME: 'my-bucket',
      };

      const result = validate(configWithOptionals);

      expect(result.OPENAI_API_KEY).toBe('sk-test-key');
      expect(result.ANTHROPIC_API_KEY).toBe('ant-test-key');
      expect(result.AWS_REGION).toBe('us-east-1');
    });

    it('should use default values for optional fields', () => {
      const result = validate(validConfig);

      expect(result.JWT_EXPIRES_IN).toBe('24h');
      expect(result.REDIS_DB).toBe(0);
    });

    it('should convert string numbers to numbers', () => {
      const configWithStrings = {
        ...validConfig,
        PORT: '3001',
        DB_PORT: '5432',
        REDIS_PORT: '6379',
      };

      const result = validate(configWithStrings);

      expect(typeof result.PORT).toBe('number');
      expect(result.PORT).toBe(3001);
      expect(typeof result.DB_PORT).toBe('number');
      expect(result.DB_PORT).toBe(5432);
    });

    it('should validate REDIS_DB range', () => {
      const invalidConfig = {
        ...validConfig,
        REDIS_DB: 20, // Out of valid range (0-15)
      };

      expect(() => validate(invalidConfig)).toThrow('Environment validation failed');
      expect(() => validate(invalidConfig)).toThrow('REDIS_DB');
    });

    it('should accept production environment', () => {
      const prodConfig = {
        ...validConfig,
        NODE_ENV: 'production',
      };

      const result = validate(prodConfig);

      expect(result.NODE_ENV).toBe('production');
    });

    it('should accept test environment', () => {
      const testConfig = {
        ...validConfig,
        NODE_ENV: 'test',
      };

      const result = validate(testConfig);

      expect(result.NODE_ENV).toBe('test');
    });

    it('should accept staging environment', () => {
      const stagingConfig = {
        ...validConfig,
        NODE_ENV: 'staging',
      };

      const result = validate(stagingConfig);

      expect(result.NODE_ENV).toBe('staging');
    });
  });
});
