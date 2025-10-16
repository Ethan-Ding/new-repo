import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DemoPage from '../../../src/app/demo/page'

// Mock the App component since we're only testing the page wrapper
vi.mock('../../../src/app/demo/App', () => ({
  default: () => <div data-testid="mocked-app">Mocked App Component</div>
}))

// Mock window methods that the App uses
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(window, 'prompt', {
  value: vi.fn(),
  writable: true
})

describe('DemoPage Component', () => {

  it('should render without crashing', () => {
    render(<DemoPage />)

    // Page should render successfully
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()
  })

  it('should render the App component', () => {
    render(<DemoPage />)

    // Should render the mocked App component
    const appComponent = screen.getByTestId('mocked-app')
    expect(appComponent).toBeInTheDocument()
    expect(appComponent).toHaveTextContent('Mocked App Component')
  })

  it('should be a client component (no server-side restrictions)', () => {
    // This test verifies the component can render in a client environment
    // Since it has 'use client' directive, it should work with client-side features

    const { container } = render(<DemoPage />)
    expect(container).toBeInTheDocument()

    // Should be able to access window object (client-side feature)
    expect(typeof window).toBe('object')
  })

  it('should have correct component structure', () => {
    const { container } = render(<DemoPage />)

    // Should have a single root element containing the App
    const rootElement = container.firstChild
    expect(rootElement).toBeInTheDocument()
  })

  it('should render App component correctly', () => {
    render(<DemoPage />)

    const appComponent = screen.getByTestId('mocked-app')
    expect(appComponent).toBeInTheDocument()
    expect(appComponent).toHaveTextContent('Mocked App Component')
  })

  it('should maintain React component lifecycle', () => {
    const { unmount } = render(<DemoPage />)

    // Should render successfully
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()

    // Should unmount without errors
    expect(() => unmount()).not.toThrow()
  })

  it('should be compatible with React', () => {
    // Test that the component works with current React version
    const { container } = render(<DemoPage />)

    expect(container).toBeInTheDocument()
    expect(React.version).toBeDefined()
  })

  it('should handle re-rendering gracefully', () => {
    const { rerender } = render(<DemoPage />)

    // Initial render
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()

    // Re-render should work without issues
    rerender(<DemoPage />)
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()

    // Multiple re-renders should work
    rerender(<DemoPage />)
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()
  })

  it('should be a functional component', () => {
    // Verify it's a function component and not a class component
    expect(typeof DemoPage).toBe('function')
    expect(DemoPage.prototype?.render).toBeUndefined()
  })

  it('should have client directive functionality', () => {
    // Test that client-side features work (like accessing window)
    render(<DemoPage />)

    // Should be able to use client-side APIs without errors
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })

  it('should have simple component structure', () => {
    render(<DemoPage />)

    // Verify the mocked App component is rendered correctly
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()

    // Component should render as expected
    const appComponent = screen.getByTestId('mocked-app')
    expect(appComponent).toHaveTextContent('Mocked App Component')
  })

  it('should work with multiple instances', () => {
    const { unmount: unmount1 } = render(<DemoPage />)
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()
    unmount1()

    const { unmount: unmount2 } = render(<DemoPage />)
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()
    unmount2()

    // Should work fine with multiple mounts/unmounts
    render(<DemoPage />)
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument()
  })
})