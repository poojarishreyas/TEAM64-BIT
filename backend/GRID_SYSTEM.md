# Grid Management System

## Database Schema

### Tables

1. **projects** - Main project information
2. **grid_cells** - Individual grid cells (max 5 members each)
3. **grid_members** - Members registered to grid cells

## Setup

### 1. Run Migration

```bash
cd backend
node src/db/migrations/001_init.js
```

### 2. API Endpoints

#### Store Grid Cells (after boundary is drawn)
```http
POST /api/grid/store
{
  "projectId": "NCCR-0D-2025-001",
  "gridData": { ... GeoJSON FeatureCollection ... }
}
```

#### Get Available Grids
```http
GET /api/grid/available/:projectId
```

#### Register Member to Grid
```http
POST /api/grid/register-member
{
  "gridCellId": 1,
  "name": "John Doe",
  "wallet": "0x...",
  "phone": "+91...",
  "photoCID": "Qm..."
}
```

#### Get Grid Details
```http
GET /api/grid/details/:gridCellId
```

#### Get All Project Grids
```http
GET /api/grid/project/:projectId
```

## Frontend Integration

Update `MapBoundary.jsx` to store grids after generation:

```javascript
// After grid generation and IPFS upload
const storeResponse = await fetch('http://localhost:5000/api/grid/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        projectId: 'NCCR-0D-2025-001',
        gridData: gridData
    })
});
```

## Member Registration Flow

1. User selects a grid cell from available grids
2. System checks if grid has space (< 5 members)
3. User fills registration form
4. Member is added to grid_members table
5. Grid cell member_count is incremented
6. If count reaches 5, is_full flag is set to true

## Constraints

- Maximum 5 members per grid cell
- Grid cells marked as full cannot accept new members
- All member registrations are tracked with timestamps
