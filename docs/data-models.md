# Data Models (Database Schema)

The application uses a relational **MySQL** database.

## Tables

### 1. Customers (`customers`)
Stores end-user profiles.
- **id**: INT (PK)
- **email**: VARCHAR (Unique)
- **phone**: VARCHAR (Indexed)
- **first_name**: VARCHAR
- **last_name**: VARCHAR
- **password**: VARCHAR (Hashed)
- **loyalty_points**: INT (Default 0)
- **otp_code / otp_expires_at**: (Used for Auth, transient)
- **created_at**: DATETIME

### 2. Addresses (`addresses`)
Delivery addresses linked to customers.
- **id**: INT (PK)
- **customer_id**: INT (FK -> customers)
- **label**: VARCHAR (e.g., "Maison")
- **street**: VARCHAR
- **postal_code**: VARCHAR
- **city**: VARCHAR
- **additional_info**: VARCHAR (Digicode, floor)

### 3. Orders (`orders`)
Central order record.
- **id**: INT (PK)
- **customer_id**: INT (FK -> customers)
- **address_id**: INT (FK -> addresses, Nullable for Takeaway)
- **mode**: ENUM ('emporter', 'livraison')
- **status**: ENUM ('en_attente', 'en_preparation', 'en_livraison', 'terminee', 'annulee')
- **total_amount**: DECIMAL
- **created_at**: DATETIME

### 4. Order Items (`order_items`)
Individual lines in an order.
- **id**: INT (PK)
- **order_id**: INT (FK -> orders)
- **product_name**: VARCHAR (Snapshot name)
- **unit_price**: DECIMAL (Snapshot price)
- **quantity**: INT
- **category**: VARCHAR

### 5. Drivers (`drivers`)
Delivery personnel.
- **id**: INT (PK)
- **first_name / last_name**: VARCHAR
- **phone**: VARCHAR
- **vehicle_type**: VARCHAR
- **is_active**: TINYINT
- **current_status**: ENUM (State tracking)

### 6. Deliveries (`deliveries`)
Links an order to a driver.
- **id**: INT (PK)
- **order_id**: INT (FK -> orders)
- **driver_id**: INT (FK -> drivers)
- **status**: ENUM ('assignée', 'en_livraison', 'livrée', 'annulée')
- **timestamps**: assigned_at, departed_at, delivered_at

### 7. Products (Inferred)
Menu items.
- **id**: INT (PK)
- **name**: VARCHAR
- **description**: TEXT
- **price**: DECIMAL
- **category**: VARCHAR
- **image_url**: VARCHAR
- **is_active**: BOOLEAN

### 8. Admins (`admins`)
Back-office users.
- **id**: INT (PK)
- **username**: VARCHAR
- **password**: VARCHAR (Hashed)
- **role**: VARCHAR
