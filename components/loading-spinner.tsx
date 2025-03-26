export function LoadingSpinner() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      <span className="text-white">Loading...</span>
    </div>
  )
}

