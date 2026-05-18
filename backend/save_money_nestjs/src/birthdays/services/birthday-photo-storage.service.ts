import {
  Injectable,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { join } from 'path';
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
  createReadStream,
  ReadStream,
} from 'fs';
import { randomUUID } from 'crypto';

/** Only image types are accepted for birthday photos. */
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
]);

/** 5 MB hard cap per photo. */
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class BirthdayPhotoStorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads', 'birthdays');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  store(file: Express.Multer.File): { storedName: string } {
    this.validate(file);
    const ext = (file.originalname.split('.').pop() ?? 'jpg').toLowerCase();
    const storedName = `${randomUUID()}.${ext}`;
    writeFileSync(join(this.uploadDir, storedName), file.buffer);
    return { storedName };
  }

  delete(storedName: string): void {
    const target = join(this.uploadDir, storedName);
    if (existsSync(target)) unlinkSync(target);
  }

  createStream(storedName: string): ReadStream {
    return createReadStream(join(this.uploadDir, storedName));
  }

  private validate(file: Express.Multer.File): void {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `File type "${file.mimetype}" is not allowed. Accepted: JPEG, PNG, GIF.`,
      );
    }
    if (file.size > MAX_BYTES) {
      throw new PayloadTooLargeException(
        `Photo "${file.originalname}" exceeds the 5 MB limit.`,
      );
    }
  }
}
