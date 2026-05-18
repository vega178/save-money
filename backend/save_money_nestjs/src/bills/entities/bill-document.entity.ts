import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Bill } from './bill.entity';

/**
 * BillDocument — one Bill can have many attached files (PDFs, images).
 * Only the file metadata is stored in the DB; the raw bytes live on the
 * filesystem under uploads/bills/<storedName>.
 */
@Entity('bill_documents')
export class BillDocument {
  @PrimaryGeneratedColumn()
  id: number;

  /** The parent bill — cascade deletes the document rows when the bill is removed. */
  @ManyToOne(() => Bill, (bill) => bill.documents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  /** Original filename as supplied by the browser (e.g. "invoice-jan.pdf"). */
  @Column({ length: 512 })
  originalName: string;

  /** UUID-based filename used on disk (e.g. "550e8400-...pdf"). Prevents collisions. */
  @Column({ length: 512 })
  storedName: string;

  /** MIME type validated on upload (application/pdf, image/jpeg, image/png, image/gif). */
  @Column({ length: 128 })
  mimeType: string;

  /** File size in bytes — stored for display / quota checks. */
  @Column({ type: 'int' })
  sizeBytes: number;

  @CreateDateColumn()
  uploadedAt: Date;
}
