const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bugTrackerAPI", {
  getAppStatus: () => ipcRenderer.invoke("app:get-status"),
  getIssues: (filters) => ipcRenderer.invoke("issues:get", filters),
  createIssue: (issue) => ipcRenderer.invoke("issues:create", issue),
  updateIssueStatus: (id, status) => ipcRenderer.invoke("issues:update-status", { id, status }),
  syncQueue: () => ipcRenderer.invoke("issues:sync"),
  getQueue: () => ipcRenderer.invoke("issues:get-queue"),
  openExternal: (url) => ipcRenderer.invoke("shell:open-external", url),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  onShowQuickLogger: (callback) => {
    ipcRenderer.on("hotkey:quick-logger", () => callback());
  },
  onStatusUpdated: (callback) => {
    ipcRenderer.on("app:status-updated", (_e, data) => callback(data));
  }
});
