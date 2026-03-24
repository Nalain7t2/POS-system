const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: process.versions,
  getDatabasePath: () => {
    const dbPath = ipcRenderer.sendSync('get-database-path');
    return dbPath;
  }
});