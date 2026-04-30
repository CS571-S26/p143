import { Button, ButtonGroup, Card } from 'react-bootstrap'

const FILTERS = ['All', 'Queued', 'Running', 'Completed', 'Failed']

function JobFilterBar({ activeFilter, onFilterChange }) {
  return (
    <Card className="panel">
      <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h2 className="mb-0">Filter Jobs</h2>
        <ButtonGroup aria-label="job-filters">
          {FILTERS.map((filter) => (
            <Button
              key={filter}
              variant={filter === activeFilter ? 'dark' : 'outline-dark'}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Button>
          ))}
        </ButtonGroup>
      </Card.Body>
    </Card>
  )
}

export default JobFilterBar
