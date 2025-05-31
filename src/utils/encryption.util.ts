import * as crypto from 'crypto';
import { config } from '../config/envs/default';

const IV_LENGTH = config.ivLength;
const ENCRYPTION_KEY = config.encryptionKey;

// Ensure key is exactly 32 bytes for AES-256
const getValidKey = (key: string): Buffer => {
  const keyBuffer = Buffer.from(key);
  if (keyBuffer.length === 32) return keyBuffer;

  // If key is shorter, pad it
  if (keyBuffer.length < 32) {
    return Buffer.concat([keyBuffer, Buffer.alloc(32 - keyBuffer.length)]);
  }

  // If key is longer, hash it to get 32 bytes
  return crypto.createHash('sha256').update(keyBuffer).digest();
};

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    getValidKey(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    getValidKey(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
