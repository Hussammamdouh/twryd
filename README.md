# Twryd Platform

A comprehensive B2B platform that connects suppliers and clients through an invitation-based system, enabling seamless business relationships, product management, and discount offerings.

## Table of Contents
- [Overview](#overview)
- [User Roles & Features](#user-roles--features)
- [Platform Operations](#platform-operations)
- [Technical Architecture](#technical-architecture)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview

Twryd is a modern React-based B2B platform designed to facilitate business relationships between suppliers and clients. The platform operates on an invitation-based system where suppliers can invite clients to establish business partnerships, manage products, offer discounts, and streamline their B2B operations.

### Key Features
- **Multi-role Authentication**: Separate portals for Admins, Suppliers, and Clients
- **Invitation System**: Secure invitation-based client onboarding
- **Product Management**: Comprehensive product catalog with categories and pricing
- **Discount Management**: Client-specific and product-specific discount systems
- **Warehouse Management**: Multi-location inventory tracking
- **Delivery Personnel Management**: Shipping and delivery coordination
- **Responsive Design**: Modern UI with dark/light theme support

## User Roles & Features

### 🔐 Admin Portal (`/admin-dashboard`)
**Access**: `/login-admin`

**Core Operations:**
- **User Management**
  - View and manage admin accounts
  - Monitor supplier registrations and accounts
  - User role management and permissions
- **Platform Configuration**
  - Manage product categories
  - Configure governates and areas
  - Platform-wide settings and configurations
- **System Monitoring**
  - View platform analytics and usage statistics
  - Monitor system health and performance

**Navigation:**
- Profile Management
- Admin Accounts Management
- Supplier Management
- Categories Management
- Governates Management
- Areas Management

### 🏢 Supplier Portal (`/supplier/dashboard`)
**Access**: `/login-supplier` or `/register-supplier`

**Core Operations:**
- **Product Management**
  - Add, edit, and delete products
  - Set pricing and product descriptions
  - Upload product images and URLs
  - Categorize products
  - Toggle product active/inactive status
- **Client Relationship Management**
  - Send invitations to potential clients
  - Manage client relationships
  - View invitation status and responses
- **Discount Management**
  - **Client-Based Discounts**: Set specific discount percentages for individual clients
  - **Product Discounts**: Apply discounts to specific products
  - Configure discount rules and conditions
- **Inventory Management**
  - Manage multiple warehouses
  - Track inventory across locations
  - Warehouse-specific product availability
- **Delivery Management**
  - Manage shipping personnel
  - Coordinate delivery operations
  - Track delivery personnel assignments

**Navigation:**
- Profile Management
- Product Management
- Warehouse Management
- Delivery Personnel Management
- Client Discounts
- Product Discounts
- Invitation Management

### 👥 Client Portal (`/client/dashboard`)
**Access**: `/login-client` or `/register-client`

**Core Operations:**
- **Supplier Relationships**
  - Accept supplier invitations
  - View connected suppliers
  - Manage business partnerships
- **Product Discovery**
  - Browse supplier catalogs
  - View product details and pricing
  - Access client-specific discounts
- **Order Management**
  - Place orders with suppliers
  - Track order status
  - View order history
- **Discount Access**
  - View available discounts
  - Access client-specific pricing
  - Track discount benefits

**Navigation:**
- Dashboard Home
- My Suppliers (Invitation Management)
- Orders
- Discounts
- Settings

## Platform Operations

### 🔗 Invitation System
The core of Twryd's B2B relationship management:

1. **Supplier Sends Invitation**
   - Supplier creates invitation from their dashboard
   - System generates unique invitation token
   - Invitation sent to client via email/link

2. **Client Receives Invitation**
   - Client clicks invitation link (`/invitation/:token`)
   - System validates invitation token
   - If not logged in, redirects to client login with invitation token

3. **Client Accepts Invitation**
   - Client logs in (if required)
   - System processes invitation acceptance
   - Establishes business relationship between supplier and client

4. **Relationship Established**
   - Client gains access to supplier's catalog
   - Client-specific discounts become available
   - Order placement becomes possible

### 🛍️ Product Management Workflow
1. **Category Setup** (Admin)
   - Admin creates product categories
   - Categories are available for supplier use

2. **Product Creation** (Supplier)
   - Supplier adds products with details
   - Sets pricing, descriptions, and images
   - Assigns products to categories
   - Configures active/inactive status

3. **Product Discovery** (Client)
   - Clients browse supplier catalogs
   - View product details and pricing
   - Access client-specific discounts

### 💰 Discount Management System
**Two-tier discount structure:**

1. **Client-Based Discounts**
   - Supplier sets specific discount percentages for individual clients
   - Applied across all products for that client
   - Managed from supplier dashboard

2. **Product Discounts**
   - Supplier applies discounts to specific products
   - Available to all clients or specific client groups
   - Product-specific pricing rules

### 🏪 Warehouse & Inventory Management
- **Multi-location Support**: Suppliers can manage multiple warehouses
- **Inventory Tracking**: Track product availability across locations
- **Location-based Operations**: Configure delivery zones and shipping personnel

### 🚚 Delivery Management
- **Personnel Management**: Add and manage delivery personnel
- **Assignment System**: Assign personnel to specific areas/warehouses
- **Coordination**: Streamline delivery operations

## Technical Architecture

### Frontend Stack
- **React 19.1.0** - Modern React with latest features
- **Vite 7.0.4** - Fast build tool and development server
- **React Router 7.6.3** - Client-side routing with lazy loading
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Axios 1.10.0** - HTTP client for API communication
- **React Hot Toast 2.5.2** - Toast notifications
- **React Icons 5.5.0** - Icon library

### Key Features
- **Lazy Loading**: Route-based code splitting for optimal performance
- **Error Boundaries**: Graceful error handling throughout the application
- **Theme System**: Dark/light mode support with context-based theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: Client-side validation with error handling
- **Loading States**: Skeleton loading and spinner components
- **Modal System**: Reusable modal components for forms and confirmations

### State Management
- **Context API**: Authentication and theme state management
- **Local State**: Component-level state with React hooks
- **API Integration**: Centralized API utilities with error handling

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   ```sh
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```sh
   npm run dev
   ```

5. **Access the application:**
   - Open `http://localhost:5173` in your browser
   - Navigate to different portals based on your role

## Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=https://back.twryd.com

# Optional: Development overrides
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG_LOGS=false
```

## Available Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Build production-ready application
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint for code quality checks
- `npm run format` — Format code with Prettier
- `npm test` — Run test suite (when configured)

## Code Quality

### Linting & Formatting
- **ESLint**: Configured for React best practices and code quality
- **Prettier**: Consistent code formatting across the project
- **Pre-commit hooks**: Automated code quality checks

### Code Organization
- **Component Structure**: Modular component architecture
- **API Abstraction**: Centralized API utilities in `utils/api.js`
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Lazy loading, memoization, and optimized rendering

### Best Practices
- **Type Safety**: PropTypes and TypeScript-ready structure
- **Accessibility**: ARIA labels and keyboard navigation support
- **Security**: Input validation and XSS prevention
- **Performance**: Code splitting and optimized bundle size

## Testing

### Recommended Testing Stack
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing

### Testing Strategy
- Unit tests for utility functions and components
- Integration tests for user workflows
- E2E tests for critical user journeys
- Performance testing for large datasets

## Contributing

### Development Workflow
1. Fork the repository and create a feature branch
2. Follow the established code style and patterns
3. Write tests for new functionality
4. Ensure all tests pass and code is linted
5. Submit a pull request with detailed description

### Code Standards
- Follow React best practices and hooks guidelines
- Use functional components with hooks
- Implement proper error handling
- Add appropriate loading states
- Ensure responsive design
- Write meaningful commit messages

### Pull Request Guidelines
- Clear description of changes
- Screenshots for UI changes
- Test coverage for new features
- Documentation updates if needed
- Performance impact assessment

---

## Support & Documentation

For technical support, feature requests, or bug reports:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for backend integration

**Platform Version**: 1.0.0  
**Last Updated**: December 2024
