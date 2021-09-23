/* eslint-disable no-console */
const {
  default: installExtension,
  EMBER_INSPECTOR,
} = require('electron-devtools-installer');
const { pathToFileURL } = require('url');
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const handleFileUrls = require('./handle-file-urls');

const emberAppDir = path.resolve(__dirname, '..', 'ember-dist');
const emberAppURL = pathToFileURL(
  path.join(emberAppDir, 'index.html')
).toString();

// Uncomment the lines below to enable Electron's crash reporter
// For more information, see http://electron.atom.io/docs/api/crash-reporter/
// electron.crashReporter.start({
//     productName: 'YourName',
//     companyName: 'YourCompany',
//     submitURL: 'https://your-domain.com/url-to-submit',
//     autoSubmit: true
// });
function createWindow(display) {
  let window = new BrowserWindow({
    width: display.bounds.width,
    height: display.bounds.height,
    x: display.bounds.x,
    y: display.bounds.y,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // fullscreen: true
  });

  // If you want to open up dev tools programmatically, call
  // window.openDevTools();

  // Load the ember application
  window.loadURL(emberAppURL);

  // If a loading operation goes wrong, we'll send Electron back to
  // Ember App entry point
  window.webContents.on('did-fail-load', () => {
    window.loadURL(emberAppURL);
  });


  window.webContents.on('dom-ready', () => {
    window.webContents.send('display-data', display);
  });

  window.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason === 'killed' || details.reason === 'clean-exit') {
      return;
    }
    console.log(
      'Your main window process has exited unexpectedly -- see https://www.electronjs.org/docs/api/web-contents#event-render-process-gone'
    );
    console.log('Reason: ' + details.reason);
  });

  window.on('unresponsive', () => {
    console.log(
      'Your Ember app (or other code) has made the window unresponsive.'
    );
  });

  window.on('responsive', () => {
    console.log('The main window has become responsive again.');
  });

  window.on('closed', () => {
    window = null;
  });
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (isDev) {
    // try {
    //   require('devtron').install();
    // } catch (err) {
    //   console.log('Failed to install Devtron: ', err);
    // }
    try {
      await installExtension(EMBER_INSPECTOR, {
        loadExtensionOptions: { allowFileAccess: true },
      });
    } catch (err) {
      console.log('Failed to install Ember Inspector: ', err);
    }
  }

  await handleFileUrls(emberAppDir);

  ipcMain.on('get-display', (event, arg) => {
    event.returnValue = screen.getAllDisplays();
  });

  screen.getAllDisplays().map((display) => {
    createWindow(display);
  });


  // createWindow({
  //   bounds: {
  //     width: 500,
  //     height: 400,
  //     x: 0,
  //     y: 0
  //   }
  // });
});

// Handle an unhandled error in the main thread
//
// Note that 'uncaughtException' is a crude mechanism for exception handling intended to
// be used only as a last resort. The event should not be used as an equivalent to
// "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
// an undefined state. Attempting to resume application code without properly recovering
// from the exception can cause additional unforeseen and unpredictable issues.
//
// Attempting to resume normally after an uncaught exception can be similar to pulling out
// of the power cord when upgrading a computer -- nine out of ten times nothing happens -
// but the 10th time, the system becomes corrupted.
//
// The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
// resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
// not safe to resume normal operation after 'uncaughtException'.
process.on('uncaughtException', (err) => {
  console.log('An exception in the main thread was not handled.');
  console.log(
    'This is a serious issue that needs to be handled and/or debugged.'
  );
  console.log(`Exception: ${err}`);
});
