# 开机自启动功能说明

## 功能概述

为 CC Switch 应用添加了开机自启动功能，用户可以在设置界面中启用或禁用该功能。

## 实现细节

### 后端实现 (Rust)

1. **依赖添加** (`src-tauri/Cargo.toml`)
   - 添加了 `tauri-plugin-autostart = "2"` 依赖

2. **插件注册** (`src-tauri/src/lib.rs`)
   - 在 Tauri 应用中注册了 autostart 插件
   - 配置了启动参数 `--minimized`，使应用在开机启动时最小化到托盘

3. **设置结构更新** (`src-tauri/src/settings.rs`)
   - 在 `AppSettings` 结构中添加了 `auto_start: bool` 字段
   - 默认值为 `false`（不自动启动）

4. **命令实现** (`src-tauri/src/commands.rs`)
   - 添加了 `tauri_plugin_autostart::ManagerExt` trait 导入
   - 更新了 `save_settings` 命令，在保存设置时自动处理开机自启动的启用/禁用
   - 添加了 `get_autostart_status` 命令：获取当前自启动状态
   - 添加了 `set_autostart` 命令：设置开机自启动

### 前端实现 (TypeScript/React)

1. **类型定义更新** (`src/types.ts`)
   - 在 `Settings` 接口中添加了 `autoStart: boolean` 字段

2. **API 封装** (`src/lib/tauri-api.ts`)
   - 在 `getSettings` 的默认返回值中添加了 `autoStart: false`
   - 添加了 `getAutostartStatus` API：获取开机自启动状态
   - 添加了 `setAutostart` API：设置开机自启动
   - 添加了缺失的 `selectConfigDirectory`、`getConfigDir` 和 `isPortable` API

3. **设置界面更新** (`src/components/SettingsModal.tsx`)
   - 在"窗口行为"部分添加了"开机自启动"开关
   - 加载设置时会读取 `autoStart` 字段
   - 保存设置时会将 `autoStart` 状态传递到后端

4. **国际化文本** (`src/i18n/locales/`)
   - **中文** (`zh.json`)
     - `settings.autoStart`: "开机自启动"
     - `settings.autoStartDescription`: "勾选后应用会在系统启动时自动运行（后台启动）。"
   - **英文** (`en.json`)
     - `settings.autoStart`: "Launch at startup"
     - `settings.autoStartDescription`: "When checked, the application will automatically start when your system boots (launches in background)."

## 使用方法

1. 打开应用设置界面
2. 在"窗口行为"部分找到"开机自启动"选项
3. 勾选复选框启用开机自启动，取消勾选则禁用
4. 点击"保存"按钮应用设置

## 技术特点

- **跨平台支持**：使用 Tauri 官方插件，支持 Windows、macOS 和 Linux
- **后台启动**：配置了 `--minimized` 参数，开机启动时应用会最小化到系统托盘
- **自动同步**：保存设置时自动处理系统层面的自启动配置
- **状态一致**：设置界面中的开关状态与系统实际配置保持同步

## 注意事项

- macOS 使用 LaunchAgent 机制实现自启动
- Windows 使用注册表机制实现自启动
- Linux 使用 .desktop 文件机制实现自启动
- 开机启动时应用会自动最小化到托盘，不会显示主窗口

