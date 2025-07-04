<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Tax Management Calculator API

A comprehensive API for managing client tax information and income data built with NestJS and TypeORM.

## Features

- 🏢 **Client Management**: Create, read, update, and delete client information
- 💰 **Income Tracking**: Track various types of income for clients by year
- 📊 **Income Types**: Predefined income types (W2, Capital Gains, Interest, etc.)
- 📈 **Statistics**: Generate income statistics and reports
- 🔍 **Search**: Search clients by name or email
- 🗃️ **Soft Delete**: All records use soft delete for data integrity

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: class-validator
- **API Documentation**: Built-in Swagger support

## Prerequisites

- Node.js (>= 18)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PORT=8000
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - API welcome message
- `GET /health` - Health check endpoint
- `GET /info` - API information and available endpoints

### Clients
- `GET /clients` - Get all clients (with pagination)
- `GET /clients/search?q={query}` - Search clients
- `GET /clients/:id` - Get client by ID
- `GET /clients/:id/incomes` - Get client's income records
- `POST /clients` - Create new client
- `PATCH /clients/:id` - Update client
- `DELETE /clients/:id` - Soft delete client
- `GET /clients/email/:email` - Find client by email

### Client Income
- `GET /client-income` - Get all income records (with filtering)
- `GET /client-income/types` - Get all income types
- `GET /client-income/stats` - Get income statistics
- `GET /client-income/:id` - Get income record by ID
- `GET /client-income/client/:clientId` - Get income by client
- `GET /client-income/client/:clientId/total?year={year}` - Get total income by client and year
- `POST /client-income` - Create new income record
- `PATCH /client-income/:id` - Update income record
- `DELETE /client-income/:id` - Soft delete income record

### Client Business
- `GET /client-businesses` - Get all business records (with filtering & pagination)
- `GET /client-businesses/stats` - Get business statistics
- `GET /client-businesses/:id` - Get business record by ID
- `GET /client-businesses/client/:clientId` - Get businesses by client
- `GET /client-businesses/search/by-name?name={name}` - Search businesses by name
- `GET /client-businesses/filter/by-filing-type/:filingType` - Filter by filing type
- `GET /client-businesses/filter/by-industry/:industry` - Filter by industry
- `GET /client-businesses/filter/by-year/:year` - Filter by year
- `POST /client-businesses` - Create new business record
- `PATCH /client-businesses/:id` - Update business record
- `DELETE /client-businesses/:id` - Soft delete business record

## Data Models

### Client
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Client Income
```json
{
  "id": "number",
  "clientId": "uuid",
  "taxPayer": "string",
  "payer": "string",
  "incomeType": "string",
  "amount": "number",
  "year": "number",
  "isExtracted": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Client Business
```json
{
  "id": "number",
  "clientId": "uuid",
  "name": "string",
  "filingType": "string",
  "ownership": "number",
  "employees": "number",
  "benefits": [
    {
      "id": "string",
      "name": "string",
      "value": "boolean"
    }
  ],
  "grossSales": "number",
  "industry": "string",
  "k1": "number",
  "netSales": "number",
  "projectedSales": "number",
  "w2": "number",
  "year": "number",
  "entities": [
    {
      "id": "string",
      "name": "string",
      "value": "boolean"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Income Types
The following income types are automatically seeded:
- `w2` - W2
- `capital_gains` - Capital Gains
- `capital_gains_long_term` - Capital Gains (Long Term)
- `dividends` - Dividends
- `interest` - Interest
- `patient` - Patient
- `rental_income` - Rental Income
- `retirement` - Retirement
- `social_security` - Social Security

### Business Filing Types
The following business filing types are automatically seeded:
- `c_corp` - C Corp
- `llc` - LLC
- `partnership` - Partnership
- `schedule_c` - Schedule C
- `s_corp` - S Corp
- `sole_proprietorships` - Sole Proprietorship

## Example Usage

### Create a Client
```bash
curl -X POST http://localhost:8000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }'
```

### Add Income Record
```bash
curl -X POST http://localhost:8000/client-income \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid-here",
    "incomeType": "w2",
    "amount": 75000,
    "year": 2024,
    "payer": "ABC Company"
  }'
```

### Get Client's Total Income for a Year
```bash
curl "http://localhost:8000/client-income/client/{clientId}/total?year=2024"
```

### Create a Client Business
```bash
curl -X POST http://localhost:8000/client-businesses \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid-here",
    "name": "Tech Solutions LLC",
    "filingType": "llc",
    "industry": "Technology",
    "employees": 25,
    "grossSales": 1500000,
    "year": 2024
  }'
```

### Get Business Statistics
```bash
curl "http://localhost:8000/client-businesses/stats"
```

### Filter Businesses by Filing Type
```bash
curl "http://localhost:8000/client-businesses/filter/by-filing-type/llc"
```

## Development

### Database Seeding
The application automatically seeds income types on startup. No manual seeding is required.

### Database Schema
The application uses TypeORM with automatic synchronization in development mode. In production, set `synchronize: false` and use migrations.

### Error Handling
All endpoints include comprehensive error handling with appropriate HTTP status codes and error messages.

### Validation
Request data is validated using class-validator decorators. Invalid requests return 400 Bad Request with validation details.

## Production Deployment

1. Set `NODE_ENV=production`
2. Set `synchronize: false` in TypeORM configuration
3. Run database migrations
4. Use environment variables for all sensitive configuration
5. Enable CORS for your frontend domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
