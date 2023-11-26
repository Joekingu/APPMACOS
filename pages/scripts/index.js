const { ipcRenderer } = require('electron');

// Send a message to the main process
ipcRenderer.send('message', 'Hello from Renderer Process!');

// Listen for a reply from the main process
ipcRenderer.on('reply', (event, arg) => {
  console.log(arg); // Log the reply from the main process
});

function highlightLink(linkId) {
    const linkElement = document.getElementById(linkId);
    linkElement.classList.add('highlighted');
};

function removeHighlight(linkId) {
    const linkElement = document.getElementById(linkId);
    linkElement.classList.remove('highlighted');
};