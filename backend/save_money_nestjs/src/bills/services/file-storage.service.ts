import {
  Injectable,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync, createReadStream, ReadStream } from 'fs';
import { randomUUID } from 'crypto';

/** Allowed MIME types for uploaded bill documents. */
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
]);

/** 10 MB hard cap per file. */
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * FileStorageService — owns all filesystem operations for bill documents.
 *
 * Keeping storage logic here (instead of in BillsService) means the entire
 * implementation can be swapped to a cloud provider (e.g. Cloudflare R2) by
 * only rewriting this class — the controller and BillsService stay unchanged.
 */
@Injectable()
export class FileStorageService {
  /** Absolute path to the uploads directory — <project-root>/uploads/bills */
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads', 'bills');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate, write the file to disk, and return the generated filename.
   * The caller is responsible for persisting `storedName` in the DB.
   */
  store(file: Express.Multer.File): { storedName: string } {
    this.validate(file);

    const ext  = (file.originalname.split('.').pop() ?? 'bin').toLowerCase();
    const storedName = `${randomUUID()}.${ext}`;
    writeFileSync(join(this.uploadDir, storedName), file.buffer);
    return { storedName };
  }

  /** Delete a previously stored file. Silently ignored if already absent. */
  delete(storedName: string): void {
    const target = join(this.uploadDir, storedName);
    if (existsSync(target)) unlinkSync(target);
  }

  /** Open a read-stream for a stored file (used to stream HTTP responses). */
  createStream(storedName: string): ReadStream {
    return createReadStream(join(this.uploadDir, storedName));
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private validate(file: Express.Multer.File): void {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `File type "${file.mimetype}" is not allowed. Accepted: PDF, JPEG, PNG, GIF.`,
      );
    }
    if (file.size > MAX_BYTES) {
      throw new PayloadTooLargeException(
        `File "${file.originalname}" exceeds the 10 MB limit (got ${(file.size / 1_048_576).toFixed(1)} MB).`,
      );
    }
  }
}
