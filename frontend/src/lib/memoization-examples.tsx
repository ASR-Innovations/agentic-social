/**
 * Memoization Examples
 * Demonstrates proper use of React.memo, useMemo, and useCallback for performance
 */

import { memo, useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Example 1: Memoized Component
 * Use React.memo to prevent unnecessary re-renders when props haven't changed
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
}

export const MemoizedMetricCard = memo(function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
}: MetricCardProps) {
  console.log(`Rendering MetricCard: ${title}`);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
});

/**
 * Example 2: useMemo for expensive computations
 * Memoize the result of expensive calculations
 */
export function ExpensiveListComponent({ items }: { items: any[] }) {
  // Without useMemo, this would recalculate on every render
  const sortedAndFilteredItems = useMemo(() => {
    console.log('Computing sorted and filtered items...');
    return items
      .filter(item => item.active)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }, [items]); // Only recompute when items change

  const totalValue = useMemo(() => {
    console.log('Computing total value...');
    return sortedAndFilteredItems.reduce((sum, item) => sum + item.value, 0);
  }, [sortedAndFilteredItems]);

  return (
    <div>
      <p>Total Value: {totalValue}</p>
      <ul>
        {sortedAndFilteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 3: useCallback for event handlers
 * Memoize callback functions to prevent child re-renders
 */
export function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // Without useCallback, this creates a new function on every render
  // causing ChildComponent to re-render even when count hasn't changed
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // No dependencies, function never changes

  const handleReset = useCallback(() => {
    setCount(0);
  }, []);

  // This callback depends on text, so it will be recreated when text changes
  const handleSubmit = useCallback(() => {
    console.log('Submitting:', text);
  }, [text]);

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
      <MemoizedChildComponent
        count={count}
        onIncrement={handleIncrement}
        onReset={handleReset}
      />
    </div>
  );
}

interface ChildComponentProps {
  count: number;
  onIncrement: () => void;
  onReset: () => void;
}

const MemoizedChildComponent = memo(function ChildComponent({
  count,
  onIncrement,
  onReset,
}: ChildComponentProps) {
  console.log('Rendering ChildComponent');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>Increment</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
});

/**
 * Example 4: Memoized list rendering
 * Optimize rendering of large lists
 */
interface ListItemProps {
  item: {
    id: string;
    title: string;
    description: string;
  };
  onSelect: (id: string) => void;
}

const MemoizedListItem = memo(function ListItem({ item, onSelect }: ListItemProps) {
  console.log(`Rendering item: ${item.id}`);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-white rounded-lg shadow-sm cursor-pointer"
      onClick={() => onSelect(item.id)}
    >
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-gray-600">{item.description}</p>
    </motion.div>
  );
});

export function OptimizedList({ items }: { items: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Memoize the callback to prevent ListItem re-renders
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="space-y-2">
      {items.map(item => (
        <MemoizedListItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

/**
 * Example 5: Complex object memoization
 * Memoize complex objects to maintain referential equality
 */
export function ComplexComponent() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Memoize the config object to prevent unnecessary re-renders
  const filterConfig = useMemo(() => ({
    filter,
    sortBy,
    options: {
      ascending: true,
      limit: 10,
    },
  }), [filter, sortBy]);

  return (
    <div>
      <FilterControls
        filter={filter}
        sortBy={sortBy}
        onFilterChange={setFilter}
        onSortChange={setSortBy}
      />
      <DataDisplay config={filterConfig} />
    </div>
  );
}

const DataDisplay = memo(function DataDisplay({ config }: { config: any }) {
  console.log('Rendering DataDisplay');
  // This component only re-renders when config changes
  return <div>Data with config: {JSON.stringify(config)}</div>;
});

function FilterControls({ filter, sortBy, onFilterChange, onSortChange }: any) {
  return (
    <div>
      <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="date">Date</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}

/**
 * Performance Tips:
 * 
 * 1. Use React.memo for components that:
 *    - Render often with the same props
 *    - Are expensive to render
 *    - Are pure (same props = same output)
 * 
 * 2. Use useMemo for:
 *    - Expensive calculations
 *    - Complex object/array transformations
 *    - Maintaining referential equality
 * 
 * 3. Use useCallback for:
 *    - Event handlers passed to memoized children
 *    - Functions used as dependencies in other hooks
 *    - Callbacks passed to third-party libraries
 * 
 * 4. Don't overuse:
 *    - Memoization has overhead
 *    - Only optimize when needed
 *    - Profile first, optimize second
 */
