import { Cargo, Tank, Allocation } from '../models/types';

export function optimizeAllocation(
  cargos: Cargo[],
  tanks: Tank[],
): { allocations: Allocation[]; totalLoaded: number } {
  // Clone to avoid mutating input directly
  const availableCargos = cargos.map((c) => ({ ...c }));
  const availableTanks = tanks.map((t) => ({ ...t }));

  // Sort cargos by volume descending
  availableCargos.sort((a, b) => b.volume - a.volume);
  // Sort tanks by capacity descending
  availableTanks.sort((a, b) => b.capacity - a.capacity);

  const allocations: Allocation[] = [];
  let totalLoaded = 0;

  for (const cargo of availableCargos) {
    if (cargo.volume <= 0) continue;

    for (const tank of availableTanks) {
      if (cargo.volume <= 0 || tank.capacity <= 0) continue;

      // Calculate how much we can put in this tank
      const allocateAmount = Math.min(cargo.volume, tank.capacity);

      allocations.push({
        cargoId: cargo.id,
        tankId: tank.id,
        allocatedVolume: allocateAmount,
      });

      // Update remaining amounts
      cargo.volume -= allocateAmount;
      tank.capacity -= allocateAmount;
      totalLoaded += allocateAmount;

      // Note: we can split cargo, meaning the cargo might still have volume and we move to the next tank,
      // or the tank might still have capacity, but the problem states:
      // "Each tank can only contain cargo from a single cargo ID"
      // Wait, if each tank can ONLY contain cargo from a single cargo ID, 
      // then once a tank receives ANY cargo, it cannot accept cargo from another ID.
      // So if `allocateAmount > 0`, we must mark the tank as completely full/unavailable for others.
      // E.g., setting tank.capacity = 0 prevents other cargos from using it.
      
      // Let's revisit the Constraints:
      // 1. Cargo splitting is allowed (one cargo can go into multiple tanks)
      // 2. Each tank can only contain cargo from a single cargo ID
      // 3. Maximize total loaded cargo volume
      // 
      // If a tank can only take a single cargo ID, then whatever is put into it, 
      // the remaining capacity of that tank CANNOT be used by another cargo.
      // So effectively, tank.capacity becomes 0 for the remaining cargos.
      if (allocateAmount > 0) {
        tank.capacity = 0; // Mark tank as utilized since it can't take other cargo IDs
      }
    }
  }

  return { allocations, totalLoaded };
}
