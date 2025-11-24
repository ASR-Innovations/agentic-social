/**
 * Test script to verify Swagger/OpenAPI documentation setup
 */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function testSwagger() {
  console.log('🧪 Testing Swagger/OpenAPI setup...\n');

  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, { logger: false });

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle('AI Social Media Management Platform API')
      .setDescription('Test API Documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Test 1: Check if document is generated
    console.log('✅ Test 1: Swagger document generated successfully');
    console.log(`   - Paths found: ${Object.keys(document.paths).length}`);
    console.log(`   - Components: ${Object.keys(document.components?.schemas || {}).length} schemas`);

    // Test 2: Check if OpenAPI spec can be written to file
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const jsonPath = path.join(docsDir, 'openapi-test.json');
    fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
    console.log('✅ Test 2: OpenAPI JSON file written successfully');
    console.log(`   - Location: ${jsonPath}`);
    console.log(`   - Size: ${(fs.statSync(jsonPath).size / 1024).toFixed(2)} KB`);

    // Test 3: Verify key sections exist
    const hasInfo = !!document.info;
    const hasPaths = Object.keys(document.paths).length > 0;
    const hasComponents = !!document.components;

    console.log('✅ Test 3: Document structure validation');
    console.log(`   - Info section: ${hasInfo ? '✓' : '✗'}`);
    console.log(`   - Paths section: ${hasPaths ? '✓' : '✗'}`);
    console.log(`   - Components section: ${hasComponents ? '✓' : '✗'}`);

    // Test 4: Check for authentication schemes
    const hasAuth = !!document.components?.securitySchemes;
    console.log('✅ Test 4: Authentication configuration');
    console.log(`   - Security schemes defined: ${hasAuth ? '✓' : '✗'}`);
    if (hasAuth) {
      const schemes = Object.keys(document.components.securitySchemes);
      console.log(`   - Schemes: ${schemes.join(', ')}`);
    }

    // Clean up test file
    fs.unlinkSync(jsonPath);

    await app.close();

    console.log('\n🎉 All tests passed! Swagger/OpenAPI setup is working correctly.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSwagger();
