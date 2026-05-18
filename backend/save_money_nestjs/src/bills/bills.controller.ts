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
  UseInterceptors,
  UploadedFile,
  Res,
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
  ApiBody,
  ApiConsumes,
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

  @ApiOperation({ summary: 'Get analytics for a user',
    description:
      'Returns aggregated dashboard metrics: spending by card/subscription, ' +
      'remaining amount per month, yearly breakdown with percentages, ' +
      'recent bills, and month-over-month spending change.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Analytics payload.',
    schema: {
      example: {
        spendingByCard:         [{ name: 'Rappi', total: 150000 }],
        spendingBySubscription: [{ name: 'Spotify', total: 236406 }],
        remainingByMonth:       [{ year: 2026, month: 5, label: 'May 2026', remainingAmount: 1200000 }],
        yearlyBreakdown:        [{ year: 2026, total: 8500000, percentage: 100 }],
        recentBills:            [{ id: 42, name: 'Tigo Home', amount: 78802, billDate: '2026-05-01' }],
        currentMonthTotal:      2500000,
        previousMonthTotal:     2300000,
        monthOverMonthPct:      9,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT.' })
  @Get('users/:id/analytics')
  getAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.getAnalytics(id);
  }

  // ── Document endpoints ──────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List all documents for a bill' })
  @ApiParam({ name: 'billId', type: Number })
  @ApiResponse({ status: 200, description: 'Array of document metadata.' })
  @Get('bills/:billId/documents')
  getDocuments(@Param('billId', ParseIntPipe) billId: number) {
    return this.billsService.getDocumentsByBillId(billId);
  }

  @ApiOperation({ summary: 'Upload a document and attach it to a bill' })
  @ApiParam({ name: 'billId', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, description: 'Document uploaded and linked.' })
  @Post('bills/:billId/documents')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadDocument(
    @Param('billId', ParseIntPipe) billId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.billsService.attachDocument(billId, file);
  }

  @ApiOperation({ summary: 'Replace an existing document on a bill' })
  @ApiParam({ name: 'billId', type: Number })
  @ApiParam({ name: 'docId',  type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 200, description: 'Document replaced.' })
  @Put('bills/:billId/documents/:docId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  replaceDocument(
    @Param('billId', ParseIntPipe) billId: number,
    @Param('docId',  ParseIntPipe) docId:  number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.billsService.replaceDocument(billId, docId, file);
  }

  @ApiOperation({ summary: 'Stream / view a document (inline in browser)' })
  @ApiParam({ name: 'billId', type: Number })
  @ApiParam({ name: 'docId',  type: Number })
  @ApiResponse({ status: 200, description: 'File stream.' })
  @Get('bills/:billId/documents/:docId/view')
  async viewDocument(
    @Param('billId', ParseIntPipe) billId: number,
    @Param('docId',  ParseIntPipe) docId:  number,
    @Res() res: Response,
  ) {
    const { stream, doc } = await this.billsService.streamDocument(billId, docId);
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Disposition': `inline; filename="${doc.originalName}"`,
      'Content-Length': String(doc.sizeBytes),
    });
    stream.pipe(res);
  }

  @ApiOperation({ summary: 'Delete a document from a bill' })
  @ApiParam({ name: 'billId', type: Number })
  @ApiParam({ name: 'docId',  type: Number })
  @ApiResponse({ status: 204, description: 'Document deleted.' })
  @Delete('bills/:billId/documents/:docId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDocument(
    @Param('billId', ParseIntPipe) billId: number,
    @Param('docId',  ParseIntPipe) docId:  number,
  ) {
    return this.billsService.removeDocument(billId, docId);
  }
}

