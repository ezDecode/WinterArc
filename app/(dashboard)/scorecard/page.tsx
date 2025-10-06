export default function ScorecardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">13-Week Scorecard</h1>
        <p className="text-text-secondary mt-1">
          Visual overview of your entire 90-day journey
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <p className="text-text-secondary text-center">
          13-week scorecard grid will be implemented in Phase 3
        </p>
        <div className="mt-8 flex justify-center">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(13)].map((_, weekIndex) => (
              <div key={weekIndex} className="flex space-x-1">
                {[...Array(7)].map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-8 h-8 bg-background border border-border rounded"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

