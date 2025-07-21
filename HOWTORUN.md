# How to Run the Project


## Prerequisites

- **Node.js**: Version 22.14.0 or higher (but less than 23)
  - Check your version: `node --version`
- **npm**: Comes with Node.js installation
- **Git**: For cloning the repository

## Installation & Setup

### 1. Install Backend Dependencies

Navigate to the `src` directory and install dependencies:

```bash
cd src
npm install
```

### 2. Install Frontend Dependencies

Navigate to the Angular app directory and install dependencies:

```bash
cd client/colors
npm install
```

## Running the Application

The application consists of three separate services that need to be running simultaneously. Open **three terminal windows/tabs** for the best experience.

### Terminal 1: Start the Queue Service

```bash
cd src
npx ts-node server-qs.ts
```

This starts the Queue Service that manages message queuing.

### Terminal 2: Start the API Server

```bash
cd src
npx ts-node server.ts
```

This starts the API server that acts as a middleware between the Angular app and the Queue Service.

### Terminal 3: Start the Angular Application

```bash
cd src/client/colors
npm start
```

This starts the Angular development server. The application will typically be available at `http://localhost:4200`.

## Verification

1. **Queue Service**: Should be running and ready to handle queue operations
2. **API Server**: Should be running and able to communicate with the Queue Service
3. **Angular App**: Should load in your browser and be able to interact with the API