const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('fsApi', (path, key) => ipcRenderer.invoke('api', path, key));
