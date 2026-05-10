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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bills')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller()
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @ApiOperation({ summary: 'List all bills' })
  @ApiResponse({ status: 200, description: 'Array of all bills.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @Get('bills')
  findAll() {
    return this.billsService.findAll();
  }

  @ApiOperation({ summary: 'Get a bill by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Bill found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({ status: 404, description: 'Bill not found.' })
  @Get('bills/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findById(id);
  }

  @ApiOperation({ summary: 'Create a bill (no user association)' })
  @ApiResponse({ status: 201, description: 'Bill created.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @Post('bills')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @ApiOperation({ summary: 'Update a bill' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 201, description: 'Bill updated.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({ status: 404, description: 'Bill not found.' })
  @Put('bills/:id')
  @HttpCode(HttpStatus.CREATED)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a bill' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Bill deleted.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({ status: 404, description: 'Bill not found.' })
  @Delete('bills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.remove(id);
  }

  @ApiOperation({
    summary: 'Get bills by user ID',
    description: 'Returns bills sorted by position/date with computed `actualDebt` and `remainingAmount` (cumulative per month/year).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Sorted and enriched bills array.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @Get('users/:id/bills')
  getBillsByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.getBillsByUserId(id);
  }

  @ApiOperation({ summary: 'Create a bill linked to a specific user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID', example: 1 })
  @ApiResponse({ status: 201, description: 'Bill created and linked to user.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post('users/:id/bills')
  @HttpCode(HttpStatus.CREATED)
  createForUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateBillDto,
  ) {
    return this.billsService.createForUser(id, dto);
  }

  @ApiOperation({
    summary: 'Reorder bills',
    description: 'Accepts an ordered array of bill IDs and updates the `position` field on each. Used for drag-and-drop ordering.',
  })
  @ApiBody({ schema: { type: 'array', items: { type: 'number' }, example: [3, 1, 2] } })
  @ApiResponse({ status: 200, description: 'Bills reordered successfully.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @Put('bills/reorder')
  reorder(@Body() orderedIds: number[]) {
    return this.billsService.reorderBills(orderedIds);
  }
}

