import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { RealtimeModule } from './realtime.module';
import { PrismaModule } from '../prisma/prisma.module';

describe('Realtime Integration Tests', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  let dashboardSocket: Socket;
  let notificationSocket: Socket;
  let presenceSocket: Socket;

  const testUserId = 'test-user-123';
  const testWorkspaceId = 'test-workspace-456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RealtimeModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3002); // Use different port for testing
  });

  afterAll(async () => {
    if (clientSocket) clientSocket.close();
    if (dashboardSocket) dashboardSocket.close();
    if (notificationSocket) notificationSocket.close();
    if (presenceSocket) presenceSocket.close();
    await app.close();
  });

  describe('WebSocket Server', () => {
    it('should connect to realtime namespace', (done) => {
      clientSocket = io('http://localhost:3002/realtime', {
        auth: {
          userId: testUserId,
          workspaceId: testWorkspaceId,
        },
      });

      clientSocket.on('connected', (data) => {
        expect(data).toBeDefined();
        expect(data.userId).toBe(testUserId);
        expect(data.workspaceId).toBe(testWorkspaceId);
        expect(data.socketId).toBeDefined();
        done();
      });
    });

    it('should respond to ping with pong', (done) => {
      clientSocket.emit('ping');
      
      clientSocket.on('pong', (data) => {
        expect(data).toBeDefined();
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    it('should receive presence updates', (done) => {
      clientSocket.on('presence:update', (presence) => {
        expect(Array.isArray(presence)).toBe(true);
        done();
      });

      // Trigger presence update by navigating
      clientSocket.emit('page:navigate', { page: '/dashboard' });
    });
  });

  describe('Dashboard Gateway', () => {
    it('should connect to dashboard namespace', (done) => {
      dashboardSocket = io('http://localhost:3002/dashboard', {
        auth: {
          userId: testUserId,
          workspaceId: testWorkspaceId,
        },
      });

      dashboardSocket.on('connect', () => {
        expect(dashboardSocket.connected).toBe(true);
        done();
      });
    });

    it('should subscribe to dashboard updates', (done) => {
      dashboardSocket.emit('dashboard:subscribe');

      dashboardSocket.on('dashboard:subscribe:ack', (data) => {
        expect(data).toBeDefined();
        expect(data.workspaceId).toBe(testWorkspaceId);
        done();
      });
    });
  });

  describe('Notification Gateway', () => {
    it('should connect to notifications namespace', (done) => {
      notificationSocket = io('http://localhost:3002/notifications', {
        auth: {
          userId: testUserId,
          workspaceId: testWorkspaceId,
        },
      });

      notificationSocket.on('connect', () => {
        expect(notificationSocket.connected).toBe(true);
        done();
      });
    });

    it('should subscribe to notification types', (done) => {
      const types = ['mention', 'message', 'approval'];
      notificationSocket.emit('notification:subscribe', { types });

      notificationSocket.on('notification:subscribe:ack', (data) => {
        expect(data).toBeDefined();
        expect(data.types).toEqual(types);
        done();
      });
    });

    it('should acknowledge read notification', (done) => {
      const notificationId = 'notif_test_123';
      notificationSocket.emit('notification:read', { notificationId });

      notificationSocket.on('notification:read:ack', (data) => {
        expect(data).toBeDefined();
        expect(data.notificationId).toBe(notificationId);
        done();
      });
    });
  });

  describe('Presence Gateway', () => {
    it('should connect to presence namespace', (done) => {
      presenceSocket = io('http://localhost:3002/presence', {
        auth: {
          userId: testUserId,
          workspaceId: testWorkspaceId,
        },
      });

      presenceSocket.on('connect', () => {
        expect(presenceSocket.connected).toBe(true);
        done();
      });
    });

    it('should get online users', (done) => {
      presenceSocket.emit('presence:online');

      presenceSocket.on('presence:online:list', (presence) => {
        expect(Array.isArray(presence)).toBe(true);
        done();
      });
    });

    it('should broadcast typing indicator', (done) => {
      const conversationId = 'conv_123';
      presenceSocket.emit('presence:typing', {
        conversationId,
        isTyping: true,
      });

      presenceSocket.on('presence:typing', (data) => {
        expect(data).toBeDefined();
        expect(data.conversationId).toBe(conversationId);
        expect(data.isTyping).toBe(true);
        done();
      });
    });

    it('should broadcast user activity', (done) => {
      const activity = {
        type: 'editing' as const,
        resourceId: 'post_123',
        resourceType: 'post' as const,
      };

      presenceSocket.emit('presence:activity', activity);

      presenceSocket.on('presence:activity', (data) => {
        expect(data).toBeDefined();
        expect(data.type).toBe(activity.type);
        expect(data.resourceId).toBe(activity.resourceId);
        expect(data.resourceType).toBe(activity.resourceType);
        done();
      });
    });
  });
});
