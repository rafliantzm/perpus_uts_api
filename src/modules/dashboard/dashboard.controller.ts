import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Mendapatkan statistik ringkasan operasional perpustakaan (katalog, eksemplar, anggota, sirkulasi)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistik dashboard berhasil diambil',
  })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
