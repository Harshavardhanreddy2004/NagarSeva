import React, { useRef, useState } from 'react'

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void
  disabled?: boolean
}

export default function ImageUpload({ onImageSelected, disabled = false }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return false
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('Image size must be less than 10MB')
      return false
    }
    
    return true
  }

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return
    }

    setError(null)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = e.target?.result as string
      setPreview(preview)
      onImageSelected(file, preview)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            type="button"
          >
            ✕
          </button>
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded text-sm">
            ✓ Image selected
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-700 font-semibold mb-2">Drag and drop your image here</p>
          <p className="text-gray-500 text-sm mb-4">or</p>
          <button
            onClick={handleClick}
            disabled={disabled}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
            type="button"
          >
            Browse Files
          </button>
          <p className="text-gray-500 text-xs mt-4">Max 10MB, PNG, JPG, GIF</p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
