# Agriculture Marketplace - MVP Scaffold

This repository contains a foundation-level full-stack setup for an agriculture e-commerce marketplace.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

## Project Structure
- `backend/`
  - `server.js`
  - `config/database.js`
  - `models/` (User, Product, Order, Cart)
  - `routes/` (authRoutes, productRoutes)
  - `controllers/` (authController, productController)
  - `middleware/` (auth middleware for JWT)
- `frontend/`
  - React app with Home, Login, Register, and Products pages
  - Shared Navbar and base styling

## Run Backend
1. Open terminal in `backend/`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update values
4. Start dev server: `npm run dev`
5. API health check: `${VITE_API_URL}/health` (or your deployed backend URL + `/api/health`)

## Run Frontend
1. Open terminal in `frontend/`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open app on the URL printed by Vite terminal output

## GitHub Pages (Frontend)
1. This repo includes workflow: `.github/workflows/deploy-pages.yml`
2. In GitHub repo settings:
  - Go to `Settings -> Pages`
  - Set source to `Deploy from a branch`
  - Branch: `gh-pages`, folder: `/ (root)`
3. Optional but recommended: add repository secrets
  - `VITE_API_URL`
  - `REACT_APP_API_URL`
4. Push to `main` to trigger deployment.
5. Live URL (for this repo name): `https://megatrann.github.io/Agro-Marcket/`

Note: GitHub Pages hosts only the frontend (static). Backend API must be hosted separately.

## Local Environment Note (macOS)
- Backend defaults to port `5000`. If this port is occupied on your system, update `PORT` in backend `.env`.

## Notes
- This is an MVP foundation with authentication, marketplace, cart, order, admin, AI description generation, and analytics modules.
- Payment integration and advanced AI features are not implemented yet.

## Product Management APIs
- POST /api/products
  - Auth required (Bearer token)
  - Only farmer or vendor role can create products
  - Supports multipart image upload with field name `images` (up to 8 files)
- GET /api/products
  - Public
  - Filters: `category`, `location`, `organic`, `minPrice`, `maxPrice`
- GET /api/products/:id
  - Public
- PUT /api/products/:id
  - Auth required
  - Only product owner can edit
- DELETE /api/products/:id
  - Auth required
  - Product owner or admin can delete

## Supported Product Categories
- Vegetables
- Fruits
- Grains
- Seeds
- Fertilizer
- Equipment
- Vehicles

## Cart APIs
- POST /api/cart/add
  - Auth required
  - Body: `productId`, `quantity`
  - If item already exists in cart, quantity is incremented
- GET /api/cart
  - Auth required
  - Returns logged-in user cart items
- PUT /api/cart/update/:id
  - Auth required
  - Update cart item quantity
- DELETE /api/cart/remove/:id
  - Auth required
  - Remove cart item

## Order APIs
- POST /api/orders/create
  - Auth required
  - Converts current user cart to order
  - Stores `priceAtPurchase` snapshot in order items
  - Decreases product stock and clears cart on success
- GET /api/orders/my-orders
  - Auth required
  - Returns buyer's own orders
- GET /api/orders/seller-orders
  - Auth required
  - Seller/Admin view of orders containing seller-owned products
- PUT /api/orders/update-status/:id
  - Auth required
  - Seller/Admin updates status: `pending`, `confirmed`, `completed`, `cancelled`

## Admin APIs
- All admin APIs require JWT auth and admin role.
- GET /api/admin/dashboard
  - Returns dashboard stats: total users, total farmers/vendors, total products, total orders
- GET /api/admin/users
  - List all users
- PUT /api/admin/users/:id/role
  - Update user role
- DELETE /api/admin/users/:id
  - Delete a user
- GET /api/admin/products
  - List all products
- DELETE /api/admin/products/:id
  - Delete a product
- GET /api/admin/orders
  - List all orders
- PUT /api/admin/orders/:id
  - Update order status (`pending`, `confirmed`, `completed`, `cancelled`)

## Frontend Admin Routes
- /admin/dashboard
- /admin/analytics
- /admin/users
- /admin/products
- /admin/orders

## Analytics APIs
- All analytics APIs require JWT auth and admin role.
- GET /api/analytics/overview
  - Returns `totalUsers`, `totalFarmers`, `totalProducts`, `totalOrders`, `totalRevenue`
- GET /api/analytics/sales-by-category
  - Returns grouped sales and revenue by product category
- GET /api/analytics/top-products
  - Returns top 5 best-selling products
- GET /api/analytics/top-farmers
  - Returns farmers/vendors with highest sales
- GET /api/analytics/location-demand
  - Returns highest demand locations by ordered units and order counts

## AI Product Description API
- POST /api/ai/generate-product-description
  - Auth required
  - Body: `productName`, `category`, `location`, `type`
  - Response:
    - `title`
    - `description`
    - `benefits` (array)
    - `tags` (array)

## AI Product Form Integration
- Frontend route: `/products/new`
- Seller can click **Generate AI Description** in Add Product form.
- AI output auto-fills title, description, benefits, and tags fields.
- Loading state shown as: `Generating AI content...`
