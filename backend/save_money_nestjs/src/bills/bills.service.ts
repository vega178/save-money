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

  /**
   * getAnalytics — aggregates all dashboard metrics from the bills table.
   *
   * Returned shape:
   *  - spendingByCard        : totals per credit-card keyword group
   *  - spendingBySubscription: totals per subscription keyword group
   *  - remainingByMonth      : final remainingAmount per month/year bucket
   *  - yearlyBreakdown       : total spend + % contribution per year
   *  - recentBills           : 5 most-recent bills sorted by date desc
   *  - currentMonthTotal     : sum of amount for the running calendar month
   *  - previousMonthTotal    : sum of amount for the previous calendar month
   *  - monthOverMonthPct     : % change between the two months
   */
  async getAnalytics(userId: number) {
    // Reuse the enriched list (actualDebt + remainingAmount already computed)
    const bills = await this.getBillsByUserId(userId);

    // ── Keyword maps ────────────────────────────────────────────────────────
    const CARD_KEYWORDS: Record<string, string[]> = {
      Rappi:      ['rappi'],
      Falabella:  ['falabella'],
      Davivienda: ['davivienda'],
    };
    const SUB_KEYWORDS: Record<string, string[]> = {
      Spotify: ['spotify'],
      Amazon:  ['amazon'],
      Disney:  ['disney'],
      Netflix: ['netflix'],
      Tigo:    ['tigo'],
    };

    const matchKeywords = (name: string, keywords: string[]): boolean =>
      keywords.some((kw) => name.toLowerCase().includes(kw));

    // ── 1. Spending by card ──────────────────────────────────────────────────
    const spendingByCard = Object.entries(CARD_KEYWORDS).map(([label, kws]) => ({
      name: label,
      total: bills
        .filter((b) => matchKeywords(b.name, kws))
        .reduce((sum, b) => sum + (b.amount ?? 0), 0),
    }));

    // ── 2. Spending by subscription ──────────────────────────────────────────
    const spendingBySubscription = Object.entries(SUB_KEYWORDS).map(([label, kws]) => ({
      name: label,
      total: bills
        .filter((b) => matchKeywords(b.name, kws))
        .reduce((sum, b) => sum + (b.amount ?? 0), 0),
    }));

    // ── 3. Remaining amount per month/year ───────────────────────────────────
    // Bills are already sorted asc by date; iterate forward so the last write
    // per key is the final cumulative remainingAmount for that period.
    const remainingMap = new Map<string, { year: number; month: number; label: string; remainingAmount: number }>();
    for (const bill of bills) {
      const d   = new Date(bill.billDate);
      const yr  = d.getFullYear();
      const mo  = d.getMonth() + 1;
      const key = `${yr}-${mo}`;
      remainingMap.set(key, {
        year:            yr,
        month:           mo,
        label:           `${d.toLocaleString('en-US', { month: 'short' })} ${yr}`,
        remainingAmount: bill.remainingAmount ?? 0,
      });
    }
    const remainingByMonth = Array.from(remainingMap.values()).sort(
      (a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month,
    );

    // ── 4. Yearly breakdown ──────────────────────────────────────────────────
    const yearTotals = new Map<number, number>();
    for (const bill of bills) {
      const yr = new Date(bill.billDate).getFullYear();
      yearTotals.set(yr, (yearTotals.get(yr) ?? 0) + (bill.amount ?? 0));
    }
    const grandTotal = Array.from(yearTotals.values()).reduce((s, v) => s + v, 0);
    const yearlyBreakdown = Array.from(yearTotals.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, total]) => ({
        year,
        total,
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      }));

    // ── 5. Recent bills ──────────────────────────────────────────────────────
    const recentBills = [...bills]
      .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
      .slice(0, 5)
      .map((b) => ({
        id:       b.id,
        name:     b.name,
        amount:   b.amount,
        billDate: b.billDate,
      }));

    // ── 6. Month-over-month ──────────────────────────────────────────────────
    const now  = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;
    const prevY = curM === 1 ? curY - 1 : curY;
    const prevM = curM === 1 ? 12 : curM - 1;

    const sumMonth = (y: number, m: number) =>
      bills
        .filter((b) => {
          const d = new Date(b.billDate);
          return d.getFullYear() === y && d.getMonth() + 1 === m;
        })
        .reduce((s, b) => s + (b.amount ?? 0), 0);

    const currentMonthTotal  = sumMonth(curY, curM);
    const previousMonthTotal = sumMonth(prevY, prevM);
    const monthOverMonthPct  =
      previousMonthTotal > 0
        ? Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100)
        : 0;

    return {
      spendingByCard,
      spendingBySubscription,
      remainingByMonth,
      yearlyBreakdown,
      recentBills,
      currentMonthTotal,
      previousMonthTotal,
      monthOverMonthPct,
    };
  }
}
