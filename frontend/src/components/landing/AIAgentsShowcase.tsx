'use client';

import { useState, useRef, useEffect } from 'react';
import { AIAgent } from '@/lib/landing-types';
import {
  ArrowRight,
  PenTool,
  Target,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Eye,
  type LucideIcon,
} from 'lucide-react';

// Local icon map to avoid dynamic import issues
const agentIconMap: Record<string, LucideIcon> = {
  PenTool,
  Target,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Eye,
};

interface AgentCardProps {
  agent: AIAgent;
  index: number;
  isVisible: boolean;
}

function AgentCard({ agent, index, isVisible }: AgentCardProps) {
  return (
    <div
      data-testid="agent-card"
      className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
      }}
    >
      {/* Icon */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: `${agent.color}15`,
        }}
      >
        <div
          style={{ color: agent.color }}
          className="transition-transform duration-300 group-hover:scale-110"
        >
          {(() => {
            const IconComponent = agentIconMap[agent.iconName];
            return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
          })()}
        </div>
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
        {agent.name}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-4">
        {agent.description}
      </p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-2">
        {agent.capabilities.slice(0, 3).map((capability, idx) => (
          <span
            key={idx}
            className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
          >
            {capability}
          </span>
        ))}
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ArrowRight className="w-5 h-5 text-emerald-500" />
      </div>
    </div>
  );
}

export interface AIAgentsShowcaseProps {
  agents: AIAgent[];
}

export function AIAgentsShowcase({ agents }: AIAgentsShowcaseProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ai-agents"
      className="relative py-24 px-6 lg:px-12 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            6 Specialized Agents
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your AI Team
          </h2>

          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Intelligent agents working together to automate your entire social
            media workflow.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AIAgentsShowcase;
