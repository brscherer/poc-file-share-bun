const path = require('path');
const fs = require('fs');

class FileService {
  constructor(uploadDirectory, encryptionManager) {
    this.uploadDirectory = uploadDirectory;
    this.encryptionManager = encryptionManager;
  }

  getAllFiles() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.uploadDirectory, (err, data) => {
        if (err) {
          console.error(err);
          reject('Failed to read files');
        } else {
          resolve(data);
        }
      });
    });
  }

  readFile(filename) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.uploadDirectory, filename);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          reject('Failed to read the file');
        } else {
          resolve(data);
        }
      });
    });
  }

  writeFile(filename, buffer) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.uploadDirectory, filename);
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error(err);
          reject('Failed to write the file');
        } else {
          resolve('File written successfully');
        }
      });
    });
  }

  deleteFile(filename) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.uploadDirectory, filename);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            reject('Failed to delete the file');
          } else {
            resolve('File deleted successfully');
          }
        });
      } else {
        reject('File not found');
      }
    });
  }
}

module.exports = FileService