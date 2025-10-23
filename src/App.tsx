import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Provider } from "./types";
import { AppType } from "./lib/tauri-api";
import ProviderList from "./components/ProviderList";
import AddProviderModal from "./components/AddProviderModal";
import EditProviderModal from "./components/EditProviderModal";
import { BatchAddKeysModal } from "./components/BatchAddKeysModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { AppSwitcher } from "./components/AppSwitcher";
import SettingsModal from "./components/SettingsModal";
import { UpdateBadge } from "./components/UpdateBadge";
import { Plus, Settings, Moon, Sun, Upload } from "lucide-react";
import McpPanel from "./components/mcp/McpPanel";
import { buttonStyles } from "./lib/styles";
import { useDarkMode } from "./hooks/useDarkMode";
import { extractErrorMessage } from "./utils/errorUtils";
import { applyProviderToVSCode } from "./utils/vscodeSettings";
import { getCodexBaseUrl } from "./utils/providerConfigUtils";
import { useVSCodeAutoSync } from "./hooks/useVSCodeAutoSync";

function App() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isAutoSyncEnabled } = useVSCodeAutoSync();
  const [activeApp, setActiveApp] = useState<AppType>("claude");
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [currentProviderId, setCurrentProviderId] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchAddModalOpen, setIsBatchAddModalOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMcpOpen, setIsMcpOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 设置通知的辅助函数
  const showNotification = (
    message: string,
    type: "success" | "error",
    duration = 3000,
  ) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 立即显示通知
    setNotification({ message, type });
    setIsNotificationVisible(true);

    // 设置淡出定时器
    timeoutRef.current = setTimeout(() => {
      setIsNotificationVisible(false);
      // 等待淡出动画完成后清除通知
      setTimeout(() => {
        setNotification(null);
        timeoutRef.current = null;
      }, 300); // 与CSS动画时间匹配
    }, duration);
  };

  // 加载供应商列表
  useEffect(() => {
    loadProviders();
  }, [activeApp]); // 当切换应用时重新加载

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 监听托盘切换事件（包括菜单切换）
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      try {
        unlisten = await window.api.onProviderSwitched(async (data) => {
          if (import.meta.env.DEV) {
            console.log(t("console.providerSwitchReceived"), data);
          }

          // 如果当前应用类型匹配，则重新加载数据
          if (data.appType === activeApp) {
            await loadProviders();
          }

          // 若为 Codex 且开启自动同步，则静默同步到 VS Code（覆盖）
          if (data.appType === "codex" && isAutoSyncEnabled) {
            await syncCodexToVSCode(data.providerId, true);
          }

          if (data.appType === "claude") {
            await syncClaudePlugin(data.providerId, true);
          }
        });
      } catch (error) {
        console.error(t("console.setupListenerFailed"), error);
      }
    };

    setupListener();

    // 清理监听器
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [activeApp, isAutoSyncEnabled]);

  const loadProviders = async () => {
    console.log(`[App] 加载供应商列表，应用类型: ${activeApp}`);
    const loadedProviders = await window.api.getProviders(activeApp);
    console.log(`[App] 加载到 ${Object.keys(loadedProviders).length} 个供应商:`, loadedProviders);
    const currentId = await window.api.getCurrentProvider(activeApp);
    console.log(`[App] 当前供应商 ID: ${currentId}`);
    setProviders(loadedProviders);
    setCurrentProviderId(currentId);

    // 如果供应商列表为空，尝试自动从 live 导入一条默认供应商
    if (Object.keys(loadedProviders).length === 0) {
      await handleAutoImportDefault();
    }
  };

  // 生成唯一ID
  const generateId = () => {
    return crypto.randomUUID();
  };

  const handleAddProvider = async (provider: Omit<Provider, "id">) => {
    try {
      const newProvider: Provider = {
        ...provider,
        id: generateId(),
        createdAt: Date.now(), // 添加创建时间戳
      };
      await window.api.addProvider(newProvider, activeApp);
      await loadProviders();
      setIsAddModalOpen(false);
      // 更新托盘菜单
      await window.api.updateTrayMenu();
      // 显示成功提示
      showNotification(t("notifications.providerAdded"), "success", 2000);
    } catch (error) {
      console.error(t("console.addProviderFailed"), error);
      const errorMessage = extractErrorMessage(error);
      const message = errorMessage
        ? t("notifications.addFailed", { error: errorMessage })
        : t("notifications.addFailedGeneric");
      showNotification(message, "error", errorMessage ? 6000 : 3000);
    }
  };

  const handleBatchAddProviders = async (providers: Omit<Provider, "id">[]) => {
    try {
      let successCount = 0;
      let failCount = 0;

      for (const provider of providers) {
        try {
          const newProvider: Provider = {
            ...provider,
            id: generateId(),
            createdAt: Date.now(),
          };
          await window.api.addProvider(newProvider, activeApp);
          successCount++;
        } catch (error) {
          console.error("添加供应商失败:", error);
          failCount++;
        }
      }

      await loadProviders();
      setIsBatchAddModalOpen(false);
      await window.api.updateTrayMenu();

      // 显示结果提示
      if (failCount === 0) {
        showNotification(
          t("notifications.batchAddSuccess", { count: successCount }),
          "success",
          3000
        );
      } else {
        showNotification(
          t("notifications.batchAddPartial", {
            success: successCount,
            fail: failCount,
          }),
          "error",
          5000
        );
      }
    } catch (error) {
      console.error("批量添加失败:", error);
      showNotification(t("notifications.batchAddFailed"), "error", 3000);
    }
  };

  const handleEditProvider = async (provider: Provider) => {
    try {
      await window.api.updateProvider(provider, activeApp);
      await loadProviders();
      setEditingProviderId(null);
      // 显示编辑成功提示
      showNotification(t("notifications.providerSaved"), "success", 2000);
      // 更新托盘菜单
      await window.api.updateTrayMenu();
    } catch (error) {
      console.error(t("console.updateProviderFailed"), error);
      setEditingProviderId(null);
      const errorMessage = extractErrorMessage(error);
      const message = errorMessage
        ? t("notifications.saveFailed", { error: errorMessage })
        : t("notifications.saveFailedGeneric");
      showNotification(message, "error", errorMessage ? 6000 : 3000);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    const provider = providers[id];
    setConfirmDialog({
      isOpen: true,
      title: t("confirm.deleteProvider"),
      message: t("confirm.deleteProviderMessage", { name: provider?.name }),
      onConfirm: async () => {
        await window.api.deleteProvider(id, activeApp);
        await loadProviders();
        setConfirmDialog(null);
        showNotification(t("notifications.providerDeleted"), "success");
        // 更新托盘菜单
        await window.api.updateTrayMenu();
      },
    });
  };

  // 同步Codex供应商到VS Code设置（静默覆盖）
  const syncCodexToVSCode = async (providerId: string, silent = false) => {
    try {
      const status = await window.api.getVSCodeSettingsStatus();
      if (!status.exists) {
        if (!silent) {
          showNotification(
            t("notifications.vscodeSettingsNotFound"),
            "error",
            3000,
          );
        }
        return;
      }

      const raw = await window.api.readVSCodeSettings();
      const provider = providers[providerId];
      const isOfficial = provider?.category === "official";

      // 非官方供应商需要解析 base_url（使用公共工具函数）
      let baseUrl: string | undefined = undefined;
      if (!isOfficial) {
        const parsed = getCodexBaseUrl(provider);
        if (!parsed) {
          if (!silent) {
            showNotification(t("notifications.missingBaseUrl"), "error", 4000);
          }
          return;
        }
        baseUrl = parsed;
      }

      const updatedSettings = applyProviderToVSCode(raw, {
        baseUrl,
        isOfficial,
      });
      if (updatedSettings !== raw) {
        await window.api.writeVSCodeSettings(updatedSettings);
        if (!silent) {
          showNotification(t("notifications.syncedToVSCode"), "success", 1500);
        }
      }

      // 触发providers重新加载，以更新VS Code按钮状态
      await loadProviders();
    } catch (error: any) {
      console.error(t("console.syncToVSCodeFailed"), error);
      if (!silent) {
        const errorMessage =
          error?.message || t("notifications.syncVSCodeFailed");
        showNotification(errorMessage, "error", 5000);
      }
    }
  };

  // 同步 Claude 插件配置（写入/移除固定 JSON）
  const syncClaudePlugin = async (providerId: string, silent = false) => {
    try {
      const provider = providers[providerId];
      if (!provider) return;
      const isOfficial = provider.category === "official";
      await window.api.applyClaudePluginConfig({ official: isOfficial });
      if (!silent) {
        showNotification(
          isOfficial
            ? t("notifications.removedFromClaudePlugin")
            : t("notifications.appliedToClaudePlugin"),
          "success",
          2000,
        );
      }
    } catch (error: any) {
      console.error("同步 Claude 插件失败:", error);
      if (!silent) {
        const message =
          error?.message || t("notifications.syncClaudePluginFailed");
        showNotification(message, "error", 5000);
      }
    }
  };

  const handleSwitchProvider = async (id: string) => {
    const success = await window.api.switchProvider(id, activeApp);
    if (success) {
      setCurrentProviderId(id);
      // 显示重启提示
      const appName = t(`apps.${activeApp}`);
      showNotification(
        t("notifications.switchSuccess", { appName }),
        "success",
        2000,
      );
      // 更新托盘菜单
      await window.api.updateTrayMenu();

      // Codex: 切换供应商后，只在自动同步启用时同步到 VS Code
      if (activeApp === "codex" && isAutoSyncEnabled) {
        await syncCodexToVSCode(id, true); // silent模式，不显示通知
      }

      if (activeApp === "claude") {
        await syncClaudePlugin(id, true);
      }
    } else {
      showNotification(t("notifications.switchFailed"), "error");
    }
  };

  // 停用当前供应商（清空 env 字段）
  const handleDisableProvider = async () => {
    try {
      const success = await window.api.disableCurrentProvider(activeApp);
      if (success) {
        setCurrentProviderId("");
        showNotification(t("notifications.disableSuccess"), "success", 2000);
        // 更新托盘菜单
        await window.api.updateTrayMenu();
      } else {
        showNotification(t("notifications.disableFailed"), "error");
      }
    } catch (error) {
      showNotification(t("notifications.disableFailed"), "error");
    }
  };

  // 自动从 live 导入一条默认供应商（仅首次初始化时）
  const handleAutoImportDefault = async () => {
    try {
      const result = await window.api.importCurrentConfigAsDefault(activeApp);

      if (result.success) {
        await loadProviders();
        showNotification(t("notifications.autoImported"), "success", 3000);
        // 更新托盘菜单
        await window.api.updateTrayMenu();
      }
      // 如果导入失败（比如没有现有配置），静默处理，不显示错误
    } catch (error) {
      console.error(t("console.autoImportFailed"), error);
      // 静默处理，不影响用户体验
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* 顶部导航区域 - 固定高度 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/farion1231/cc-switch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              title={t("header.viewOnGithub")}
            >
              CC Switch
            </a>
            <button
              onClick={toggleDarkMode}
              className={buttonStyles.icon}
              title={
                isDarkMode
                  ? t("header.toggleLightMode")
                  : t("header.toggleDarkMode")
              }
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={buttonStyles.icon}
                title={t("common.settings")}
              >
                <Settings size={18} />
              </button>
              <UpdateBadge onClick={() => setIsSettingsOpen(true)} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AppSwitcher activeApp={activeApp} onSwitch={setActiveApp} />

            <button
              onClick={() => setIsMcpOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-2 text-sm font-medium rounded-lg transition-colors bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              MCP
            </button>

            {activeApp === "droid" && (
              <button
                onClick={() => setIsBatchAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                <Upload size={16} />
                {t("droid.batchImport")}
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`inline-flex items-center gap-2 ${buttonStyles.primary}`}
            >
              <Plus size={16} />
              {t("header.addProvider")}
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 独立滚动 */}
      <main className="flex-1 overflow-y-scroll">
        <div className="pt-3 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {/* 通知组件 - 相对于视窗定位 */}
            {notification && (
              <div
                className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                  notification.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                } ${isNotificationVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              >
                {notification.message}
              </div>
            )}

            <ProviderList
              providers={providers}
              currentProviderId={currentProviderId}
              onSwitch={handleSwitchProvider}
              onDisable={handleDisableProvider}
              onDelete={handleDeleteProvider}
              onEdit={setEditingProviderId}
              appType={activeApp}
              onNotify={showNotification}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddProviderModal
          appType={activeApp}
          onAdd={handleAddProvider}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {isBatchAddModalOpen && activeApp === "droid" && (
        <BatchAddKeysModal
          onAdd={handleBatchAddProviders}
          onClose={() => setIsBatchAddModalOpen(false)}
        />
      )}

      {editingProviderId && providers[editingProviderId] && (
        <EditProviderModal
          appType={activeApp}
          provider={providers[editingProviderId]}
          currentProviderId={currentProviderId}
          onSave={handleEditProvider}
          onClose={() => setEditingProviderId(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isMcpOpen && (
        <McpPanel
          appType={activeApp}
          onClose={() => setIsMcpOpen(false)}
          onNotify={showNotification}
        />
      )}
    </div>
  );
}

export default App;
