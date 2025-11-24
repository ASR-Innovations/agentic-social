import { Test, TestingModule } from '@nestjs/testing';
import { DataLoaderService } from './dataloader.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DataLoaderService', () => {
  let service: DataLoaderService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
    workspace: {
      findMany: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataLoaderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DataLoaderService>(DataLoaderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserLoader', () => {
    it('should batch multiple user queries into one', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
        { id: '3', name: 'User 3' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const loader = service.getUserLoader();

      // Load multiple users
      const results = await Promise.all([
        loader.load('1'),
        loader.load('2'),
        loader.load('3'),
      ]);

      // Should only call findMany once (batched)
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['1', '2', '3'] } },
      });

      // Results should match
      expect(results).toEqual(mockUsers);
    });

    it('should cache loaded users', async () => {
      const mockUsers = [{ id: '1', name: 'User 1' }];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const loader = service.getUserLoader();

      // Load same user twice
      await loader.load('1');
      await loader.load('1');

      // Should only call findMany once (cached)
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return null for non-existent users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const loader = service.getUserLoader();
      const result = await loader.load('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getPostsByWorkspaceLoader', () => {
    it('should group posts by workspace ID', async () => {
      const mockPosts = [
        { id: '1', workspaceId: 'ws1', title: 'Post 1' },
        { id: '2', workspaceId: 'ws1', title: 'Post 2' },
        { id: '3', workspaceId: 'ws2', title: 'Post 3' },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const loader = service.getPostsByWorkspaceLoader();

      const results = await Promise.all([
        loader.load('ws1'),
        loader.load('ws2'),
      ]);

      expect(results[0]).toHaveLength(2);
      expect(results[1]).toHaveLength(1);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all loaders', () => {
      service.getUserLoader();
      service.getWorkspaceLoader();

      service.clearAll();

      // After clearing, new loaders should be created
      const loader1 = service.getUserLoader();
      const loader2 = service.getUserLoader();

      expect(loader1).toBe(loader2); // Same instance after clearing
    });
  });
});
