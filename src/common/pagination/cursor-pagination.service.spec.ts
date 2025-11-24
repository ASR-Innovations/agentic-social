import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CursorPaginationService } from './cursor-pagination.service';

describe('CursorPaginationService', () => {
  let service: CursorPaginationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursorPaginationService],
    }).compile();

    service = module.get<CursorPaginationService>(CursorPaginationService);
  });

  describe('encodeCursor', () => {
    it('should encode cursor data to base64', () => {
      const cursor = service.encodeCursor('123', new Date('2024-01-01'));
      expect(cursor).toBeTruthy();
      expect(typeof cursor).toBe('string');
    });
  });

  describe('decodeCursor', () => {
    it('should decode valid cursor', () => {
      const encoded = service.encodeCursor('123', new Date('2024-01-01'));
      const decoded = service.decodeCursor(encoded);

      expect(decoded.id).toBe('123');
      expect(decoded.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw BadRequestException for invalid cursor', () => {
      expect(() => service.decodeCursor('invalid')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for malformed cursor', () => {
      const malformed = Buffer.from(JSON.stringify({ invalid: 'data' })).toString('base64');
      expect(() => service.decodeCursor(malformed)).toThrow(BadRequestException);
    });
  });

  describe('buildWhereClause', () => {
    it('should build where clause for forward pagination', () => {
      const cursor = service.encodeCursor('123', new Date('2024-01-01'));
      const where = service.buildWhereClause(cursor, 'forward');

      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(2);
    });

    it('should build where clause for backward pagination', () => {
      const cursor = service.encodeCursor('123', new Date('2024-01-01'));
      const where = service.buildWhereClause(cursor, 'backward');

      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(2);
    });

    it('should include additional where conditions', () => {
      const cursor = service.encodeCursor('123', new Date('2024-01-01'));
      const where = service.buildWhereClause(cursor, 'forward', { status: 'published' });

      expect(where.status).toBe('published');
      expect(where.OR).toBeDefined();
    });

    it('should return only additional conditions when no cursor', () => {
      const where = service.buildWhereClause(undefined, 'forward', { status: 'published' });

      expect(where.status).toBe('published');
      expect(where.OR).toBeUndefined();
    });
  });

  describe('createResponse', () => {
    it('should create response with hasNextPage true when more items exist', () => {
      const items = [
        { id: '1', createdAt: new Date('2024-01-01') },
        { id: '2', createdAt: new Date('2024-01-02') },
        { id: '3', createdAt: new Date('2024-01-03') },
      ];

      const response = service.createResponse(items, 2, 'forward');

      expect(response.data).toHaveLength(2);
      expect(response.pageInfo.hasNextPage).toBe(true);
      expect(response.pageInfo.hasPreviousPage).toBe(false);
    });

    it('should create response with hasNextPage false when no more items', () => {
      const items = [
        { id: '1', createdAt: new Date('2024-01-01') },
        { id: '2', createdAt: new Date('2024-01-02') },
      ];

      const response = service.createResponse(items, 5, 'forward');

      expect(response.data).toHaveLength(2);
      expect(response.pageInfo.hasNextPage).toBe(false);
    });

    it('should include start and end cursors', () => {
      const items = [
        { id: '1', createdAt: new Date('2024-01-01') },
        { id: '2', createdAt: new Date('2024-01-02') },
      ];

      const response = service.createResponse(items, 5, 'forward');

      expect(response.pageInfo.startCursor).toBeTruthy();
      expect(response.pageInfo.endCursor).toBeTruthy();
    });

    it('should include total count when provided', () => {
      const items = [{ id: '1', createdAt: new Date('2024-01-01') }];
      const response = service.createResponse(items, 5, 'forward', 100);

      expect(response.pageInfo.totalCount).toBe(100);
    });
  });

  describe('buildPaginationQuery', () => {
    it('should build complete pagination query', () => {
      const cursor = service.encodeCursor('123', new Date('2024-01-01'));
      const query = service.buildPaginationQuery(cursor, 20, 'forward', { status: 'published' });

      expect(query.where).toBeDefined();
      expect(query.take).toBe(21); // limit + 1
      expect(query.orderBy).toBeDefined();
    });

    it('should use correct order for forward pagination', () => {
      const query = service.buildPaginationQuery(undefined, 20, 'forward');

      expect(query.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    });

    it('should use correct order for backward pagination', () => {
      const query = service.buildPaginationQuery(undefined, 20, 'backward');

      expect(query.orderBy).toEqual([{ createdAt: 'asc' }, { id: 'asc' }]);
    });
  });
});
