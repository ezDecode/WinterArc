import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WaterBottlesTracker } from '@/components/tracker/WaterBottlesTracker'
import { WATER_BOTTLES_COUNT } from '@/lib/constants/targets'

describe('WaterBottlesTracker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders with initial bottles state', () => {
    const bottles = [false, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    expect(screen.getByText('💧 Hydration')).toBeInTheDocument()
    expect(screen.getByText(`0/${WATER_BOTTLES_COUNT}`)).toBeInTheDocument()
  })

  it('displays correct filled count', () => {
    const bottles = [true, true, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    expect(screen.getByText(`2/${WATER_BOTTLES_COUNT}`)).toBeInTheDocument()
  })

  it('shows success message when target is met', () => {
    const bottles = new Array(WATER_BOTTLES_COUNT).fill(true)
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    expect(screen.getByText(/Hydration goal achieved!/i)).toBeInTheDocument()
  })

  it('does not show success message when target is not met', () => {
    const bottles = [true, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    expect(screen.queryByText(/Hydration goal achieved!/i)).not.toBeInTheDocument()
  })

  it('toggles bottle state when clicked', () => {
    const bottles = [false, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const bottleButton = screen.getByRole('button', { name: 'Bottle 1' })
    fireEvent.click(bottleButton)
    
    expect(mockOnChange).toHaveBeenCalledWith([true, false, false, false, false, false, false, false])
  })

  it('untoggle filled bottle when clicked', () => {
    const bottles = [true, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const bottleButton = screen.getByRole('button', { name: 'Bottle 1' })
    fireEvent.click(bottleButton)
    
    expect(mockOnChange).toHaveBeenCalledWith([false, false, false, false, false, false, false, false])
  })

  it('adds new bottle when add button is clicked', () => {
    const bottles = [false, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const addButton = screen.getByRole('button', { name: 'Add bottle' })
    fireEvent.click(addButton)
    
    expect(mockOnChange).toHaveBeenCalledWith([...bottles, false])
  })

  it('displays progress bar with correct width', () => {
    const bottles = [true, true, false, false, false, false, false, false]
    const { container } = render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    // 2/8 = 25%
    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '25%' })
  })

  it('displays water consumption in liters', () => {
    const bottles = [true, true, true, true, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    // 4 bottles * 0.5L / 2 = 1.0L
    expect(screen.getByText('1.0L consumed')).toBeInTheDocument()
  })

  it('shows target information', () => {
    const bottles = [false, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    expect(screen.getByText(`Target: ${WATER_BOTTLES_COUNT} bottles (4L)`)).toBeInTheDocument()
  })

  it('renders all bottles with correct aria-labels', () => {
    const bottles = [false, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    for (let i = 1; i <= bottles.length; i++) {
      expect(screen.getByRole('button', { name: `Bottle ${i}` })).toBeInTheDocument()
    }
  })

  it('shows remove button on hover for bottles when more than one bottle', async () => {
    const bottles = [false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    // Remove buttons should exist but be hidden initially (opacity-0)
    const removeButtons = screen.getAllByRole('button', { name: 'Remove bottle' })
    expect(removeButtons).toHaveLength(2)
  })

  it('removes bottle when remove button is clicked', () => {
    const bottles = [true, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const removeButtons = screen.getAllByRole('button', { name: 'Remove bottle' })
    fireEvent.click(removeButtons[0])
    
    expect(mockOnChange).toHaveBeenCalledWith([false, false])
  })

  it('does not allow removing the last bottle', () => {
    const bottles = [false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const removeButton = screen.getByRole('button', { name: 'Remove bottle' })
    fireEvent.click(removeButton)
    
    // Should not call onChange since we're keeping at least 1 bottle
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('displays correct progress color when target is met', () => {
    const bottles = new Array(WATER_BOTTLES_COUNT).fill(true)
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const progressText = screen.getByText(`${WATER_BOTTLES_COUNT}/${WATER_BOTTLES_COUNT}`)
    expect(progressText).toHaveClass('text-success')
  })

  it('handles multiple bottle toggles correctly', () => {
    const bottles = [false, false, false, false, false, false, false, false]
    render(<WaterBottlesTracker bottles={bottles} onChange={mockOnChange} />)
    
    const bottle1 = screen.getByRole('button', { name: 'Bottle 1' })
    const bottle3 = screen.getByRole('button', { name: 'Bottle 3' })
    
    fireEvent.click(bottle1)
    fireEvent.click(bottle3)
    
    expect(mockOnChange).toHaveBeenCalledTimes(2)
  })
})
