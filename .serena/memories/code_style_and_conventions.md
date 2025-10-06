# Code Style and Conventions

## TypeScript/React Conventions
- **Strict TypeScript**: Enabled with strict mode, noUnusedLocals, noUnusedParameters
- **Target**: ES2020 with DOM libraries
- **Module Resolution**: Bundler mode with allowImportingTsExtensions
- **JSX**: react-jsx transform
- **Component Naming**: PascalCase for components, camelCase for functions/variables
- **File Extensions**: .tsx for React components, .ts for utilities

## Code Formatting
- **Prettier**: Used for code formatting
- **Format Pattern**: `"src/**/*.{js,jsx,ts,tsx,css,json}"`
- **Automatic Formatting**: Use `pnpm format` to format all code

## Project Structure Conventions
```
src/
├── components/          # React components (PascalCase)
│   ├── ComponentName.tsx
│   └── ComponentName/   # Component with subcomponents
├── config/              # Configuration files and presets
├── contexts/            # React contexts
├── hooks/               # Custom React hooks (useHookName)
├── lib/                 # Library code and API wrappers
├── utils/               # Utility functions
└── types.ts             # TypeScript type definitions
```

## Rust Conventions
- **Edition**: 2021
- **Minimum Rust Version**: 1.85.0
- **Formatting**: Use `cargo fmt`
- **Linting**: Use `cargo clippy`
- **File Structure**: Modular approach with separate files for different concerns
  - `commands.rs`: Tauri command handlers
  - `config.rs`: Configuration management
  - `provider.rs`: Provider logic
  - `store.rs`: State management

## Import/Module Conventions
- **Tauri API**: Import from `@tauri-apps/api`
- **React**: Use functional components with hooks
- **Utility Imports**: Relative imports for local utilities
- **Type Imports**: Use type-only imports where appropriate

## Naming Conventions
- **Files**: kebab-case for utilities, PascalCase for components
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **CSS Classes**: Use Tailwind utility classes