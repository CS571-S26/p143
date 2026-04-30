import { useState } from 'react'
import { Badge, Button, Card, Form, Table } from 'react-bootstrap'

function statusBadge(status) {
  if (status === 'Completed') return 'success'
  if (status === 'Running') return 'warning'
  if (status === 'Failed') return 'danger'
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

function RecentJobsTable({ jobs, onJobUpdate, onJobDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({
    fileName: '',
    sourceLanguage: '',
    targetLanguage: '',
  })

  const startEditing = (job) => {
    setEditingId(job.id)
    setDraft({
      fileName: job.fileName,
      sourceLanguage: job.sourceLanguage,
      targetLanguage: job.targetLanguage,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setDraft({ fileName: '', sourceLanguage: '', targetLanguage: '' })
  }

  const saveEditing = async (jobId) => {
    const saved = await onJobUpdate(jobId, {
      fileName: draft.fileName,
      sourceLanguage: draft.sourceLanguage,
      targetLanguage: draft.targetLanguage,
    })
    if (saved) {
      cancelEditing()
    }
  }

  const onDraftChange = (key, value) => {
    setDraft((previous) => ({ ...previous, [key]: value }))
  }

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
                <th>Message</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const isEditing = editingId === job.id
                const canDelete = !['Queued', 'Running'].includes(job.status)
                const canEdit = canDelete
                return (
                  <tr key={job.id}>
                    <td>
                      {isEditing ? (
                        <Form.Group controlId={`fileName-${job.id}`}>
                          <Form.Label className="visually-hidden">File name</Form.Label>
                          <Form.Control
                            value={draft.fileName}
                            onChange={(event) => onDraftChange('fileName', event.target.value)}
                          />
                        </Form.Group>
                      ) : (
                        job.fileName
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="table-edit-grid">
                          <Form.Group controlId={`sourceLanguage-${job.id}`}>
                            <Form.Label className="visually-hidden">Source language</Form.Label>
                            <Form.Control
                              value={draft.sourceLanguage}
                              onChange={(event) =>
                                onDraftChange('sourceLanguage', event.target.value)
                              }
                            />
                          </Form.Group>
                          <span aria-hidden="true">{'->'}</span>
                          <Form.Group controlId={`targetLanguage-${job.id}`}>
                            <Form.Label className="visually-hidden">Target language</Form.Label>
                            <Form.Control
                              value={draft.targetLanguage}
                              onChange={(event) =>
                                onDraftChange('targetLanguage', event.target.value)
                              }
                            />
                          </Form.Group>
                        </div>
                      ) : (
                        <>
                          {job.sourceLanguage} {'->'} {job.targetLanguage}
                        </>
                      )}
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
                    <td>{job.error || job.message || '-'}</td>
                    <td>{formatAge(job.updatedAt)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="success"
                              onClick={() => saveEditing(job.id)}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline-secondary"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-dark"
                            disabled={!canEdit}
                            onClick={() => startEditing(job)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline-danger"
                          disabled={!canDelete}
                          onClick={() => onJobDelete(job)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

export default RecentJobsTable
