# FabTrack Equipment Tracking System

## Overview

FabTrack is a modern, web-based equipment tracking application specifically developed for managing equipment usage in academic and professional lab environments, particularly at Ashesi University's Fabrication Lab. It automates and centralizes the tracking of lab equipment check-outs, returns, and audit logs, reducing equipment loss and improving operational efficiency.

## Problem Statement

Manual tracking of lab equipment often leads to inaccuracies, inefficiencies, and losses. FabTrack addresses these issues by offering a robust, digital solution that ensures accountability and transparency in equipment management.

## Objectives

* Automate equipment borrowing and return processes.
* Ensure accountability through user-specific logs.
* Improve equipment return rates through automated reminders.
* Enhance data integrity and accessibility.
* Provide a user-friendly, intuitive interface for students and lab administrators.

## Key Features

* **Role-Based Access Control:** Separate roles for Admins (lab attendants) and Students.
* **Secure Authentication:** JWT tokens and bcrypt-hashed passwords.
* **Real-Time Equipment Tracking:** Immediate updates on equipment status.
* **Automated Notifications:** Email reminders for returns and confirmations.
* **Comprehensive Logging:** Detailed audit logs for every equipment transaction.
* **Data Export:** Export logs in JSON format.

## Tech Stack

### Backend

* Node.js with Express.js
* PostgreSQL database via Sequelize ORM
* JWT for secure authentication
* bcrypt for password hashing
* Jest & Supertest for automated testing

### Frontend

* React.js with Next.js framework
* Tailwind CSS for styling
* Context API for state management

## System Architecture

FabTrack utilizes a classic three-tier architecture:

* **Presentation Layer:** React frontend hosted on Vercel.
* **Application Logic Layer:** Node.js/Express backend hosted on Render.
* **Data Layer:** PostgreSQL database hosted on Railway.

## Project Structure

```
project/
├── backend/
│   ├── controllers/  # Express route handlers
│   ├── services/     # Business logic
│   ├── models/       # Sequelize models
│   ├── routes/       # API route definitions
│   ├── middleware/   # JWT and other middlewares
│   └── tests/        # Unit and integration tests
└── frontend/
    ├── components/   # Reusable UI components
    ├── app/          # Application pages and layouts
    ├── context/      # Global state (auth)
    ├── hooks/        # Custom React hooks
    └── public/       # Static assets
```

## Installation and Setup

### Prerequisites

* Node.js (v18.x or higher)
* PostgreSQL
* Git

### Backend Setup

1. Clone repository

```bash
git clone [https://github.com/DAN6256/Software-Engineering-Final-Project-20]
cd Software-Engineering-Final-Project-20/backend
npm install
```

2. Setup PostgreSQL database

```sql
CREATE DATABASE fabtrack_dev;
```

3. Configure environment variables

```env
DB_NAME=name of database
DB_USER=root
DB_PASSWORD= database password
DB_HOST=Data base host
DB_PORT=port number
EMAIL=email for the project
JWT_SECRET= strong secrete
DB_SSL=true
DB_URL =full database url
NODE_ENV=test

EMAIL_NOT_USED=some@email
EMAIL_PASSWORD_NOT_USED= example password
```

4. Run backend

```bash
node index.js
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

Configure API endpoint in `.env`

```env
NEXT_PUBLIC_BASE_URL_API=http://localhost:3000/
```

Start the frontend application

```bash
npm run dev
```

## API Documentation

Interactive API documentation is available via Swagger UI:
[FabTrack API Documentation](https://backendservice-9fbf.onrender.com/api-docs/)

## Deployment

* Backend hosted on [Render](https://render.com/)
* Database hosted on [Railway](https://railway.app/)
* Frontend hosted on [Vercel](https://vercel.com/)

Live demo:
[FabTrack Live Application](https://fab-track-wtcn.vercel.app/)

## Testing

Automated tests run with Jest and Supertest in backend folder.

```bash
npm test
```

## Challenges and Solutions

* Authentication and CORS resolved via localStorage JWT tokens and correct middleware configuration.
* React state managed effectively through Context API.
* Git branching strategy (Git Flow) reduced merge conflicts.
* Real-time data synchronization and timezone handling addressed through frontend date conversions.

## Development Methodology

FabTrack was developed using Agile Scrum with:

* Sprint planning and reviews
* Regular stand-ups and retrospectives
* GitHub pull requests and peer code reviews

## Team

* Ewura Ama Etruwaa Sam
* Daniel Tunyinko
* Dave Leori Donbo
* Chika Perpetual Amanna

## Future Enhancements

* Advanced reporting and analytics
* Mobile application support
* RFID/barcode integration
* Enhanced security features (2FA, audit trails)

## Resources

* [Figma UI Design](https://www.figma.com/design/3heVxmCywUbxT4U9jNxmKv/SWE_Final_Project?node-id=1-2&t=uMETlVLvj0RRqTMI-1)

## License

[MIT License](LICENSE)

---

This documentation captures the detailed implementation, deployment, and future scope of FabTrack, highlighting its effectiveness as an equipment management solution.
