# Cargo Optimization Service

A production-ready robust backend service to optimize the allocation of cargos into tanks, built with NestJS and TypeScript.

## 1. Project Overview
The Cargo Optimization Service evaluates a set of cargos and empty tanks, returning an optimized mapping that maximizes the total loaded cargo volume. It enforces the rule that each tank can only house cargo originating from a single cargo ID, while allowing cargo splitting (a specific cargo can span across multiple tanks).

This service is exposed via RESTful API endpoints, allowing decoupled ingestion of input values and optimization processing.

## 2. Approach
The optimization employs a **Greedy Algorithm** to maximize the total loaded volume. The algorithm works as follows:
1. Sort all cargos by volume in descending order (largest first).
2. Sort all tanks by capacity in descending order (largest first).
3. Loop over the largest available cargos and attempt to allocate them into the highest-capacity empty tanks available.
4. Calculate the allocated amount as `min(cargo.volume, tank.capacity)`.
5. Once a cargo is assigned to a tank, update remaining capacities. Since each tank can only receive a *single cargo ID*, any remaining capacity in the newly occupied tank is effectively ignored for subsequent distinct cargos.

## 3. Why Greedy Works
In this specific problem, **cargo splitting is allowed**. When elements can be fractionally separated across containers without penalty, the greedy approach (filling the largest containers with the largest possible values first) guarantees maximum utilization. There is no risk of a smaller cargo being mathematically better placed in a large tank, since the algorithm uses continuous fractional allocation until total cargo or total capacities run out subject to the constraint. 

## 4. Trade-offs
- **Constraints limitation:** This algorithm assumes all cargos and tanks are fully compatible. If constraints change (e.g., specific cargos cannot mix with other hazardous materials, or if cargo splitting was *not* allowed which would transform this into a Bin Packing Problem), a simple greedy algorithm would no longer guarantee an optimal solution. Dynamic programming or constraint programming would be required instead.
- **In-Memory State:** Current setup stores state in-memory inside the `OptimizationService` for simplicity and speedy processing. This is not horizontally scalable. For a highly-available production system, Redis or a standard database should be utilized to maintain state.

## 5. Setup Instructions

### Prerequisites
- Node.js (v20+)
- Docker (optional, for containerization)

### Local Native Setup
```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run the app locally in dev mode
npm run start:dev
```
The application will run on `http://localhost:3000`.

### Docker Setup
You can also run the service entirely within Docker.
```bash
# Build the application image
docker build -t cargo-optimizer .

# Run the container mapping port 3000
docker run -p 3000:3000 cargo-optimizer
```

## 6. API Endpoints

### `POST /input`
Submits a list of cargos and tanks to safely store them for optimization.
**Example Request:**
```json
{
  "cargos": [
    { "id": "C1", "volume": 1234 },
    { "id": "C2", "volume": 4352 }
  ],
  "tanks": [
    { "id": "T1", "capacity": 1234 },
    { "id": "T2", "capacity": 4352 }
  ]
}
```

### `POST /optimize`
Triggers the optimization algorithm based on the ingested state.
**Example Request:** No body required.

### `GET /results`
Retrieves the computed allocations and the total volume of all cargos successfully matched to tanks.
**Example Response:**
```json
{
  "allocations": [
    {
      "cargoId": "C2",
      "tankId": "T2",
      "allocatedVolume": 4352
    },
    {
      "cargoId": "C1",
      "tankId": "T1",
      "allocatedVolume": 1234
    }
  ],
  "totalLoaded": 5586
}
```

## Swagger Documentation
Once the server is running, the fully detailed interactive Swagger API documentation is available at:
`http://localhost:3000/api`
