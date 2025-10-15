/// <reference types="vite/client" />

import { Provider, Settings, McpConfigResponse, McpServer } from "./types";
import { AppType } from "./lib/tauri-api";
import type { UnlistenFn } from "@tauri-apps/api/event";

interface ImportResult {
  success: boolean;
  message?: string;
}

interface ConfigStatus {
  exists: boolean;
  path: string;
  error?: string;
}

interface EndpointLatency {
  url: string;
  latency: number | null;
  status: number | null;
  error: string | null;
}

declare global {
  interface Window {
    api: {
      getProviders: (app?: AppType) => Promise<Record<string, Provider>>;
      getCurrentProvider: (app?: AppType) => Promise<string>;
      addProvider: (provider: Provider, app?: AppType) => Promise<boolean>;
      deleteProvider: (id: string, app?: AppType) => Promise<boolean>;
      updateProvider: (provider: Provider, app?: AppType) => Promise<boolean>;
      switchProvider: (providerId: string, app?: AppType) => Promise<boolean>;
      disableCurrentProvider: (app?: AppType) => Promise<boolean>;
      importCurrentConfigAsDefault: (app?: AppType) => Promise<ImportResult>;
      getClaudeCodeConfigPath: () => Promise<string>;
      getClaudeConfigStatus: () => Promise<ConfigStatus>;
      getConfigStatus: (app?: AppType) => Promise<ConfigStatus>;
      getConfigDir: (app?: AppType) => Promise<string>;
      selectConfigDirectory: (defaultPath?: string) => Promise<string | null>;
      openConfigFolder: (app?: AppType) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      updateTrayMenu: () => Promise<boolean>;
      onProviderSwitched: (
        callback: (data: { appType: string; providerId: string }) => void,
      ) => Promise<UnlistenFn>;
      getSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<boolean>;
      checkForUpdates: () => Promise<void>;
      isPortable: () => Promise<boolean>;
      getAppConfigPath: () => Promise<string>;
      openAppConfigFolder: () => Promise<void>;
      // VS Code settings.json 能力
      getVSCodeSettingsStatus: () => Promise<ConfigStatus>;
      readVSCodeSettings: () => Promise<string>;
      writeVSCodeSettings: (content: string) => Promise<boolean>;
      // Claude 配置同步能力
      getCurrentClaudeSettings: () => Promise<any>;
      syncCurrentProviderConfig: (app?: AppType) => Promise<boolean>;
      // Claude 插件配置能力
      getClaudePluginStatus: () => Promise<ConfigStatus>;
      readClaudePluginConfig: () => Promise<string | null>;
      applyClaudePluginConfig: (options: {
        official: boolean;
      }) => Promise<boolean>;
      isClaudePluginApplied: () => Promise<boolean>;
      // MCP 管理能力
      getMcpConfig: (app?: AppType) => Promise<McpConfigResponse>;
      upsertMcpServerInConfig: (
        app: AppType,
        id: string,
        server: McpServer,
      ) => Promise<boolean>;
      deleteMcpServerInConfig: (app: AppType, id: string) => Promise<boolean>;
      setMcpEnabled: (
        app: AppType,
        id: string,
        enabled: boolean,
      ) => Promise<boolean>;
      importMcpFromClaude: () => Promise<boolean>;
      importMcpFromCodex: () => Promise<boolean>;
      syncEnabledMcpToClaude: () => Promise<boolean>;
      syncEnabledMcpToCodex: () => Promise<boolean>;
      // v3.5.1: MCP 双端同步
      checkMcpSyncConflict: (app: AppType, id: string) => Promise<boolean>;
      syncMcpToOtherApp: (
        app: AppType,
        id: string,
        overwrite: boolean,
      ) => Promise<boolean>;
      // 端点测速
      testEndpoints: (
        urls: string[],
        timeoutSecs?: number,
      ) => Promise<EndpointLatency[]>;
    };
    platform: {
      isMac: boolean;
    };
    __TAURI__?: any;
  }
}

export {};
