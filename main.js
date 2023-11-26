const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db;

function createWindow() {
  // Initialize SQLite database
  const dbPath = path.join(app.getPath('userData'), 'donnees.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to open the database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');

      // Perform database setup
      db.serialize(() => {
        // Create the 'Subjects' table
        db.run(`
          CREATE TABLE IF NOT EXISTS Matiere (
            MatiereID INTEGER PRIMARY KEY AUTOINCREMENT,
            MatiereNAME VARCHAR(255)
          )
        `);

        // Create the 'Exams' table
        db.run(`
          CREATE TABLE IF NOT EXISTS Exams (
            ExamID INTEGER PRIMARY KEY AUTOINCREMENT,
            SubjectID INTEGER,
            Version VARCHAR(255),
            J0 DATE,
            J1 DATE,
            J2 DATE,
            J3 DATE,
            J5 DATE,
            J7 DATE,
            J10 DATE,
            J14 DATE,
            J15 DATE,
            J30 DATE,
            FinalDATE DATE,
            FOREIGN KEY (SubjectID) REFERENCES Matiere(MatiereID)
          )
        `);
        console.log('Database setup complete.');
        const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in 'YYYY-MM-DD' format

        const sql = `DELETE FROM Exams WHERE FinalDATE < ?`;

        db.run(sql, [currentDate], (err) => {
          if (err) {
            console.error('Error deleting past exams:', err.message);
          } else {
            console.log('Deleted past exams.');
          }
        });
      });
    }
  });

  // Create the main window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-eval'"],
        },
      },
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.setFullScreen(true);
  });

  // Load the HTML file into the main window
  mainWindow.loadFile('pages/index.html');

  // Event handler for window close
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Event listener for the 'ready' event of the app
app.whenReady().then(createWindow);

// Event listener for the 'window-all-closed' event of the app
app.on('window-all-closed', function () {
  // On macOS, it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

// Event listener for the 'activate' event of the app
app.on('activate', function () {
  // On macOS, re-create a window when the dock icon is clicked
  if (mainWindow === null) createWindow();
});

// Close the database connection when the app is quitting
app.on('will-quit', function () {
  if (db) {
    db.close((err) => {
      if (err) {
        return console.error('Error closing the database:', err.message);
      }
      console.log('Closed the SQLite database connection.');
    });
  }
});

// IPC listener for messages from the renderer process
ipcMain.on('message', (event, arg) => {
  console.log(arg); // Prints the message from the renderer process

  // Example: Send a reply back to the renderer process
  event.reply('reply', 'Hello from the main process!');
});

