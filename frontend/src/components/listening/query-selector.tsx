'use client';

import { useState } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListeningQuery } from '@/types';

interface QuerySelectorProps {
  queries: ListeningQuery[];
  selectedQuery: ListeningQuery | null;
  onSelectQuery: (query: ListeningQuery) => void;
  onCreateQuery: () => void;
}

export function QuerySelector({
  queries,
  selectedQuery,
  onSelectQuery,
  onCreateQuery,
}: QuerySelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Select
          value={selectedQuery?.id}
          onValueChange={(value) => {
            const query = queries.find((q) => q.id === value);
            if (query) onSelectQuery(query);
          }}
        >
          <SelectTrigger className="glass-card border-white/10 text-white">
            <SelectValue placeholder="Select a listening query" />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            {queries.map((query) => (
              <SelectItem key={query.id} value={query.id} className="text-white">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>{query.name}</span>
                  {!query.isActive && (
                    <span className="text-xs text-gray-400">(Inactive)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onCreateQuery}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Query
      </Button>
    </div>
  );
}
