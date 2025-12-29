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
