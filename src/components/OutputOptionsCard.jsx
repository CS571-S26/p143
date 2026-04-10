import { Button, Card, Form } from 'react-bootstrap'

function OutputOptionsCard() {
  return (
    <Card className="panel h-100">
      <Card.Body>
        <h2>Output Preferences</h2>
        <Form className="mt-2">
          <Form.Check
            type="switch"
            id="bilingualOutput"
            label="Generate bilingual PDF (side-by-side)"
            defaultChecked
            className="mb-2"
          />
          <Form.Check
            type="switch"
            id="monoOutput"
            label="Generate monolingual PDF"
            defaultChecked
            className="mb-2"
          />
          <Form.Check
            type="switch"
            id="glossaryOutput"
            label="Include glossary table"
            className="mb-3"
          />
          <Button variant="success">Start Translation</Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default OutputOptionsCard
