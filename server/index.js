const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto')

const app = express();
const port = 3000;
const algorithm = 'aes-256-cbc'
const key = crypto.scryptSync('super strong password', 'salt', 32)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  return Buffer.concat([iv, cipher.update(buffer)]);
}

const decrypt = (encrypted) => {
  const iv = encrypted.slice(0, 16);
  const encryptedRest = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return Buffer.from(decipher.update(encryptedRest));
}

const upload = multer({ storage });

app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/files', (req, res) => {
  fs.readdir(path.join(__dirname, 'uploads'), (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read files' });
    }

    res.json({ files: data });
  })
})

app.get('/file/:filename', (req, res) => {
  const { filename } = req.params
  const filePath = path.join(__dirname, 'uploads', filename);
  const fileBuffer = fs.readFileSync(filePath);
  const decryptedBuffer = decrypt(fileBuffer);
  res.end(decryptedBuffer);
})

app.post('/upload', upload.array('files'), (req, res) => {
  req.files.forEach((file) => {
    const outputFilePath = path.join(__dirname, 'uploads', file.filename);

    const fileBuffer = fs.readFileSync(file.path);
    const encryptedBuffer = encrypt(fileBuffer);

    fs.writeFileSync(outputFilePath, encryptedBuffer);
  });

  res.json({ message: 'Files uploaded successfully!' });
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
