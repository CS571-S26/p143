import { Card } from 'react-bootstrap'
import DownloadList from '../components/DownloadList'

function DownloadsPage({ completedJobs, apiBaseUrl }) {
  return (
    <div className="d-flex flex-column gap-4">
      <Card className="panel">
        <Card.Body>
          <h1 className="display-title">Downloads</h1>
          <p className="lead-copy">
            Access generated files from completed jobs, including dual PDF, mono PDF,
            and optional glossary output.
          </p>
        </Card.Body>
      </Card>
      <DownloadList completedJobs={completedJobs} apiBaseUrl={apiBaseUrl} />
    </div>
  )
}

export default DownloadsPage
