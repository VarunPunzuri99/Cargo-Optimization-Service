# Cargo Optimization Service

A production-ready robust backend service to optimize the allocation of cargos into tanks, built with NestJS and TypeScript.

**🚀 Live Demo:** [https://cargo-optimization-service.onrender.com](https://cargo-optimization-service.onrender.com)
**🚀 Swagger URL:** [https://cargo-optimization-service.onrender.com/api](https://cargo-optimization-service.onrender.com/api)

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

## 7. Interactive Visualization UI
This project includes a fully integrated front-end visualization built with HTML, Tailwind CSS, and Vanilla JavaScript.

To access the UI:
1. Start the application (`npm run start:dev` or via Docker).
2. Open your browser and navigate to `http://localhost:3000`. (The `public/index.html` is served automatically).
3. You will see an interactive dashboard where you can tweak the JSON inputs for Cargos and Tanks.
4. Click **Run Optimization Setup** to visualize how the system automatically allocates the cargoes into the tanks using the greedy algorithm, complete with visual fill-percentage indicators.

## 8. Cloud Deployment (Render)
This project is pre-configured for one-click deployment to **Render** using the included `render.yaml`.

### To Deploy:
1. Push this repository to **GitHub**.
2. Log in to [Render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` and configure the service.
6. Once deployed, you will get a live URL to access the API and UI.

> [!TIP]
> Make sure the `NODE_VERSION` in Render matches your local version (v20+ recommended).

## 9. Performance & Large Datasets
The service is optimized to handle larger datasets:
- **Algorithmic Complexity**: The Greedy Allocation algorithm runs in **O(N log N)** time (due to sorting), where N is the number of cargos or tanks. This remains highly performant even for thousands of entries.
- **Payload Limits**: The API is configured to accept payloads up to **10MB**, allowing for significant batches of cargo and tank data.
- **Memory Efficiency**: The core algorithm uses in-place operations on cloned data structures to avoid deep-copy overhead where possible.
