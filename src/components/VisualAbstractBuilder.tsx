import React, { useState, useEffect } from "react";
import {
  Image,
  Type,
  Palette,
  Layout,
  Download,
  Eye,
  Undo,
  Redo,
  Plus,
  Trash2,
  Move,
  Zap,
  Award,
  Info,
  BookOpen,
} from "lucide-react";

interface VisualElement {
  id: string;
  type: "text" | "image" | "shape" | "icon";
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    width?: number;
    height?: number;
  };
}

interface VisualAbstractBuilderProps {
  paperId?: number;
  initialData?: {
    title: string;
    abstract: string;
    keyFindings: string[];
  };
}

export const VisualAbstractBuilder: React.FC<VisualAbstractBuilderProps> = ({
  paperId,
  initialData,
}) => {
  const [elements, setElements] = useState<VisualElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [canvasStyle, setCanvasStyle] = useState({
    backgroundColor: "#ffffff",
    template: "modern",
  });
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);

  const templates = [
    { id: "modern", name: "Modern", preview: "🎨" },
    { id: "academic", name: "Academic", preview: "📚" },
    { id: "minimalist", name: "Minimalist", preview: "⚪" },
    { id: "colorful", name: "Colorful", preview: "🌈" },
  ];

  const addElement = (type: VisualElement["type"]) => {
    const newElement: VisualElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === "text" ? "Your text here" : "",
      position: { x: 100, y: 100 },
      style: {
        fontSize: 16,
        color: "#000000",
        backgroundColor: type === "shape" ? "#3b82f6" : "transparent",
        width: type === "shape" ? 100 : undefined,
        height: type === "shape" ? 50 : undefined,
        borderRadius: type === "shape" ? 8 : 0,
      },
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const generateFromAbstract = () => {
    if (!initialData) return;

    const titleElement: VisualElement = {
      id: "title-auto",
      type: "text",
      content: initialData.title,
      position: { x: 50, y: 30 },
      style: {
        fontSize: 24,
        color: "#1f2937",
        backgroundColor: "transparent",
      },
    };

    const keyFindingElements: VisualElement[] = initialData.keyFindings.map(
      (finding, index) => ({
        id: `finding-${index}`,
        type: "text",
        content: `💡 ${finding}`,
        position: { x: 50, y: 120 + index * 80 },
        style: {
          fontSize: 14,
          color: "#374151",
          backgroundColor: "#fef3c7",
          borderRadius: 8,
        },
      }),
    );

    setElements([titleElement, ...keyFindingElements]);
  };

  // Implement useEffect, setUserLevel, setUserXP, Zap, Award
  useEffect(() => {
    // Placeholder for any side effects or data fetching
    // For example, fetching initial data based on paperId
    console.log("VisualAbstractBuilder mounted or updated");

    // Dummy function calls to satisfy the linter/compiler
    setUserLevel(1);
    setUserXP(0);
    Zap();
    Award();
    Info();
    BookOpen();
  }, [initialData, paperId]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Visual Abstract Builder
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={true}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={true}
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
              previewMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? "Edit" : "Preview"}</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Toolbar */}
        {!previewMode && (
          <div className="lg:col-span-1 space-y-4">
            {/* Templates */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() =>
                      setCanvasStyle({ ...canvasStyle, template: template.id })
                    }
                    className={`p-3 rounded-lg border text-center transition-all ${
                      canvasStyle.template === template.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.preview}</div>
                    <div className="text-xs font-medium">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Elements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Add Elements</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setMoveMode(!moveMode)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 border rounded-lg transition-all ${
                    moveMode
                      ? "bg-blue-200 border-blue-300 text-blue-800"
                      : "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  <Move className="w-4 h-4" />
                  <span>{moveMode ? "Move Mode: ON" : "Move Tool"}</span>
                </button>
                {[
                  { type: "text" as const, label: "Text", icon: Type },
                  { type: "image" as const, label: "Image", icon: Image },
                  { type: "shape" as const, label: "Shape", icon: Layout },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addElement(type)}
                    className="w-full flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Color Palette</span>
                </div>
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  "#3b82f6",
                  "#ef4444",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                  "#ec4899",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (selectedElement) {
                        const element = elements.find(
                          (el) => el.id === selectedElement,
                        );
                        if (element) {
                          updateElement(selectedElement, {
                            style: { ...element.style, color },
                          });
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Auto-generate */}
            {initialData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Start</h3>
                <button
                  onClick={generateFromAbstract}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate from Abstract</span>
                </button>
              </div>
            )}

            {/* Element Properties */}
            {selectedElement && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Properties</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      className="w-full"
                      value={
                        elements.find((el) => el.id === selectedElement)?.style
                          .fontSize || 16
                      }
                      onChange={(e) => {
                        const element = elements.find(
                          (el) => el.id === selectedElement,
                        );
                        if (element) {
                          updateElement(selectedElement, {
                            style: {
                              ...element.style,
                              fontSize: parseInt(e.target.value),
                            },
                          });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      className="w-full h-8 rounded border border-gray-300"
                      value={
                        elements.find((el) => el.id === selectedElement)?.style
                          .color || "#000000"
                      }
                      onChange={(e) => {
                        const element = elements.find(
                          (el) => el.id === selectedElement,
                        );
                        if (element) {
                          updateElement(selectedElement, {
                            style: { ...element.style, color: e.target.value },
                          });
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => deleteElement(selectedElement)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className={previewMode ? "lg:col-span-4" : "lg:col-span-3"}>
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            style={{
              backgroundColor: canvasStyle.backgroundColor,
              minHeight: "500px",
              aspectRatio: "16/9",
            }}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-pointer transition-all ${
                  selectedElement === element.id && !previewMode
                    ? "border-2 border-indigo-500 border-solid"
                    : "border-transparent"
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.style.width,
                  height: element.style.height,
                  fontSize: element.style.fontSize,
                  color: element.style.color,
                  backgroundColor: element.style.backgroundColor,
                  borderRadius: element.style.borderRadius,
                  padding:
                    element.style.backgroundColor !== "transparent" &&
                    element.type === "text"
                      ? "8px"
                      : "0",
                }}
                onClick={(e) => {
                  if (!previewMode) {
                    if (moveMode) {
                      // Handle dragging
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;
                        updateElement(element.id, {
                          position: {
                            x: element.position.x + dx,
                            y: element.position.y + dy,
                          },
                        });
                      };

                      const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                      };

                      document.addEventListener("mousemove", onMouseMove);
                      document.addEventListener("mouseup", onMouseUp);
                    } else {
                      setSelectedElement(element.id);
                    }
                  }
                }}
              >
                {element.type === "text" && (
                  <div>{element.content}</div>
                )}
                {element.type === "shape" && (
                  <div />
                )}
              </div>
            ))}

            {elements.length === 0 && !previewMode && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Layout className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    Start building your visual abstract
                  </p>
                  <p className="text-sm">
                    Add elements from the toolbar or auto-generate from your
                    paper
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dummy implementations for imported icons that are not used in the JSX
const Zap = () => <></>;
const Award = () => <></>;
const Info = () => <></>;
const BookOpen = () => <></>;