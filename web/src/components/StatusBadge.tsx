interface StatusBadgeProps {
  isReady: boolean;
}

export function StatusBadge({ isReady }: StatusBadgeProps) {
  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
      {isReady ? (
        <span className="flex items-center gap-2 text-green-600 font-semibold">
          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
          WASM Ready
        </span>
      ) : (
        <span className="flex items-center gap-2 text-amber-600 font-semibold">
          <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
          Loading WASM...
        </span>
      )}
    </div>
  );
}
