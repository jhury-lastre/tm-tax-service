# Tax Management Calculator

A comprehensive tax management application built with Turborepo, designed to help manage client tax scenarios and perform tax calculations. This application provides an intuitive interface for tax professionals to manage client information, track income sources, and calculate tax liabilities.

## 🚀 Quick Start

To start the development server for all applications:

```sh
npm run dev
```

This will start:
- **Web App** (port 3001): Main tax calculator application
- **API** (port 3000): Backend API for client and income management  
- **Docs** (port 3000): Documentation and demo site

## 📋 Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm >= 10

## 🛠️ Setup

1. **Clone and install dependencies:**
   ```sh
   git clone <repository-url>
   cd tm-calculator
   npm install
   ```

2. **Database Setup:**
   ```sh
   # Create a PostgreSQL database
   createdb tm_calculator
   
   # Set your database URL in the API environment
   # Create apps/api/.env with:
   DATABASE_URL=postgresql://username:password@localhost:5432/tm_calculator
   ```

3. **Start development servers:**
   ```sh
   npm run dev
   ```

The application will automatically seed the database with sample data on first run.

## 🏗️ Project Structure

This monorepo contains the following applications and packages:

### Applications

- **`apps/web`** - Next.js tax calculator frontend with client scenarios
- **`apps/api`** - NestJS backend API for managing clients, income, and business data
- **`apps/docs`** - Next.js documentation and demo application

### Shared Packages

- **`packages/ui`** - Shared React component library with Tailwind CSS
- **`packages/eslint-config`** - Shared ESLint configurations
- **`packages/typescript-config`** - Shared TypeScript configurations  
- **`packages/tailwind-config`** - Shared Tailwind CSS configuration

## ✨ Features

### Tax Calculator
- **Interactive Tax Form**: Comprehensive tax calculation with income, deductions, and payments
- **Real-time Calculations**: Automatic calculation of tax liability and refund/balance due
- **Client Integration**: Pre-populated data from selected client scenarios
- **Responsive Design**: Modern UI with accordion-style organization

### Client Management
- **Client Scenarios**: Pre-defined client profiles with varied income sources
- **Income Tracking**: Multiple income types (W2, Capital Gains, Dividends, Interest, etc.)
- **Business Information**: Track business entities with filing types and financial data
- **Income Breakdown**: Visual breakdown of W2, K1, and other income sources

### API Features
- **RESTful API**: Complete CRUD operations for clients, income, and business data
- **Database Seeding**: Automatic generation of realistic test data
- **Soft Deletes**: Data integrity with soft delete functionality
- **Statistics**: Income analytics and reporting capabilities

## 💾 Database Schema

### Core Entities

**Clients**
- Personal information (name, email, phone, address)
- Relationships to income records and business entities

**Client Income**
- Income tracking by type and year
- Support for multiple income sources per client
- Extraction status for tax preparation

**Client Businesses**  
- Business entity information and filing types
- Financial data (gross sales, net sales, projections)
- Employee benefits and compliance tracking
- W2 and K1 income generation

**Income Types**
- W2, Capital Gains, Dividends, Interest
- Rental Income, Social Security, Retirement
- Patient income and other categories

**Business Filing Types**
- C Corp, LLC, Partnership
- Schedule C, S Corp, Sole Proprietorship

## 🧪 Development

### Available Scripts

```sh
# Development
npm run dev          # Start all apps in development mode
npm run build        # Build all apps for production
npm run lint         # Run ESLint across all packages
npm run check-types  # Run TypeScript type checking

# API-specific
npm run seed                    # Seed database with sample data
npm run seed:2025-businesses   # Seed additional business data
```

### Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS for styling
- Radix UI components
- Zustand for state management
- React Query for data fetching

**Backend:**
- NestJS framework
- TypeORM with PostgreSQL
- Class validation and transformation
- Automatic database seeding

**Development:**
- Turborepo for monorepo management
- ESLint and Prettier for code quality
- TypeScript for type safety

## 🎯 Usage

1. **Start the application** with `npm run dev`
2. **View client scenarios** on the main page
3. **Select a client** to see their income breakdown and business information
4. **Use the tax calculator** to perform tax calculations with pre-populated data
5. **Modify values** in the calculator to see real-time tax updates

## 🔧 API Endpoints

- `GET /clients` - List all clients with optional filtering
- `GET /client-income` - Retrieve income records by client
- `GET /client-businesses` - Get business information
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client information
- `DELETE /clients/:id` - Soft delete client

See the API documentation at `/info` endpoint for complete details.

## 📱 Screenshots

The application features:
- Clean, professional tax calculator interface
- Client scenario cards with income summaries
- Interactive forms with real-time validation
- Responsive design for desktop and mobile use

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Run `npm run lint` and `npm run check-types` before committing
3. Ensure all applications build successfully with `npm run build`
4. Test API endpoints after making backend changes

## 📄 License

This project is private and proprietary.
