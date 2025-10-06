# Suggested Commands

## Development Commands

### Setup
```bash
# Install dependencies
pnpm install
```

### Development
```bash
# Start development server with hot reload
pnpm dev

# Start only the frontend renderer
pnpm dev:renderer
```

### Code Quality
```bash
# Type checking
pnpm typecheck

# Format code
pnpm format

# Check code formatting
pnpm format:check
```

### Building
```bash
# Build production application
pnpm build

# Build renderer only
pnpm build:renderer

# Build debug version
pnpm tauri build --debug
```

### Tauri Commands
```bash
# Run tauri commands directly
pnpm tauri

# Other tauri-specific commands
pnpm tauri dev
pnpm tauri build
```

## Rust Backend Commands

```bash
cd src-tauri

# Format Rust code
cargo fmt

# Run clippy linting
cargo clippy

# Run tests
cargo test

# Check compilation without building
cargo check
```

## Platform-Specific Notes
- **Windows**: Use PowerShell or Command Prompt
- **macOS/Linux**: Use bash/zsh terminal
- All commands should work cross-platform via pnpm scripts