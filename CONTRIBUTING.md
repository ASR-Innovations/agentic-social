# Contributing to AI-Native Social Media Management Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Submitting Changes](#submitting-changes)
8. [Review Process](#review-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable Behavior:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations can be reported to conduct@platform.com. All complaints will be reviewed and investigated.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- MongoDB 7+
- Git
- Docker (optional but recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/platform.git
   cd platform
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original/platform.git
   ```

### Setup Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start databases:
   ```bash
   docker-compose up -d postgres redis mongodb
   ```

4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

---

## Development Process

### Branching Strategy

We use Git Flow:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes
- `release/*`: Release preparation

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git checkout develop
git pull upstream develop
git checkout feature/your-feature-name
git rebase develop
```

---

## Coding Standards

### TypeScript

**Style Guide:**
- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add type annotations for function parameters and return types
- Use interfaces for object shapes

**Example:**
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id } });
}

// ❌ Bad
async function getUser(id) {
  return await prisma.user.findUnique({ where: { id } });
}
```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase with `I` prefix optional (`User` or `IUser`)
- **Types**: PascalCase (`UserRole`)

### Code Organization

**File Structure:**
```
src/
├── module-name/
│   ├── module-name.module.ts
│   ├── module-name.controller.ts
│   ├── module-name.service.ts
│   ├── module-name.service.spec.ts
│   ├── dto/
│   │   ├── create-module.dto.ts
│   │   └── update-module.dto.ts
│   └── interfaces/
│       └── module.interface.ts
```

### Comments

**When to Comment:**
- Complex algorithms
- Non-obvious business logic
- Workarounds for known issues
- Public API documentation

**Example:**
```typescript
/**
 * Calculates optimal posting time based on audience activity
 * @param userId - The user ID to analyze
 * @param platform - The social media platform
 * @returns ISO timestamp of optimal posting time
 */
async function calculateOptimalTime(
  userId: string,
  platform: Platform
): Promise<string> {
  // Implementation
}
```

### Error Handling

**Best Practices:**
```typescript
// ✅ Good
try {
  const result = await externalService.call();
  return result;
} catch (error) {
  this.logger.error('External service failed', error);
  throw new HttpException(
    'Service temporarily unavailable',
    HttpStatus.SERVICE_UNAVAILABLE
  );
}

// ❌ Bad
try {
  const result = await externalService.call();
  return result;
} catch (error) {
  console.log(error);
  throw error;
}
```

---

## Testing Guidelines

### Test Coverage

- Minimum 80% coverage for new code
- 100% coverage for critical paths
- All public APIs must have tests

### Unit Tests

**Location:** Next to source file with `.spec.ts` extension

**Example:**
```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });
});
```

### Integration Tests

**Location:** `test/` directory with `.integration.spec.ts` extension

**Example:**
```typescript
// user.integration.spec.ts
describe('User API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# Integration tests
npm run test:e2e

# Specific file
npm test user.service.spec.ts
```

---

## Documentation

### Code Documentation

- Document all public APIs
- Use JSDoc format
- Include examples for complex functions
- Keep documentation up to date

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying configuration
- Adding dependencies

### API Documentation

- Update OpenAPI/Swagger specs
- Add examples for new endpoints
- Document request/response formats
- Include error responses

---

## Submitting Changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add two-factor authentication

Implement 2FA using TOTP tokens. Users can enable 2FA in settings
and must provide a code during login.

Closes #123
```

```
fix(publishing): resolve Instagram posting failure

Fix issue where posts with multiple images failed to publish
to Instagram due to incorrect media format.

Fixes #456
```

### Pull Request Process

1. **Update your branch:**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Run tests:**
   ```bash
   npm test
   npm run test:e2e
   npm run lint
   ```

3. **Push to your fork:**
   ```bash
   git push origin feature/your-feature
   ```

4. **Create Pull Request:**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the template

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)

## Related Issues
Closes #issue_number
```

---

## Review Process

### What We Look For

**Code Quality:**
- Follows coding standards
- Well-structured and readable
- Properly tested
- No unnecessary complexity

**Functionality:**
- Solves the stated problem
- Doesn't introduce new bugs
- Handles edge cases
- Includes error handling

**Documentation:**
- Code is documented
- README updated if needed
- API docs updated
- Changelog updated

### Review Timeline

- Initial review: Within 2 business days
- Follow-up reviews: Within 1 business day
- Merge: After approval from 2 maintainers

### Addressing Feedback

1. Make requested changes
2. Commit with descriptive message
3. Push to your branch
4. Respond to comments
5. Request re-review

---

## Additional Guidelines

### Performance

- Optimize database queries
- Use caching appropriately
- Avoid N+1 queries
- Profile performance-critical code

### Security

- Never commit secrets
- Validate all user input
- Use parameterized queries
- Follow OWASP guidelines
- Report security issues privately

### Accessibility

- Follow WCAG 2.1 AA standards
- Use semantic HTML
- Include ARIA labels
- Test with screen readers
- Ensure keyboard navigation

---

## Getting Help

### Resources

- **Documentation**: docs.platform.com
- **API Docs**: docs.platform.com/api
- **Community Forum**: community.platform.com
- **Discord**: discord.gg/platform

### Questions

- **General**: community.platform.com
- **Technical**: dev@platform.com
- **Security**: security@platform.com

---

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Annual contributor spotlight
- Swag for significant contributions

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this platform better! 🎉

*Last updated: November 2025*
