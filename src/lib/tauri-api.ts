import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Provider, Settings, McpConfigResponse, McpServer } from "../types";

// 应用类型
export type AppType = "claude" | "codex";

// 定义配置状态类型
interface ConfigStatus {
  exists: boolean;
  path: string;
  error?: string;
}

// 定义导入结果类型
interface ImportResult {
  success: boolean;
  message?: string;
}

// Tauri API 封装，提供统一的全局 API 接口
export const tauriAPI = {
  // 获取所有供应商
  getProviders: async (app?: AppType): Promise<Record<string, Provider>> => {
    try {
      return await invoke("get_providers", { app_type: app, app });
    } catch (error) {
      console.error("获取供应商列表失败:", error);
      return {};
    }
  },

  // 获取当前供应商ID
  getCurrentProvider: async (app?: AppType): Promise<string> => {
    try {
      return await invoke("get_current_provider", { app_type: app, app });
    } catch (error) {
      console.error("获取当前供应商失败:", error);
      return "";
    }
  },

  // 添加供应商
  addProvider: async (provider: Provider, app?: AppType): Promise<boolean> => {
    try {
      return await invoke("add_provider", { provider, app_type: app, app });
    } catch (error) {
      console.error("添加供应商失败:", error);
      throw error;
    }
  },

  // 更新供应商
  updateProvider: async (
    provider: Provider,
    app?: AppType,
  ): Promise<boolean> => {
    try {
      return await invoke("update_provider", { provider, app_type: app, app });
    } catch (error) {
      console.error("更新供应商失败:", error);
      throw error;
    }
  },

  // 删除供应商
  deleteProvider: async (id: string, app?: AppType): Promise<boolean> => {
    try {
      return await invoke("delete_provider", { id, app_type: app, app });
    } catch (error) {
      console.error("删除供应商失败:", error);
      throw error;
    }
  },

  // 切换供应商
  switchProvider: async (
    providerId: string,
    app?: AppType,
  ): Promise<boolean> => {
    try {
      return await invoke("switch_provider", {
        id: providerId,
        app_type: app,
        app,
      });
    } catch (error) {
      console.error("切换供应商失败:", error);
      return false;
    }
  },

  // 停用当前供应商
  disableCurrentProvider: async (app?: AppType): Promise<boolean> => {
    try {
      return await invoke("disable_current_provider", { app_type: app, app });
    } catch (error) {
      console.error("停用当前供应商失败:", error);
      throw error;
    }
  },

  // 导入当前配置为默认供应商
  importCurrentConfigAsDefault: async (
    app?: AppType,
  ): Promise<ImportResult> => {
    try {
      const success = await invoke<boolean>("import_default_config", {
        app_type: app,
        app,
      });
      return {
        success,
        message: success ? "成功导入默认配置" : "导入失败",
      };
    } catch (error) {
      console.error("导入默认配置失败:", error);
      return {
        success: false,
        message: String(error),
      };
    }
  },

  // 获取 Claude Code 配置文件路径
  getClaudeCodeConfigPath: async (): Promise<string> => {
    try {
      return await invoke("get_claude_code_config_path");
    } catch (error) {
      console.error("获取配置路径失败:", error);
      return "";
    }
  },

  // 获取 Claude Code 配置状态
  getClaudeConfigStatus: async (): Promise<ConfigStatus> => {
    try {
      return await invoke("get_claude_config_status");
    } catch (error) {
      console.error("获取配置状态失败:", error);
      return {
        exists: false,
        path: "",
        error: String(error),
      };
    }
  },

  // 获取应用配置状态（通用）
  getConfigStatus: async (app?: AppType): Promise<ConfigStatus> => {
    try {
      return await invoke("get_config_status", { app_type: app, app });
    } catch (error) {
      console.error("获取配置状态失败:", error);
      return {
        exists: false,
        path: "",
        error: String(error),
      };
    }
  },

  // 打开配置文件夹
  openConfigFolder: async (app?: AppType): Promise<void> => {
    try {
      await invoke("open_config_folder", { app_type: app, app });
    } catch (error) {
      console.error("打开配置文件夹失败:", error);
    }
  },

  // 打开外部链接
  openExternal: async (url: string): Promise<void> => {
    try {
      await invoke("open_external", { url });
    } catch (error) {
      console.error("打开外部链接失败:", error);
    }
  },

  // 更新托盘菜单
  updateTrayMenu: async (): Promise<boolean> => {
    try {
      return await invoke("update_tray_menu");
    } catch (error) {
      console.error("更新托盘菜单失败:", error);
      return false;
    }
  },

  // 监听供应商切换事件
  onProviderSwitched: async (
    callback: (data: { appType: string; providerId: string }) => void,
  ): Promise<UnlistenFn> => {
    return await listen("provider-switched", (event) => {
      callback(event.payload as { appType: string; providerId: string });
    });
  },

  // （保留空位，取消迁移提示）

  // 选择配置文件（Tauri 暂不实现，保留接口兼容性）
  selectConfigFile: async (): Promise<string | null> => {
    console.warn("selectConfigFile 在 Tauri 版本中暂不支持");
    return null;
  },

  // 获取设置
  getSettings: async (): Promise<Settings> => {
    try {
      return await invoke("get_settings");
    } catch (error) {
      console.error("获取设置失败:", error);
      return {
        showInTray: true,
        minimizeToTrayOnClose: false,
        language: "zh",
      };
    }
  },

  // 保存设置
  saveSettings: async (settings: Settings): Promise<boolean> => {
    try {
      return await invoke("save_settings", { settings });
    } catch (error) {
      console.error("保存设置失败:", error);
      return false;
    }
  },

  // 检查更新
  checkForUpdates: async (): Promise<void> => {
    try {
      await invoke("check_for_updates");
    } catch (error) {
      console.error("检查更新失败:", error);
    }
  },

  // 获取应用配置文件路径
  getAppConfigPath: async (): Promise<string> => {
    try {
      return await invoke("get_app_config_path");
    } catch (error) {
      console.error("获取应用配置路径失败:", error);
      return "";
    }
  },

  // 打开应用配置文件夹
  openAppConfigFolder: async (): Promise<void> => {
    try {
      await invoke("open_app_config_folder");
    } catch (error) {
      console.error("打开应用配置文件夹失败:", error);
    }
  },

  // VS Code: 获取 settings.json 状态
  getVSCodeSettingsStatus: async (): Promise<{
    exists: boolean;
    path: string;
    error?: string;
  }> => {
    try {
      return await invoke("get_vscode_settings_status");
    } catch (error) {
      console.error("获取 VS Code 设置状态失败:", error);
      return { exists: false, path: "", error: String(error) };
    }
  },

  // VS Code: 读取 settings.json 文本
  readVSCodeSettings: async (): Promise<string> => {
    try {
      return await invoke("read_vscode_settings");
    } catch (error) {
      throw new Error(`读取 VS Code 设置失败: ${String(error)}`);
    }
  },

  // VS Code: 写回 settings.json 文本（不自动创建）
  writeVSCodeSettings: async (content: string): Promise<boolean> => {
    try {
      return await invoke("write_vscode_settings", { content });
    } catch (error) {
      throw new Error(`写入 VS Code 设置失败: ${String(error)}`);
    }
  },

  // 获取当前 Claude settings.json 的完整内容
  getCurrentClaudeSettings: async (): Promise<any> => {
    try {
      return await invoke("get_current_claude_settings");
    } catch (error) {
      throw new Error(`获取 Claude 配置失败: ${String(error)}`);
    }
  },

  // 同步当前供应商配置（从 live settings.json 回填）
  syncCurrentProviderConfig: async (app?: AppType): Promise<boolean> => {
    try {
      return await invoke("sync_current_provider_config", {
        app_type: app,
        app,
      });
    } catch (error) {
      throw new Error(`同步供应商配置失败: ${String(error)}`);
    }
  },

  // ========== MCP 相关 API ==========

  // 获取 MCP 配置
  getMcpConfig: async (app?: AppType): Promise<McpConfigResponse> => {
    try {
      return await invoke("get_mcp_config", { app_type: app, app });
    } catch (error) {
      console.error("获取 MCP 配置失败:", error);
      throw error;
    }
  },

  // 添加或更新 MCP 服务器
  upsertMcpServerInConfig: async (
    app: AppType,
    id: string,
    server: McpServer,
  ): Promise<boolean> => {
    try {
      return await invoke("upsert_mcp_server_in_config", {
        app_type: app,
        app,
        id,
        server,
      });
    } catch (error) {
      console.error("添加/更新 MCP 服务器失败:", error);
      throw error;
    }
  },

  // 删除 MCP 服务器
  deleteMcpServerInConfig: async (
    app: AppType,
    id: string,
  ): Promise<boolean> => {
    try {
      return await invoke("delete_mcp_server_in_config", {
        app_type: app,
        app,
        id,
      });
    } catch (error) {
      console.error("删除 MCP 服务器失败:", error);
      throw error;
    }
  },

  // 设置 MCP 服务器启用状态
  setMcpEnabled: async (
    app: AppType,
    id: string,
    enabled: boolean,
  ): Promise<boolean> => {
    try {
      return await invoke("set_mcp_enabled", {
        app_type: app,
        app,
        id,
        enabled,
      });
    } catch (error) {
      console.error("设置 MCP 启用状态失败:", error);
      throw error;
    }
  },

  // 从 Claude 导入 MCP 配置
  importMcpFromClaude: async (): Promise<boolean> => {
    try {
      return await invoke("import_mcp_from_claude");
    } catch (error) {
      console.error("从 Claude 导入 MCP 失败:", error);
      throw error;
    }
  },

  // 从 Codex 导入 MCP 配置
  importMcpFromCodex: async (): Promise<boolean> => {
    try {
      return await invoke("import_mcp_from_codex");
    } catch (error) {
      console.error("从 Codex 导入 MCP 失败:", error);
      throw error;
    }
  },

  // 同步已启用的 MCP 到 Claude
  syncEnabledMcpToClaude: async (): Promise<boolean> => {
    try {
      return await invoke("sync_enabled_mcp_to_claude");
    } catch (error) {
      console.error("同步 MCP 到 Claude 失败:", error);
      throw error;
    }
  },

  // 同步已启用的 MCP 到 Codex
  syncEnabledMcpToCodex: async (): Promise<boolean> => {
    try {
      return await invoke("sync_enabled_mcp_to_codex");
    } catch (error) {
      console.error("同步 MCP 到 Codex 失败:", error);
      throw error;
    }
  },

  // v3.5.1: 检查 MCP 双端同步冲突
  checkMcpSyncConflict: async (app: AppType, id: string): Promise<boolean> => {
    try {
      return await invoke("check_mcp_sync_conflict", { app, id });
    } catch (error) {
      console.error("检查 MCP 同步冲突失败:", error);
      throw error;
    }
  },

  // v3.5.1: 同步 MCP 到另一应用
  syncMcpToOtherApp: async (
    app: AppType,
    id: string,
    overwrite: boolean,
  ): Promise<boolean> => {
    try {
      return await invoke("sync_mcp_to_other_app", { app, id, overwrite });
    } catch (error) {
      console.error("同步 MCP 到另一应用失败:", error);
      throw error;
    }
  },
};

// 创建全局 API 对象，兼容现有代码
if (typeof window !== "undefined") {
  // 绑定到 window.api，避免 Electron 命名造成误解
  // API 内部已做 try/catch，非 Tauri 环境下也会安全返回默认值
  (window as any).api = tauriAPI;
}

export default tauriAPI;
