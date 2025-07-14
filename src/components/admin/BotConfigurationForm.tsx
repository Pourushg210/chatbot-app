"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  addConfiguration,
  updateConfiguration,
} from "@/store/slices/chatbotSlice";
import { QuestionFlow, BotConfiguration } from "@/store/slices/chatbotSlice";

type QuestionOption = {
  label: string;
  value: string;
  next?: string | undefined;
};

interface BotConfigurationFormProps {
  existingConfig?: BotConfiguration;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function BotConfigurationForm({
  existingConfig,
  onSave,
  onCancel,
}: BotConfigurationFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    name: existingConfig?.name || "",
    description: existingConfig?.description || "",
    isActive: existingConfig?.isActive || false,
  });

  const [flows, setFlows] = useState<QuestionFlow[]>(
    existingConfig?.flows || []
  );

  const [currentFlow, setCurrentFlow] = useState<Partial<QuestionFlow>>({
    question: "",
    type: "text",
    required: false,
    options: [],
    next: undefined,
  });

  const addFlow = () => {
    if (!currentFlow.question) return;
    const newId = Date.now().toString();
    let newFlow: QuestionFlow;

    if (
      currentFlow.type === "multiple_choice" ||
      currentFlow.type === "yes_no"
    ) {
      const options = (currentFlow.options as QuestionOption[]) || [];
      // Build next map for MCQ/yes_no
      const nextMap: { [key: string]: string } = {};
      options.forEach((opt) => {
        if (opt.next) nextMap[opt.value] = opt.next;
      });
      newFlow = {
        id: newId,
        question: currentFlow.question!,
        type: currentFlow.type!,
        required: currentFlow.required || false,
        options,
        next: Object.keys(nextMap).length > 0 ? nextMap : undefined,
      };
    } else {
      newFlow = {
        id: newId,
        question: currentFlow.question!,
        type: "text",
        required: currentFlow.required || false,
        next:
          typeof currentFlow.next === "string" && currentFlow.next !== ""
            ? currentFlow.next
            : undefined,
      };
    }

    setFlows([...flows, newFlow]);
    setCurrentFlow({
      question: "",
      type: "text",
      required: false,
      options: [],
      next: undefined,
    });
  };

  const removeFlow = (id: string) => {
    setFlows(flows.filter((flow) => flow.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: BotConfiguration = {
      id: existingConfig?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      flows,
      isActive: formData.isActive,
      createdAt: existingConfig?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingConfig) {
      dispatch(updateConfiguration(config));
    } else {
      dispatch(addConfiguration(config));
    }

    onSave?.();
  };

  const allQuestionOptions = flows.map((f) => ({
    label: f.question,
    value: f.id,
  }));
  const nextStepOptions = [
    { label: "End Conversation", value: "" },
    ...allQuestionOptions,
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {existingConfig
          ? "Edit Bot Configuration"
          : "Create New Bot Configuration"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trigger Field */}
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bot Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "active",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        {/* Question Flows */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Question Flows
          </h3>

          {/* Add New Flow */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Add New Question
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={currentFlow.question}
                  onChange={(e) =>
                    setCurrentFlow({ ...currentFlow, question: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={currentFlow.type}
                  onChange={(e) =>
                    setCurrentFlow({
                      ...currentFlow,
                      type: e.target.value as
                        | "text"
                        | "multiple_choice"
                        | "yes_no",
                      options:
                        e.target.value === "multiple_choice"
                          ? [
                              {
                                label: "",
                                value: "",
                                next: "",
                              } as QuestionOption,
                            ]
                          : e.target.value === "yes_no"
                          ? [
                              {
                                label: "Yes",
                                value: "yes",
                                next: "",
                              } as QuestionOption,
                              {
                                label: "No",
                                value: "no",
                                next: "",
                              } as QuestionOption,
                            ]
                          : [],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="text">Text Input</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="yes_no">Yes/No</option>
                </select>
              </div>
            </div>

            {currentFlow.type === "multiple_choice" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options
                </label>
                {(currentFlow.options as QuestionOption[] | undefined)?.map(
                  (option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <input
                        type="text"
                        value={option?.label || ""}
                        onChange={(e) => {
                          const newOptions = [
                            ...((currentFlow.options as QuestionOption[]) ||
                              []),
                          ];
                          newOptions[index] = {
                            ...newOptions[index],
                            label: e.target.value,
                            value: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          };
                          setCurrentFlow({
                            ...currentFlow,
                            options: newOptions,
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        placeholder={`Option ${index + 1}`}
                      />
                      <select
                        value={option?.next || ""}
                        onChange={(e) => {
                          const newOptions = [
                            ...((currentFlow.options as QuestionOption[]) ||
                              []),
                          ];
                          newOptions[index] = {
                            ...newOptions[index],
                            next: e.target.value || undefined,
                          };
                          setCurrentFlow({
                            ...currentFlow,
                            options: newOptions,
                          });
                        }}
                        className="px-2 py-2 border border-gray-300 rounded-md text-gray-900"
                      >
                        {nextStepOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = (
                            (currentFlow.options as QuestionOption[]) || []
                          ).filter((_, i) => i !== index);
                          setCurrentFlow({
                            ...currentFlow,
                            options: newOptions,
                          });
                        }}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentFlow({
                      ...currentFlow,
                      options: [
                        ...((currentFlow.options as QuestionOption[]) || []),
                        { label: "", value: "", next: "" },
                      ],
                    })
                  }
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  + Add Option
                </button>
              </div>
            )}
            {currentFlow.type === "yes_no" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yes/No Branching
                </label>
                {["Yes", "No"].map((label, index) => (
                  <div key={label} className="flex items-center space-x-2 mb-2">
                    <span className="flex-1 text-gray-900">{label}</span>
                    <select
                      value={
                        (currentFlow.options as QuestionOption[] | undefined)?.[
                          index
                        ]?.next || ""
                      }
                      onChange={(e) => {
                        const newOptions = [
                          ...((currentFlow.options as QuestionOption[]) || []),
                        ];
                        newOptions[index] = {
                          label,
                          value: label.toLowerCase(),
                          next: e.target.value || undefined,
                        };
                        setCurrentFlow({ ...currentFlow, options: newOptions });
                      }}
                      className="px-2 py-2 border border-gray-300 rounded-md text-gray-900"
                    >
                      {nextStepOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
            {currentFlow.type === "text" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Question
                </label>
                <select
                  value={
                    typeof currentFlow.next === "string" ? currentFlow.next : ""
                  }
                  onChange={(e) =>
                    setCurrentFlow({
                      ...currentFlow,
                      next: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  {nextStepOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-4 mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentFlow.required}
                  onChange={(e) =>
                    setCurrentFlow({
                      ...currentFlow,
                      required: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>

              <button
                type="button"
                onClick={addFlow}
                disabled={!currentFlow.question}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Add Question
              </button>
            </div>
          </div>

          {/* Existing Flows */}
          <div className="space-y-3">
            {flows.map((flow, index) => (
              <div key={flow.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-900">
                        Q{index + 1}:
                      </span>
                      <span className="text-sm text-gray-900">
                        {flow.question}
                      </span>
                    </div>
                    {(flow.type === "multiple_choice" ||
                      flow.type === "yes_no") &&
                      flow.options && (
                        <div className="ml-4">
                          <p className="text-xs text-gray-500 mb-1">
                            Options & Next:
                          </p>
                          <div className="flex flex-col gap-1">
                            {flow.options.map((option, optIndex) => (
                              <span
                                key={optIndex}
                                className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-900"
                              >
                                {option.label} →{" "}
                                {typeof flow.next === "object" &&
                                flow.next !== null &&
                                flow.next !== undefined &&
                                flow.next[option.value]
                                  ? flows.find(
                                      (f) => f.id === flow.next[option.value]
                                    )?.question || "[Unknown]"
                                  : "End Conversation"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    {flow.type === "yes_no" && flow.options && (
                      <div className="ml-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Yes/No Next:
                        </p>
                        <div className="flex flex-col gap-1">
                          {flow.options.map((option, optIndex) => (
                            <span
                              key={optIndex}
                              className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-900"
                            >
                              {option.label} →{" "}
                              {option.next
                                ? flows.find((f) => f.id === option.next)
                                    ?.question || "[Unknown]"
                                : "End Conversation"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {flow.type === "text" && (
                      <div className="ml-4">
                        <p className="text-xs text-gray-500 mb-1">Next:</p>
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-900">
                          {typeof flow.next === "string" &&
                          flow.next !== undefined &&
                          flow.next
                            ? flows.find((f) => f.id === flow.next)?.question ||
                              "[Unknown]"
                            : "End Conversation"}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFlow(flow.id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {existingConfig ? "Update Configuration" : "Create Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
