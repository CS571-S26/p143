import { Card, Col, Row } from 'react-bootstrap'

function JobSummaryCards({ jobs }) {
  const total = jobs.length
  const running = jobs.filter((job) => job.status === 'Running').length
  const completed = jobs.filter((job) => job.status === 'Completed').length

  const items = [
    { label: 'Total Jobs', value: total },
    { label: 'Running', value: running },
    { label: 'Completed', value: completed },
  ]

  return (
    <Row className="g-4">
      {items.map((item) => (
        <Col key={item.label} md={4}>
          <Card className="panel h-100">
            <Card.Body>
              <p className="muted-note mb-2">{item.label}</p>
              <p className="summary-value mb-0">{item.value}</p>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default JobSummaryCards
