import { Card, Col, Row } from 'react-bootstrap'

const workflowSteps = [
  {
    title: '1. Input Validation',
    text: 'Check file type/size first, then make sure provider and language are in our allowed list.',
  },
  {
    title: '2. OCR + Extraction',
    text: 'If the PDF is scanned, run OCR and pull the text out in chunks.',
  },
  {
    title: '3. Translation Core',
    text: 'Use the selected API to translate while keeping formulas/placeholders intact.',
  },
  {
    title: '4. Output Build',
    text: 'Create both output files: side-by-side bilingual PDF and translation-only PDF.',
  },
]

function WorkflowGrid() {
  return (
    <section aria-labelledby="workflow-heading" className="mt-1">
      <h2 id="workflow-heading" className="section-title">
        Translation Workflow
      </h2>
      <Row className="g-4">
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
    </section>
  )
}

export default WorkflowGrid
