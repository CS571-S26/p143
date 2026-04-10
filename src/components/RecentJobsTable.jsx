import { Badge, Card, Table } from 'react-bootstrap'

const jobs = [
  {
    file: 'Phenomenology_Intro.pdf',
    pair: 'English -> Chinese (Simplified)',
    provider: 'OpenAI',
    status: 'Completed',
    updated: '2 min ago',
  },
  {
    file: 'Ethics_Notes.txt',
    pair: 'German -> English',
    provider: 'DeepSeek',
    status: 'Running',
    updated: 'just now',
  },
  {
    file: 'Logic_Seminar.pdf',
    pair: 'Japanese -> Korean',
    provider: 'Gemini',
    status: 'Queued',
    updated: '1 min ago',
  },
]

function statusBadge(status) {
  if (status === 'Completed') return 'success'
  if (status === 'Running') return 'warning'
  return 'secondary'
}

function RecentJobsTable() {
  return (
    <Card className="panel">
      <Card.Body>
        <h2>Recent Translation Jobs</h2>
        <Table responsive hover className="module-table mt-3">
          <thead>
            <tr>
              <th>File</th>
              <th>Language Pair</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.file}>
                <td>{job.file}</td>
                <td>{job.pair}</td>
                <td>{job.provider}</td>
                <td>
                  <Badge bg={statusBadge(job.status)}>{job.status}</Badge>
                </td>
                <td>{job.updated}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export default RecentJobsTable
