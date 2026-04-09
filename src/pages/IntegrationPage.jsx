import { Card } from 'react-bootstrap'
import ModuleReuseTable from '../components/ModuleReuseTable'

function IntegrationPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <Card className="panel">
        <Card.Body>
          <h1 className="display-title">Backend Integration Map</h1>
          <p className="lead-copy">
            Modules below are directly referenced from
            <code> PDFMathTranslate-main </code>
            and mapped to your web backend responsibilities.
          </p>
        </Card.Body>
      </Card>
      <Card className="panel">
        <Card.Body>
          <ModuleReuseTable />
        </Card.Body>
      </Card>
      <Card className="panel">
        <Card.Body>
          <h2>Interface Contract</h2>
          <p className="mb-0">
            Recommended API endpoints: <code>POST /translate</code>,{' '}
            <code>GET /jobs/:id</code>, <code>GET /jobs/:id/mono.pdf</code>,{' '}
            <code>GET /jobs/:id/dual.pdf</code>.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

export default IntegrationPage
