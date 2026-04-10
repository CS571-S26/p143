import { Button, Card, Form } from 'react-bootstrap'

function FileUploadCard() {
  return (
    <Card className="panel h-100">
      <Card.Body>
        <h2>Upload Source File</h2>
        <p className="muted-note">Accepted: PDF / TXT (max 10 MB)</p>
        <Form.Group controlId="sourceFile" className="mt-3">
          <Form.Control type="file" accept=".pdf,.txt" />
        </Form.Group>
        <Button className="mt-3" variant="dark">
          Add File
        </Button>
      </Card.Body>
    </Card>
  )
}

export default FileUploadCard
