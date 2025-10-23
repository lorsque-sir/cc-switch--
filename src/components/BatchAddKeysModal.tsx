import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Upload, AlertCircle } from "lucide-react";
import { Provider } from "../types";

interface BatchAddKeysModalProps {
  onAdd: (providers: Omit<Provider, "id">[]) => void;
  onClose: () => void;
}

export function BatchAddKeysModal({ onAdd, onClose }: BatchAddKeysModalProps) {
  const { t } = useTranslation();
  const [keysText, setKeysText] = useState("");
  const [namePrefix, setNamePrefix] = useState("Key");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string[]>([]);

  const parseKeys = (text: string): string[] => {
    // 支持多种分隔方式：换行、逗号、分号
    const keys = text
      .split(/[\n,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.startsWith("fk-"));
    
    return Array.from(new Set(keys)); // 去重
  };

  const handleTextChange = (text: string) => {
    setKeysText(text);
    setError("");
    const parsed = parseKeys(text);
    setPreview(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!keysText.trim()) {
      setError("请输入至少一个 API Key");
      return;
    }

    const keys = parseKeys(keysText);

    if (keys.length === 0) {
      setError("未找到有效的 API Key（应以 fk- 开头）");
      return;
    }

    // 生成供应商列表
    const providers: Omit<Provider, "id">[] = keys.map((key, index) => ({
      name: `${namePrefix} ${index + 1}`,
      websiteUrl: "",
      settingsConfig: {
        apiKey: key,
      },
      category: "official" as const,
    }));

    onAdd(providers);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t("droid.batchAddKeys")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 内容区域 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* 使用说明 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 {t("droid.batchAddHelp")}
              </p>
              <ul className="mt-2 text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-4">
                <li>• {t("droid.batchAddTip1")}</li>
                <li>• {t("droid.batchAddTip2")}</li>
                <li>• {t("droid.batchAddTip3")}</li>
              </ul>
            </div>

            {/* 名称前缀 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("droid.namePrefix")}
              </label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                placeholder="Key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("droid.namePrefixHelp", { prefix: namePrefix })}
              </p>
            </div>

            {/* API Keys 输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("droid.apiKeys")}
              </label>
              <textarea
                value={keysText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={t("droid.apiKeysPlaceholder")}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 font-mono text-sm"
              />
            </div>

            {/* 预览 */}
            {preview.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t("droid.willAdd", { count: preview.length })}
                  </span>
                </div>
                <div className="space-y-1">
                  {preview.map((key, index) => (
                    <div key={index} className="text-xs text-green-600 dark:text-green-400 font-mono">
                      {namePrefix} {index + 1}: {key.substring(0, 15)}...{key.substring(key.length - 10)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={preview.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("droid.batchAdd", { count: preview.length })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


