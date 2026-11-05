import { useState } from 'react'

function App() {
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    )
    setFiles((prev) => [...prev, ...dropped])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMerge = async () => {
  if (files.length < 2) {
    setStatus('⚠️ Please add at least 2 PDF files.')
    return
  }
  setStatus('⏳ Merging...')

  const fileBuffers = await Promise.all(
    files.map((f) => f.arrayBuffer().then((buf) => Array.from(new Uint8Array(buf))))
  )

  const result = await window.electronAPI.mergePdfs(fileBuffers)
  setStatus(result.success ? `✅ ${result.message}` : `❌ ${result.message}`)
  if (result.success) setFiles([])
}

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>PDF Merger</h1>
      <p style={styles.subtitle}>Drag and drop your PDF files below</p>

      <div
        style={{ ...styles.dropzone, borderColor: dragging ? '#4f8ef7' : '#aaa' }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
      >
        {dragging ? 'Drop your PDFs here!' : '⬆ Drag & Drop PDFs here'}
      </div>

      {files.length > 0 && (
        <ul style={styles.fileList}>
          {files.map((file, i) => (
            <li key={i} style={styles.fileItem}>
              📄 {file.name}
              <button style={styles.removeBtn} onClick={() => removeFile(i)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <button style={styles.mergeBtn} onClick={handleMerge}>
        Merge PDFs
      </button>

      {status && <p style={styles.status}>{status}</p>}
    </div>
  )
}

const styles = {
  container: { fontFamily: 'Arial', maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' },
  title: { fontSize: 28, color: '#333' },
  subtitle: { color: '#777' },
  dropzone: { border: '2px dashed', borderRadius: 12, padding: 40, fontSize: 18, cursor: 'pointer', margin: '20px 0', color: '#555', transition: 'border-color 0.2s' },
  fileList: { listStyle: 'none', padding: 0, textAlign: 'left' },
  fileItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f4f4f4', borderRadius: 6, marginBottom: 6 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontWeight: 'bold' },
  mergeBtn: { background: '#4f8ef7', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 8, fontSize: 16, cursor: 'pointer', marginTop: 16 },
  status: { marginTop: 20, fontWeight: 'bold' },
}

export default App