import { Badge, Button, Card, Form } from 'react-bootstrap'

function FileUploadCard({ selectedFile, onFileSelect, onFileClear }) {
  const handleFileInput = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <Card className="panel h-100">
      <Card.Body>
        <h2>Upload Source File</h2>
        <Form.Group controlId="sourceFile" className="mt-3">
          <Form.Label>Source document</Form.Label>
          <Form.Control type="file" accept=".pdf,.txt" onChange={handleFileInput} />
          <Form.Text className="muted-note">Accepted: PDF / TXT (max 10 MB)</Form.Text>
        </Form.Group>
        {selectedFile ? (
          <div className="file-preview mt-3">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <p className="mb-1 fw-semibold">{selectedFile.name}</p>
                <p className="mb-0 muted-note">{selectedFile.sizeLabel}</p>
              </div>
              <Badge bg="success">Ready</Badge>
            </div>
            <Button
              type="button"
              className="mt-3"
              variant="outline-secondary"
              size="sm"
              onClick={onFileClear}
            >
              Remove File
            </Button>
          </div>
        ) : (
          <p className="muted-note mt-3 mb-0">No file selected yet.</p>
        )}
      </Card.Body>
    </Card>
  )
}

export default FileUploadCard
