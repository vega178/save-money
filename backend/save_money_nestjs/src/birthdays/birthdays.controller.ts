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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
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
}
