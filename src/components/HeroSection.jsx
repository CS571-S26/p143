import { Badge, Card, Col, Row } from 'react-bootstrap'

function HeroSection() {
  return (
    <Row className="g-4 align-items-stretch">
      <Col lg={7}>
        <Card className="panel h-100">
          <Card.Body>
            <Badge bg="dark" className="mb-3">
              Class Project
            </Badge>
            <h1 className="display-title">PDF Translation Platform Prototype</h1>
            <p className="lead-copy">
              This is a project website. It shows the workflow, allowed
              providers/languages, and a backend integration plan.
            </p>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={5}>
        <Card className="panel h-100 stat-panel">
          <Card.Body>
            <h2>Current Scope</h2>
            <ul className="quick-stats">
              <li>3 providers: OpenAI, DeepSeek, Gemini</li>
              <li>12 supported mainstream languages</li>
              <li>Dual PDF + mono PDF output targets</li>
            </ul>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default HeroSection
