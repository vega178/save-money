import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('birthdays')
export class Birthday {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.birthdays, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'full_name', length: 120 })
  fullName: string;

  /** Stored as DATE string 'YYYY-MM-DD' — no timezone issues */
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
