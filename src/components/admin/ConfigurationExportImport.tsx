"use client";

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  addConfiguration,
  updateConfiguration,
} from "@/store/slices/chatbotSlice";
import { BotConfiguration } from "@/store/slices/chatbotSlice";

export default function ConfigurationExportImport() {
  const dispatch = useDispatch<AppDispatch>();
  const { configurations } = useSelector((state: RootState) => state.chatbot);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportConfiguration = (config: BotConfiguration) => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllConfigurations = () => {
    const dataStr = JSON.stringify(configurations, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "all_bot_configurations.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedConfig = JSON.parse(content) as BotConfiguration;

        // Validate the imported configuration
        if (!isValidConfiguration(importedConfig)) {
          setImportStatus({
            type: "error",
            message:
              "Invalid configuration format. Please check the file structure.",
          });
          return;
        }

        // Check if configuration already exists
        const existingConfig = configurations.find(
          (config) => config.id === importedConfig.id
        );

        if (existingConfig) {
          // Update existing configuration
          dispatch(
            updateConfiguration({
              ...importedConfig,
              updatedAt: new Date().toISOString(),
            })
          );
          setImportStatus({
            type: "success",
            message: `Configuration "${importedConfig.name}" updated successfully!`,
          });
        } else {
          // Add new configuration with new ID
          const newConfig = {
            ...importedConfig,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          dispatch(addConfiguration(newConfig));
          setImportStatus({
            type: "success",
            message: `Configuration "${importedConfig.name}" imported successfully!`,
          });
        }

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch {
        setImportStatus({
          type: "error",
          message:
            "Failed to parse configuration file. Please check the file format.",
        });
      }
    };
    reader.readAsText(file);
  };

  const isValidConfiguration = (
    config: unknown
  ): config is BotConfiguration => {
    return (
      config !== null &&
      typeof config === "object" &&
      "id" in config &&
      "name" in config &&
      "description" in config &&
      "flows" in config &&
      "isActive" in config &&
      "createdAt" in config &&
      "updatedAt" in config &&
      typeof (config as BotConfiguration).id === "string" &&
      typeof (config as BotConfiguration).name === "string" &&
      typeof (config as BotConfiguration).description === "string" &&
      Array.isArray((config as BotConfiguration).flows) &&
      typeof (config as BotConfiguration).isActive === "boolean" &&
      typeof (config as BotConfiguration).createdAt === "string" &&
      typeof (config as BotConfiguration).updatedAt === "string"
    );
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Export / Import Configurations
      </h3>

      {/* Import Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Import Configuration
        </h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleImportClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Import JSON File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importConfiguration}
            className="hidden"
          />
          <span className="text-sm text-gray-500">
            Select a JSON file to import configuration
          </span>
        </div>

        {importStatus.type && (
          <div
            className={`mt-2 p-2 rounded text-sm ${
              importStatus.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {importStatus.message}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Export Configurations
        </h4>
        <div className="space-y-3">
          <button
            onClick={exportAllConfigurations}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export All Configurations
          </button>

          <div className="border-t pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Export Individual Configurations
            </h5>
            <div className="space-y-2">
              {configurations.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h6 className="font-medium text-gray-900">{config.name}</h6>
                    <p className="text-sm text-gray-500">
                      {config.description}
                    </p>
                  </div>
                  <button
                    onClick={() => exportConfiguration(config)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Export
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Export configurations as JSON files for backup or sharing</li>
          <li>• Import JSON files to restore or add configurations</li>
          <li>• Existing configurations with the same ID will be updated</li>
          <li>• New configurations will be added with a new ID</li>
        </ul>
      </div>
    </div>
  );
}
