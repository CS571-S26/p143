import { Badge, Card, Col, Row } from 'react-bootstrap'

function HeroSection() {
  return (
    <Row className="g-4 align-items-stretch">
      <Col lg={7}>
        <Card className="panel h-100">
          <Card.Body>
            <Badge bg="dark" className="mb-3">
              Course MVP
            </Badge>
            <h1 className="display-title">PDF Translation Platform Prototype</h1>
            <p className="lead-copy">
              A scoped frontend inspired by PDFMathTranslate-main: upload-focused
              workflow, strict provider/language controls, and a backend-oriented
              integration map.
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
              <li>Architecture references from PDFMathTranslate-main</li>
            </ul>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default HeroSection
