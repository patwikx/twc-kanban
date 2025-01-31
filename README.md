# RD Realty Development Corporation - Property Management System



This is a repository for RD Realty Development Corporation - Property Management System


# Key Features

# User Management
- User authentication and authorization (integrated with NextAuth)
- Role-based access control (Admin, Manager, Staff, Tenant)
- User profile management

# Property Management
- Property creation and management
- Unit management within properties
- Property and unit tax tracking
- Utility management for properties and units

# Tenant Management
- Tenant profile management
- Lease management
- Rent and payment tracking
- Maintenance request system
# Financial Management
- Payment processing and tracking
- Utility bill management
- Property and unit tax management

# Document Management
- Document upload and storage
- Document categorization (Lease, Contract, Invoice, Maintenance, Other)
- Document association with properties, units, and tenants

# Project Management
- Project creation and tracking
- Task management with boards and columns (Kanban-style)
- Task assignment, commenting, and activity tracking
- Project member management with roles

# Maintenance Management
- Maintenance request creation and tracking
- Priority-based maintenance scheduling
- Maintenance status updates

# Reporting and Analytics
- Audit log system for tracking all major actions
- Customizable reporting capabilities (implied by the comprehensive data model)

# Notification System
- User-specific notifications
- Multi-type notifications (System, Maintenance, Lease, Payment, etc.)
- Notification prioritization

# Utility Management
- Tracking of utility accounts for properties and units
- Utility bill management and payment tracking
- Security and Compliance
- Secure authentication with NextAuth
- Detailed audit logging for compliance and security purposes
- Role-based access control to ensure data privacy


This system provides a robust foundation for managing properties, tenants, projects, and associated financial and maintenance aspects. It offers comprehensive features for both property management companies and project-based organizations, allowing for efficient management of resources, tasks, and communications.

### Prerequisites

**Node version 18.7.x**


### Install packages

```shell
npm i
```

### Setup .env file


```js
DATABASE_URL=
DIRECT_URL=

AUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RESEND_API_KEY=

NEXT_PUBLIC_APP_URL=
```

### Setup Prisma
```shell
npx prisma generate
npx prisma db push
```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command         | description                              |
| :-------------- | :--------------------------------------- |
| `dev`           | Starts a development instance of the app |
