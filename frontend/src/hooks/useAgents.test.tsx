import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAgents,
  useAgentStatistics,
  useAgentActivity,
  useActivateAgent,
  useDeactivateAgent,
  useUpdateAgentConfig,
} from './useAgents';
import { apiClient } from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getAgents: jest.fn(),
    getAgentStatistics: jest.fn(),
    getAgentActivity: jest.fn(),
    activateAgent: jest.fn(),
    deactivateAgent: jest.fn(),
    updateAgentConfig: jest.fn(),
  },
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Helper to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAgents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch agents successfully', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Content Creator',
        type: 'content_creator' as const,
        active: true,
        tenantId: 'tenant-1',
        aiProvider: 'openai' as const,
        model: 'gpt-4',
        personalityConfig: {},
        costBudget: 100,
        fallbackProvider: null,
        usageStats: {},
        metadata: {},
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    (apiClient.getAgents as jest.Mock).mockResolvedValue(mockAgents);

    const { result } = renderHook(() => useAgents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAgents);
    expect(apiClient.getAgents).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching agents', async () => {
    const mockError = new Error('Failed to fetch agents');
    (apiClient.getAgents as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAgents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useAgentStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch agent statistics successfully', async () => {
    const mockStats = {
      totalAgents: 6,
      activeAgents: 4,
      byType: {
        content_creator: 1,
        strategy: 1,
        engagement: 1,
        analytics: 1,
        trend_detection: 1,
        competitor_analysis: 1,
      },
      totalCost: 150.5,
      totalTasks: 250,
    };

    (apiClient.getAgentStatistics as jest.Mock).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useAgentStatistics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStats);
    expect(apiClient.getAgentStatistics).toHaveBeenCalledTimes(1);
  });
});

describe('useAgentActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch agent activity successfully', async () => {
    const mockActivity = [
      {
        id: '1',
        agentId: 'agent-1',
        agentName: 'Content Creator',
        agentType: 'content_creator' as const,
        action: 'Generated post content',
        status: 'completed' as const,
        timestamp: '2024-01-01T12:00:00Z',
        metadata: {},
      },
    ];

    (apiClient.getAgentActivity as jest.Mock).mockResolvedValue(mockActivity);

    const { result } = renderHook(() => useAgentActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockActivity);
    expect(apiClient.getAgentActivity).toHaveBeenCalledTimes(1);
  });
});

describe('useActivateAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should activate an agent successfully', async () => {
    const mockAgent = {
      id: '1',
      name: 'Content Creator',
      type: 'content_creator' as const,
      active: true,
      tenantId: 'tenant-1',
      aiProvider: 'openai' as const,
      model: 'gpt-4',
      personalityConfig: {},
      costBudget: 100,
      fallbackProvider: null,
      usageStats: {},
      metadata: {},
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (apiClient.activateAgent as jest.Mock).mockResolvedValue(mockAgent);

    const { result } = renderHook(() => useActivateAgent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.activateAgent).toHaveBeenCalledWith('1');
  });
});

describe('useDeactivateAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deactivate an agent successfully', async () => {
    const mockAgent = {
      id: '1',
      name: 'Content Creator',
      type: 'content_creator' as const,
      active: false,
      tenantId: 'tenant-1',
      aiProvider: 'openai' as const,
      model: 'gpt-4',
      personalityConfig: {},
      costBudget: 100,
      fallbackProvider: null,
      usageStats: {},
      metadata: {},
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (apiClient.deactivateAgent as jest.Mock).mockResolvedValue(mockAgent);

    const { result } = renderHook(() => useDeactivateAgent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.deactivateAgent).toHaveBeenCalledWith('1');
  });
});

describe('useUpdateAgentConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update agent configuration successfully', async () => {
    const mockAgent = {
      id: '1',
      name: 'Updated Content Creator',
      type: 'content_creator' as const,
      active: true,
      tenantId: 'tenant-1',
      aiProvider: 'openai' as const,
      model: 'gpt-4',
      personalityConfig: { tone: 'professional' },
      costBudget: 200,
      fallbackProvider: null,
      usageStats: {},
      metadata: {},
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const updateConfig = {
      name: 'Updated Content Creator',
      costBudget: 200,
      personalityConfig: { tone: 'professional' },
    };

    (apiClient.updateAgentConfig as jest.Mock).mockResolvedValue(mockAgent);

    const { result } = renderHook(() => useUpdateAgentConfig(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ agentId: '1', config: updateConfig });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.updateAgentConfig).toHaveBeenCalledWith('1', updateConfig);
  });
});
