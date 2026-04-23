import { Card, Col, Row } from 'react-bootstrap'
import { LANGUAGES, PROVIDERS } from '../data/catalog'

function ScopePanel() {
  return (
    <Row className="g-4 mt-1">
      <Col md={5}>
        <Card className="panel h-100">
          <Card.Body>
            <h2>Available Providers</h2>
            <ul className="chip-list">
              {PROVIDERS.map((provider) => (
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
              {LANGUAGES.map((language) => (
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
