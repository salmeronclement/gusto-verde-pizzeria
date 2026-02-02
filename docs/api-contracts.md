# API Contracts

Base URL: `/api` (Proxied in Dev, absolute in Prod).

## Authentication

### Client
- `POST /auth/register` - Create account
- `POST /auth/login` - Email/Password login
- `POST /auth/client/send-code` - Request OTP (Phone Auth)
- `POST /auth/client/verify-code` - Verify OTP & Login
- `GET /auth/me` - Get current user profile (Via Token)
- `PUT /auth/me` - Update profile

### Admin
- `POST /auth/admin/login` - Username/Password login

### Driver
- `POST /auth/driver/send-code` - Request OTP
- `POST /auth/driver/verify-code` - Verify OTP & Login

## Products (Public)
- `GET /products` - List all active products

## Orders
- `POST /orders` - Submit a new order
- `GET /orders/customers/:id/orders` - Customer order history
- `GET /orders/:id/tracking` - Track order status

## Admin Resources
**Requires Admin Token**

### Orders
- `GET /admin/orders` - List all orders (Live dashboard)
- `PATCH /admin/orders/:id/status` - Update status (e.g., preparation -> delivery)
- `PATCH /admin/orders/:id/assign-driver` - Manual driver assignment

### Catalog
- `GET /admin/products` - List all products (including inactive)
- `POST /admin/products` - Create product (Multipart/Form-Data)
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Remove product

### Customers
- `GET /admin/customers` - CRM List
- `PATCH /admin/customers/:id/loyalty` - Adjust points manually

### Drivers
- `GET /admin/drivers` - List fleet
- `POST /admin/drivers` - Recruit driver
- `DELETE /admin/drivers/:id` - Terminate driver

### Stats
- `GET /admin/stats` - Dashboard analytics (Revenue, orders, top items)

### Service
- `POST /admin/service/open` - Open service
- `POST /admin/service/close` - Close service
- `GET /admin/service/status` - Check current state

## Driver Resources
**Requires Driver Token**

- `GET /driver/me` - Profile & Status
- `GET /driver/my-orders` - Assigned deliveries
- `PATCH /driver/:id/start` - Pickup order
- `PATCH /driver/:id/complete` - Confirm delivery
- `PATCH /driver/status` - Toggle availability
