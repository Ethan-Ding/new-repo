/// <reference types="vitest" />
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
    // Testing Library DOM matchers
    toBeInTheDocument(): T
    toBeVisible(): T
    toBeEmptyDOMElement(): T
    toBeInvalid(): T
    toBeRequired(): T
    toBeValid(): T
    toContainElement(element: HTMLElement | null): T
    toContainHTML(htmlText: string): T
    toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): T
    toHaveAccessibleName(expectedAccessibleName?: string | RegExp): T
    toHaveAttribute(attr: string, value?: string | RegExp): T
    toHaveClass(...classNames: string[]): T
    toHaveFocus(): T
    toHaveFormValues(expectedValues: Record<string, any>): T
    toHaveStyle(css: string | Record<string, any>): T
    toHaveTextContent(text: string | RegExp): T
    toHaveValue(value: string | string[] | number): T
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): T
    toBeChecked(): T
    toBePartiallyChecked(): T
    toHaveDescription(text?: string | RegExp): T
  }

  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}