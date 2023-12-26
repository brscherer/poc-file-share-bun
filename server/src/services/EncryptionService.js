const crypto = require('crypto');

class EncryptionService {
  constructor(key) {
    this.key = key;
    this.algorithm = 'aes-256-cbc';
  }

  encrypt(buffer) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    return Buffer.concat([iv, cipher.update(buffer)]);
  }

  decrypt(encrypted) {
    const iv = encrypted.slice(0, 16);
    const encryptedRest = encrypted.slice(16);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    return Buffer.from(decipher.update(encryptedRest));
  }
}

module.exports = EncryptionService
