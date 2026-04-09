import { Card } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import ScopePanel from '../components/ScopePanel'
import WorkflowGrid from '../components/WorkflowGrid'

function HomePage() {
  return (
    <div className="d-flex flex-column gap-4">
      <HeroSection />
      <ScopePanel />
      <WorkflowGrid />
      <Card className="panel">
        <Card.Body>
          <h2>Project Direction</h2>
          <p className="mb-0">
            This frontend is intentionally scoped for course delivery while
            aligning backend design with PDFMathTranslate-main internals.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

export default HomePage
