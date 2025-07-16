# Technology Stack

## Core Framework
- **SvelteKit**: Full-stack web framework with SSR/SSG capabilities
- **Svelte 5**: Latest version of the reactive UI framework
- **Vite**: Build tool and development server

## Database & Backend
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Real-time subscriptions**: Live data updates
- **Authentication**: Built-in user management
- **Row Level Security**: Database-level access control

## Styling & UI
- **Tailwind CSS 4.0**: Utility-first CSS framework
- **Tailwind Plugins**: Forms, Typography, and Vite integration
- **Responsive Design**: Mobile-first approach

## Development Tools
- **Prettier**: Code formatting with Svelte and Tailwind plugins
- **JavaScript**: ES modules with modern syntax
- **JSConfig**: JavaScript configuration for better IDE support

## Deployment
- **Vercel Adapter**: Optimized for Vercel platform deployment
- **Static Generation**: Pre-rendered pages for performance

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run dev -- --open  # Start dev server and open browser
```

### Build & Deploy
```bash
npm run build        # Create production build
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run format       # Format code with Prettier
npm run lint         # Check code formatting
```

### Setup
```bash
npm install          # Install dependencies
npm run prepare      # Sync SvelteKit configuration
```