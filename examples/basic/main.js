const { join } = require('path');
const { app, dialog, BrowserWindow } = require('electron');
const { handleAuth } = require('./auth');

let win;

function createWindow() {
  handleAuth()
    .then((userProfile) => {
      win = new BrowserWindow({
        width: 800,
        height: 600,
        center: true
      });

      console.log('userProfile: ', userProfile);

      win.loadURL(`file://${join(__dirname, 'index.html')}`);

      win.on('closed', () => (win = null));
    })
    .catch((err) => handlerError('authentication error', err));
}

function handlerError(message, err) {
  console.error(err);

  dialog.showMessageBox({ type: 'error', message }, () => {
    app.quit();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});

process.on('uncaughtException', (err) => {
  handlerError('uncaught exception', err);
});
