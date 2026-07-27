// ─── Storage Abstraction Layer ─────────────────────────────
// Supports local disk storage with an interface for future cloud providers (S3, GCS, etc.)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const logger = require('./logger');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/json',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Interface that all storage providers must implement
 */
class StorageProvider {
  async save(fileName, buffer) { throw new Error('Not implemented'); }
  async delete(fileName) { throw new Error('Not implemented'); }
  getUrl(fileName) { throw new Error('Not implemented'); }
}

/**
 * Local disk storage provider
 */
class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.baseDir = UPLOAD_DIR;
    this._ensureDir();
  }

  _ensureDir() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
      logger.info('Upload directory created', { path: this.baseDir });
    }
  }

  _generateFileName(originalName) {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    const date = new Date().toISOString().split('T')[0];
    return `${date}/${hash}${ext}`;
  }

  async save(fileName, buffer) {
    const fullPath = path.join(this.baseDir, fileName);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(fullPath, buffer);
    logger.info('File saved to disk', { fileName, size: buffer.length });
    return fileName;
  }

  async delete(fileName) {
    const fullPath = path.join(this.baseDir, fileName);
    try {
      await fs.promises.unlink(fullPath);
      logger.info('File deleted from disk', { fileName });
      // Try to remove empty parent directories
      const dir = path.dirname(fullPath);
      try {
        const files = await fs.promises.readdir(dir);
        if (files.length === 0) {
          await fs.promises.rmdir(dir);
        }
      } catch { /* ignore */ }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error('Failed to delete file', { fileName, error: error.message });
        throw error;
      }
    }
  }

  getUrl(fileName) {
    // In development, serve from the uploads directory
    // In production, this would be a CDN URL or S3 endpoint
    return `/uploads/${fileName}`;
  }
}

// Singleton storage provider - swap implementation here for cloud providers
let storageInstance = null;

function getStorage() {
  if (!storageInstance) {
    storageInstance = new LocalStorageProvider();
    logger.info('Storage provider initialized: LocalStorageProvider');
  }
  return storageInstance;
}

/**
 * Validate file type against allowed MIME types
 */
function validateFileType(mimeType) {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Validate file size
 */
function validateFileSize(size) {
  return size <= MAX_FILE_SIZE;
}

/**
 * Get the maximum allowed file size in bytes
 */
function getMaxFileSize() {
  return MAX_FILE_SIZE;
}

/**
 * Get allowed MIME types
 */
function getAllowedMimeTypes() {
  return [...ALLOWED_MIME_TYPES];
}

module.exports = {
  StorageProvider,
  LocalStorageProvider,
  getStorage,
  validateFileType,
  validateFileSize,
  getMaxFileSize,
  getAllowedMimeTypes,
};
