import { Badge, Card, Col, Row } from 'react-bootstrap'

function HeroSection() {
  return (
    <Row className="g-4 align-items-stretch">
      <Col lg={7}>
        <Card className="panel h-100">
          <Card.Body>
            <Badge bg="dark" className="mb-3">
              Live Tool
            </Badge>
            <h1 className="display-title">PDF Translation Platform Prototype</h1>
            <p className="lead-copy">
              Upload a PDF or TXT file, choose a provider and language, then
              get bilingual and monolingual outputs for study or review.
            </p>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={5}>
        <Card className="panel h-100 stat-panel">
          <Card.Body>
            <h2>What You Can Do</h2>
            <ul className="quick-stats">
              <li>Upload files up to 10 MB</li>
              <li>Use OpenAI, DeepSeek, or Gemini</li>
              <li>Select from mainstream languages</li>
              <li>Download dual and mono PDFs</li>
            </ul>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default HeroSection
