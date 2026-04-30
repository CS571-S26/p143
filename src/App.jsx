import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrimaryNavBar from './components/PrimaryNavBar'
import DownloadsPage from './pages/DownloadsPage'
import HomePage from './pages/HomePage'
import WorkspacePage from './pages/WorkspacePage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const initialSettings = {
  provider: 'OpenAI',
  sourceLanguage: 'English',
  targetLanguage: 'Chinese (Simplified)',
  apiKey: '',
  model: '',
  includeBilingual: true,
  includeMonolingual: true,
  includeGlossary: false,
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [settings, setSettings] = useState(initialSettings)
  const [jobs, setJobs] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [notice, setNotice] = useState(null)
  const hasShownBackendError = useRef(false)

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'Completed'),
    [jobs],
  )

  const canStartTranslation =
    Boolean(selectedFile?.rawFile) &&
    Boolean(settings.apiKey.trim()) &&
    (settings.includeBilingual || settings.includeMonolingual || settings.includeGlossary)

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`)
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      const payload = await response.json()
      setJobs(payload.jobs || [])
    } catch {
      if (!hasShownBackendError.current) {
        hasShownBackendError.current = true
        setNotice({
          variant: 'warning',
          text:
            'Backend is unreachable. Start the API server with "python backend/run.py" in another terminal.',
        })
      }
    }
  }, [])

  useEffect(() => {
    fetchJobs()
    const timerId = window.setInterval(fetchJobs, 2500)
    return () => window.clearInterval(timerId)
  }, [fetchJobs])

  const onFileSelect = (file) => {
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      setNotice({ variant: 'danger', text: 'Only PDF and TXT files are supported.' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotice({ variant: 'warning', text: 'File is too large. Maximum size is 10 MB.' })
      return
    }

    const sizeMb = file.size / (1024 * 1024)
    setSelectedFile({
      name: file.name,
      sizeLabel: `${sizeMb.toFixed(2)} MB`,
      rawSize: file.size,
      type: file.type,
      rawFile: file,
    })
    setNotice({ variant: 'info', text: `Selected ${file.name}` })
  }

  const onFileClear = () => {
    setSelectedFile(null)
    setNotice({ variant: 'secondary', text: 'File selection cleared.' })
  }

  const onSettingChange = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const onOutputToggle = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  const onStartTranslation = async () => {
    if (!canStartTranslation || !selectedFile?.rawFile) {
      setNotice({
        variant: 'warning',
        text: 'Please add a file, API key, and at least one output option.',
      })
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile.rawFile)
    formData.append('provider', settings.provider)
    formData.append('sourceLanguage', settings.sourceLanguage)
    formData.append('targetLanguage', settings.targetLanguage)
    formData.append('apiKey', settings.apiKey)
    formData.append('model', settings.model)
    formData.append('includeBilingual', String(settings.includeBilingual))
    formData.append('includeMonolingual', String(settings.includeMonolingual))
    formData.append('includeGlossary', String(settings.includeGlossary))

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.detail || 'Unable to start translation job.')
      }
      setNotice({
        variant: 'success',
        text: `Job queued for ${selectedFile.name}. Watch it in Workspace.`,
      })
      setSelectedFile(null)
      setActiveFilter('All')
      fetchJobs()
    } catch (error) {
      setNotice({
        variant: 'danger',
        text: error.message || 'Failed to create translation job.',
      })
    }
  }

  const parseApiError = async (response, fallback) => {
    try {
      const payload = await response.json()
      return payload.detail || fallback
    } catch {
      return fallback
    }
  }

  const onJobUpdate = async (jobId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${encodeURIComponent(jobId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Unable to update job.'))
      }
      const payload = await response.json()
      setJobs((previous) =>
        previous.map((job) => (job.id === jobId ? payload.job : job)),
      )
      setNotice({ variant: 'success', text: 'Job details updated.' })
      return true
    } catch (error) {
      setNotice({ variant: 'danger', text: error.message || 'Failed to update job.' })
      return false
    }
  }

  const onJobDelete = async (job) => {
    if (!window.confirm(`Remove "${job.fileName}" and all of its generated files?`)) {
      return false
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${encodeURIComponent(job.id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Unable to delete job.'))
      }
      setJobs((previous) => previous.filter((item) => item.id !== job.id))
      setNotice({ variant: 'success', text: `Removed ${job.fileName}.` })
      return true
    } catch (error) {
      setNotice({ variant: 'danger', text: error.message || 'Failed to delete job.' })
      return false
    }
  }

  const onArtifactDelete = async (job, artifact, label) => {
    if (!window.confirm(`Remove ${label} for "${job.fileName}"?`)) {
      return false
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${encodeURIComponent(job.id)}/artifacts/${artifact}`,
        { method: 'DELETE' },
      )
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Unable to remove file.'))
      }
      const payload = await response.json()
      setJobs((previous) =>
        previous.map((item) => (item.id === job.id ? payload.job : item)),
      )
      setNotice({ variant: 'success', text: `Removed ${label} for ${job.fileName}.` })
      return true
    } catch (error) {
      setNotice({ variant: 'danger', text: error.message || 'Failed to remove file.' })
      return false
    }
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <PrimaryNavBar />
        <main className="py-4 py-md-5">
          <Container>
            {notice && (
              <Alert
                variant={notice.variant}
                dismissible
                onClose={() => setNotice(null)}
                className="mb-4"
                aria-live="polite"
              >
                {notice.text}
              </Alert>
            )}

            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    selectedFile={selectedFile}
                    settings={settings}
                    onFileSelect={onFileSelect}
                    onFileClear={onFileClear}
                    onSettingChange={onSettingChange}
                    onOutputToggle={onOutputToggle}
                    onStartTranslation={onStartTranslation}
                    canStartTranslation={canStartTranslation}
                  />
                }
              />
              <Route
                path="/workspace"
                element={
                  <WorkspacePage
                    jobs={jobs}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onJobUpdate={onJobUpdate}
                    onJobDelete={onJobDelete}
                  />
                }
              />
              <Route
                path="/downloads"
                element={
                  <DownloadsPage
                    completedJobs={completedJobs}
                    apiBaseUrl={API_BASE_URL}
                    onArtifactDelete={onArtifactDelete}
                    onJobDelete={onJobDelete}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </main>
      </div>
    </HashRouter>
  )
}

export default App
