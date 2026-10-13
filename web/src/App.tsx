import React from 'react'
import PlantOverview from './pages/PlantOverview'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Plant Dashboard</h1>
      </header>

      <main className="app-main">
        <PlantOverview />
      </main>

      <footer className="app-footer">Industrial Digital Twin · Mobile</footer>
    </div>
  )
}
