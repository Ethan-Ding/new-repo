import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DemoLayout from '../../../src/app/demo/layout'

describe('DemoLayout Component', () => {
  it('should render the layout component structure', () => {
    const { container } = render(
      <DemoLayout>
        <div data-testid="test-content">Test content</div>
      </DemoLayout>
    )

    // Since HTML/body are top-level elements in Next.js layouts,
    // we'll test that the component renders without errors
    expect(container).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('should render layout structure correctly', () => {
    // This tests the component structure, even though in test env
    // HTML/body won't render the same way as in production
    const { container } = render(
      <DemoLayout>
        <div data-testid="layout-content">Test content</div>
      </DemoLayout>
    )

    // The component should render without throwing errors and contain the children
    expect(container).toBeInTheDocument()
    expect(screen.getByTestId('layout-content')).toBeInTheDocument()
    expect(screen.getByTestId('layout-content')).toHaveTextContent('Test content')
  })

  it('should render children correctly', () => {
    render(
      <DemoLayout>
        <div data-testid="test-child">Test content</div>
      </DemoLayout>
    )

    const childElement = screen.getByTestId('test-child')
    expect(childElement).toBeInTheDocument()
    expect(childElement).toHaveTextContent('Test content')
  })

  it('should render multiple children', () => {
    render(
      <DemoLayout>
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </DemoLayout>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-1')).toHaveTextContent('First child')
    expect(screen.getByTestId('child-2')).toHaveTextContent('Second child')
  })

  it('should handle empty children gracefully', () => {
    const { container } = render(
      <DemoLayout>
        {null}
      </DemoLayout>
    )

    // Should render without errors even with null children
    expect(container).toBeInTheDocument()
  })

  it('should render React components as children', () => {
    const TestComponent = () => <span data-testid="react-component">React Component</span>

    render(
      <DemoLayout>
        <TestComponent />
      </DemoLayout>
    )

    expect(screen.getByTestId('react-component')).toBeInTheDocument()
    expect(screen.getByTestId('react-component')).toHaveTextContent('React Component')
  })

  it('should maintain correct component hierarchy', () => {
    render(
      <DemoLayout>
        <main data-testid="main-content">Main content</main>
      </DemoLayout>
    )

    const mainElement = screen.getByTestId('main-content')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement).toHaveTextContent('Main content')
  })

  it('should preserve complex nested structure', () => {
    render(
      <DemoLayout>
        <div className="wrapper">
          <header data-testid="header">Header</header>
          <main data-testid="main">Main</main>
          <footer data-testid="footer">Footer</footer>
        </div>
      </DemoLayout>
    )

    expect(screen.getByTestId('header')).toHaveTextContent('Header')
    expect(screen.getByTestId('main')).toHaveTextContent('Main')
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer')
  })

  it('should accept React.ReactNode as children type', () => {
    // This test ensures TypeScript compatibility
    const stringChild = 'String child'
    const numberChild = 42
    const reactElement = <span>React element</span>

    // These should all be valid children types
    expect(() => {
      render(
        <DemoLayout>
          {stringChild}
          {numberChild}
          {reactElement}
        </DemoLayout>
      )
    }).not.toThrow()
  })

  it('should render without CSS import errors', () => {
    // The component imports App.css, this ensures no import errors
    expect(() => {
      render(
        <DemoLayout>
          <div>Test</div>
        </DemoLayout>
      )
    }).not.toThrow()
  })
})