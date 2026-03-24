const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const net = require("net");

let mainWindow;
let serverProcess;
let activePort = null;

// Find available port
function findAvailablePort(startPort, callback) {
  const server = net.createServer();
  server.listen(startPort, () => {
    const port = server.address().port;
    server.close(() => callback(port));
  });
  server.on('error', () => {
    findAvailablePort(startPort + 1, callback);
  });
}

function startServer(port) {
  activePort = port;
  
  let nodePath, serverPath, staticPath;
  
  // 🔥 Check if we're in production or development
  if (app.isPackaged) {
    // Production mode (installed EXE on client machine)
    const resourcesPath = process.resourcesPath;
    const unpackedPath = path.join(resourcesPath, "app.asar.unpacked");
    
    nodePath = path.join(unpackedPath, "bin", "node.exe");
    serverPath = path.join(unpackedPath, ".next", "standalone", "server.js");
    staticPath = path.join(unpackedPath, ".next", "static");
    
    console.log(`✅ Production mode`);
  } else {
    // Development mode (npm run electron)
    nodePath = path.join(__dirname, "bin", "node.exe");
    serverPath = path.join(__dirname, ".next", "standalone", "server.js");
    staticPath = path.join(__dirname, ".next", "static");
    
    console.log(`✅ Development mode`);
  }
  
  // Fallback if files not found
  if (!fs.existsSync(nodePath)) {
    nodePath = path.join(__dirname, "bin", "node.exe");
  }
  if (!fs.existsSync(serverPath)) {
    serverPath = path.join(__dirname, ".next", "standalone", "server.js");
  }
  
  console.log(`✅ Static files exist: ${fs.existsSync(staticPath)}`);
  console.log(`✅ Using node: ${nodePath}`);
  console.log(`✅ Server path: ${serverPath}`);
  console.log(`✅ Using port: ${port}`);
  
  // Check if node.exe exists
  if (!fs.existsSync(nodePath)) {
    console.error(`❌ node.exe not found at: ${nodePath}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(`data:text/html,
        <html>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <h1>⚠️ Application Error</h1>
            <p>Required files are missing. Please reinstall the application.</p>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
    }
    return;
  }
  
  // Check if server.js exists
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ server.js not found at: ${serverPath}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(`data:text/html,
        <html>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <h1>⚠️ Application Error</h1>
            <p>Server files are missing. Please reinstall the application.</p>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
    }
    return;
  }
  
  serverProcess = spawn(nodePath, [serverPath], {
    cwd: path.dirname(serverPath),
    env: { ...process.env, NODE_ENV: "production", PORT: port.toString() },
    stdio: "pipe"
  });
  
  serverProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`Server: ${output}`);
    
    // Jab server ready ho, app load karo
    if (output.includes("ready") || output.includes("Ready")) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          const url = `http://localhost:${activePort}`;
          console.log(`✅ Loading app from: ${url}`);
          mainWindow.loadURL(url);
        }
      }, 1000);
    }
  });
  
  serverProcess.stderr.on("data", (data) => {
    const error = data.toString();
    console.error(`Server stderr: ${error}`);
    
    if (error.includes("EADDRINUSE")) {
      console.log("⚠️ Port busy, finding new port...");
      serverProcess.kill();
      findAvailablePort(port + 1, (newPort) => {
        startServer(newPort);
      });
    }
  });
  
  serverProcess.on("error", (err) => {
    console.error("Failed to start server:", err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(`data:text/html,
        <html>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <h1>⚠️ Server Error</h1>
            <p>Failed to start application server.</p>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "public/icon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // Beautiful loading screen
  mainWindow.loadURL(`data:text/html,
    <!DOCTYPE html>
    <html>
    <head>
      <title>POS System</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .loader-container {
          background: white;
          border-radius: 28px;
          padding: 48px 56px;
          text-align: center;
          box-shadow: 0 25px 45px rgba(0,0,0,0.2);
          animation: fadeIn 0.5s ease;
        }
        .logo {
          font-size: 72px;
          margin-bottom: 20px;
          animation: bounce 1s ease infinite;
        }
        h2 {
          color: #1a2b3c;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .subtitle {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 32px;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e9ecef;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 24px;
        }
        .status {
          color: #868e96;
          font-size: 13px;
          font-weight: 500;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      </style>
    </head>
    <body>
      <div class="loader-container">
        <div class="logo">🪙</div>
        <h2>POS System</h2>
        <p class="subtitle">Point of Sale Management</p>
        <div class="spinner"></div>
        <p class="status" id="statusMsg">Initializing system...</p>
      </div>
      <script>
        let dots = 0;
        setInterval(() => {
          const msg = document.getElementById('statusMsg');
          if (msg) {
            dots = (dots + 1) % 4;
            msg.innerText = 'Starting server' + '.'.repeat(dots);
          }
        }, 500);
      </script>
    </body>
    </html>
  `);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  
  // Open DevTools for debugging (uncomment only for testing)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  
  // Find available port starting from 3000
  findAvailablePort(3000, (port) => {
    startServer(port);
  });
  
  // Fallback: 30 seconds timeout
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const currentUrl = mainWindow.webContents.getURL();
      if (currentUrl.includes("data:")) {
        mainWindow.loadURL(`data:text/html,
          <!DOCTYPE html>
          <html>
          <head><title>POS System - Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0;">
            <div style="background: white; border-radius: 24px; padding: 48px; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
              <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
              <h2 style="color: #e74c3c; margin-bottom: 12px;">Startup Error</h2>
              <p style="color: #555; margin-bottom: 24px;">The application is taking longer than expected.<br>Please try restarting the app.</p>
              <button onclick="window.close()" style="background: #667eea; color: white; border: none; padding: 12px 28px; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
          </body>
          </html>
        `);
      }
    }
  }, 30000);
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});