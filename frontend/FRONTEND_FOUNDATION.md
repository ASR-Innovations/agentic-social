# Frontend Foundation Documentation

## Overview

The frontend foundation for the AI Social Media Platform has been successfully implemented using Next.js 14 with the App Router, providing a modern, performant, and scalable architecture.

## Technology Stack

### Core Framework
- **Next.js 14**: React framework with App Router for server-side rendering and static site generation
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development with full type coverage

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Shadcn/ui**: High-quality, accessible component library built on Radix UI
- **Framer Motion**: Animation library for smooth transitions and interactions
- **Lucide React**: Beautiful, consistent icon set

### State Management
- **Zustand**: Lightweight state management with persistence
  - `useAuthStore`: Authentication state (user, tenant, login/logout)
  - `useUIStore`: UI preferences (theme, sidebar, modals, mobile detection)

### Data Fetching
- **TanStack Query (React Query)**: Powerful data synchronization and caching
  - Configured with 1-minute stale time
  - 5-minute garbage collection
  - Automatic retry logic
  - React Query DevTools in development

### API Client
- **Axios**: HTTP client with interceptors for auth and error handling
- Centralized API client in `src/lib/api.ts`
- Automatic token management
- Request/response interceptors
- Error handling with toast notifications

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── app/                  # Protected app routes
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── content/          # Content calendar
│   │   │   ├── ai-hub/           # AI Hub
│   │   │   ├── analytics/        # Analytics
│   │   │   ├── inbox/            # Unified inbox
│   │   │   ├── listening/        # Social listening
│   │   │   ├── media/            # Media library
│   │   │   ├── team/             # Team management
│   │   │   ├── settings/         # Settings
│   │   │   └── layout.tsx        # Protected layout with sidebar
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/               # React components
│   │   ├── auth/                 # Authentication components
│   │   │   └── protected-route.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── app-header.tsx
│   │   │   └── app-sidebar.tsx
│   │   ├── ui/                   # Shadcn/ui components
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── input.tsx
│   │   ├── providers.tsx         # App providers wrapper
│   │   └── theme-toggle.tsx      # Theme switcher
│   ├── hooks/                    # Custom React hooks
│   │   └── useApi.ts
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client
│   │   └── utils.ts              # Helper functions
│   ├── store/                    # Zustand stores
│   │   ├── auth.ts               # Authentication store
│   │   └── ui.ts                 # UI preferences store
│   ├── styles/                   # Global styles
│   │   └── globals.css           # Tailwind + custom CSS
│   └── types/                    # TypeScript types
│       ├── index.ts              # Core types
│       ├── api.ts                # API types
│       └── components.ts         # Component types
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Key Features Implemented

### 1. Authentication System

#### Protected Routes
- `ProtectedRoute` component wraps authenticated pages
- Automatic redirect to login for unauthenticated users
- Stores intended destination for post-login redirect
- Loading state during authentication check

#### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}
```

#### Features:
- JWT token management
- Automatic token refresh
- Persistent auth state (localStorage)
- Profile refresh on app load
- Error handling with user feedback

### 2. Base Layout with Navigation

#### App Header
- Responsive design (mobile/tablet/desktop)
- Search bar (desktop only)
- Theme toggle
- Notifications dropdown
- User menu with profile, settings, logout
- Mobile menu toggle

#### App Sidebar
- Collapsible sidebar (desktop)
- Mobile overlay with backdrop
- Active route highlighting
- Navigation items:
  - Dashboard
  - Content Calendar
  - AI Hub (with AI badge)
  - Analytics
  - Inbox (with unread count)
  - Listening
  - Media Library
  - Team
  - Settings
- AI credits display
- Tooltips for collapsed state

### 3. Responsive Design System

#### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

#### Features:
- Mobile-first approach
- Touch device detection
- Device type detection (mobile/tablet/desktop)
- Responsive sidebar behavior
- Adaptive layouts

#### CSS Utilities
- Glass morphism effects (`.glass`, `.glass-card`)
- Gradient backgrounds (`.gradient-primary`, `.gradient-secondary`)
- Glow effects (`.glow-primary`)
- Text gradients (`.text-gradient-primary`)
- Loading states (`.skeleton`, `.shimmer`)
- Interactive elements (`.interactive`)
- Focus rings (`.focus-ring`)

### 4. Theme System

#### Modes
- Light mode
- Dark mode
- Auto (system preference)

#### Features:
- Persistent theme preference
- Smooth transitions
- CSS variables for colors
- Tailwind dark mode support
- Theme toggle component

### 5. UI Components (Shadcn/ui)

Implemented components:
- **Avatar**: User profile pictures with fallback
- **Badge**: Status indicators and labels
- **Button**: Multiple variants (primary, secondary, ghost, danger)
- **Card**: Container component with header/content
- **Dropdown Menu**: Context menus and dropdowns
- **Input**: Form input with validation support

### 6. API Client

#### Features:
- Centralized HTTP client
- Request interceptors (auth token, tenant ID)
- Response interceptors (error handling)
- Automatic token management
- Toast notifications for errors
- Type-safe endpoints

#### Endpoints Implemented:
- Authentication (login, register, logout, profile)
- Posts (CRUD operations)
- Media (upload, delete, library)
- Analytics (overview, platform-specific)
- AI (generate, agents, usage)
- Social accounts (connect, disconnect)
- Inbox (conversations, messages)
- Team (members, invites)
- Settings
- Webhooks
- Notifications

### 7. State Management

#### Auth Store
- User authentication state
- Tenant information
- Login/logout actions
- Profile refresh
- Error handling

#### UI Store
- Theme preferences
- Sidebar state
- Command palette
- Dashboard widgets
- Notification preferences
- Loading states
- Modal management
- Mobile detection
- Language and timezone

### 8. Utility Functions

Comprehensive utility library including:
- Date formatting (relative, absolute)
- Number formatting (K, M suffixes)
- Currency formatting
- Text truncation
- Debounce/throttle
- Email/URL validation
- Clipboard operations
- File operations
- Image compression
- Device detection
- Browser detection

## Environment Variables

Required environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Performance Optimizations

### Next.js Optimizations
- App Router for improved performance
- Automatic code splitting
- Image optimization
- Font optimization (Google Fonts)
- Static generation where possible
- Server components by default

### React Query Configuration
- 1-minute stale time
- 5-minute cache time
- Automatic retry (1 attempt)
- No refetch on window focus
- DevTools in development only

### CSS Optimizations
- Tailwind CSS purging
- Custom scrollbar styling
- Optimized animations
- Reduced motion support

### Bundle Optimizations
- SWC minification
- Tree shaking
- Dynamic imports for heavy components
- Optimized package imports (lucide-react, framer-motion)

## Accessibility

### Features Implemented
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance
- Reduced motion support

### Best Practices
- Focus rings on interactive elements
- Proper heading hierarchy
- Alt text for images
- Form labels and validation
- Skip links (to be added)

## Security

### Implemented Measures
- JWT token storage in localStorage
- Automatic token refresh
- HTTPS enforcement (production)
- XSS protection headers
- CSRF protection
- Content Security Policy headers
- Secure cookie settings

### Best Practices
- No sensitive data in client-side code
- API key management via environment variables
- Input validation
- Output encoding
- Rate limiting (API level)

## Browser Support

### Supported Browsers
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Progressive Enhancement
- Core functionality works without JavaScript
- Graceful degradation for older browsers
- Polyfills for missing features

## Mobile Support

### Features
- Responsive design
- Touch-friendly interactions
- Mobile-optimized navigation
- Swipe gestures (to be added)
- PWA support (configured)
- Offline support (to be added)

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing
- Utility function testing

### Integration Tests
- API integration tests
- Authentication flow tests
- Navigation tests

### E2E Tests
- User journey tests with Playwright
- Critical path testing
- Cross-browser testing

## Future Enhancements

### Planned Features
1. Command palette (Cmd+K)
2. Keyboard shortcuts
3. Drag-and-drop file uploads
4. Real-time updates (WebSocket)
5. Offline support
6. Push notifications
7. Advanced search
8. Bulk operations
9. Export functionality
10. Internationalization (i18n)

### Performance Improvements
1. Service worker for caching
2. Lazy loading for images
3. Virtual scrolling for large lists
4. Code splitting optimization
5. Bundle size reduction

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Type Errors
```bash
# Run type check
npm run type-check

# Regenerate types
npm run generate-types
```

#### Style Issues
```bash
# Rebuild Tailwind
npm run build:css
```

## Contributing

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Component Guidelines
- Use functional components
- Implement proper TypeScript types
- Add prop validation
- Include error boundaries
- Write unit tests
- Document props and usage

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Conclusion

The frontend foundation is now complete with:
✅ Next.js 14 with App Router
✅ Tailwind CSS and Shadcn/ui components
✅ TanStack Query for data fetching
✅ Zustand for state management
✅ Authentication context and protected routes
✅ Base layout with navigation (header + sidebar)
✅ Responsive design system
✅ Comprehensive type system
✅ API client with error handling
✅ Theme system (light/dark)
✅ Utility functions
✅ Performance optimizations

The foundation is ready for building out the individual feature pages (Dashboard, Content Calendar, AI Hub, etc.).
