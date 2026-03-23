import { Injectable, BadRequestException } from '@nestjs/common';
import { Cargo, Tank, Allocation } from '../../core/models/types';
import { optimizeAllocation } from '../../core/algorithms/greedy-allocation';
import { OptimizeInputDto } from './dto/input.dto';

@Injectable()
export class OptimizationService {
  private cargos: Cargo[] = [];
  private tanks: Tank[] = [];
  private currentAllocations: Allocation[] = [];
  private totalLoaded: number = 0;

  loadInput(input: OptimizeInputDto): void {
    if (!input.cargos || !input.tanks) {
      throw new BadRequestException('Provide both cargos and tanks');
    }
    this.cargos = input.cargos;
    this.tanks = input.tanks;
    // Reset previous results
    this.currentAllocations = [];
    this.totalLoaded = 0;
  }

  optimize(): void {
    if (this.cargos.length === 0 && this.tanks.length === 0) {
      throw new BadRequestException('No input data loaded.');
    }
    
    const { allocations, totalLoaded } = optimizeAllocation(this.cargos, this.tanks);
    this.currentAllocations = allocations;
    this.totalLoaded = totalLoaded;
  }

  getResults(): { allocations: Allocation[]; totalLoaded: number } {
    return {
      allocations: this.currentAllocations,
      totalLoaded: this.totalLoaded,
    };
  }
}
