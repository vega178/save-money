import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BillsService } from '../../../src/bills/bills.service';
import { Bill } from '../../../src/bills/entities/bill.entity';
import { User } from '../../../src/users/entities/user.entity';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockBillRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

const mockUser = { id: 1, username: 'vega178', email: 'test@test.com' } as User;

const mockBill = (overrides: Partial<Bill> = {}): Bill =>
  ({
    id: 1,
    name: 'Servicios Publicos',
    amount: 276293,
    totalDebt: 276293,
    actualDebt: 0,
    totalBalance: 5503591,
    remainingAmount: 0,
    gap: 0,
    isChecked: false,
    position: 0,
    billDate: new Date('2024-01-30'),
    user: mockUser,
    ...overrides,
  } as Bill);

describe('BillsService', () => {
  let service: BillsService;
  let billRepo: jest.Mocked<Repository<Bill>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        { provide: getRepositoryToken(Bill), useFactory: mockBillRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
    billRepo = module.get(getRepositoryToken(Bill));
    userRepo = module.get(getRepositoryToken(User));
  });

  // ── findAll ─────────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return all bills', async () => {
      billRepo.find.mockResolvedValue([mockBill()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Servicios Publicos');
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────────
  describe('findById()', () => {
    it('should return a bill when found', async () => {
      billRepo.findOne.mockResolvedValue(mockBill());
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      billRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create and return a bill', async () => {
      const dto = { name: 'Comida', amount: 800000 } as any;
      billRepo.create.mockReturnValue(mockBill({ name: 'Comida', amount: 800000 }));
      billRepo.save.mockResolvedValue(mockBill({ name: 'Comida', amount: 800000 }));
      const result = await service.create(dto);
      expect(result.name).toBe('Comida');
    });
  });

  // ── createForUser ────────────────────────────────────────────────────────────
  describe('createForUser()', () => {
    it('should link the bill to the user', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      billRepo.create.mockReturnValue(mockBill());
      billRepo.save.mockResolvedValue(mockBill());
      const result = await service.createForUser(1, { name: 'Tigo', amount: 78802 } as any);
      expect(result.user.id).toBe(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createForUser(999, { name: 'Tigo', amount: 78802 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the modified bill', async () => {
      billRepo.findOne.mockResolvedValue(mockBill());
      billRepo.save.mockResolvedValue(mockBill({ name: 'Updated', amount: 100 }));
      const result = await service.update(1, { name: 'Updated', amount: 100 });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      billRepo.findOne.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should remove the bill', async () => {
      const bill = mockBill();
      billRepo.findOne.mockResolvedValue(bill);
      billRepo.remove.mockResolvedValue(bill);
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      billRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── getBillsByUserId ─────────────────────────────────────────────────────────
  describe('getBillsByUserId()', () => {
    it('should sort bills by position then date', async () => {
      billRepo.find.mockResolvedValue([
        mockBill({ id: 2, position: 1, billDate: new Date('2024-01-30') }),
        mockBill({ id: 1, position: 0, billDate: new Date('2024-01-30') }),
      ]);
      const result = await service.getBillsByUserId(1);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should compute actualDebt = totalDebt - amount', async () => {
      billRepo.find.mockResolvedValue([
        mockBill({ totalDebt: 276293, amount: 100000 }),
      ]);
      const result = await service.getBillsByUserId(1);
      expect(result[0].actualDebt).toBe(176293);
    });

    it('should compute remainingAmount cumulatively per month', async () => {
      billRepo.find.mockResolvedValue([
        mockBill({ id: 1, position: 0, amount: 100, totalBalance: 1000, billDate: new Date('2024-01-30') }),
        mockBill({ id: 2, position: 1, amount: 200, totalBalance: 1000, billDate: new Date('2024-01-30') }),
      ]);
      const result = await service.getBillsByUserId(1);
      expect(result[0].remainingAmount).toBe(900);
      expect(result[1].remainingAmount).toBe(700);
    });
  });

  // ── reorderBills ─────────────────────────────────────────────────────────────
  describe('reorderBills()', () => {
    it('should update position for each bill in order', async () => {
      const bill1 = mockBill({ id: 1, position: 0 });
      const bill2 = mockBill({ id: 2, position: 1 });
      billRepo.findOne
        .mockResolvedValueOnce(bill1)
        .mockResolvedValueOnce(bill2);
      billRepo.save.mockResolvedValue({} as Bill);

      await service.reorderBills([1, 2]);

      expect(bill1.position).toBe(0);
      expect(bill2.position).toBe(1);
    });
  });
});
