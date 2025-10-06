export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Weekly Review</h1>
        <p className="text-text-secondary mt-1">
          Reflect on your week and plan improvements
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <p className="text-text-secondary text-center mb-8">
          Weekly review form will be implemented in Phase 3
        </p>
        <div className="max-w-2xl mx-auto space-y-6">
          {[
            'How many days did you hit all 5 targets?',
            'What helped you stay consistent?',
            'What got in the way?',
            'What will you change next week?',
          ].map((question) => (
            <div key={question} className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {question}
              </label>
              <div className="bg-background border border-border rounded-lg p-4 h-24">
                <p className="text-text-tertiary text-sm">Response area...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
