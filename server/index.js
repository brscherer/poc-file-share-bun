const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use((error, req, res, next) => {
  console.log('This is the rejected field ->', error.field);
});

app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/files', (req, res) => {
  fs.readdir(path.join(__dirname, 'uploads'), (err, data) => {
    if (err) throw err;
    console.log(data)
    res.json({ files: data })
  })
})

app.get('/file/:filename', (req, res) => {
  const { filename } = req.params
  const filePath = path.join(__dirname, 'uploads', filename);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
})

app.post('/upload', upload.array('file[]'), (req, res) => {
  req.files.forEach((file) => {
    console.log(file)
    const filePath = path.join(__dirname, 'uploads', file.originalname);
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to store the file' });
      }
    });
  });
  res.json({ message: 'File uploaded successfully!' });
});

app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully!' });
  } else {
    res.status(404).json({ message: 'File not found.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
