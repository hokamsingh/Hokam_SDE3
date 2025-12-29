# Conversation Service

A robust, scalable NestJS backend for managing voice AI conversation sessions and events.

## Features

-   **Session Management**: Create and track conversation lifecycles.
-   **Event Tracking**: Log proprietary events with payloads (User Speech, Bot Speech, System).
-   **Idempotency**: Robust handling of duplicate sessions and events.
-   **Pagination**: Efficient retrieval of session history.
-   **Health Monitoring**: Real-time checks for MongoDB and Redis dependencies.
-   **Security**: Helmet, CORS, and Input Validation enabled.

## Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/)
-   **Database**: MongoDB (via Mongoose)
-   **Caching**: Redis
-   **Validation**: Joi & class-validator
-   **Language**: TypeScript

## Assumptions

1.  **Trust Boundary**: The API is internal-facing or behind an API Gateway/WAF. Rate limiting and auth are handled at that layer.
2.  **Session Uniqueness**: `sessionId` is globally unique and provided by the client (or an upstream service).
3.  **Event Order**: While we track timestamps, precise ordering of concurrent events sent via partial speech packets is best-effort unless sequenced by the client.
4.  **Data Retention**: Voice event data is high-volume; we assume an archival strategy (offloading to S3) is acceptable for long-term retention.

## Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose

## Setup & Running

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd conversation-service
    ```

2.  **Start Infrastructure (MongoDB & Redis)**
    ```bash
    docker-compose up -d
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Configure Environment**
    Copy the example env file:
    ```bash
    cp .env.example .env
    ```

5.  **Run Development Server**
    ```bash
    npm run start:dev
    ```

The server will start on `http://localhost:3000`.

## API Documentation

### Sessions

-   **Create Session**: `POST /sessions`
-   **Get Session**: `GET /sessions/:sessionId?limit=50&offset=0`
-   **Complete Session**: `POST /sessions/:sessionId/complete`

### Events

-   **Add Event**: `POST /sessions/:sessionId/events`

### Monitoring

-   **Health Check**: `GET /health`

## Testing

To run the test suite (once implemented):

```bash
npm run test
```
