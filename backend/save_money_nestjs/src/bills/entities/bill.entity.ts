import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// Mirrors Bill.java — maps to 'bills' table
@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  // ManyToOne — mirrors @ManyToOne + @JoinColumn(name = "userId")
  // Excluded from JSON responses by not serializing the relation by default
  @ManyToOne(() => User, (user) => user.bills, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'datetime', nullable: true })
  billDate: Date;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'double', nullable: true })
  amount: number;

  @Column({ type: 'double', nullable: true })
  totalDebt: number;

  // Computed on read in getBillsByUserId() — stored but recalculated
  @Column({ type: 'double', nullable: true })
  actualDebt: number;

  @Column({ type: 'double', nullable: true })
  totalBalance: number;

  // Computed on read — cumulative remaining per month/year
  @Column({ type: 'double', nullable: true })
  remainingAmount: number;

  @Column({ type: 'double', nullable: true })
  gap: number;

  @Column({ default: false })
  isChecked: boolean;

  // Used for drag-and-drop reordering — mirrors `position` field in Bill.java
  @Column({ type: 'int', nullable: true })
  position: number;
}
