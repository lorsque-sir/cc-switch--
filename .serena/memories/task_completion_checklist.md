# Task Completion Checklist

## Before Committing Changes

### Code Quality Checks
1. **Type Check**: Run `pnpm typecheck` to ensure no TypeScript errors
2. **Format Code**: Run `pnpm format` to ensure consistent formatting
3. **Format Check**: Run `pnpm format:check` to verify formatting compliance

### Rust Backend Checks (if backend changes)
1. **Format Rust**: Run `cargo fmt` in `src-tauri/` directory
2. **Lint Rust**: Run `cargo clippy` for Rust linting
3. **Test Rust**: Run `cargo test` to ensure tests pass

### Build Verification
1. **Development Build**: Ensure `pnpm dev` works without errors
2. **Production Build**: Run `pnpm build` to verify production build
3. **Cross-Platform**: Test on target platforms if possible

### Functional Testing
1. **Provider Switching**: Test switching between different providers
2. **Configuration**: Verify configuration files are correctly updated
3. **UI Functionality**: Test all UI components and interactions
4. **System Tray**: Test system tray functionality on supported platforms

### Documentation
1. **Update README**: Update if new features or changes affect usage
2. **Update CHANGELOG**: Add entry for significant changes
3. **Code Comments**: Ensure complex logic is properly commented

## Release Preparation

### Version Management
1. **Update Version**: Update version in `package.json` and `src-tauri/Cargo.toml`
2. **Update Tauri Config**: Check `src-tauri/tauri.conf.json` for version consistency
3. **Tag Release**: Create appropriate git tags

### Build Testing
1. **Debug Build**: Test `pnpm tauri build --debug`
2. **Release Build**: Test `pnpm tauri build` 
3. **Platform Testing**: Test on Windows, macOS, and Linux if possible

### Distribution
1. **Updater**: Verify updater functionality works
2. **Installer**: Test platform-specific installers (.msi, .deb, .zip)
3. **Code Signing**: Ensure proper code signing for production releases