import { Card } from 'react-bootstrap'
import RecentJobsTable from '../components/RecentJobsTable'

function WorkspacePage() {
  return (
    <div className="d-flex flex-column gap-4">
      <Card className="panel">
        <Card.Body>
          <h1 className="display-title">Workspace</h1>
          <p className="lead-copy">
            Track running jobs, check completed files, and review which provider
            was used for each translation.
          </p>
        </Card.Body>
      </Card>
      <RecentJobsTable />
      <Card className="panel">
        <Card.Body>
          <h2>Download Center</h2>
          <p className="mb-2">
            Completed jobs will provide two files: bilingual PDF and monolingual
            PDF.
          </p>
          <p className="mb-0 muted-note">
            Tip: keep your API key private and rotate it if it is shared by
            mistake.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

export default WorkspacePage
