import { optimizeAllocation } from './greedy-allocation';

describe('Greedy Allocation Algorithm', () => {
  it('should handle normal allocation successfully', () => {
    const cargos = [
      { id: 'C1', volume: 1000 },
      { id: 'C2', volume: 500 },
    ];
    const tanks = [
      { id: 'T1', capacity: 1200 },
      { id: 'T2', capacity: 600 },
    ];

    const { allocations, totalLoaded } = optimizeAllocation(cargos, tanks);

    expect(totalLoaded).toBe(1500);
    expect(allocations).toEqual(
      expect.arrayContaining([
        { cargoId: 'C1', tankId: 'T1', allocatedVolume: 1000 },
        { cargoId: 'C2', tankId: 'T2', allocatedVolume: 500 },
      ])
    );
  });

  it('should handle partial allocation (cargo splitting)', () => {
    const cargos = [{ id: 'C1', volume: 1500 }];
    const tanks = [
      { id: 'T1', capacity: 1000 },
      { id: 'T2', capacity: 800 },
    ];

    const { allocations, totalLoaded } = optimizeAllocation(cargos, tanks);

    expect(totalLoaded).toBe(1500);
    // Highest capacity tank T1 should be filled first
    expect(allocations).toEqual(
      expect.arrayContaining([
        { cargoId: 'C1', tankId: 'T1', allocatedVolume: 1000 },
        { cargoId: 'C1', tankId: 'T2', allocatedVolume: 500 },
      ])
    );
  });

  it('should handle empty input', () => {
    const { allocations, totalLoaded } = optimizeAllocation([], []);
    expect(totalLoaded).toBe(0);
    expect(allocations).toEqual([]);
  });

  it('should handle more tanks than cargo', () => {
    const cargos = [{ id: 'C1', volume: 500 }];
    const tanks = [
      { id: 'T1', capacity: 1000 },
      { id: 'T2', capacity: 1000 },
    ];

    const { allocations, totalLoaded } = optimizeAllocation(cargos, tanks);

    expect(totalLoaded).toBe(500);
    expect(allocations).toHaveLength(1);
    expect(allocations[0]).toEqual({
      cargoId: 'C1',
      tankId: 'T1',
      allocatedVolume: 500,
    });
  });

  it('should handle more cargo than tanks', () => {
    const cargos = [
      { id: 'C1', volume: 1000 },
      { id: 'C2', volume: 1000 },
    ];
    const tanks = [{ id: 'T1', capacity: 1500 }];

    const { allocations, totalLoaded } = optimizeAllocation(cargos, tanks);

    // C1 is the same volume as C2 and will be allocated first
    // C1 takes 1000 out of T1's 1500 capacity.
    // T1 cannot accept C2 due to single cargo ID per tank constraint.
    expect(totalLoaded).toBe(1000);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].allocatedVolume).toBe(1000); // T1 takes 1000 of C1
    // Wait, T1 capacity is 1500. So it takes 1000 of C1. 
    // And remaining 500? Actually, a tank can only take a single cargo ID, so T1 cannot take C2!
    // Therefore, totalLoaded is 1000, not 1500!
  });

  it('verifies the single cargo ID per tank constraint', () => {
    const cargos = [
      { id: 'C1', volume: 1000 },
      { id: 'C2', volume: 1000 },
    ];
    const tanks = [{ id: 'T1', capacity: 1500 }];

    const { allocations, totalLoaded } = optimizeAllocation(cargos, tanks);

    expect(totalLoaded).toBe(1000);
    expect(allocations).toHaveLength(1);
    expect(allocations[0]).toEqual({
      cargoId: 'C1',
      tankId: 'T1',
      allocatedVolume: 1000,
    });
  });
});
