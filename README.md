# **be-node-portfolio**

<p align="center">
  <img src="./assets/logo.png" alt="logo" 
  style="height: 350px; object-fit: contain;">
</p>

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.18.0-green)
![Yarn](https://img.shields.io/badge/yarn-%3E%3D4.5.1-green)

A TypeScript-powered Node.js backend application designed for managing and exposing portfolio-related APIs. This repository follows modern development practices and ensures scalability, maintainability, and security.

<p align="center">
   <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
      <img src="./assets/preview.png" alt="Preview Desktop Light" style="height: 150px; object-fit: contain;">
   </div>
</p>

## **Table of Contents**

- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Key Dependencies](#key-dependencies)
- [Testing](#testing)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

## **Introduction**

**be-node-portfolio** is a backend application that serves API endpoints for managing GitHub repositories and monitoring application health. It leverages TypeScript, modern libraries, and frameworks to ensure a robust development environment and API design.

## **Features**

- ✅ Secure API endpoints with middleware like Helmet and CORS.
- ✅ Automatic API documentation generation using Swagger/OpenAPI.
- ✅ GitHub integration for repository data.
- ✅ Robust logging with Winston and Morgan.
- ✅ Easy environment configuration with dotenv.
- ✅ Type-safe DTOs and validation using class-validator.

## **Requirements**

Ensure the following are installed on your system:

- **Node.js**: `>= 20.18.0`
- **Yarn**: `>= 4.5.1`

## **Installation**

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/5h1ngy/be-node-portfolio.git
   cd be-node-portfolio
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file (or `.env.development` for development mode) with the necessary environment variables:
   ```env
   NODE_ENV=development
   SERVER_PORT=3000
   GITHUB_BEARER=your_github_token
   GITHUB_USER=your_github_username
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

For a production build:
```bash
yarn build
yarn start
```

## **Usage**

### Core Endpoints:

- **GET /api/github/repos**: Fetches a list of repositories from the configured GitHub user.
- **GET /health/**: Verifies the health and status of the application.

Swagger documentation is available at `http://localhost:[PORT]/docs` after starting the server.

## **Project Structure**

```plaintext
src/
├── assets/          # Static assets (images, icons, etc.)
├── config/          # Configuration and environment setup
├── controllers/     # API controllers
├── dtos/            # Data Transfer Objects for validation and transformation
├── middleware/      # Custom middleware
├── services/        # Business logic and API integration
├── shared/          # Shared utilities (e.g., logging)
├── index.ts         # Application entry point
└── main.ts          # Application bootstrap file
```

## **Key Dependencies**

- **Express**: Fast, unopinionated, and minimalist web framework.
- **Routing-Controllers**: Declarative routing and controller support.
- **Swagger-UI-Express**: Automatically generated API documentation.
- **TypeDI**: Dependency injection for TypeScript.
- **Sequelize**: ORM for database management.
- **Winston**: Comprehensive logging solution.

For a full list of dependencies, see the [package.json](./package.json).

## **Testing**

Testing framework configuration is not included in this version. Future updates may add integration and unit tests using Jest or similar tools.

## **License**

This project is licensed under the [MIT License](./LICENSE).

## **Contributing**

Contributions are welcome! Please fork the repository and create a pull request with a detailed description of your changes.

## **Contact**

- **Repository**: [https://github.com/5h1ngy/be-node-portfolio](https://github.com/5h1ngy/be-node-portfolio)  
- **Author**: 5h1ngy

