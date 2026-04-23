import { useMemo, useState } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrimaryNavBar from './components/PrimaryNavBar'
import DownloadsPage from './pages/DownloadsPage'
import HomePage from './pages/HomePage'
import WorkspacePage from './pages/WorkspacePage'

const initialSettings = {
  provider: 'OpenAI',
  sourceLanguage: 'English',
  targetLanguage: 'Chinese (Simplified)',
  apiKey: '',
  includeBilingual: true,
  includeMonolingual: true,
  includeGlossary: false,
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [settings, setSettings] = useState(initialSettings)
  const [jobs, setJobs] = useState([
    {
      id: 'seed-completed',
      fileName: 'Classical_Logic.pdf',
      provider: 'OpenAI',
      sourceLanguage: 'English',
      targetLanguage: 'Chinese (Traditional)',
      includeBilingual: true,
      includeMonolingual: true,
      includeGlossary: true,
      status: 'Completed',
      updatedAt: Date.now() - 1000 * 60 * 8,
    },
  ])
  const [activeFilter, setActiveFilter] = useState('All')
  const [notice, setNotice] = useState(null)

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'Completed'),
    [jobs],
  )

  const canStartTranslation =
    Boolean(selectedFile) &&
    Boolean(settings.apiKey.trim()) &&
    (settings.includeBilingual || settings.includeMonolingual || settings.includeGlossary)

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

  const updateJob = (jobId, changes) => {
    setJobs((previous) =>
      previous.map((job) =>
        job.id === jobId
          ? {
              ...job,
              ...changes,
              updatedAt: Date.now(),
            }
          : job,
      ),
    )
  }

  const onStartTranslation = () => {
    if (!canStartTranslation || !selectedFile) {
      setNotice({
        variant: 'warning',
        text: 'Please add a file, API key, and at least one output option.',
      })
      return
    }

    const jobId = `job-${Date.now()}`
    const newJob = {
      id: jobId,
      fileName: selectedFile.name,
      provider: settings.provider,
      sourceLanguage: settings.sourceLanguage,
      targetLanguage: settings.targetLanguage,
      includeBilingual: settings.includeBilingual,
      includeMonolingual: settings.includeMonolingual,
      includeGlossary: settings.includeGlossary,
      status: 'Queued',
      updatedAt: Date.now(),
    }

    setJobs((previous) => [newJob, ...previous])
    setNotice({
      variant: 'success',
      text: `Job queued for ${selectedFile.name}. Check Workspace for status updates.`,
    })
    setActiveFilter('All')

    window.setTimeout(() => updateJob(jobId, { status: 'Running' }), 700)
    window.setTimeout(() => updateJob(jobId, { status: 'Completed' }), 2600)
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
                  />
                }
              />
              <Route path="/downloads" element={<DownloadsPage completedJobs={completedJobs} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </main>
      </div>
    </HashRouter>
  )
}

export default App
