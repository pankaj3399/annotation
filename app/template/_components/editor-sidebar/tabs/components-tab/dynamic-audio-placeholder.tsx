import { EditorBtns } from '@/lib/constants'
import { AudioLinesIcon, Image } from 'lucide-react'
import React from 'react'


const DynamicAudioPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData('componentType', type)
  }
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, 'dynamicAudio')}
      className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <AudioLinesIcon
        size={40}
        className="text-muted-foreground"
      />
    </div>
  )
}

export default DynamicAudioPlaceholder