import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OptimizationService } from './optimization.service';
import { OptimizeInputDto } from './dto/input.dto';

@Controller()
export class OptimizationController {
  constructor(private readonly optimizationService: OptimizationService) {}

  @Post('input')
  @HttpCode(HttpStatus.OK)
  loadInput(@Body() inputDto: OptimizeInputDto) {
    this.optimizationService.loadInput(inputDto);
    return { message: 'Input loaded successfully' };
  }

  @Post('optimize')
  @HttpCode(HttpStatus.OK)
  runOptimization() {
    this.optimizationService.optimize();
    return { message: 'Optimization completed' };
  }

  @Get('results')
  getResults() {
    return this.optimizationService.getResults();
  }
}
