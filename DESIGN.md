# Design Decisions & Architecture

## 1. How did you ensure idempotency?
I implemented idempotency at the database level to ensure data consistency without complex application state checks.
-   **Sessions**: I used MongoDB's `findOneAndUpdate` with `{ upsert: true }`. This ensures that a "Create Session" call for an existing ID simply updates the timestamp or returns the existing record without creating a duplicate.
-   **Events**: I defined a compound unique index on `{ sessionId: 1, eventId: 1 }`. In the repository, I catch the specific MongoDB duplicate key error (`11000`) and return the existing event. This allows clients to safely retry `POST /events` requests without side effects.

## 2. How does your design behave under concurrent requests?
My design leverages MongoDB's document-level atomicity to handle concurrency safely.
-   **Atomic Writes**: Operations like adding an event or updating session status are atomic. If two requests try to modify the same session simultaneously, MongoDB serializes the writes, preventing race conditions or "lost updates".
-   **Race Conditions**: For checking session completion, I check the status *before* update. While there is a theoretical window where two requests could both see "Active" and try to complete it, the operation is idempotent (setting status to "Completed" twice has the same result), so the outcome remains consistent.

## 3. What MongoDB indexes did you choose and why?
I chose indexes to balance query performance with data integrity:
1.  **`sessionId` (Unique) on Sessions**: Essential for fast lookups by ID and ensuring session uniqueness.
2.  **`sessionId` + `eventId` (Unique) on Events**: The core mechanism for event deduplication/idempotency.
3.  **`sessionId` + `timestamp` on Events**: Optimized for the `GET /sessions/:id` endpoint. Since we return events sorted by time, this compound index allows MongoDB to fetch and sort the paginated results efficiently without an in-memory sort.

## 4. How would you scale this system for millions of sessions per day?
I designed the system to be stateless and horizontally scalable, but for massive scale, I would evolve it into 4 stages:
1.  **Event-Driven Ingestion**: Direct DB writes would become a bottleneck. I would eagerly accept events into a queue (Kafka/RabbitMQ) and use a pool of consumers to batch-write to MongoDB.
2.  **Sharding Strategy**: I would shard the `events` collection by `sessionId` to ensure efficient reads/writes.
3.  **Hybrid Caching Strategy**:
    *   **Session Metadata**: Highly stable. Cached in Redis (Read-Through).
    *   **Events**: Highly volatile. **Fetched live from MongoDB**.
    *   *Why?*: Caching the entire response via Interceptor causes UI lag on new speech packets. This approach balances load reduction with data freshness.
4.  **Autoscaling (HPA + KEDA)**: I would use KEDA to scale consumer pods based on "Kafka Lag" (queue depth) ensuring the system reacts instantly to traffic bursts.
5.  **Storage Tiers**: Completed sessions older than 30 days would be offloaded to S3 (Parquet format) to keep the "Hot" operational database small.

## 5. What did you intentionally keep out of scope, and why?
I focused strictly on the core functional requirements to deliver a high-quality, production-ready MVP.
-   **Authentication/Authorization**: I omitted JWT/OAuth. In a real system, this is critical, but implementing it here would add noise without demonstrating the core "Session/Event" logic requested.
-   **Complex Validation Logic**: While I added basic type checking, I didn't implement deep logic like "User Speech cannot follow System Speech" to keep the domain flexible.
-   **Full CI/CD Pipeline**: I provided a Docker Compose setup for local dev, but didn't build a GitHub Actions workflow for deployment, as that depends heavily on the specific target infrastructure.
