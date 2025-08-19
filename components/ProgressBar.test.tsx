import { render, screen } from '@testing-library/react'
import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with the correct width for 50%', () => {
    render(<ProgressBar value={50} max={100} />)
    const container = screen.getByTestId('progress-bar-container')
    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveStyle('width: 50%')
    expect(bar).toHaveClass('bg-emerald-500')
  })

  it('renders with the correct width for 0%', () => {
    render(<ProgressBar value={0} max={100} />)
    const container = screen.getByTestId('progress-bar-container')
    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveStyle('width: 0%')
  })

  it('renders with 100% width when value exceeds max', () => {
    render(<ProgressBar value={120} max={100} />)
    const container = screen.getByTestId('progress-bar-container')
    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveStyle('width: 100%')
    expect(bar).toHaveClass('bg-red-500')
  })

  it('handles max being 0', () => {
    render(<ProgressBar value={50} max={0} />)
    const container = screen.getByTestId('progress-bar-container')
    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveStyle('width: 0%')
  })

  it('renders with amber color between 80 and 100', () => {
    render(<ProgressBar value={85} max={100} />)
    const container = screen.getByTestId('progress-bar-container')
    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveClass('bg-amber-500')
  })
})
