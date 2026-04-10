import { Container } from 'react-bootstrap'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrimaryNavBar from './components/PrimaryNavBar'
import HomePage from './pages/HomePage'
import WorkspacePage from './pages/WorkspacePage'

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <PrimaryNavBar />
        <main className="py-4 py-md-5">
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/requirements" element={<Navigate to="/workspace" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </main>
      </div>
    </HashRouter>
  )
}

export default App
