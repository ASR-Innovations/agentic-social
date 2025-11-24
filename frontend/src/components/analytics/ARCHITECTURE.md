# Analytics Components Architecture

## Component Hierarchy

```
AnalyticsPage (page.tsx)
├── Header
│   ├── DateRangePicker
│   └── ExportMenu
│
└── Tabs
    ├── Overview Tab
    │   ├── KPICard (x4)
    │   │   ├── Total Reach
    │   │   ├── Engagement Rate
    │   │   ├── New Followers
    │   │   └── Total Posts
    │   ├── EngagementChart
    │   └── PostsPerformanceTable (preview)
    │
    ├── Posts Tab
    │   └── PostsPerformanceTable (full)
    │
    ├── Audience Tab
    │   └── AudienceDemographics
    │       ├── Age Distribution (Pie Chart)
    │       ├── Gender Distribution (Pie Chart)
    │       └── Top Locations (Bar Chart)
    │
    ├── Engagement Tab
    │   └── EngagementChart
    │
    └── Conversions Tab
        ├── ConversionFunnel
        └── KPICard (Revenue)
```

## Data Flow

```
User Interaction
    ↓
DateRangePicker onChange
    ↓
Update dateRange state
    ↓
Trigger API calls (useApi hook)
    ↓
Fetch data from backend
    ↓
Update component state
    ↓
Re-render components with new data
```

## State Management

### Page-level State
- `dateRange: DateRange` - Selected date range
- `mounted: boolean` - Client-side hydration flag

### Component-level State
- `sortField: SortField` - Current sort column (PostsPerformanceTable)
- `sortDirection: SortDirection` - Sort direction (PostsPerformanceTable)
- `isExporting: boolean` - Export in progress (ExportMenu)

### API State (via useApi hook)
- `data: T | null` - Fetched data
- `loading: boolean` - Loading state
- `error: Error | null` - Error state

## API Endpoints

### Analytics Overview
```typescript
GET /api/analytics/overview
Query: { startDate, endDate }
Response: {
  totalReach: number;
  reachChange: number;
  engagementRate: number;
  engagementChange: number;
  newFollowers: number;
  followersChange: number;
  totalPosts: number;
  postsChange: number;
}
```

### Engagement Trend
```typescript
GET /api/analytics/engagement-trend
Query: { startDate, endDate }
Response: Array<{
  date: string;
  engagement: number;
  reach: number;
  impressions: number;
}>
```

### Top Posts
```typescript
GET /api/analytics/top-posts
Query: { startDate, endDate, limit }
Response: Array<PostPerformance>
```

### Export Data
```typescript
POST /api/export
Body: {
  type: 'analytics';
  format: 'pdf' | 'csv' | 'xlsx';
  dateRange: { startDate, endDate };
}
Response: Blob
```

## Styling System

### Glass-card Design
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
```

### Color Palette
- Primary: Purple (#8b5cf6)
- Secondary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Error: Red (#ef4444)
- Info: Cyan (#06b6d4)

### Gradients
- Blue: `from-blue-500 to-cyan-500`
- Pink: `from-pink-500 to-rose-500`
- Green: `from-green-500 to-emerald-500`
- Purple: `from-purple-500 to-indigo-500`

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Single column layout
  - Stacked KPI cards
  - Simplified tables
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - 2-column grid
  - Responsive charts
  - Horizontal scrolling tables
}

/* Desktop */
@media (min-width: 1025px) {
  - 4-column grid for KPIs
  - Full-width charts
  - Multi-column layouts
}
```

## Performance Optimizations

1. **Lazy Loading**: Components load on demand
2. **Memoization**: React.memo for expensive components
3. **Debouncing**: API calls debounced on date range changes
4. **Virtualization**: Large tables use virtual scrolling
5. **Code Splitting**: Route-based code splitting
6. **Image Optimization**: Next.js Image component
7. **Caching**: React Query for API response caching

## Accessibility

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible focus states
- **Alt Text**: All images have descriptive alt text

## Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- State management
- API integration

### Integration Tests
- Tab navigation
- Data fetching
- Export functionality
- Date range selection

### E2E Tests
- Complete user flows
- Cross-browser testing
- Mobile responsiveness
- Performance benchmarks

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Custom Dashboards**: Drag-and-drop builder
3. **Advanced Filters**: Multi-dimensional filtering
4. **Saved Views**: User-defined report templates
5. **Scheduled Reports**: Automated delivery
6. **Collaborative Features**: Shared dashboards
7. **AI Insights**: Automated recommendations
8. **Predictive Analytics**: ML-based forecasting
