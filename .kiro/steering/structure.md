# Project Structure

## Root Directory
```
inventory-app/
├── src/                 # Source code
├── static/              # Static assets (favicon, images)
├── .svelte-kit/         # Generated SvelteKit files
├── node_modules/        # Dependencies
└── package.json         # Project configuration
```

## Source Directory (`src/`)
```
src/
├── routes/              # SvelteKit routes (pages)
│   ├── +layout.svelte   # Root layout component
│   └── +page.svelte     # Homepage component
├── lib/                 # Reusable components and utilities
│   └── index.js         # Library exports
├── app.html             # HTML template
└── app.css              # Global styles
```

## Key Conventions

### File Naming
- **Routes**: Use `+page.svelte` for pages, `+layout.svelte` for layouts
- **Components**: PascalCase for component files (e.g., `InventoryItem.svelte`)
- **Utilities**: camelCase for JavaScript files (e.g., `apiHelpers.js`)

### Import Aliases
- `$lib` - Points to `src/lib/` directory
- `$app` - SvelteKit app utilities
- Standard relative imports for local files

### Component Organization
- **Pages**: Place in `src/routes/` following SvelteKit routing
- **Reusable Components**: Place in `src/lib/components/`
- **Utilities**: Place in `src/lib/utils/`
- **Stores**: Place in `src/lib/stores/`

### Static Assets
- Place in `static/` directory
- Reference with absolute paths (e.g., `/favicon.svg`)
- Excluded from Prettier formatting

### Configuration Files
- **Prettier**: `.prettierrc` with tabs, single quotes, no trailing commas
- **Svelte**: `svelte.config.js` with Vercel adapter
- **Vite**: `vite.config.js` with Tailwind and SvelteKit plugins
- **JavaScript**: `jsconfig.json` extends SvelteKit TypeScript config