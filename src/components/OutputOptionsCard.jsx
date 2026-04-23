import { Button, Card, Form } from 'react-bootstrap'

function OutputOptionsCard({ settings, onOutputToggle, onStartTranslation, canStart }) {
  return (
    <Card className="panel h-100">
      <Card.Body>
        <h2>Output Preferences</h2>
        <Form className="mt-2">
          <Form.Check
            type="switch"
            id="bilingualOutput"
            label="Generate bilingual PDF (side-by-side)"
            checked={settings.includeBilingual}
            onChange={() => onOutputToggle('includeBilingual')}
            className="mb-2"
          />
          <Form.Check
            type="switch"
            id="monoOutput"
            label="Generate monolingual PDF"
            checked={settings.includeMonolingual}
            onChange={() => onOutputToggle('includeMonolingual')}
            className="mb-2"
          />
          <Form.Check
            type="switch"
            id="glossaryOutput"
            label="Include glossary table"
            checked={settings.includeGlossary}
            onChange={() => onOutputToggle('includeGlossary')}
            className="mb-3"
          />
          <Button variant="success" onClick={onStartTranslation} disabled={!canStart}>
            Start Translation
          </Button>
          {!canStart && (
            <p className="muted-note mt-2 mb-0">
              Select a file, API key, and at least one output type.
            </p>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}

export default OutputOptionsCard
