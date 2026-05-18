import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bill } from './entities/bill.entity';
import { BillDocument } from './entities/bill-document.entity';
import { User } from '../users/entities/user.entity';
import { FileStorageService } from './services/file-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, BillDocument, User])],
  controllers: [BillsController],
  providers: [BillsService, FileStorageService],
  exports: [BillsService],
})
export class BillsModule {}
