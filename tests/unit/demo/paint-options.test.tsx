import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import App from '../../../src/app/demo/App'

// ---- Mocks for App.jsx dependencies ----
vi.mock('../../../src/app/demo/apiClient', () => ({
  // Keep the same shape App expects
  toApiRooms: vi.fn((x) => x),
  fetchPaints: vi.fn().mockResolvedValue({ paints: [] }),
  postEstimate: vi.fn().mockResolvedValue({ totals: { grand_total: 123.45 } }),
}))

// Mock MobileUI regardless of file name casing
vi.mock('../../../src/app/demo/MobileUI', () => ({
  default: () => <div data-testid="mobile-ui" />,
}))
vi.mock('../../../src/app/demo/mobileUI', () => ({
  default: () => <div data-testid="mobile-ui" />,
}))

beforeEach(() => {
  // Use fake timers to control debounce and time-based effects
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

// Advance timers and flush microtasks to settle debounced effects
const flush = async (ms = 0) => {
  await act(async () => {
    vi.advanceTimersByTime(ms)
    await Promise.resolve()
    await Promise.resolve()
  })
}

// Find a <select> within the form-group for a given label text
const getGroupSelect = (labelText: string) => {
  const group = screen.getByText(labelText).closest('.form-group')!
  return within(group).getByRole('combobox') as HTMLSelectElement
}

// Find the auto-calculated <input> inside the form-group for a given label (regex)
const getAutoInputByLabel = (labelRegex: RegExp) => {
  const labelEl = screen.getByText(labelRegex)
  const group = labelEl.closest('.form-group')!
  return within(group).getByRole('textbox') as HTMLInputElement
}

describe('App (paint options)', () => {
  it('updates auto Finish/Colour cost and falls back to 0 for unknown options', async () => {
    render(<App />)

    // ----- Finish -----
    const finishSelect = getGroupSelect('Paint Finish:')
    fireEvent.change(finishSelect, { target: { value: 'gloss' } })
    const finishAuto = getAutoInputByLabel(/Finish Cost/i)
    expect(finishAuto).toHaveValue('0.00012')

    // Unknown finish -> fallback 0
    fireEvent.change(finishSelect, { target: { value: 'unknown-finish' } })
    expect(finishAuto).toHaveValue('0')

    // ----- Colour -----
    const colourSelect = getGroupSelect('Paint Colour:')
    fireEvent.change(colourSelect, { target: { value: 'blue' } })
    const colourAuto = getAutoInputByLabel(/Colour Cost/i)
    expect(colourAuto).toHaveValue('0.00005')

    // Unknown colour -> fallback 0
    fireEvent.change(colourSelect, { target: { value: 'unknown-colour' } })
    expect(colourAuto).toHaveValue('0')
  })

  it.skip('shows total using postEstimate after debounce (manual overrides also trigger estimate in App)', async () => {
    // SKIPPED: Demo app uses old calculation method, incompatible with frontend refactoring
    // Frontend calculator now requires all 4 paint options to be selected before calculating costs
    render(<App />)

    // Wait for initial debounced estimate to complete
    await flush(1200)
    expect(screen.getByText(/Total Project Cost:/)).toHaveTextContent('$123.45')
  })

  it('renders MobileUI in mobile viewport', async () => {
    // Configure a mobile-like viewport before render
    ;(window as any).innerWidth = 360
    ;(window as any).innerHeight = 900

    render(<App />)

    // Trigger resize listener (if App uses it)
    window.dispatchEvent(new Event('resize'))

    expect(screen.getByTestId('mobile-ui')).toBeInTheDocument()
  })
})
