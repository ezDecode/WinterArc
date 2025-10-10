import { render, screen } from '@testing-library/react'
import { DailyScoreDisplay } from '@/components/tracker/DailyScoreDisplay'
import { DAILY_MAX_SCORE } from '@/lib/constants/targets'

describe('DailyScoreDisplay', () => {
  it('renders the component with score and progress', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    // Check if the score is displayed
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(`/${DAILY_MAX_SCORE}`)).toBeInTheDocument()
    
    // Check if heading is present
    expect(screen.getByText('Daily Score')).toBeInTheDocument()
  })

  it('displays correct percentage for partial completion', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    // 3/5 = 60%
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('displays 100% for perfect score', () => {
    render(<DailyScoreDisplay score={5} isComplete={true} />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('displays 0% for zero score', () => {
    render(<DailyScoreDisplay score={0} isComplete={false} />)
    
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows completion badge when isComplete is true', () => {
    render(<DailyScoreDisplay score={5} isComplete={true} />)
    
    expect(screen.getByText(/Perfect Day! All 5 targets completed!/i)).toBeInTheDocument()
  })

  it('does not show completion badge when isComplete is false', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    expect(screen.queryByText(/Perfect Day/i)).not.toBeInTheDocument()
  })

  it('displays all category breakdowns', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('Reading')).toBeInTheDocument()
    expect(screen.getByText('Pushups')).toBeInTheDocument()
    expect(screen.getByText('Meditation')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
  })

  it('has correct accessibility attributes for score', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    const scoreDisplay = screen.getByRole('img', { name: /Current score: 3 out of 5 points/i })
    expect(scoreDisplay).toBeInTheDocument()
  })

  it('has correct accessibility attributes for progress bar', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '3')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '5')
  })

  it('has correct region role and aria-labelledby', () => {
    render(<DailyScoreDisplay score={3} isComplete={false} />)
    
    const section = screen.getByRole('region', { name: /Daily Score/i })
    expect(section).toBeInTheDocument()
  })

  it('shows completion badge with alert role when complete', () => {
    render(<DailyScoreDisplay score={5} isComplete={true} />)
    
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/Perfect Day/i)
  })
})
