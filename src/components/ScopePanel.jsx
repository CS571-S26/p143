import { Card, Col, Row } from 'react-bootstrap'

const providers = ['OpenAI', 'DeepSeek', 'Gemini']

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

function ScopePanel() {
  return (
    <Row className="g-4 mt-1">
      <Col md={5}>
        <Card className="panel h-100">
          <Card.Body>
            <h2>Available Providers</h2>
            <ul className="chip-list">
              {providers.map((provider) => (
                <li key={provider}>{provider}</li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </Col>
      <Col md={7}>
        <Card className="panel h-100">
          <Card.Body>
            <h2>Language Coverage</h2>
            <ul className="chip-list">
              {languages.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default ScopePanel
