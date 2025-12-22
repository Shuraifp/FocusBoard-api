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
*   Redis (Token Blacklisting)
*   Docker & Docker Compose

## Setup

### Option 1: Local Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Create a `.env` file based on the example below:
    ```env
    JWT_SECRET=your_jwt_secret
    ```
4.  **Start MongoDB** (locally or use Atlas)
5.  **Start Redis** (locally):
    ```bash
    redis-server
    ```
6.  Run the server:
    ```bash
    pnpm dev
    ```

### Option 2: Docker (Production)

1.  Create a `.env` file with your `JWT_SECRET`
2.  Run with Docker Compose:
    ```bash
    docker-compose up --build
    ```
3.  The API will be available at `http://localhost:5000`

### Option 3: Docker (Development with Hot-Reload)

1.  Create a `.env` file with your `JWT_SECRET`
2.  Run with development Docker Compose:
    ```bash
    docker-compose -f docker-compose.dev.yml up
    ```
3.  Edit code in `src/` - changes will auto-reload!
4.  The API will be available at `http://localhost:5000`

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
