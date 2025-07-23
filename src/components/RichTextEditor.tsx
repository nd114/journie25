
import React, { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Strikethrough,
  Save,
  Undo,
  Redo,
  Eye,
  Edit3,
  Type,
  Palette,
  X
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [history, setHistory] = useState<string[]>([content])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // History management
  const addToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const newContent = history[newIndex]
      onChange(newContent)
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const newContent = history[newIndex]
      onChange(newContent)
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
    }
  }

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    const newContent = editorRef.current?.innerHTML || ''
    onChange(newContent)
    addToHistory(newContent)
    editorRef.current?.focus()
  }

  const formatBold = () => executeCommand('bold')
  const formatItalic = () => executeCommand('italic')
  const formatUnderline = () => executeCommand('underline')
  const formatStrikethrough = () => executeCommand('strikeThrough')
  
  const formatHeading = (level: number) => {
    executeCommand('formatBlock', `h${level}`)
  }
  
  const formatList = () => executeCommand('insertUnorderedList')
  const formatOrderedList = () => executeCommand('insertOrderedList')
  
  const formatAlign = (alignment: string) => {
    executeCommand(`justify${alignment}`)
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const formatTextColor = (color: string) => {
    executeCommand('foreColor', color)
    setShowColorPicker(false)
  }

  const formatBackgroundColor = (color: string) => {
    executeCommand('backColor', color)
    setShowColorPicker(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          formatBold()
          break
        case 'i':
          e.preventDefault()
          formatItalic()
          break
        case 'u':
          e.preventDefault()
          formatUnderline()
          break
        case 'k':
          e.preventDefault()
          insertLink()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
      }
    }
  }

  const handleInput = () => {
    const newContent = editorRef.current?.innerHTML || ''
    onChange(newContent)
  }

  const textColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6B6B', '#FFA500', '#FFD93D', '#6BCF7F',
    '#4ECDC4', '#45B7D1', '#6C5CE7', '#A29BFE', '#FD79A8'
  ]

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#FFEBEE', '#FFF3E0', '#FFFDE7', '#F1F8E9', '#E8F5E8',
    '#E0F2F1', '#E1F5FE', '#E8EAF6', '#F3E5F5', '#FCE4EC'
  ]

  useEffect(() => {
    if (editorRef.current && !isPreviewMode) {
      editorRef.current.innerHTML = content
    }
  }, [content, isPreviewMode])

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-1 flex-wrap">
            {/* History Controls */}
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Cmd+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* Basic Formatting */}
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={formatBold}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Bold (Cmd+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={formatItalic}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Italic (Cmd+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={formatUnderline}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Underline (Cmd+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                onClick={formatStrikethrough}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* Headers */}
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={() => formatHeading(1)}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatHeading(2)}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatHeading(3)}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* Lists and Links */}
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={formatList}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={insertLink}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Insert Link (Cmd+K)"
              >
                <Link className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* Alignment */}
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={() => formatAlign('Left')}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatAlign('Center')}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatAlign('Right')}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* Colors */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded hover:bg-gray-200 active:bg-gray-300"
                title="Text Color & Background"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              {showColorPicker && (
                <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-20 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Colors</h4>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {textColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => formatTextColor(color)}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                          style={{ backgroundColor: color }}
                          title={`Text color: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {backgroundColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => formatBackgroundColor(color)}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                          style={{ backgroundColor: color }}
                          title={`Background: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-2 rounded ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div className="relative">
        {isPreviewMode ? (
          <div 
            className="p-6 prose prose-lg max-w-none min-h-[300px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full text-base text-gray-700 border-none outline-none bg-transparent resize-none leading-relaxed min-h-[300px] p-6 focus:ring-0"
            style={{ minHeight: '300px' }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
        
        {/* Placeholder styling */}
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9CA3AF;
            pointer-events: none;
          }
        `}</style>
      </div>
    </div>
  )
}
