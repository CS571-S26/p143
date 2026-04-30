import { useMemo, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'

function DownloadList({ completedJobs, apiBaseUrl, onArtifactDelete, onJobDelete }) {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return completedJobs
    return completedJobs.filter((job) =>
      job.fileName.toLowerCase().includes(query.trim().toLowerCase()),
    )
  }, [completedJobs, query])

  const handleDownload = (job, artifact, fileType) => {
    const url = `${apiBaseUrl}/api/jobs/${encodeURIComponent(job.id)}/download/${artifact}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setNotice(`${fileType} download requested for ${job.fileName}.`)
  }

  const artifacts = [
    { key: 'dual', label: 'Dual PDF', type: 'Bilingual PDF' },
    { key: 'mono', label: 'Mono PDF', type: 'Monolingual PDF' },
    { key: 'source', label: 'Source TXT', type: 'Source text' },
    { key: 'translated', label: 'Translated TXT', type: 'Translated text' },
    { key: 'glossary', label: 'Glossary CSV', type: 'Glossary CSV' },
  ]

  return (
    <Card className="panel">
      <Card.Body>
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <h2 className="mb-1">Downloads</h2>
            <p className="muted-note mb-0">Search completed jobs and prepare outputs.</p>
          </div>
          <Form.Group controlId="downloadSearch" className="download-search">
            <Form.Label>Search completed jobs</Form.Label>
            <Form.Control
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by file name"
            />
          </Form.Group>
        </div>

        {notice && (
          <Alert variant="success" className="mt-3 mb-0" aria-live="polite">
            {notice}
          </Alert>
        )}

        {filteredJobs.length === 0 ? (
          <p className="muted-note mt-3 mb-0">No completed files match your search.</p>
        ) : (
          <div className="d-flex flex-column gap-3 mt-3">
            {filteredJobs.map((job) => (
              <div key={job.id} className="download-item">
                <div>
                  <p className="mb-1 fw-semibold">{job.fileName}</p>
                  <p className="mb-0 muted-note">
                    {job.sourceLanguage} {'->'} {job.targetLanguage} via {job.provider}
                  </p>
                </div>
                <div className="download-actions">
                  {artifacts.filter((artifact) => job.downloads?.[artifact.key]).length === 0 ? (
                    <p className="muted-note mb-0">No generated files remain.</p>
                  ) : (
                    artifacts
                      .filter((artifact) => job.downloads?.[artifact.key])
                      .map((artifact) => (
                        <div key={artifact.key} className="artifact-actions">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-dark"
                            onClick={() => handleDownload(job, artifact.key, artifact.type)}
                          >
                            {artifact.label}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-danger"
                            onClick={() => onArtifactDelete(job, artifact.key, artifact.label)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => onJobDelete(job)}
                  >
                    Remove Job
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default DownloadList
