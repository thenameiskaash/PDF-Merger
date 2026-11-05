const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { PDFDocument } = require('pdf-lib')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile('dist/index.html')
}

ipcMain.handle('merge-pdfs', async (event, fileBuffers) => {
  try {
    const mergedPdf = await PDFDocument.create()

    for (const fileBuffer of fileBuffers) {
      const bytes = new Uint8Array(fileBuffer)
      const pdf = await PDFDocument.load(bytes)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach((page) => mergedPdf.addPage(page))
    }

    const now = new Date()
    const timestamp = now.toLocaleDateString('en-GB').replace(/\//g, '-') +
                      '_' +
                      now.toLocaleTimeString('en-GB').replace(/:/g, '-')
    const defaultName = `merged_${timestamp}.pdf`

    const { filePath: savePath } = await dialog.showSaveDialog({
      title: 'Save Merged PDF',
      defaultPath: defaultName,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    })

    if (!savePath) return { success: false, message: 'Save cancelled.' }

    const mergedBytes = await mergedPdf.save()
    fs.writeFileSync(savePath, mergedBytes)

    return { success: true, message: `Saved to ${savePath}` }
  } catch (err) {
    return { success: false, message: err.message }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})