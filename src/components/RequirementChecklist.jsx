import { Card, ListGroup } from 'react-bootstrap'

const requirements = [
  'Project committed and pushed to GitHub',
  'Live and functional on GitHub Pages',
  'Uses React Bootstrap design library',
  'Primary navigation bar present and functional',
  'At least 2 pages built with React Router',
  'At least 5 meaningful React components',
]

function RequirementChecklist() {
  return (
    <Card className="panel">
      <Card.Body>
        <h2>Minimum Requirement Checklist</h2>
        <ListGroup variant="flush" className="mt-3">
          {requirements.map((requirement) => (
            <ListGroup.Item key={requirement} className="check-item">
              <span className="check-icon" aria-hidden="true">
                ✓
              </span>
              {requirement}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

export default RequirementChecklist
