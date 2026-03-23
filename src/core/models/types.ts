export interface Cargo {
  id: string;
  volume: number;
}

export interface Tank {
  id: string;
  capacity: number;
}

export interface Allocation {
  cargoId: string;
  tankId: string;
  allocatedVolume: number;
}
