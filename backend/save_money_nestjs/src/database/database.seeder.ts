import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Bill } from '../bills/entities/bill.entity';

/**
 * DatabaseSeeder — runs once after the app boots and TypeORM has synced the schema.
 * Mirrors the behaviour of Spring Boot's import.sql with INSERT IGNORE:
 * every upsert is idempotent — safe to run on every startup.
 */
@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Skip seeding in test environment
    if (process.env.NODE_ENV === 'test') return;

    this.logger.log('Running database seed...');
    await this.seedRoles();
    await this.seedUsers();
    await this.seedBills();
    this.logger.log('Database seed complete.');
  }

  // ── Roles ───────────────────────────────────────────────────────────────────
  // Mirrors: INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER')
  private async seedRoles(): Promise<void> {
    const roleNames = ['ROLE_ADMIN', 'ROLE_USER'];

    for (const name of roleNames) {
      const exists = await this.roleRepository.findOne({ where: { name } });
      if (!exists) {
        await this.roleRepository.save(this.roleRepository.create({ name }));
        this.logger.log(`Created role: ${name}`);
      }
    }
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  // Mirrors: INSERT IGNORE INTO users + users_roles for the default admin user
  private async seedUsers(): Promise<void> {
    const existing = await this.userRepository.findOne({
      where: { username: 'vega178' },
    });
    if (existing) return;

    const adminRole = await this.roleRepository.findOne({ where: { name: 'ROLE_ADMIN' } });
    const userRole  = await this.roleRepository.findOne({ where: { name: 'ROLE_USER' } });

    // Password hash from import.sql — already BCrypt-hashed, used as-is
    const user = this.userRepository.create({
      email: 'estebanvegapatio@gmail.com',
      username: 'vega178',
      password: '$2a$10$84M.u0./Kdo.2Eq2idjhCeE21.6bYBdpQ7tRkpMMc2UI8qbMYtVpm',
      roles: [adminRole, userRole].filter(Boolean),
    });

    await this.userRepository.save(user);
    this.logger.log('Created default user: vega178');
  }

  // ── Bills ───────────────────────────────────────────────────────────────────
  // Mirrors: INSERT IGNORE INTO bills for the default user
  private async seedBills(): Promise<void> {
    const user = await this.userRepository.findOne({ where: { username: 'vega178' } });
    if (!user) return;

    const existingCount = await this.billRepository.count({ where: { user: { id: user.id } } });
    if (existingCount > 0) return; // already seeded

    const billDate = new Date('2024-01-30');
    const totalBalance = 5503591;

    const seedBills = [
      { name: 'Servicios Publicos',    amount: 276293,  totalDebt: 276293  },
      { name: 'Comida',                amount: 800000,  totalDebt: 800000  },
      { name: 'Tigo Home',             amount: 78802,   totalDebt: 78802   },
      { name: 'Tigo Phone',            amount: 78802,   totalDebt: 78802   },
      { name: 'Chamo Spotify',         amount: 78802,   totalDebt: 78802   },
      { name: 'Funeraria San Vicente', amount: 78802,   totalDebt: 78802   },
      { name: 'Credito avevillas',     amount: 1179000, totalDebt: 31000000 },
      { name: 'Couta harold',          amount: 1000000, totalDebt: 12000000 },
      { name: 'Intereses Harold',      amount: 1000000, totalDebt: 12000000 },
      { name: 'Tarjetas de credito',   amount: 1000000, totalDebt: 12000000 },
    ];

    for (let i = 0; i < seedBills.length; i++) {
      const { name, amount, totalDebt } = seedBills[i];
      await this.billRepository.save(
        this.billRepository.create({
          user,
          billDate,
          name,
          amount,
          totalDebt,
          actualDebt: 0,
          totalBalance,
          remainingAmount: 0,
          gap: 0,
          isChecked: false,
          position: i,
        }),
      );
    }

    this.logger.log(`Seeded ${seedBills.length} bills for user vega178`);
  }
}
