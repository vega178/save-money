import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Bill } from '../../bills/entities/bill.entity';
import { Birthday } from '../../birthdays/entities/birthday.entity';

// Mirrors User.java — maps to 'users' table
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  // Mirrors @ManyToMany + users_roles join table
  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'ID', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // Mirrors @OneToMany(fetch = FetchType.LAZY, mappedBy = "user") in User.java
  @OneToMany(() => Bill, (bill) => bill.user, { lazy: true })
  bills: Promise<Bill[]>;

  @OneToMany(() => Birthday, (birthday) => birthday.user, { lazy: true })
  birthdays: Promise<Birthday[]>;
}
