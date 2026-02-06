import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import { Dashboard } from './Dashboard'

function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider theme={defaultTheme} colorScheme="light" locale="en-US">
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

describe('Dashboard', () => {
  it('renders ForgeMob heading and app cards', () => {
    render(
      <AppWrapper>
        <Dashboard />
      </AppWrapper>
    )
    expect(screen.getByText('ForgeMob')).toBeInTheDocument()
    expect(screen.getByText('What will you design today?')).toBeInTheDocument()
    // App names appear in explore cards and/or main grid
    expect(screen.getAllByText('Presentations').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Social Media').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Docs').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Sheets').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Whiteboard').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Photo Editor').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Video').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Print').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Websites').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Web Apps').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Mobile Apps').length).toBeGreaterThanOrEqual(1)
  })

  it('has New and Open by ID buttons for each app', () => {
    render(
      <AppWrapper>
        <Dashboard />
      </AppWrapper>
    )
    const newButtons = screen.getAllByText('New')
    const openButtons = screen.getAllByText('Open by ID')
    expect(newButtons.length).toBeGreaterThanOrEqual(11)
    expect(openButtons.length).toBeGreaterThanOrEqual(11)
  })
})
