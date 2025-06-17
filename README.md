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

## License


