# Analytics Components

This directory contains reusable analytics components for the AI Social Media Management Platform.

## Components

### DateRangePicker
A date range selector with preset options (7d, 30d, 90d, etc.).

**Props:**
- `value: DateRange` - Current date range
- `onChange: (range: DateRange) => void` - Callback when range changes

**Usage:**
```tsx
const [dateRange, setDateRange] = useState<DateRange>({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  preset: '30d',
});

<DateRangePicker value={dateRange} onChange={setDateRange} />
```

### KPICard
Displays a key performance indicator with icon, value, and change percentage.

**Props:**
- `title: string` - Card title
- `value: string | number` - Main metric value
- `change?: number` - Percentage change
- `changeLabel?: string` - Label for change (default: "vs last period")
- `icon: LucideIcon` - Icon component
- `color: string` - Tailwind gradient classes
- `loading?: boolean` - Loading state

**Usage:**
```tsx
<KPICard
  title="Total Reach"
  value="124.5K"
  change={12.3}
  icon={Eye}
  color="from-blue-500 to-cyan-500"
/>
```

### EngagementChart
Line/area chart showing engagement trends over time using Recharts.

**Props:**
- `data: Array<{ date: string; engagement: number; reach: number; impressions: number }>` - Chart data
- `loading?: boolean` - Loading state

**Usage:**
```tsx
const chartData = [
  { date: '2024-01-01', engagement: 1200, reach: 15000, impressions: 25000 },
  // ...more data
];

<EngagementChart data={chartData} />
```

### PostsPerformanceTable
Sortable table displaying post performance metrics.

**Props:**
- `posts: PostPerformance[]` - Array of post performance data
- `loading?: boolean` - Loading state

**PostPerformance Interface:**
```typescript
interface PostPerformance {
  id: string;
  content: string;
  platform: string;
  publishedAt: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}
```

**Usage:**
```tsx
<PostsPerformanceTable posts={postsData} />
```

### AudienceDemographics
Displays audience demographics with pie charts and bar charts.

**Props:**
- `ageData: Array<{ name: string; value: number }>` - Age distribution
- `genderData: Array<{ name: string; value: number }>` - Gender distribution
- `locationData: Array<{ name: string; value: number }>` - Location distribution
- `loading?: boolean` - Loading state

**Usage:**
```tsx
<AudienceDemographics
  ageData={[
    { name: '18-24', value: 2400 },
    { name: '25-34', value: 4567 },
  ]}
  genderData={[
    { name: 'Male', value: 6500 },
    { name: 'Female', value: 5800 },
  ]}
  locationData={[
    { name: 'United States', value: 5200 },
    { name: 'United Kingdom', value: 3100 },
  ]}
/>
```

### ConversionFunnel
Displays a conversion funnel with drop-off rates.

**Props:**
- `stages: FunnelStage[]` - Array of funnel stages
- `loading?: boolean` - Loading state

**FunnelStage Interface:**
```typescript
interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
}
```

**Usage:**
```tsx
<ConversionFunnel
  stages={[
    { name: 'Impressions', value: 125000, percentage: 100 },
    { name: 'Reach', value: 85000, percentage: 68 },
    { name: 'Engagement', value: 12500, percentage: 10 },
    { name: 'Clicks', value: 3200, percentage: 2.56 },
    { name: 'Conversions', value: 450, percentage: 0.36 },
  ]}
/>
```

### ExportMenu
Dropdown menu for exporting analytics data in various formats.

**Props:**
- `onExport: (format: 'pdf' | 'csv' | 'xlsx') => Promise<void>` - Export handler

**Usage:**
```tsx
const handleExport = async (format: 'pdf' | 'csv' | 'xlsx') => {
  const blob = await apiClient.exportData({
    type: 'analytics',
    format,
    dateRange: { startDate, endDate },
  });
  // Handle download
};

<ExportMenu onExport={handleExport} />
```

## Styling

All components use the glass-card design system with:
- Dark theme optimized colors
- Glassmorphism effects
- Responsive layouts
- Smooth animations with Framer Motion

## Dependencies

- `recharts` - Chart library
- `lucide-react` - Icons
- `framer-motion` - Animations
- `@radix-ui` - UI primitives
- `tailwindcss` - Styling
