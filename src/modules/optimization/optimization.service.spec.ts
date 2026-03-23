import { Test, TestingModule } from '@nestjs/testing';
import { OptimizationService } from './optimization.service';
import { BadRequestException } from '@nestjs/common';

describe('OptimizationService', () => {
  let service: OptimizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptimizationService],
    }).compile();

    service = module.get<OptimizationService>(OptimizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if optimize is called without loading input', () => {
    expect(() => service.optimize()).toThrow(BadRequestException);
  });

  it('should load input and optimize', () => {
    service.loadInput({
      cargos: [{ id: 'C1', volume: 1000 }],
      tanks: [{ id: 'T1', capacity: 1200 }],
    });

    service.optimize();
    const results = service.getResults();

    expect(results.totalLoaded).toBe(1000);
    expect(results.allocations).toHaveLength(1);
    expect(results.allocations[0]).toEqual({
      cargoId: 'C1', tankId: 'T1', allocatedVolume: 1000,
    });
  });
});
