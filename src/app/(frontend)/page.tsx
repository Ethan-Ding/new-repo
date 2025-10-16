import React from 'react'
import { CalculatorProvider } from './contexts/CalculatorContext'
import RoomList from './components/Rooms/RoomList'
import Calculator from './components/Calculator'
import './calculator.css'

export default function HomePage() {
  return (
    <CalculatorProvider>
      <div className="App">
        <div className="App-header">
          <RoomList />
          <div className="main-content">
            <div>
              <h1>Renopilot Painting</h1>
              <p>Calculate the cost to paint your house by room</p>
            </div>
            <Calculator />
          </div>
        </div>
      </div>
    </CalculatorProvider>
  )
}
