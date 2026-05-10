import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { User } from '../users/entities/user.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { IBillsService } from './interfaces/bills-service.interface';

// Mirrors BillServiceImpl.java — full port of all methods
@Injectable()
export class BillsService implements IBillsService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Mirrors BillServiceImpl.findAll()
  async findAll(): Promise<Bill[]> {
    return this.billRepository.find();
  }

  // Mirrors BillServiceImpl.findById()
  async findById(id: number): Promise<Bill> {
    const bill = await this.billRepository.findOne({ where: { id } });
    if (!bill) throw new NotFoundException(`Bill with id ${id} not found`);
    return bill;
  }

  // Mirrors BillServiceImpl.save(Bill bill) — plain save without user association
  async create(dto: CreateBillDto): Promise<Bill> {
    const bill = this.billRepository.create({
      ...dto,
      billDate: dto.billDate ? new Date(dto.billDate) : undefined,
    });
    return this.billRepository.save(bill);
  }

  // Mirrors BillServiceImpl.save(Bill bill, Long id) — create bill linked to a user
  async createForUser(userId: number, dto: CreateBillDto): Promise<Bill> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const bill = this.billRepository.create({
      ...dto,
      billDate: dto.billDate ? new Date(dto.billDate) : undefined,
      user,
    });
    return this.billRepository.save(bill);
  }

  // Mirrors BillServiceImpl.update() — updates all mutable fields
  async update(id: number, dto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findById(id);

    if (dto.billDate !== undefined) bill.billDate = new Date(dto.billDate);
    if (dto.name !== undefined) bill.name = dto.name;
    if (dto.amount !== undefined) bill.amount = dto.amount;
    if (dto.totalDebt !== undefined) bill.totalDebt = dto.totalDebt;
    if (dto.actualDebt !== undefined) bill.actualDebt = dto.actualDebt;
    if (dto.totalBalance !== undefined) bill.totalBalance = dto.totalBalance;
    if (dto.remainingAmount !== undefined) bill.remainingAmount = dto.remainingAmount;
    if (dto.gap !== undefined) bill.gap = dto.gap;
    if (dto.isChecked !== undefined) bill.isChecked = dto.isChecked;

    return this.billRepository.save(bill);
  }

  // Mirrors BillServiceImpl.remove()
  async remove(id: number): Promise<void> {
    const bill = await this.findById(id);
    await this.billRepository.remove(bill);
  }

  // Mirrors BillServiceImpl.getBillsByUserId() — includes sorting and computed fields
  async getBillsByUserId(userId: number): Promise<Bill[]> {
    const bills = await this.billRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    // Sort by position (nulls last), then by billDate — mirrors Java Comparator logic
    bills.sort((a, b) => {
      const posA = a.position ?? Number.MAX_SAFE_INTEGER;
      const posB = b.position ?? Number.MAX_SAFE_INTEGER;
      if (posA !== posB) return posA - posB;
      return new Date(a.billDate).getTime() - new Date(b.billDate).getTime();
    });

    // Compute actualDebt and remainingAmount cumulatively per month/year
    // Mirrors the Map<String, Double> cumulativePerMonth logic in BillServiceImpl
    const cumulativePerMonth = new Map<string, number>();

    for (const bill of bills) {
      const d = new Date(bill.billDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

      const cumulative = (cumulativePerMonth.get(key) ?? 0) + bill.amount;
      cumulativePerMonth.set(key, cumulative);

      bill.actualDebt = bill.totalDebt - bill.amount;
      bill.remainingAmount = bill.totalBalance - cumulative;
    }

    return bills;
  }

  // Mirrors BillServiceImpl.reorderBills() — updates position field for each bill
  async reorderBills(orderedIds: number[]): Promise<void> {
    await Promise.all(
      orderedIds.map(async (billId, index) => {
        const bill = await this.billRepository.findOne({ where: { id: billId } });
        if (bill) {
          bill.position = index;
          await this.billRepository.save(bill);
        }
      }),
    );
  }
}
