import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Birthday } from './entities/birthday.entity';
import { User } from '../users/entities/user.entity';
import { CreateBirthdayDto } from './dto/create-birthday.dto';
import { UpdateBirthdayDto } from './dto/update-birthday.dto';
import {
  IBirthdaysService,
  UpcomingBirthdaysResult,
} from './interfaces/birthdays-service.interface';

/** Returns the next occurrence of a MM-DD birthday as a Date in local time */
function getNextOccurrence(birthDate: string): Date {
  const [, month, day] = birthDate.split('-');
  const now = new Date();
  const year = now.getFullYear();
  const candidate = new Date(year, +month - 1, +day);
  if (candidate < now && !(candidate.toDateString() === now.toDateString())) {
    candidate.setFullYear(year + 1);
  }
  return candidate;
}

function diffInCalendarDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / msPerDay);
}

@Injectable()
export class BirthdaysService implements IBirthdaysService {
  constructor(
    @InjectRepository(Birthday)
    private readonly birthdayRepository: Repository<Birthday>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllByUserId(userId: number): Promise<Birthday[]> {
    return this.birthdayRepository.find({
      where: { user: { id: userId } },
      order: { fullName: 'ASC' },
    });
  }

  async findById(id: number): Promise<Birthday> {
    const birthday = await this.birthdayRepository.findOne({ where: { id } });
    if (!birthday) throw new NotFoundException(`Birthday with id ${id} not found`);
    return birthday;
  }

  async create(userId: number, dto: CreateBirthdayDto): Promise<Birthday> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const birthday = this.birthdayRepository.create({ ...dto, user });
    await this.birthdayRepository.save(birthday);
    return birthday;
  }

  async update(id: number, dto: UpdateBirthdayDto): Promise<Birthday> {
    const birthday = await this.findById(id);

    if (dto.fullName !== undefined) birthday.fullName = dto.fullName;
    if (dto.birthDate !== undefined) birthday.birthDate = dto.birthDate;
    if (dto.notes !== undefined) birthday.notes = dto.notes;
    if (dto.photoUrl !== undefined) birthday.photoUrl = dto.photoUrl;

    await this.birthdayRepository.save(birthday);
    return birthday;
  }

  async remove(id: number): Promise<void> {
    const birthday = await this.findById(id);
    await this.birthdayRepository.remove(birthday);
  }

  async getUpcoming(userId: number, days: number): Promise<UpcomingBirthdaysResult> {
    const birthdays = await this.findAllByUserId(userId);
    const today = new Date();
    const todayBirthdays: Birthday[] = [];
    const upcomingBirthdays: { birthday: Birthday; daysUntil: number }[] = [];

    for (const b of birthdays) {
      const next = getNextOccurrence(b.birthDate);
      const diff = diffInCalendarDays(next, today);
      if (diff === 0) {
        todayBirthdays.push(b);
      } else if (diff > 0 && diff <= days) {
        upcomingBirthdays.push({ birthday: b, daysUntil: diff });
      }
    }

    upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

    return { todayBirthdays, upcomingBirthdays };
  }
}
