import { Card, Col, Row } from 'react-bootstrap'

const workflowSteps = [
  {
    title: '1. Input Validation',
    text: 'Accept PDF/TXT under limit, validate provider and language against strict allow-lists.',
  },
  {
    title: '2. OCR + Extraction',
    text: 'For scanned pages, route to OCR and extract text blocks suitable for translator chunking.',
  },
  {
    title: '3. Translation Core',
    text: 'Use selected API provider and preserve formulas/placeholders for structural fidelity.',
  },
  {
    title: '4. Output Build',
    text: 'Produce bilingual side-by-side PDF and monolingual reading PDF for download.',
  },
]

function WorkflowGrid() {
  return (
    <Row className="g-4 mt-1">
      {workflowSteps.map((step) => (
        <Col key={step.title} md={6}>
          <Card className="panel h-100">
            <Card.Body>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default WorkflowGrid
