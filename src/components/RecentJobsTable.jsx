import { Badge, Card, Table } from 'react-bootstrap'

function statusBadge(status) {
  if (status === 'Completed') return 'success'
  if (status === 'Running') return 'warning'
  return 'secondary'
}

function formatAge(timestamp) {
  if (!timestamp) return '-'
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (Number.isNaN(seconds) || seconds < 0) return '-'
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function RecentJobsTable({ jobs }) {
  return (
    <Card className="panel">
      <Card.Body>
        <h2>Recent Translation Jobs</h2>
        {jobs.length === 0 ? (
          <p className="muted-note mb-0">No jobs yet. Start a translation on the Translate page.</p>
        ) : (
          <Table responsive hover className="module-table mt-3">
            <thead>
              <tr>
                <th>File</th>
                <th>Language Pair</th>
                <th>Provider</th>
                <th>Outputs</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.fileName}</td>
                  <td>
                    {job.sourceLanguage} {'->'} {job.targetLanguage}
                  </td>
                  <td>{job.provider}</td>
                  <td>
                    {job.includeBilingual ? 'Dual ' : ''}
                    {job.includeMonolingual ? 'Mono ' : ''}
                    {job.includeGlossary ? 'Glossary' : ''}
                  </td>
                  <td>
                    <Badge bg={statusBadge(job.status)}>{job.status}</Badge>
                  </td>
                  <td>{job.progress ?? 0}%</td>
                  <td>{formatAge(job.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

export default RecentJobsTable
