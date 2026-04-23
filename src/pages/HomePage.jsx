import { Col, Row } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import FileUploadCard from '../components/FileUploadCard'
import OutputOptionsCard from '../components/OutputOptionsCard'
import ScopePanel from '../components/ScopePanel'
import TranslationOptionsCard from '../components/TranslationOptionsCard'
import WorkflowGrid from '../components/WorkflowGrid'

function HomePage({
  selectedFile,
  settings,
  onFileSelect,
  onFileClear,
  onSettingChange,
  onOutputToggle,
  onStartTranslation,
  canStartTranslation,
}) {
  return (
    <div className="d-flex flex-column gap-4">
      <HeroSection />
      <Row className="g-4">
        <Col lg={4}>
          <FileUploadCard
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onFileClear={onFileClear}
          />
        </Col>
        <Col lg={4}>
          <TranslationOptionsCard settings={settings} onSettingChange={onSettingChange} />
        </Col>
        <Col lg={4}>
          <OutputOptionsCard
            settings={settings}
            onOutputToggle={onOutputToggle}
            onStartTranslation={onStartTranslation}
            canStart={canStartTranslation}
          />
        </Col>
      </Row>
      <ScopePanel />
      <WorkflowGrid />
    </div>
  )
}

export default HomePage
