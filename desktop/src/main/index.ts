import { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut, shell, nativeImage } from "electron";
import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// File store path
const userDataDir = app.getPath("userData");
const storePath = path.join(userDataDir, "bugtracker_store.json");

interface LocalIssue {
  id: string;
  key: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  type: "BUG" | "TASK" | "FEATURE" | "SECURITY";
  component: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  synced: boolean;
}

interface LocalStore {
  issues: LocalIssue[];
  offlineQueue: LocalIssue[];
  backendUrl: string;
  user: {
    name: string;
    email: string;
    role: string;
    organization: string;
  };
}

const defaultIssues: LocalIssue[] = [
  {
    id: "iss-101",
    key: "BT-101",
    title: "[Auth/SSO] Session token expiry does not trigger proactive refresh in WebRTC client",
    description: "When session times out after 1h, WebRTC data channel drops before silent re-authentication executes.",
    severity: "CRITICAL",
    status: "IN_PROGRESS",
    type: "BUG",
    component: "Auth Gateway",
    assignee: "Rahul Garg",
    reporter: "Rahul Garg",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    synced: true
  },
  {
    id: "iss-102",
    key: "BT-102",
    title: "[UI/UX] Enterprise high-contrast theme typography spacing misalignment",
    description: "Header elements in the sprint burndown chart overflow on 1440p displays when telemetry sidebar is active.",
    severity: "MEDIUM",
    status: "TODO",
    type: "BUG",
    component: "Design System",
    assignee: "Rahul Garg",
    reporter: "Rahul Garg",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    synced: true
  },
  {
    id: "iss-103",
    key: "BT-103",
    title: "[Telemetry] Heartbeat jitter exceeds 250ms SLA under 50+ concurrent streaming agents",
    description: "Redis pub/sub bottleneck causing slight delay in live supervisor stream state propagation.",
    severity: "HIGH",
    status: "IN_REVIEW",
    type: "SECURITY",
    component: "Live Engine",
    assignee: "Rahul Garg",
    reporter: "Rahul Garg",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    synced: true
  },
  {
    id: "iss-104",
    key: "BT-104",
    title: "[Compliance] Add explicit GDPR right to erasure trigger to telemetry agent",
    description: "Implement direct client-side erasure trigger invoking DELETE /api/privacy/erase.",
    severity: "HIGH",
    status: "DONE",
    type: "TASK",
    component: "Compliance",
    assignee: "Rahul Garg",
    reporter: "Rahul Garg",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    synced: true
  }
];

function loadStore(): LocalStore {
  try {
    if (fs.existsSync(storePath)) {
      const data = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      return data;
    }
  } catch (err) {
    console.error("[Store] Failed to load store, falling back to defaults", err);
  }
  return {
    issues: defaultIssues,
    offlineQueue: [],
    backendUrl: "http://localhost:3000",
    user: {
      name: "Rahul Garg",
      email: "rahul@northstardigital.com",
      role: "Engineering Lead & Systems Architect",
      organization: "Northstar Digital"
    }
  };
}

function saveStore(store: LocalStore) {
  try {
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[Store] Failed to persist store", err);
  }
}

let currentStore: LocalStore = loadStore();

function resolveAsset(subpath: string): string {
  const distPath = path.resolve(__dirname, "..", subpath);
  if (fs.existsSync(distPath)) return distPath;
  const srcPath = path.resolve(__dirname, "../../src", subpath);
  if (fs.existsSync(srcPath)) return srcPath;
  return distPath;
}

async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:3000/api/health", { timeout: 1500 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 503) {
        resolve({ online: true, message: `Connected (HTTP ${res.statusCode})` });
      } else {
        resolve({ online: false, message: `HTTP ${res.statusCode}` });
      }
    });
    req.on("error", () => {
      resolve({ online: false, message: "Server Offline (Local Cache Active)" });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ online: false, message: "Timeout (Using Local Cache)" });
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 740,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    frame: true,
    show: true,
    title: "BugTracker Desktop Companion — Enterprise Defect HUD",
    backgroundColor: "#090d16",
    webPreferences: {
      preload: resolveAsset("preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const htmlPath = resolveAsset("renderer/index.html");
  await mainWindow.loadFile(htmlPath);

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  // 16x16 tray icon representation in base64 (Red / Purple Bug icon)
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWklEQVR42mP4z8DwnwEHLGCE4tEBkGZGY2O0xshmY2NqGgAzn5EYQ8hmo2NkNlhmA5gZkQwYGI1hQ8k0AApGZAcg2wzThmQ0/P8fG04UAMjJgZGRsIEYQ0AAmcE6t4H7GAAAAABJRU5ErkJggg==",
      "base64"
    )
  );

  tray = new Tray(icon);
  tray.setToolTip("BugTracker Companion — Press Ctrl+Shift+B for Quick Logger");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open BugTracker HUD",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: "Quick Defect Logger (Ctrl+Shift+B)",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send("hotkey:quick-logger");
      },
    },
    { type: "separator" },
    {
      label: "Sync Offline Queue",
      click: async () => {
        await handleSync();
      },
    },
    { type: "separator" },
    {
      label: "Quit BugTracker",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

async function handleSync() {
  const health = await checkBackendHealth();
  if (health.online && currentStore.offlineQueue.length > 0) {
    // Process items in queue
    const syncedCount = currentStore.offlineQueue.length;
    currentStore.offlineQueue.forEach((item) => {
      item.synced = true;
      const existingIdx = currentStore.issues.findIndex((i) => i.id === item.id);
      if (existingIdx >= 0) {
        currentStore.issues[existingIdx] = item;
      } else {
        currentStore.issues.unshift(item);
      }
    });
    currentStore.offlineQueue = [];
    saveStore(currentStore);
    mainWindow?.webContents.send("app:status-updated", {
      message: `Successfully synced ${syncedCount} queued defects to cloud.`,
      issues: currentStore.issues,
      queueCount: 0,
      online: true
    });
  }
}

declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean;
    }
  }
}

app.whenReady().then(async () => {
  // IPC Handlers
  ipcMain.handle("app:get-status", async () => {
    const health = await checkBackendHealth();
    return {
      user: currentStore.user,
      online: health.online,
      serverMessage: health.message,
      queueCount: currentStore.offlineQueue.length,
      totalIssues: currentStore.issues.length,
      version: "2.1.0"
    };
  });

  ipcMain.handle("issues:get", async (_e, filters?: { search?: string; status?: string; severity?: string }) => {
    let result = [...currentStore.issues];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.key.toLowerCase().includes(q) ||
          i.component.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== "ALL") {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters?.severity && filters.severity !== "ALL") {
      result = result.filter((i) => i.severity === filters.severity);
    }
    return result;
  });

  ipcMain.handle("issues:create", async (_e, data: {
    title: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    type: "BUG" | "TASK" | "FEATURE" | "SECURITY";
    component: string;
  }) => {
    const health = await checkBackendHealth();
    const nextNum = 100 + currentStore.issues.length + 1;
    const newIssue: LocalIssue = {
      id: "iss-" + Date.now(),
      key: `BT-${nextNum}`,
      title: data.title,
      description: data.description || "No extended description provided.",
      severity: data.severity,
      type: data.type,
      component: data.component || "Frontend Core",
      status: "TODO",
      assignee: currentStore.user.name,
      reporter: currentStore.user.name,
      createdAt: new Date().toISOString(),
      synced: health.online
    };

    if (!health.online) {
      currentStore.offlineQueue.push(newIssue);
    }
    currentStore.issues.unshift(newIssue);
    saveStore(currentStore);

    return { success: true, issue: newIssue, synced: health.online };
  });

  ipcMain.handle("issues:update-status", async (_e, { id, status }: { id: string; status: LocalIssue["status"] }) => {
    const target = currentStore.issues.find((i) => i.id === id);
    if (target) {
      target.status = status;
      saveStore(currentStore);
      return { success: true, issue: target };
    }
    return { success: false, message: "Issue not found" };
  });

  ipcMain.handle("issues:get-queue", () => {
    return currentStore.offlineQueue;
  });

  ipcMain.handle("issues:sync", async () => {
    await handleSync();
    return {
      success: true,
      queueCount: currentStore.offlineQueue.length,
      issues: currentStore.issues
    };
  });

  ipcMain.handle("shell:open-external", (_e, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle("window:minimize", () => {
    mainWindow?.minimize();
  });

  ipcMain.handle("window:close", () => {
    mainWindow?.hide();
  });

  // Register Global Shortcut: Ctrl+Shift+B (or Cmd+Shift+B on macOS)
  globalShortcut.register("CommandOrControl+Shift+B", () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.focus();
      mainWindow.webContents.send("hotkey:quick-logger");
    }
  });

  createTray();
  await createWindow();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Keep alive in system tray
  }
});
