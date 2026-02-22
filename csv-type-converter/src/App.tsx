import { useState, useMemo, useCallback, useRef } from 'react'
import { parseCSV, inferType, toDelimited, COLUMN_TYPES } from './csvUtils'
import type { ColumnType } from './csvUtils'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [columnTypes, setColumnTypes] = useState<ColumnType[]>([])
  const [outputFormat, setOutputFormat] = useState<'csv' | 'tsv'>('csv')
  const [copied, setCopied] = useState(false)
  const prevHeaderCountRef = useRef(0)

  const parsed = useMemo(() => parseCSV(inputText), [inputText])
  const headers = parsed.length > 0 ? parsed[0] : []

  // Sync column types when headers change
  useMemo(() => {
    const headerCount = headers.length
    if (headerCount === 0) {
      // Don't reset types when input is cleared - preserve for re-paste
      prevHeaderCountRef.current = 0
      return
    }

    const dataRows = parsed.slice(1)

    if (prevHeaderCountRef.current === 0) {
      // Fresh paste (from empty): infer all types
      const inferred = headers.map((_, i) => {
        const colValues = dataRows.map(row => row[i] ?? '')
        return inferType(colValues)
      })
      setColumnTypes(inferred)
    } else {
      // Content changed while already having data: preserve existing type settings by index
      setColumnTypes(prev => {
        const newTypes: ColumnType[] = []
        for (let i = 0; i < headerCount; i++) {
          newTypes.push(prev[i] ?? inferType(dataRows.map(row => row[i] ?? '')))
        }
        return newTypes
      })
    }
    prevHeaderCountRef.current = headerCount
  }, [headers.length, parsed])

  const outputText = useMemo(() => {
    if (parsed.length === 0) return ''
    const delimiter = outputFormat === 'tsv' ? '\t' : ','
    return toDelimited(parsed, columnTypes, delimiter)
  }, [parsed, columnTypes, outputFormat])

  const handleTypeChange = useCallback((index: number, type: ColumnType) => {
    setColumnTypes(prev => {
      const next = [...prev]
      next[index] = type
      return next
    })
  }, [])

  const handleCopy = useCallback(async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [outputText])

  return (
    <div className="app">
      <header className="app-header">
        <h1>CSV Type Converter</h1>
      </header>

      <div className="main-content">
        {/* Left panel: Input */}
        <div className="panel">
          <div className="panel-header">Input CSV</div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste your CSV here..."
            spellCheck={false}
          />
        </div>

        <div className="divider" />

        {/* Right panel: Output */}
        <div className="panel">
          <div className="panel-header">
            <span>Output</span>
            <div className="output-controls">
              <select
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value as 'csv' | 'tsv')}
              >
                <option value="csv">CSV</option>
                <option value="tsv">TSV</option>
              </select>
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                disabled={!outputText}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {headers.length > 0 && (
            <div className="type-config">
              <div className="type-config-title">Column Types</div>
              {headers.map((header, i) => (
                <div key={i} className="type-row">
                  <span className="col-name" title={header}>{header}</span>
                  <select
                    value={columnTypes[i] ?? 'string'}
                    onChange={e => handleTypeChange(i, e.target.value as ColumnType)}
                  >
                    {COLUMN_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="output-textarea"
            value={outputText}
            readOnly
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>
    </div>
  )
}

export default App
