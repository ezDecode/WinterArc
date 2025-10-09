import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Winter Arc Tracker
          </h1>
          <p className="text-text-secondary">
            Track your 90-day transformation journey
          </p>
        </div>
        <SignIn 
          fallbackRedirectUrl="/today"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-surface border border-border shadow-xl',
            },
          }}
        />
      </div>
    </div>
  )
}
