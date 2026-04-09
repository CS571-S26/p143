import { Card } from 'react-bootstrap'
import RequirementChecklist from '../components/RequirementChecklist'

function RequirementsPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <Card className="panel">
        <Card.Body>
          <h1 className="display-title">Course Requirement Status</h1>
          <p className="lead-copy">
            This page tracks the minimum checklist items for deployment,
            navbar/routing, and component usage.
          </p>
        </Card.Body>
      </Card>
      <RequirementChecklist />
      <Card className="panel">
        <Card.Body>
          <h2>Routing Pages</h2>
          <p className="mb-0">
            Implemented pages: <code>Home</code>, <code>Integration Map</code>,
            and <code>Requirements</code> using React Router.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

export default RequirementsPage
