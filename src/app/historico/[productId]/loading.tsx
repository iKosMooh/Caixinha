export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  )
}
