const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto')

const EncryptionService = require('./src/services/EncryptionService')
const FileService = require('./src/services/FileService')

const app = express();
const port = 3000;
const key = crypto.scryptSync('super strong password', 'salt', 32);

const encryptionService = new EncryptionService(key);
const fileService = new FileService(path.join(__dirname, 'uploads'), encryptionService);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileService.uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/files', async (req, res) => {
  try {
    const files = await fileService.getAllFiles();
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error });
  }

})

app.get('/file/:filename', async (req, res) => {
  const { filename } = req.params
  try {
    const encryptedBuffer = await fileService.readFile(filename);
    const decryptedBuffer = encryptionService.decrypt(encryptedBuffer);
    res.end(decryptedBuffer);
  } catch (error) {
    res.status(500).json({ error });
  }
})

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    for (const file of req.files) {
      const fileBuffer = fs.readFileSync(file.path);
      const encryptedBuffer = encryptionService.encrypt(fileBuffer);
      await fileService.writeFile(file.filename, encryptedBuffer);
    }
    res.json({ message: 'Files uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error });
  }
});


app.delete('/delete/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    await fileService.deleteFile(filename);
    res.json({ message: 'File deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
