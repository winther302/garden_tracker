# Garden Tracker Application

This project is a simple garden tracker application with a React (TypeScript) frontend and a Node.js (TypeScript) backend using Prisma ORM and MySQL.

## Getting Started

Follow these steps to set up and run the application locally.

### Prerequisites

Ensure you have the following installed on your machine:

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://docs.npmjs.com/cli/v8/commands/npm) (comes with Node.js)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Engine and Docker Compose)

### 1. Backend Setup

The backend is a Node.js application that uses Prisma to interact with a MySQL database. The database will be run using Docker Compose.

#### 1.1. Database Setup (Docker Compose)

1.  Open your terminal in the **root directory** of the project (`/Users/rasmuswinther/Documents/garden_tracker/`).
2.  Start the MySQL database container:
    ```bash
    docker compose up -d db
    ```
3.  Verify the database container is running and healthy:
    ```bash
    docker compose ps db
    ```
    You should see `(healthy)` in the `STATUS` column.

#### 1.2. Prisma Migrations

1.  Navigate into the `server` directory:
    ```bash
    cd server
    ```
2.  Run Prisma migrations to create the database schema. This command will create the necessary tables in your MySQL database.
    ```bash
    npx prisma migrate dev --name init
    ```
    *Note: If you encounter permission errors related to the shadow database, temporarily change the `DATABASE_URL` in `server/.env` to use `root:root_password` for the `user:password` part, run the migration, and then change it back to `user:password`.*

#### 1.3. Start the Backend Server

1.  While still in the `server` directory, start the backend server:
    ```bash
    npm start
    ```
    The server should start on `http://localhost:3001`.

### 2. Frontend Setup

The frontend is a React application.

1.  Open a **new terminal window** and navigate to the **root directory** of the project (`/Users/rasmuswinther/Documents/garden_tracker/`).
2.  Install the frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm start
    ```
    The frontend application should open in your browser, usually at `http://localhost:3000`.

## Important Notes

*   **Database Credentials:** The `server/.env` file contains the database connection string. For local development, it's configured to use the credentials defined in `docker-compose.yml` (`user:password`).
*   **Docker Compose `version` warning:** You might see a warning about the `version` attribute being obsolete in `docker-compose.yml`. This is harmless and can be ignored for now.