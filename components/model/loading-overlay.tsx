import { Spinner } from "@/components/ui/spinner"

interface LoadingOverlayProps {
  isLoading: boolean
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 z-10">
      <div className="flex flex-col items-center">
        <Spinner className="w-10 h-10 text-blue-500" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading model...</p>
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%