# Project Overview

## Purpose
CC-Switch is a desktop application for managing and switching between different provider configurations for Claude Code and Codex. It allows users to quickly switch between different API providers (official, custom, third-party) without manually editing configuration files.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Rust + Tauri 2.0
- **UI**: TailwindCSS v4
- **Code Editor**: CodeMirror 6
- **Package Manager**: pnpm
- **Build Tool**: Tauri CLI 2.0

## Key Features
- Single Source of Truth (SSOT) configuration management
- System tray integration for quick switching
- Built-in updater
- Atomic file operations with rollback
- Dark mode support
- Cross-platform (Windows, macOS, Linux)
- Provider presets for popular services (Qwen, Kimi, GLM, DeepSeek, etc.)

## Application Architecture
- Frontend handles UI and user interactions
- Tauri backend manages file operations, system integration, and provider switching
- Configuration stored in `~/.cc-switch/config.json`
- Live configurations written to app-specific files:
  - Claude Code: `~/.claude/settings.json`
  - Codex: `~/.codex/auth.json` + `config.toml`