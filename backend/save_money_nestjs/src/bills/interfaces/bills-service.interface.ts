import { CreateBillDto } from '../dto/create-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';
import { Bill } from '../entities/bill.entity';

/**
 * IBillsService
 *
 * Contract for the BillsService. Decouples the controller from the concrete
 * implementation (Dependency Inversion Principle).
 */
export interface IBillsService {
  findAll(): Promise<Bill[]>;
  findById(id: number): Promise<Bill>;
  create(dto: CreateBillDto): Promise<Bill>;
  createForUser(userId: number, dto: CreateBillDto): Promise<Bill>;
  update(id: number, dto: UpdateBillDto): Promise<Bill>;
  remove(id: number): Promise<void>;
  getBillsByUserId(userId: number): Promise<Bill[]>;
  reorderBills(orderedIds: number[]): Promise<void>;
  getAnalytics(userId: number): Promise<any>;
}

/** Injection token for IBillsService */
export const BILLS_SERVICE = Symbol('IBillsService');
