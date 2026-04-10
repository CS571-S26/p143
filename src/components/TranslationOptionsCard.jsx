import { Card, Col, Form, Row } from 'react-bootstrap'

const languages = [
  'English',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Spanish',
  'Hindi',
  'Arabic',
  'Portuguese',
  'Russian',
  'Japanese',
  'French',
  'German',
  'Korean',
]

function TranslationOptionsCard() {
  return (
    <Card className="panel h-100">
      <Card.Body>
        <h2>Translation Settings</h2>
        <Row className="g-3 mt-1">
          <Col md={12}>
            <Form.Group controlId="provider">
              <Form.Label>Provider</Form.Label>
              <Form.Select defaultValue="OpenAI">
                <option>OpenAI</option>
                <option>DeepSeek</option>
                <option>Gemini</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="langIn">
              <Form.Label>Source Language</Form.Label>
              <Form.Select defaultValue="English">
                {languages.map((lang) => (
                  <option key={`in-${lang}`}>{lang}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="langOut">
              <Form.Label>Target Language</Form.Label>
              <Form.Select defaultValue="Chinese (Simplified)">
                {languages.map((lang) => (
                  <option key={`out-${lang}`}>{lang}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default TranslationOptionsCard
