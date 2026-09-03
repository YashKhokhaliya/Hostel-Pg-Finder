# Hostel-PG-Finder

A full-stack accommodation platform designed to help students discover, compare, and manage hostel and PG accommodations across multiple cities.

## 🚀 Overview

Hostel-PG-Finder provides a centralized platform for students to find suitable accommodations while giving administrators tools to manage listings and verify uploaded documents.

The backend is built with a modular Node.js and Express.js architecture, with MongoDB for persistent data, Redis for temporary data and caching, BullMQ for asynchronous job processing, and Cloudinary for cloud-based file storage.

## ✨ Key Features

* **Authentication & Authorization**

  * JWT-based authentication
  * Cookie-based token management
  * Role-based access for users and administrators
  * OTP-based email verification

* **Hostel & PG Management**

  * Create, update, and manage accommodation listings
  * Search and filter accommodations by location
  * Manage hostel/PG information and availability

* **Document Verification**

  * Secure document uploads
  * Cloudinary-based document storage
  * Admin verification workflow
  * Document status tracking: `Pending`, `Accepted`, `Rejected`
  * Rejection reason tracking

* **Area-Based Administration**

  * Dedicated administrative management for supported areas
  * Ahmedabad
  * Vadodara
  * Surat
  * Rajkot

* **Asynchronous Processing**

  * BullMQ-based background job processing
  * Redis-backed job queues
  * Asynchronous email processing

* **OTP Management**

  * Redis-based OTP storage
  * OTP expiration
  * Attempt limiting
  * Request rate limiting

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │     Client       │
                    └────────┬─────────┘
                             │
                             │ HTTP / REST API
                             ▼
                    ┌──────────────────┐
                    │  Express Server  │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
       ┌──────────┐    ┌──────────┐    ┌────────────┐
       │ MongoDB  │    │  Redis   │    │ Cloudinary │
       │          │    │          │    │            │
       │ Persistent│   │ OTP/Queue│    │ Documents  │
       │   Data   │    │  /Cache  │    │   /Media   │
       └──────────┘    └────┬─────┘    └────────────┘
                             │
                             ▼
                       ┌──────────┐
                       │ BullMQ   │
                       │ Workers  │
                       └────┬─────┘
                            │
                            ▼
                       Email Jobs
```

## 🛠️ Tech Stack

| Category                 | Technologies      |
| ------------------------ | ----------------- |
| Runtime                  | Node.js           |
| Backend                  | Express.js        |
| Database                 | MongoDB, Mongoose |
| Caching / Temporary Data | Redis             |
| Job Queue                | BullMQ            |
| Authentication           | JWT, Cookies      |
| File Storage             | Cloudinary        |
| Email                    | Nodemailer        |
| API Testing              | Postman           |
| Version Control          | Git, GitHub       |

## 📁 Project Structure

```text
Hostel-Pg-Finder/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── index.js
│
├── frontend/
│
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

* Node.js
* MongoDB
* Redis
* Cloudinary account

### Installation

```bash
git clone https://github.com/YashKhokhaliya/Hostel-Pg-Finder.git

cd Hostel-Pg-Finder
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` and configure the required environment variables.

Start the development server:

```bash
npm run dev
```

## 🔐 Environment Variables

```env
PORT=
MONGODB_URI=

REDIS_URL=

JWT_SECRET=
JWT_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAIL_USER=
MAIL_PASSWORD=
```

Never commit actual credentials or secrets to the repository.

## 🔌 API

The backend exposes RESTful APIs for:

* Authentication
* User management
* Hostel/PG listings
* Search and filtering
* Document uploads
* Document verification
* Administrative operations
* OTP verification

API endpoints can be tested using Postman.

## 🔭 Engineering Highlights

* Designed RESTful backend APIs using Express.js.
* Used MongoDB with Mongoose for structured data modeling and querying.
* Implemented JWT-based authentication with cookie-based token handling.
* Used Redis for short-lived OTP data, attempt tracking, and request limiting.
* Implemented asynchronous processing using BullMQ and Redis-backed workers.
* Integrated Cloudinary for scalable cloud-based document/media storage.
* Implemented an admin-driven document verification workflow.
* Added database indexing and aggregation-based querying where required for efficient data access.

## 📌 Future Improvements

* Add accommodation recommendation based on user preferences.
* Introduce advanced search and ranking.
* Add automated notifications for important listing and verification events.
* Containerize the application for easier deployment.
* Add automated testing and CI/CD pipelines.

## 👨‍💻 Author

**Yash Khokhaliya**

GitHub: [YashKhokhaliya](https://github.com/YashKhokhaliya)

