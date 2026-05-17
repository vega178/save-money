import { Birthday } from '../entities/birthday.entity';
import { CreateBirthdayDto } from '../dto/create-birthday.dto';
import { UpdateBirthdayDto } from '../dto/update-birthday.dto';

export interface UpcomingBirthday {
  birthday: Birthday;
  daysUntil: number;
}

export interface UpcomingBirthdaysResult {
  todayBirthdays: Birthday[];
  upcomingBirthdays: UpcomingBirthday[];
}

export interface IBirthdaysService {
  findAllByUserId(userId: number): Promise<Birthday[]>;
  findById(id: number): Promise<Birthday>;
  create(userId: number, dto: CreateBirthdayDto): Promise<Birthday>;
  update(id: number, dto: UpdateBirthdayDto): Promise<Birthday>;
  remove(id: number): Promise<void>;
  getUpcoming(userId: number, days: number): Promise<UpcomingBirthdaysResult>;
}

export const BIRTHDAYS_SERVICE = Symbol('IBirthdaysService');
