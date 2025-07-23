import React, { useState, useRef, useEffect } from 'react'
import RichTextEditor from './RichTextEditor'
import { Page } from '../types'

interface EditorProps {
  page: Page
  onUpdatePage: (updates: Partial<Page>) => void
}

export default function Editor({ page, onUpdatePage }: EditorProps) {
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(page.title)
    setContent(page.content)
  }, [page])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onUpdatePage({ title: newTitle })
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onUpdatePage({ content: newContent })
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Focus will be handled by the RichTextEditor automatically
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent mb-6 resize-none"
        />

        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your research notes..."
        />
      </div>

      <div className="border-t border-gray-200 px-8 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Last edited: {page.updatedAt.toLocaleDateString()} at {page.updatedAt.toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-4">
            <span>{content.replace(/<[^>]*>/g, '').length} characters</span>
            <span>{content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words</span>
          </div>
        </div>
      </div>
    </div>
  )
}