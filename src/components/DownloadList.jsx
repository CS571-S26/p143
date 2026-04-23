import { useMemo, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'

function DownloadList({ completedJobs, apiBaseUrl }) {
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

  return (
    <Card className="panel">
      <Card.Body>
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <h2 className="mb-1">Downloads</h2>
            <p className="muted-note mb-0">Search completed jobs and prepare outputs.</p>
          </div>
          <Form.Control
            style={{ maxWidth: 300 }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file name"
          />
        </div>

        {notice && (
          <Alert variant="success" className="mt-3 mb-0">
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
                <div className="d-flex flex-wrap gap-2">
                  {job.includeBilingual && (
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => handleDownload(job, 'dual', 'Bilingual PDF')}
                    >
                      Dual PDF
                    </Button>
                  )}
                  {job.includeMonolingual && (
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => handleDownload(job, 'mono', 'Monolingual PDF')}
                    >
                      Mono PDF
                    </Button>
                  )}
                  {job.includeGlossary && (
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => handleDownload(job, 'glossary', 'Glossary CSV')}
                    >
                      Glossary
                    </Button>
                  )}
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
