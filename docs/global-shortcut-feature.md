# 全局快捷键功能说明

## 功能概述

为 CC Switch 应用添加了全局快捷键功能，用户可以自定义组合按键来快速显示或隐藏主窗口，无需点击托盘图标即可操作应用。

## 实现细节

### 后端实现 (Rust)

1. **依赖添加** (`src-tauri/Cargo.toml`)
   - 添加了 `tauri-plugin-global-shortcut = "2"` 依赖

2. **插件注册** (`src-tauri/src/lib.rs`)
   - 注册了 global-shortcut 插件
   - 应用启动时自动读取设置并注册快捷键
   - 快捷键触发时调用 `toggle_main_window` 函数切换窗口显示状态
   - 添加了 `toggle_main_window` 辅助函数处理窗口显示/隐藏逻辑

3. **设置结构更新** (`src-tauri/src/settings.rs`)
   - 在 `AppSettings` 结构中添加了 `global_shortcut: Option<String>` 字段
   - 默认值为 `None`（不使用快捷键）
   - 在 `normalize_paths` 中添加了快捷键字符串的规范化处理

4. **命令实现** (`src-tauri/src/commands.rs`)
   - 导入了必要的 traits：`Manager`、`GlobalShortcutExt`、`Shortcut`、`FromStr`
   - 更新了 `save_settings` 命令：
     - 检测快捷键变化
     - 自动注销旧快捷键
     - 注册新快捷键
     - 验证快捷键格式
   - 添加了 `register_global_shortcut` 命令：注册全局快捷键
   - 添加了 `unregister_global_shortcut` 命令：注销全局快捷键
   - 添加了 `validate_global_shortcut` 命令：验证快捷键格式是否有效

### 前端实现 (TypeScript/React)

1. **类型定义更新** (`src/types.ts`)
   - 在 `Settings` 接口中添加了 `globalShortcut?: string` 字段

2. **API 封装** (`src/lib/tauri-api.ts`)
   - 在 `getSettings` 的默认返回值中添加了 `globalShortcut: undefined`
   - 添加了 `registerGlobalShortcut` API：注册全局快捷键
   - 添加了 `unregisterGlobalShortcut` API：注销全局快捷键
   - 添加了 `validateGlobalShortcut` API：验证快捷键

3. **设置界面更新** (`src/components/SettingsModal.tsx`)
   - 在"窗口行为"部分后添加了"全局快捷键"设置区域
   - 包含输入框用于输入快捷键
   - 提供详细的说明和示例
   - 加载和保存设置时处理 `globalShortcut` 字段

4. **国际化文本** (`src/i18n/locales/`)
   - **中文** (`zh.json`)
     - `settings.globalShortcut`: "全局快捷键"
     - `settings.globalShortcutPlaceholder`: "例如：CommandOrControl+Shift+C"
     - `settings.globalShortcutDescription`: "设置一个全局快捷键来显示或隐藏主窗口。留空则不使用快捷键。"
     - `settings.globalShortcutExamples`: "示例：CommandOrControl+Shift+C（Mac用Command，Windows/Linux用Ctrl）、Alt+Space、CmdOrCtrl+\`"
   - **英文** (`en.json`)
     - `settings.globalShortcut`: "Global Shortcut"
     - `settings.globalShortcutPlaceholder`: "e.g., CommandOrControl+Shift+C"
     - `settings.globalShortcutDescription`: "Set a global keyboard shortcut to show or hide the main window. Leave blank to disable."
     - `settings.globalShortcutExamples`: "Examples: CommandOrControl+Shift+C (Command on Mac, Ctrl on Windows/Linux), Alt+Space, CmdOrCtrl+\`"

## 使用方法

1. 打开应用设置界面
2. 找到"全局快捷键"设置区域
3. 在输入框中输入快捷键组合，例如：
   - `CommandOrControl+Shift+C`
   - `Alt+Space`
   - `CmdOrCtrl+\``
4. 点击"保存"按钮应用设置
5. 在系统任意位置按下设置的快捷键即可显示/隐藏主窗口

## 快捷键格式说明

### 修饰键（Modifiers）

- `Command` 或 `Cmd` - macOS 的 Command 键
- `Control` 或 `Ctrl` - 所有平台的 Control 键
- `CommandOrControl` 或 `CmdOrCtrl` - macOS 上的 Command，其他平台的 Ctrl（推荐）
- `Alt` 或 `Option` - Alt/Option 键
- `Shift` - Shift 键
- `Super` - Windows 键（Windows/Linux）

### 普通键

- 字母键：`A` 到 `Z`
- 数字键：`0` 到 `9`
- 功能键：`F1` 到 `F24`
- 特殊键：`Space`、`Tab`、`Escape`、`Enter` 等
- 符号键：`` ` ``、`-`、`=`、`[`、`]`、`\`、`;`、`'`、`,`、`.`、`/` 等

### 组合格式

使用 `+` 连接多个按键，例如：
- `CommandOrControl+Shift+C` - Ctrl/Cmd + Shift + C
- `Alt+Space` - Alt + 空格
- `Control+Shift+F1` - Ctrl + Shift + F1

## 技术特点

1. **跨平台支持**：使用 Tauri 官方插件，自动适配不同操作系统
2. **智能跨平台映射**：使用 `CommandOrControl` 自动匹配 macOS 的 Command 和 Windows/Linux 的 Ctrl
3. **格式验证**：前后端都进行快捷键格式验证，避免无效输入
4. **动态更新**：修改快捷键后自动注销旧快捷键并注册新快捷键
5. **窗口状态切换**：按快捷键自动切换窗口显示/隐藏状态
6. **任务栏集成**：隐藏时自动从任务栏移除（Windows），显示时恢复

## 注意事项

### 快捷键冲突

- 系统会自动检测快捷键是否已被占用
- 如果快捷键注册失败，请尝试其他组合
- 避免使用系统保留的快捷键（如 Ctrl+Alt+Delete）

### 平台差异

- **macOS**：建议使用 `CommandOrControl` 而不是 `Command`，保证跨平台兼容
- **Windows**：某些快捷键可能被系统或其他应用占用
- **Linux**：快捷键支持取决于桌面环境

### 禁用快捷键

- 将输入框清空后保存，即可禁用全局快捷键功能
- 禁用后仍可通过托盘图标操作窗口

## 示例配置

### 推荐配置

1. **类 VS Code 风格**：`CommandOrControl+Shift+C`
2. **类 Spotlight 风格**：`CommandOrControl+Space`（注意可能与系统冲突）
3. **Alt 风格**：`Alt+\`` 或 `Alt+C`
4. **自定义功能键**：`F12` 或 `Control+F12`

### 不推荐配置

1. ❌ 单个修饰键（如只有 `Shift`）
2. ❌ 系统快捷键（如 `Control+Alt+Delete`）
3. ❌ 常用应用快捷键（如 `Control+C`、`Control+V`）
4. ❌ 浏览器快捷键（如 `Control+T`、`Control+W`）

## 故障排查

### 快捷键不生效

1. 检查快捷键格式是否正确
2. 确认快捷键没有被其他应用占用
3. 重新设置快捷键并保存
4. 重启应用

### 格式错误

- 确保使用 `+` 连接按键
- 修饰键在前，普通键在后
- 按键名称大小写正确
- 参考示例配置

### 平台特定问题

- **macOS**：检查系统偏好设置中的快捷键设置
- **Windows**：检查是否有其他应用占用快捷键
- **Linux**：某些桌面环境可能有额外限制

