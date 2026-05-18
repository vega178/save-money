import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  NotFoundException,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { BirthdaysService } from './birthdays.service';
import { CreateBirthdayDto } from './dto/create-birthday.dto';
import { UpdateBirthdayDto } from './dto/update-birthday.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Birthdays')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller()
export class BirthdaysController {
  constructor(private readonly birthdaysService: BirthdaysService) {}

  @ApiOperation({ summary: 'Get all birthdays for a user' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Array of birthdays.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @Get('users/:userId/birthdays')
  findAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.birthdaysService.findAllByUserId(userId);
  }

  @ApiOperation({ summary: 'Get upcoming birthdays (today + within N days)' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiQuery({ name: 'days', type: Number, required: false, example: 7 })
  @ApiResponse({ status: 200, description: 'Upcoming birthdays.' })
  @Get('users/:userId/birthdays/upcoming')
  getUpcoming(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('days', new ParseIntPipe({ optional: true })) days = 7,
  ) {
    return this.birthdaysService.getUpcoming(userId, days);
  }

  @ApiOperation({ summary: 'Get a birthday by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Birthday found.' })
  @ApiResponse({ status: 404, description: 'Birthday not found.' })
  @Get('birthdays/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.birthdaysService.findById(id);
  }

  @ApiOperation({ summary: 'Create a birthday for a user' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 201, description: 'Birthday created.' })
  @Post('users/:userId/birthdays')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateBirthdayDto,
  ) {
    return this.birthdaysService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Update a birthday' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 201, description: 'Birthday updated.' })
  @ApiResponse({ status: 404, description: 'Birthday not found.' })
  @Put('birthdays/:id')
  @HttpCode(HttpStatus.CREATED)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBirthdayDto,
  ) {
    return this.birthdaysService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a birthday' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Birthday deleted.' })
  @ApiResponse({ status: 404, description: 'Birthday not found.' })
  @Delete('birthdays/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.birthdaysService.remove(id);
  }

  // ── Photo endpoints ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Upload or replace birthday photo' })
  @ApiConsumes('multipart/form-data')
  @Post('birthdays/:id/photo')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.birthdaysService.uploadPhoto(id, file);
  }

  @ApiOperation({ summary: 'Stream birthday photo' })
  @Get('birthdays/:id/photo')
  async streamPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const birthday = await this.birthdaysService.findById(id);
    if (!birthday.storedPhoto) throw new NotFoundException('No photo uploaded for this birthday.');
    const stream = this.birthdaysService.streamPhoto(birthday);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    stream.pipe(res);
  }

  @ApiOperation({ summary: 'Delete birthday photo' })
  @Delete('birthdays/:id/photo')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePhoto(@Param('id', ParseIntPipe) id: number) {
    return this.birthdaysService.deletePhoto(id);
  }
}
