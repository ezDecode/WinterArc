export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Progress Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Track your streaks, completion rates, and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: '0 days', color: 'text-warning' },
          { label: 'Longest Streak', value: '0 days', color: 'text-success' },
          { label: 'Days Completed', value: '0/90', color: 'text-text-primary' },
          { label: 'Completion Rate', value: '0%', color: 'text-text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-6">
            <div className="text-sm text-text-secondary">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <p className="text-text-secondary text-center">
          Charts and detailed analytics will be implemented in Phase 3
        </p>
      </div>
    </div>
  )
}

