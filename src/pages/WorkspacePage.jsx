import { Card } from 'react-bootstrap'
import JobFilterBar from '../components/JobFilterBar'
import JobSummaryCards from '../components/JobSummaryCards'
import RecentJobsTable from '../components/RecentJobsTable'

function WorkspacePage({ jobs, activeFilter, onFilterChange }) {
  const visibleJobs =
    activeFilter === 'All' ? jobs : jobs.filter((job) => job.status === activeFilter)

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="panel">
        <Card.Body>
          <h1 className="display-title">Workspace</h1>
          <p className="lead-copy">
            Track translation tasks, monitor status, and review output settings.
          </p>
        </Card.Body>
      </Card>
      <JobSummaryCards jobs={jobs} />
      <JobFilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <RecentJobsTable jobs={visibleJobs} />
    </div>
  )
}

export default WorkspacePage
