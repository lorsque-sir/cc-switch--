import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

interface DroidConfigEditorProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export function DroidConfigEditor({
  config,
  onChange,
}: DroidConfigEditorProps) {
  const { t } = useTranslation();
  // 如果已有 API Key，默认显示；新建时默认隐藏
  const [showApiKey, setShowApiKey] = useState(!!(config.apiKey && config.apiKey.trim()));

  const apiKey = config.apiKey || "";

  const handleApiKeyChange = (value: string) => {
    onChange({
      ...config,
      apiKey: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("droid.apiKey")}
        </label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder={t("droid.apiKeyPlaceholder")}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title={showApiKey ? t("droid.hideApiKey") : t("droid.showApiKey")}
          >
            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t("droid.apiKeyHelp")}
        </p>
      </div>
    </div>
  );
}

