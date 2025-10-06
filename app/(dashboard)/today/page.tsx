export default function TodayPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Today&apos;s Tracker</h1>
          <p className="text-text-secondary mt-1">
            Track your daily habits and reach 5/5 points
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Daily Score</div>
          <div className="text-4xl font-bold text-text-primary">0/5</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <p className="text-text-secondary text-center">
          Daily tracker components will be implemented in Phase 2
        </p>
        <div className="mt-8 space-y-4">
          {['Study Blocks', 'Reading', 'Pushups', 'Meditation', 'Water Intake'].map((target) => (
            <div key={target} className="bg-background rounded-lg p-4 border border-border">
              <h3 className="text-lg font-semibold text-text-primary">{target}</h3>
              <p className="text-sm text-text-secondary mt-1">Coming soon...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

