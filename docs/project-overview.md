# Project Overview: Dolce Pizza Marseille

## Executive Summary
**New_concept_pizzeria** (Dolce Pizza App) is a modern web application for an artisanal pizzeria in Marseille. It replaces an existing informational site with a fully functional ordering system. Ideally designed for mobile-first usage, it allows customers to browse the menu, customize orders (base, ingredients), manage a cart, and choose between takeaway or delivery. The system features a comprehensive admin dashboard for order management, driver assignments, and content updates.

> **Note:** This project is a "brownfield" modernization of an existing PHP/HTML site into a React/Node.js stack.

## Technology Stack

| Component | Technology | Logic/Pattern |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Component-based, SPA |
| **Styling** | TailwindCSS | Utility-first, Responsive |
| **State Management** | Zustand | Global store (Cart, Auth) |
| **Backend** | Node.js / Express | REST API, Controller-Service Service |
| **Database** | MySQL | Relational, Structured Schema |
| **Authentication** | JWT + Firebase | Phone Auth (Client/Driver), JWT (Admin) |
| **Integrations** | Twilio | SMS OTP (Driver verification) |

## Architecture Classification
- **Type**: Multi-part Project (Frontend + Backend)
- **Architecture**: Client-Server (Decoupled)
  - **Frontend**: Single Page Application (SPA) consuming JSON APIs.
  - **Backend**: RESTful API service with direct database access.

## Repository Structure
The project is organized adjacent directories for client and server:

```
New_concept_pizzeria/
├── frontend/    # React Client (Vite)
└── backend/     # Express API Server
```

## Key Features
- **Public Ordering**: Menu browsing, Cart management, Order placement (Delivery/Takeaway).
- **Customer Account**: History, Addresses, Loyalty Points, Profile management.
- **Admin Dashboard**: Live order tracking, Menu editing, Stats, Driver management.
- **Driver App**: Mobile interface for drivers to accept/complete deliveries.
- **Service Management**: Open/Close service, scheduled orders.
