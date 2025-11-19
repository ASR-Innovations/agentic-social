#!/usr/bin/env node

/**
 * Setup Verification Script
 * Verifies that the development environment is properly configured
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function section(message) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(message, colors.blue);
  log('='.repeat(60), colors.blue);
}

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    success(`${name} is installed`);
    return true;
  } catch (e) {
    error(`${name} is not installed`);
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    success(`${name} exists`);
    return true;
  } else {
    error(`${name} not found at ${filePath}`);
    return false;
  }
}

function checkDirectory(dirPath, name) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    success(`${name} directory exists`);
    return true;
  } else {
    error(`${name} directory not found at ${dirPath}`);
    return false;
  }
}

function checkEnvVariable(varName) {
  if (process.env[varName]) {
    success(`${varName} is set`);
    return true;
  } else {
    warning(`${varName} is not set`);
    return false;
  }
}

function checkDockerService(serviceName) {
  try {
    const output = execSync(`docker-compose ps ${serviceName}`, {
      encoding: 'utf-8',
    });
    if (output.includes('Up')) {
      success(`${serviceName} is running`);
      return true;
    } else {
      warning(`${serviceName} is not running`);
      return false;
    }
  } catch (e) {
    warning(`Could not check ${serviceName} status`);
    return false;
  }
}

async function main() {
  log('\n🚀 AI Social Media Platform - Setup Verification\n', colors.cyan);

  let allChecks = true;

  // Check Prerequisites
  section('1. Prerequisites');
  allChecks &= checkCommand('node', 'Node.js');
  allChecks &= checkCommand('npm', 'npm');
  allChecks &= checkCommand('docker', 'Docker');
  allChecks &= checkCommand('docker-compose', 'Docker Compose');

  // Check Node version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 20) {
      success(`Node.js version ${nodeVersion} (>= 20.x)`);
    } else {
      error(`Node.js version ${nodeVersion} is too old. Please upgrade to v20.x or higher`);
      allChecks = false;
    }
  } catch (e) {
    error('Could not determine Node.js version');
    allChecks = false;
  }

  // Check Project Structure
  section('2. Project Structure');
  allChecks &= checkFile('package.json', 'Backend package.json');
  allChecks &= checkFile('tsconfig.json', 'Backend tsconfig.json');
  allChecks &= checkFile('.eslintrc.js', 'Backend ESLint config');
  allChecks &= checkFile('.prettierrc', 'Backend Prettier config');
  allChecks &= checkDirectory('src', 'Backend source');
  allChecks &= checkDirectory('prisma', 'Prisma directory');
  allChecks &= checkFile('prisma/schema.prisma', 'Prisma schema');

  // Check Frontend
  section('3. Frontend Structure');
  allChecks &= checkDirectory('frontend', 'Frontend directory');
  allChecks &= checkFile('frontend/package.json', 'Frontend package.json');
  allChecks &= checkFile('frontend/tsconfig.json', 'Frontend tsconfig.json');
  allChecks &= checkFile('frontend/.eslintrc.json', 'Frontend ESLint config');
  allChecks &= checkFile('frontend/.prettierrc', 'Frontend Prettier config');
  allChecks &= checkDirectory('frontend/src', 'Frontend source');

  // Check Dependencies
  section('4. Dependencies');
  const backendNodeModules = checkDirectory('node_modules', 'Backend node_modules');
  const frontendNodeModules = checkDirectory(
    'frontend/node_modules',
    'Frontend node_modules'
  );

  if (!backendNodeModules) {
    info('Run: npm install');
  }
  if (!frontendNodeModules) {
    info('Run: cd frontend && npm install');
  }

  allChecks &= backendNodeModules && frontendNodeModules;

  // Check Environment Variables
  section('5. Environment Configuration');
  const envExists = checkFile('.env', 'Environment file');
  if (!envExists) {
    warning('.env file not found. Copy .env.example to .env');
    info('Run: cp .env.example .env');
  }

  // Load .env if it exists
  if (envExists) {
    require('dotenv').config();
    checkEnvVariable('DATABASE_URL');
    checkEnvVariable('JWT_SECRET');
    checkEnvVariable('REDIS_HOST');
    checkEnvVariable('MONGODB_URI');
  }

  // Check Docker Services
  section('6. Docker Services');
  info('Checking if Docker services are running...');
  checkDockerService('postgres');
  checkDockerService('redis');
  checkDockerService('mongodb');

  info('\nTo start services: npm run docker:up');

  // Check Prisma
  section('7. Prisma Setup');
  const prismaClientExists = checkDirectory(
    'node_modules/.prisma/client',
    'Prisma Client'
  );
  if (!prismaClientExists) {
    warning('Prisma Client not generated');
    info('Run: npm run prisma:generate');
  }

  // Summary
  section('Summary');
  if (allChecks) {
    success('All critical checks passed! ✨');
    log('\nNext steps:', colors.cyan);
    log('1. Start Docker services: npm run docker:up');
    log('2. Run migrations: npm run prisma:migrate');
    log('3. Start backend: npm run start:dev');
    log('4. Start frontend: npm run dev:frontend');
  } else {
    error('Some checks failed. Please review the output above.');
    log('\nQuick setup:', colors.cyan);
    log('1. npm run setup          # Install all dependencies');
    log('2. cp .env.example .env   # Create environment file');
    log('3. npm run setup:db       # Start Docker and run migrations');
    log('4. npm run start:dev      # Start backend');
    log('5. npm run dev:frontend   # Start frontend');
  }

  log('');
}

main().catch((err) => {
  error(`Verification failed: ${err.message}`);
  process.exit(1);
});
