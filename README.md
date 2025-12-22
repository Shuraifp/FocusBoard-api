# Task Management API

A robust RESTful API for a Task Management application built with Node.js, Express, and MongoDB.

## Features

*   **User Authentication**: Register, Login, and Get Current User (JWT-based).
*   **Category Management**: Create, Read, and Delete categories.
*   **Task Management**: Create, Read (with filters, pagination, search), Update, and Delete tasks.
*   **Security**: Helmet headers, CORS, Password Hashing.
*   **Validation**: Robust input validation (Manual checks for speed).
*   **Automated Logic**:
    *   Auto-updates `taskCount` in categories.
    *   Sets `completedAt` timestamp automatically.

## Tech Stack

*   Node.js & Express
*   MongoDB & Mongoose
*   TypeScript
*   JWT & Bcrypt

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Create a `.env` file based on the example below:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/task-manager
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    NODE_ENV=development
    ```
4.  Run the server:
    ```bash
    pnpm dev
    ```

## API Endpoints

### Auth
*   `POST /api/auth/register` - Register user
*   `POST /api/auth/login` - Login user
*   `GET /api/auth/me` - Get current user (Protected)

### Categories
*   `GET /api/categories` - Get user categories
*   `POST /api/categories` - Create category
*   `DELETE /api/categories/:id` - Delete category

### Tasks
*   `GET /api/tasks` - Get tasks (Filters: status, priority, category, search, dueDate)
*   `POST /api/tasks` - Create task
*   `GET /api/tasks/:id` - Get single task
*   `PUT /api/tasks/:id` - Update task
*   `DELETE /api/tasks/:id` - Delete task
*   `PUT /api/tasks/:id/status` - Update task status
*   `PUT /api/tasks/:id/priority` - Update task priority
