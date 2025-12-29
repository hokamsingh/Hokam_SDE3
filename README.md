# Conversation Service

A robust, enterprise-grade NestJS backend for managing voice AI conversation sessions and events. Designed for high availability, observability, and scalability.

## Features

### Core Logic
-   **Session Lifecycle**: Comprehensive management of initiated, active, and completed sessions.
-   **Event Tracking**: Optimized logging of voice events (User Speech, Bot Speech, System) with metadata support.
-   **Idempotency**: Application and database-level handling to prevent duplicate session or event entries.
-   **Standardized API**: Consistent response envelopes and machine-readable error codes.

### Infrastructure & Scaling
-   **3-Node MongoDB Replica Set**: Full cluster setup in Docker for high availability.
-   **Read/Write Splitting**: Database traffic routing (Reads to secondaries, Writes to primary) for maximum throughput.
-   **Hybrid Caching Strategy**: Redis read-through caching for stable metadata to reduce DB load.

### Resilience & Security
-   **Circuit Breaker (Opossum)**: Protects the system from cascading failures during Redis outages.
-   **Distributed Rate Limiting**: Global API protection using Redis-backed throttler.
-   **Production Security**: Integrated Helmet, CORS, and Payload compression.

### Observability & Tracing
-   **Correlation IDs**: End-to-end request tracing via `X-Request-Id` headers and JSON logs.
-   **Structured Logging**: Production-ready logging using `nestjs-pino`.
-   **Advanced Health Monitoring**: Detailed endpoint checking for Mongo, Redis, and memory usage.

## Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/)
-   **Database**: MongoDB (v7 Replica Set)
-   **Caching**: Redis (v7 Alpine)
-   **Observability**: Pino & Terminus
-   **Testing**: Jest & Supertest

## Future Goals

1.  **Event-Driven Processing**: Move from direct database writes to a message-bus architecture (Kafka/RabbitMQ) for ingestion.
2.  **Database Sharding**: Implement shard keys based on `sessionId` to support TB-scale event data.
3.  **Real-Time Monitoring**: Integration with Prometheus and Grafana for latency and throughput dashboards.
4.  **Advanced Auth**: Full OIDC integration for fine-grained multi-tenant access control.
5.  **Analytics Service**: Separate read-model for aggregate conversation insights (CQRS).

## Setup & Running

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd conversation-service
    ```

2.  **Start Infrastructure (Replica Set MongoDB & Redis)**
    ```bash
    docker-compose up -d
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Configure Environment**
    ```bash
    cp .env.example .env
    ```

5.  **Run Development Server**
    ```bash
    npm run start:dev
    ```

## Testing

The project maintains a high-quality gate with automated hooks:

-   **Unit Tests**: `npm run test`
-   **E2E Smoke Tests**: `npm run test:e2e`
-   **Linting**: `npm run lint`

*Note: Husky pre-commit hooks ensure all tests and linting pass before any commit.*

## API Documentation

Interactive documentation is available at:
-   **Swagger UI**: `http://localhost:3000/api`
-   **OpenAPI Spec**: `http://localhost:3000/api-json`

## Usage Examples

### 1. Create a Session
```bash
curl -X 'POST' \
  'http://localhost:3000/v1/sessions' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "sessionId": "sess_123",
  "language": "en-US",
  "metadata": {
    "userId": "user_456"
  }
}'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6952e12e41b0bba87d9fb505",
    "sessionId": "sess_123",
    "__v": 0,
    "createdAt": "2025-12-29T20:14:38.487Z",
    "endedAt": null,
    "language": "en-US",
    "metadata": {
      "userId": "user_456"
    },
    "startedAt": "2025-12-29T20:14:38.483Z",
    "status": "initiated",
    "updatedAt": "2025-12-29T20:15:09.316Z"
  },
  "statusCode": 201,
  "timestamp": "2025-12-29T20:15:09.328Z"
}
```

### 2. Add an Event to a Session
```bash
curl -X 'POST' \
  'http://localhost:3000/v1/sessions/sess_123/events' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "eventId": "evt_123",
  "type": "user_speech",
  "payload": {
    "transcript": "hello"
  },
  "timestamp": "2025-12-25T10:00:00Z"
}'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "evt_123",
    "sessionId": "sess_123",
    "type": "user_speech",
    "payload": {
      "transcript": "hello"
    },
    "timestamp": "2025-12-25T10:00:00.000Z",
    "_id": "6952e1b4dad31676d156ddad",
    "__v": 0
  },
  "statusCode": 201,
  "timestamp": "2025-12-29T20:16:52.018Z"
}
```

### 3. Get Session Data (with Pagination)
```bash
curl -X 'GET' \
  'http://localhost:3000/v1/sessions/sess_123?offset=0&limit=50' \
  -H 'accept: */*'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6952e12e41b0bba87d9fb505",
    "sessionId": "sess_123",
    "__v": 0,
    "createdAt": "2025-12-29T20:14:38.487Z",
    "endedAt": null,
    "language": "en-US",
    "metadata": {
      "userId": "user_456"
    },
    "startedAt": "2025-12-29T20:14:38.483Z",
    "status": "initiated",
    "updatedAt": "2025-12-29T20:15:09.316Z",
    "events": [
      {
        "_id": "6952e191dad31676d156ddab",
        "eventId": "evt_123",
        "sessionId": "sess_123",
        "type": "user_speech",
        "payload": {
          "transcript": "hello"
        },
        "timestamp": "2025-12-25T10:00:00.000Z",
        "__v": 0
      },
      {
        "_id": "6952e1b4dad31676d156ddad",
        "eventId": "evt_123",
        "sessionId": "sess_123",
        "type": "user_speech",
        "payload": {
          "transcript": "hello"
        },
        "timestamp": "2025-12-25T10:00:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  },
  "statusCode": 200,
  "timestamp": "2025-12-29T20:17:57.044Z"
}
```

### 4. Complete a Session
```bash
curl -X 'POST' \
  'http://localhost:3000/v1/sessions/sess_123/complete' \
  -H 'accept: */*' \
  -d ''
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6952e12e41b0bba87d9fb505",
    "sessionId": "sess_123",
    "__v": 0,
    "createdAt": "2025-12-29T20:14:38.487Z",
    "endedAt": "2025-12-29T20:18:22.902Z",
    "language": "en-US",
    "metadata": {
      "userId": "user_456"
    },
    "startedAt": "2025-12-29T20:14:38.483Z",
    "status": "completed",
    "updatedAt": "2025-12-29T20:18:22.902Z"
  },
  "statusCode": 200,
  "timestamp": "2025-12-29T20:18:22.909Z"
}
```
