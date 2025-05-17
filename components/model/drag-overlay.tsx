interface DragOverlayProps {
  isDragging: boolean
}

export function DragOverlay({ isDragging }: DragOverlayProps) {
  if (!isDragging) return null

  return (
    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center z-20 border-2 border-dashed border-blue-500 rounded-lg">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <p className="text-lg font-medium">Drop to replace current model</p>
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%