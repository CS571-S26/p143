import Table from 'react-bootstrap/Table'

const rows = [
  {
    module: 'pdf2zh/high_level.py',
    purpose: 'Main translation orchestration and output generation',
    reuse: 'Backend service layer',
  },
  {
    module: 'pdf2zh/converter.py',
    purpose: 'Text/formula parsing and PDF operator rewrite',
    reuse: 'Core translation engine',
  },
  {
    module: 'pdf2zh/doclayout.py',
    purpose: 'ONNX DocLayout detection wrapper',
    reuse: 'Layout-analysis stage',
  },
  {
    module: 'pdf2zh/translator.py',
    purpose: 'Provider adapters and prompt handling',
    reuse: 'Restrict to OpenAI/DeepSeek/Gemini',
  },
  {
    module: 'pdf2zh/cache.py',
    purpose: 'SQLite translation cache',
    reuse: 'Optional performance layer',
  },
  {
    module: 'pdf2zh/converter_docx.py',
    purpose: 'DOC/DOCX to PDF conversion',
    reuse: 'Optional pre-processing path',
  },
]

function ModuleReuseTable() {
  return (
    <Table responsive bordered hover className="module-table">
      <thead>
        <tr>
          <th>Module</th>
          <th>Main Purpose</th>
          <th>Reuse Plan</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.module}>
            <td>{row.module}</td>
            <td>{row.purpose}</td>
            <td>{row.reuse}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default ModuleReuseTable
