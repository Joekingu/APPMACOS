const { ipcRenderer } = require('electron');

// Send a message to the main process
ipcRenderer.send('message', 'Hello from Renderer Process!');

// Listen for a reply from the main process
ipcRenderer.on('reply', (event, arg) => {
  console.log(arg); // Log the reply from the main process
});