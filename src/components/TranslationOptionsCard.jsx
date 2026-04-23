import { Card, Col, Form, Row } from 'react-bootstrap'
import { LANGUAGES, PROVIDERS } from '../data/catalog'

function TranslationOptionsCard({ settings, onSettingChange }) {
  return (
    <Card className="panel h-100">
      <Card.Body>
        <h2>Translation Settings</h2>
        <Row className="g-3 mt-1">
          <Col md={12}>
            <Form.Group controlId="provider">
              <Form.Label>Provider</Form.Label>
              <Form.Select
                value={settings.provider}
                onChange={(event) => onSettingChange('provider', event.target.value)}
              >
                {PROVIDERS.map((provider) => (
                  <option key={provider}>{provider}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="langIn">
              <Form.Label>Source Language</Form.Label>
              <Form.Select
                value={settings.sourceLanguage}
                onChange={(event) => onSettingChange('sourceLanguage', event.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={`in-${lang}`}>{lang}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="langOut">
              <Form.Label>Target Language</Form.Label>
              <Form.Select
                value={settings.targetLanguage}
                onChange={(event) => onSettingChange('targetLanguage', event.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={`out-${lang}`}>{lang}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group controlId="apiKey">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="password"
                placeholder="Paste your provider API key"
                value={settings.apiKey}
                onChange={(event) => onSettingChange('apiKey', event.target.value)}
              />
              <Form.Text className="muted-note">
                Your key stays in this browser session only.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default TranslationOptionsCard
