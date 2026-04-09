import Table from 'react-bootstrap/Table'

const rows = [
  {
    module: 'pdf2zh/high_level.py',
    purpose: 'Main translation orchestration and output generation',
    reuse: 'Use as the main backend flow',
  },
  {
    module: 'pdf2zh/converter.py',
    purpose: 'Text/formula parsing and PDF operator rewrite',
    reuse: 'Use for the main translation logic',
  },
  {
    module: 'pdf2zh/doclayout.py',
    purpose: 'ONNX DocLayout detection wrapper',
    reuse: 'Use in the layout detection step',
  },
  {
    module: 'pdf2zh/translator.py',
    purpose: 'Provider adapters and prompt handling',
    reuse: 'Keep only OpenAI/DeepSeek/Gemini',
  },
  {
    module: 'pdf2zh/cache.py',
    purpose: 'SQLite translation cache',
    reuse: 'Optional speed improvement',
  },
  {
    module: 'pdf2zh/converter_docx.py',
    purpose: 'DOC/DOCX to PDF conversion',
    reuse: 'Optional pre-processing',
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
