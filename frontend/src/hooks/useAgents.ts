import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { Agent, AgentStatistics, AgentActivity, UpdateAgentConfigRequest } from '@/types/api';
import { toast } from 'react-hot-toast';

/**
 * Hook to fetch all AI agents
 * Automatically refreshes every 30 seconds
 */
export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents.list(),
    queryFn: () => apiClient.getAgents(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

/**
 * Hook to fetch agent statistics
 * Refreshes every 10 seconds for real-time metrics
 */
export function useAgentStatistics() {
  return useQuery({
    queryKey: queryKeys.agents.statistics(),
    queryFn: () => apiClient.getAgentStatistics(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

/**
 * Hook to fetch agent activity feed
 * Shows recent agent actions and tasks
 */
export function useAgentActivity() {
  return useQuery({
    queryKey: queryKeys.agents.activity(),
    queryFn: () => apiClient.getAgentActivity(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

/**
 * Mutation hook to activate an agent
 * Invalidates agent list and statistics on success
 */
export function useActivateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => apiClient.activateAgent(agentId),
    onMutate: async (agentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.list() });
      
      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(queryKeys.agents.list());
      
      // Optimistically update the agent status
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(
          queryKeys.agents.list(),
          previousAgents.map(agent =>
            agent.id === agentId ? { ...agent, active: true } : agent
          )
        );
      }
      
      // Return context with the snapshot
      return { previousAgents };
    },
    onError: (error, agentId, context) => {
      // Rollback to the previous value on error
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.list(), context.previousAgents);
      }
      toast.error('Failed to activate agent. Please try again.');
    },
    onSuccess: (data) => {
      toast.success(`${data.name} has been activated`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.statistics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.activity() });
    },
  });
}

/**
 * Mutation hook to deactivate an agent
 * Invalidates agent list and statistics on success
 */
export function useDeactivateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => apiClient.deactivateAgent(agentId),
    onMutate: async (agentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.list() });
      
      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(queryKeys.agents.list());
      
      // Optimistically update the agent status
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(
          queryKeys.agents.list(),
          previousAgents.map(agent =>
            agent.id === agentId ? { ...agent, active: false } : agent
          )
        );
      }
      
      // Return context with the snapshot
      return { previousAgents };
    },
    onError: (error, agentId, context) => {
      // Rollback to the previous value on error
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.list(), context.previousAgents);
      }
      toast.error('Failed to deactivate agent. Please try again.');
    },
    onSuccess: (data) => {
      toast.success(`${data.name} has been deactivated`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.statistics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.activity() });
    },
  });
}

/**
 * Mutation hook to update agent configuration
 * Invalidates agent list on success
 */
export function useUpdateAgentConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, config }: { agentId: string; config: UpdateAgentConfigRequest }) =>
      apiClient.updateAgentConfig(agentId, config),
    onMutate: async ({ agentId, config }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.list() });
      
      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(queryKeys.agents.list());
      
      // Optimistically update the agent config
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(
          queryKeys.agents.list(),
          previousAgents.map(agent =>
            agent.id === agentId ? { ...agent, ...config } : agent
          )
        );
      }
      
      // Return context with the snapshot
      return { previousAgents };
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.list(), context.previousAgents);
      }
      toast.error('Failed to update agent configuration. Please try again.');
    },
    onSuccess: (data) => {
      toast.success(`${data.name} configuration updated successfully`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.statistics() });
    },
  });
}
