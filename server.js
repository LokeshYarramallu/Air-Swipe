const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

// Function to run Python script
async function mad() {
  const pythonProcess = spawn('python', ['pyCode.py']);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Output from Python script: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  await new Promise((resolve) => pythonProcess.on('close', resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb('Error: Only PDF files are allowed!');
    }
  }
});

// Routes
app.get('/Home', (req, res) => {
  res.sendFile(__dirname + '/Home.html');
});

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  var link = req.body.code;

  link = link.replace('width="476px"', 'width="100%"');
  link = link.replace('height="288px"', 'height="100%"');

  if (req.file) {
    const filePath = path.join(__dirname, req.file.path);
    if (fs.existsSync(filePath)) {
      const madPromise = mad();
      await madPromise;
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  } else if (link != "") {
    if (link[0] == "<" && link[1] == "i") {
      const madPromise = mad();
      await madPromise;
      res.send(link);
    } else {
      res.send("Enter a valid link");
    }
  } else {
    res.send('Please select a file to upload');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
