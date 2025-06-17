# Task Manager API

A simple NestJS-based API for managing tasks.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (optional, for containerization)

### Installation
```bash
npm install
```

### Setting the Environment
- Create a .env file at the root of the application
```
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://user:pass@host.docker.internal:5432/mydb
DB_MODE=<db|json>
```
-DB_MODE=json will simulate the app using json files.

### Running the Application
- Development:
  ```bash
  npm run start:dev
  ```
- Production:
  ```bash
  npm run build
  npm run start:prod
  ```

### Running Tests
- Unit tests:
  ```bash
  npm run test
  ```
- End-to-end tests:
  ```bash
  npm run test:e2e
  ```
- Test coverage:
  ```bash
  npm run test:cov
  ```

## Docker Usage

if you are using Docker Desktop with Windows containers enabled switch Docker to use Linux containers

- Right-click the Docker icon in your system tray.
- Select "Switch to Linux containers..."

1. **Build the Docker image:**
   ```bash
   docker build -t task-manager-api .
   ```
2. **Run the container:**
   ```bash
   docker run -p 3000:3000 task-manager-api
   ```

The API will be available at `http://localhost:3000`.

## Note::

 -  Token does not expire
 -  For every login request a new token is issued, but it is not being kept in DB.
 - While running in docker, your db needs to be accessible from the container environment


