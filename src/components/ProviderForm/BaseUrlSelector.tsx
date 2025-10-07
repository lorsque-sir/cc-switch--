import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

interface BaseUrlSelectorProps {
  urls: string[];
  currentUrl: string;
  onSelect: (url: string) => void;
  onChange: (urls: string[]) => void;
}

const BaseUrlSelector: React.FC<BaseUrlSelectorProps> = ({
  urls,
  currentUrl,
  onSelect,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsAdding(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAddUrl = () => {
    const trimmedUrl = newUrl.trim();
    if (
      trimmedUrl &&
      !urls.includes(trimmedUrl) &&
      (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://"))
    ) {
      onChange([...urls, trimmedUrl]);
      setNewUrl("");
      setIsAdding(false);
    }
  };

  const handleDeleteUrl = (url: string) => {
    onChange(urls.filter((u) => u !== url));
  };

  const handleSelectUrl = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors flex items-center gap-1"
        title="快速选择地址"
      >
        <ChevronDown size={16} />
        快捷选择
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {/* 已保存的地址列表 */}
            {urls.length > 0 ? (
              <div className="space-y-1 mb-2">
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      url === currentUrl
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectUrl(url)}
                      className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 truncate"
                      title={url}
                    >
                      {url}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUrl(url)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="删除此地址"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                暂无保存的地址
              </p>
            )}

            {/* 添加新地址 */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              {!isAdding ? (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  添加新地址
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddUrl();
                      } else if (e.key === "Escape") {
                        setIsAdding(false);
                        setNewUrl("");
                      }
                    }}
                    placeholder="https://api.example.com"
                    autoFocus
                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setNewUrl("");
                      }}
                      className="flex-1 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseUrlSelector;
