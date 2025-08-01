# 💼 Digital Wallet API

## 🎯 Project Overview

The **Digital Wallet API** is a secure, modular, and role-based backend system built using **Express.js** and **Mongoose** to facilitate digital financial transactions similar to **Bkash** or **Nagad**. The API supports user registration, wallet management, and core financial operations such as **topping up**, **withdrawing**, **sending money**, **cash-in**, **cash-out**, and **transaction history** retrieval. It incorporates **JWT-based authentication**, **role-based authorization**, **secure password hashing**, and **transaction tracking** with a notification system.

---

## ✨ Key Features

- **Authentication**
  - JWT-based login
  - Google OAuth login
  - Password hashing with `bcrypt`

- **Role-Based Authorization**
  - Supports `ADMIN`, `USER`, and `AGENT` roles
  - Role-specific access to endpoints

- **Wallet Management**
  - Automatic wallet creation during registration
  - Initial balance of ৳50

- **Transaction Management**
  - Types: `TOP_UP`, `WITHDRAW`, `SEND_MONEY`, `CASH_IN`, `CASH_OUT`
  - Handles transaction fees and agent commissions

- **Notification System**
  - Console-based alerts
  - Webhook-ready event stubs

- **Admin Controls**
  - View all users
  - Block/Unblock wallets
  - Approve/Suspend agents
  - Modify system parameters

- **Validation & Business Rules**
  - Enforces transaction limits
  - Insufficient balance checks
  - Blocked wallet restrictions

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT, bcrypt, Passport.js (Local + Google OAuth)
- **Validation:** Zod
- **Environment Config:** dotenv
- **Error Handling:** Centralized custom middleware

---

## 📦 Setup and Environment Instructions

### ✅ Prerequisites

- Node.js `v16+`
- MongoDB (local or cloud e.g., MongoDB Atlas)
- Git (for cloning)
- Postman (for API testing)

### 🔧 Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd digital-wallet-api

2. **Install Dependencies:**

   ```bash
   npm install
3. **Set Up Environment Variables:
Create a `.env` file in the project root and add the following variables:**

   ```bash
   PORT=5000
   DB_URL=<your-mongodb-connection-string>
   NODE_ENV=development
   BCRYPT_SALT_ROUND=12
   JWT_ACCESS_SECRET=<your-jwt-access-secret>
   JWT_ACCESS_EXPIRES=1h
   JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
   JWT_REFRESH_EXPIRES=7d
   ADMIN_EMAIL=<admin-email>
   ADMIN_PASSWORD=<admin-password>
   GOOGLE_CLIENT_ID=<google-oauth-client-id>
   GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
   EXPRESS_SESSION_SECRET=<session-secret>
   FRONTEND_URL=<frontend-url>
   TRANSACTION_FEE_PERCENTAGE=1
   AGENT_COMMISSION_PERCENTAGE=0.5
   DAILY_USER_LIMIT=10000
   MONTHLY_USER_LIMIT=50000
   DAILY_AGENT_LIMIT=50000
   MONTHLY_AGENT_LIMIT=200000
   ```

4. **Run the Application:**

   ```bash
   npm run dev
   ````

    The server will start on `http://localhost:5000`. A default admin user will be seeded automatically using the ADMIN_EMAIL and ADMIN_PASSWORD from the `.env` file.

5. **Test the API:**Use Postman to test the API endpoints. Import the provided Postman collection (if available) or follow the endpoint documentation below.

---

## 🚀 API Endpoints

The API is organized into modules: **User**, **Auth**, **Admin**, **Transaction**, and **Notification**.  
All endpoints are prefixed with: `/api/v1/`

---

### 👤 User Endpoints

| Method | Endpoint           | Description                            | Role Access       | Notes                                                                 |
|--------|--------------------|----------------------------------------|-------------------|-----------------------------------------------------------------------|
| POST   | /user/register     | Register a new user or agent           | Public            | Creates a wallet with ৳50 initial balance. Agents get `PENDING` status. |
| GET    | /user/all-users    | Retrieve all users                     | ADMIN             | Returns non-deleted users with pagination metadata.                  |
| PATCH  | /user/:id          | Update user details                    | USER, AGENT, ADMIN | Admins can update role, status; others can update name, password, etc. |

---

### 🔐 Auth Endpoints

| Method | Endpoint                | Description                      | Role Access         | Notes                                                             |
|--------|-------------------------|----------------------------------|---------------------|-------------------------------------------------------------------|
| POST   | /auth/login             | Login with email and password    | Public              | Returns access and refresh tokens. Sets cookies.                 |
| POST   | /auth/refresh-token     | Generate new access token        | Public              | Requires refresh token in cookies.                               |
| POST   | /auth/logout            | Logout and clear cookies         | Public              | Clears access and refresh tokens.                                |
| POST   | /auth/reset-password    | Reset user password              | USER, AGENT, ADMIN  | Requires old and new passwords.                                  |
| GET    | /auth/google            | Initiate Google OAuth login      | Public              | Redirects to Google for authentication.                          |
| GET    | /auth/google/callback   | Google OAuth callback            | Public              | Redirects to frontend with tokens.                               |

---

### 🛠️ Admin Endpoints

| Method | Endpoint                          | Description                           | Role Access | Notes                                                             |
|--------|-----------------------------------|---------------------------------------|-------------|-------------------------------------------------------------------|
| PATCH  | /admin/wallets/block/:id          | Block a user's wallet                 | ADMIN       | Prevents wallet from performing transactions.                    |
| PATCH  | /admin/wallets/unblock/:id        | Unblock a user's wallet               | ADMIN       | Restores wallet functionality.                                   |
| PATCH  | /admin/agents/approve/:id         | Approve an agent                      | ADMIN       | Sets agent status to `APPROVED`.                                 |
| PATCH  | /admin/agents/suspend/:id         | Suspend an agent                      | ADMIN       | Sets agent status to `SUSPENDED`.                                |
| GET    | /admin/agents/pending             | Retrieve pending agents               | ADMIN       | Returns agents with `PENDING` status.                            |
| PATCH  | /admin/system-parameters          | Update transaction fees/commissions   | ADMIN       | Updates `TRANSACTION_FEE_PERCENTAGE` and `AGENT_COMMISSION_PERCENTAGE`. |

---

### 💸 Transaction Endpoints

| Method | Endpoint                   | Description                        | Role Access       | Notes                                                                |
|--------|----------------------------|------------------------------------|-------------------|----------------------------------------------------------------------|
| POST   | /transaction/top-up        | Add money to own wallet            | USER, AGENT       | Triggers console and webhook notifications.                          |
| POST   | /transaction/withdraw      | Withdraw money from own wallet     | USER, AGENT       | Triggers console and webhook notifications.                          |
| POST   | /transaction/send-money    | Send money to another user         | USER              | Applies transaction fee. Triggers notifications.                     |
| POST   | /transaction/cash-in       | Agent adds money to user wallet    | AGENT (APPROVED)  | Applies commission. Triggers notifications.                          |
| POST   | /transaction/cash-out      | Agent withdraws money for user     | AGENT (APPROVED)  | Applies fee and commission. Triggers notifications.                  |
| GET    | /transaction/history       | View transaction history           | USER, AGENT, ADMIN | Admins see all transactions; others see their own.                  |

---

### 🔔 Notification Endpoints

| Method | Endpoint                 | Description                          | Role Access | Notes                                                             |
|--------|--------------------------|--------------------------------------|-------------|-------------------------------------------------------------------|
| POST   | /notification/webhook    | Webhook stub for transaction events  | Public      | Logs incoming transaction payloads for future integrations.       |

---

## Postman Test Cases

Below are the Postman test cases for the transaction-related endpoints, as specified in the requirements. These tests assume the server is running on `http://localhost:5000` and appropriate authentication tokens are available.

### 1. **Top-Up**
- **Endpoint**: `POST /api/v1/transaction/top-up`
- **Token**: Access token with `USER` or `AGENT` role.
- **Description**: User or agent adds money to their own wallet (e.g., from a bank or external source).
- **Postman Test**: 
    - **Method**:POST
    - **URL**: `http://localhost:5000/api/v1/transaction/top-up`
    - **Header**: `Authorization: Bearer <user_or_agent_access_token>`
    - **Body**: `Authorization: Bearer <user_or_agent_access_token>`
       ```json
       {
         "amount": 100
       } 
### 2. **Withdraw**
- **Endpoint**: `POST /api/v1/transaction/withdraw`
- **Token**: Access token with `USER` or `AGENT` role.
- **Description**: User or agent withdraws money from their own wallet (e.g., to a bank or external source).
- **Postman Test**: 
    - **Method**:POST
    - **URL**: `http://localhost:5000/api/v1/transaction/withdraw`
    - **Header**: `Authorization: Bearer <user_or_agent_access_token>`
    - **Body**: `Authorization: Bearer <user_or_agent_access_token>`
       ```json
       {
         "amount": 50
       } 
### 3. **Send Money**
- **Endpoint**: `POST /api/v1/transaction/send-money`
- **Token**: Access token with `USER` role.
- **Description**: User sends money from their wallet to another user's wallet.
- **Postman Test**: 
    - **Method**:POST
    - **URL**: `http://localhost:5000/api/v1/transaction/send-money`
    - **Header:**: `Authorization: Bearer <user_access_token>`
    - **Body**: 
       ```json
       {
         "receiverId": "<receiver_user_id>",
         "amount": 30
       } 
### 4. **Cash-In**
- **Endpoint**: `POST /api/v1/transaction/cash-in`
- **Token**: Access token with `AGENT` role (agent must be `APPROVED`).
- **Description**:Agent adds money to a user's wallet (user provides cash to agent).
- **Postman Test**: 
    - **Method**:POST
    - **URL**: `http://localhost:5000/api/v1/transaction/cash-in`
    - **Header**: `Authorization: Bearer <user_access_token>`
    - **Body**: 
       ```json
       {
         "userId": "<user_id>",
         "amount": 100
       } 
### 5. **Cash-Out**
- **Endpoint**: `POST /api/v1/transaction/cash-out`
- **Token**: Access token with `AGENT` role (agent must be `APPROVED`).
- **Description**:User withdraws money from their wallet via an agent (agent provides cash to user).
- **Postman Test**: 
    - **Method**:POST
    - **URL**: `http://localhost:5000/api/v1/transaction/cash-out`
    - **Header**: `Authorization: Bearer <agent_access_token>`
    - **Body**: 
       ```json
       {
         "userId": "<user_id>",
         "amount": 50
       } 
### 6. **Transaction History**
- **Endpoint**: `GET /api/v1/transaction/history`
- **Token**: Access token with `USER`, `AGENT`, or `ADMIN` role.
- **Description**:Read-only endpoint to retrieve transaction history related to the authenticated user. Admins can view all transactions.
- **Postman Test**: 
    - **Method**:GET
    - **URL**: `http://localhost:5000/api/v1/transaction/history`
    - **Header**: `Authorization: Bearer <user_or_agent_or_admin_access_token>`
    
 ---

# 📁 Project Structure

The project follows a **modular architecture** for scalability and maintainability:
```text
src/
├── App/
│ ├── config/ # Environment and configuration files
│ │ ├── env.ts # Loads environment variables
│ │ ├── passport.ts # Passport.js configuration for auth
│ │
│ ├── errorHelpers/ # Custom error handling
│ │ ├── AppError.ts # Custom error class
│ │
│ ├── helpers/ # Error handling helpers
│ │ ├── handleCastError.ts
│ │ ├── handleDuplicateError.ts
│ │ ├── handlerValidationError.ts
│ │ ├── handlerZodError.ts
│ │
│ ├── interfaces/ # TypeScript interfaces
│ │ ├── error.types.ts
│ │ ├── index.d.ts
│ │
│ ├── middlewares/ # Express middlewares
│ │ ├── checkAuth.ts # Role-based authorization
│ │ ├── globalErrorHandler.ts # Centralized error handling
│ │ ├── notFound.ts # 404 handler
│ │ ├── validateRequest.ts # Zod validation middleware
│ │
│ ├── modules/ # Feature modules
│ │ ├── admin/ # Admin-related logic
│ │ ├── auth/ # Authentication logic
│ │ ├── notification/ # Notification logic
│ │ ├── transaction/ # Transaction logic
│ │ ├── user/ # User logic
│ │
│ ├── routes/ # API routes
│ │ ├── index.ts # Main router
│ │
│ ├── utils/ # Utility functions
│ │ ├── catchAsync.ts # Async error handling
│ │ ├── jwt.ts # JWT utilities
│ │ ├── notify.ts # Notification utilities
│ │ ├── seedAdmin.ts # Admin seeding
│ │ ├── sendResponse.ts # Standardized response utility
│ │ ├── setCookie.ts # Cookie setting utility
│ │ ├── userTokens.ts # Token generation utilities
│
├── app.ts # Express app setup
├── server.ts # Server entry point
```

---

# 🧠 Design Decisions

## 🏦 Wallet Creation & Management

- **Creation**: Wallets are automatically created during user/agent registration with an initial balance of ৳50.  
- **Blocking**: Only admins can block/unblock wallets. Blocked wallets cannot perform any transactions.  
- **Validation**: Ensures non-negative balances and prevents operations on blocked wallets.

## 🔁 Transaction Management

- **Fields**: Transactions include sender, receiver (optional), agent (optional), amount, fee, commission, type, status, and timestamps.  
- **Status**: Transactions are marked as `PENDING` during creation and `COMPLETED` upon success. Reversal is not implemented but can be added.  
- **Atomicity**: Wallet updates and transaction creation are sequential to ensure consistency, with validation checks before updates.

## 👥 Role Representation

- **Single Model**: Uses a single `User` model with a `role` field (`ADMIN`, `USER`, `AGENT`).  
- **Agent-Specific**: Agents have an `agentApprovalStatus` field (`PENDING`, `APPROVED`, `SUSPENDED`), managed by admins.  
- **Admin Privileges**: Admins have full access to view and manage users, wallets, and transactions.

## 🫆 Validations & Business Rules

- **Validations**: Enforces checks for insufficient balance, negative amounts, non-existent users, blocked wallets, and unapproved agents.  
- **Transaction Limits**:  
  - **Users**: ৳10,000 daily, ৳50,000 monthly.  
  - **Agents**: ৳50,000 daily, ৳200,000 monthly.  
- **Blocked Wallets**: Cannot send, withdraw, or receive money (except for admin actions).  
- **Minimum Balance**: No minimum balance enforced, but transactions must cover fees where applicable.

## 📜 Access & Visibility

- **Transaction History**: Users/agents see their own transactions; admins see all transactions. Sorted by creation date (newest first).  
- **Wallet Access**: Users/agents can only view their own wallet balance. Admins can view all wallets via `/user/all-users`.  
- **No Pagination**: Transaction history is not paginated but can be extended.

## 🔐 Role-Based Control

- **Admin-Only**: `/admin/*` endpoints and `/user/all-users`.  
- **User-Only**: `/transaction/send-money`.  
- **Agent-Only**: `/transaction/cash-in`, `/transaction/cash-out` (requires `APPROVED` status).  
- **Shared**: `/transaction/top-up`, `/transaction/withdraw`, `/transaction/history`.  
- **Authorization**: Enforced via `checkAuth` middleware validating JWT and role.

## 🧩 API Design

- **RESTful**: Follows REST conventions (e.g., `POST /transaction/top-up`, `PATCH /admin/wallets/block/:id`).  
- **Error Handling**: Standardized error responses with status codes, messages, and error sources (for validation errors).  
- **Success Responses**: Include `success`, `statusCode`, `message`, `data`, and optional `meta`.

## 🧠 Optional Features

- **Transaction Fees**: 1% for `SEND_MONEY` and `CASH_OUT`.  
- **Agent Commissions**: 0.5% for `CASH_IN` and `CASH_OUT`.  
- **Transaction Limits**: Daily and monthly limits enforced for users and agents.  
- **Notification System**: Console notifications and webhook stub for all transactions.

## 🧪 Testing Coverage

- **Authentication**: Tested login, logout, refresh token, Google OAuth, and password reset.  
- **Authorization**: Role-based access verified for all endpoints.  
- **Wallet Management**: Tested automatic wallet creation, balance updates, and block/unblock functionality.  
- **Transaction Logic**: Tested all transaction types with success and failure cases (e.g., insufficient balance, blocked wallet, limits).  
- **Error Handling**: Tested validation errors, duplicate errors, invalid ObjectIDs, and unauthorized access.  
- **Notifications**: Verified console notifications and webhook payloads for all transactions.

---

## 📄 Notes

- **Transaction Fees**: Applied to `SEND_MONEY` (1%) and `CASH_OUT` (1%) transactions.
- **Agent Commissions**: Applied to `CASH_IN` (0.5%) and `CASH_OUT` (0.5%) transactions.
- **Transaction Limits**:  
  - **Users**: ৳10,000 daily, ৳50,000 monthly  
  - **Agents**: ৳50,000 daily, ৳200,000 monthly
- **Notification System**: Each transaction triggers a console notification with details including:
  - Type, Amount, Fee, Commission, Sender, Receiver, Agent, Status, Timestamp
  - A webhook payload is also generated (stubbed for now).
- **Error Handling**: Comprehensive handling implemented for:
  - Validation errors
  - Duplicate entries
  - Invalid ObjectIDs
  - Unauthorized access

### 🚧 Future Improvements

- Implement real webhook integrations  
- Add pagination and filtering for transaction history  
- Introduce transaction reversal functionality  
- Enhance security with rate limiting and two-factor authentication  
