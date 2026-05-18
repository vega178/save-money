import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BirthdaysService } from './birthdays.service';
import { BirthdaysController } from './birthdays.controller';
import { Birthday } from './entities/birthday.entity';
import { User } from '../users/entities/user.entity';
import { BirthdayPhotoStorageService } from './services/birthday-photo-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Birthday, User])],
  controllers: [BirthdaysController],
  providers: [BirthdaysService, BirthdayPhotoStorageService],
  exports: [BirthdaysService],
})
export class BirthdaysModule {}
