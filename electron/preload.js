const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  mergePdfs: (fileBuffers) => ipcRenderer.invoke('merge-pdfs', fileBuffers),
})  