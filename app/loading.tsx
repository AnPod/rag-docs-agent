export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="animate-pulse text-center mb-8">
          <div className="h-10 bg-gray-200 rounded mx-auto mb-2 w-3/4" />
          <div className="h-5 bg-gray-200 rounded mx-auto w-1/2" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="md:col-span-1 space-y-4">
            {/* Upload Section Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-7 bg-gray-200 rounded mb-4 w-1/2 animate-pulse" />
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </div>

            {/* How it works Section Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-7 bg-gray-200 rounded mb-2 w-1/2 animate-pulse" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 animate-pulse">
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-7 bg-gray-200 rounded mb-4 w-1/4 animate-pulse" />

              {/* Chat Messages Skeleton */}
              <div className="space-y-4 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area Skeleton */}
              <div className="flex gap-2 animate-pulse">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
                <div className="h-12 w-12 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
