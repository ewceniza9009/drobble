# Drobble E-Commerce Platform: Enhanced Technical Specifications

This enhanced document builds upon the original specifications for the Drobble e-commerce platform. Improvements include:
- **Clarity and Structure**: Reorganized sections for better readability, with added subsections, bullet points, and tables where appropriate. Consistent terminology and formatting.
- **Completeness**: Added missing elements such as API documentation (Swagger/OpenAPI), monitoring/observability (Prometheus, Grafana, OpenTelemetry), CI/CD recommendations, scalability strategies, data privacy compliance (GDPR/CCPA), and performance optimizations.
- **Security Enhancements**: Expanded on OWASP top 10 mitigations, secrets management (e.g., Azure Key Vault or AWS Secrets Manager), and zero-trust principles.
- **Modern Best Practices**: Updated to leverage newer features (e.g., .NET 9 previews if stable by 2025, React 19 hooks), added PWA support for frontend, multi-arch Docker images, and schema validation for events.
- **Testing and Reliability**: Expanded testing strategies, added chaos engineering, and improved error handling with structured logging.
- **Infrastructure**: Added Kubernetes best practices, autoscaling, and hybrid cloud considerations.
- **Dependencies**: Updated with version pinning where possible and alternatives for flexibility.
- **New Additions Based on Feedback**: Incorporated industry-standard specifications for administrative management features, including a dedicated Admin Panel in the frontend, expanded admin endpoints in backend services, order cancellation workflows, and additional services for notifications and analytics to complete end-to-end functionality. Identified and addressed gaps such as analytics reporting, notification systems, customer support integration, and comprehensive admin dashboards for products, users, and orders.

The system maintains a microservices architecture for scalability, security, and maintainability. Below, we detail each component, including data models, API contracts, component hierarchies, Docker setups, event-driven communication, and new additions.

## Backend Specifications: ASP.NET Core Microservices

The backend comprises independent ASP.NET Core Web API projects (targeting .NET 8 or 9+ for improved performance and AOT compilation support), implemented as microservices using minimal APIs for lightweight endpoints or controllers for complex logic. Each service adheres to clean architecture (Presentation, Application, Domain, Infrastructure) and utilizes dependency injection for repositories, services, and business logic. Services incorporate ASP.NET Core’s built-in logging (via Serilog for structured logs) and health checks (/health endpoint returning JSON with status details).

### General Backend Guidelines

- **Project Structure**: Clean architecture layers:
  - **Presentation**: API controllers/minimal APIs, input validation.
  - **Application**: Use cases, CQRS patterns (MediatR for command/query separation), business logic.
  - **Domain**: Entities, value objects, domain events.
  - **Infrastructure**: Repositories (EF Core or MongoDB.Driver), external integrations.
- **Communication**:
  - Synchronous: HTTP/REST using HttpClientFactory with Polly for retries, circuit breaking, and timeouts (e.g., exponential backoff).
  - Asynchronous: RabbitMQ for pub/sub events; consider gRPC for high-performance inter-service calls in future iterations.
- **Error Handling**: Centralized middleware for exceptions, returning standardized ProblemDetails JSON (RFC 7807 compliant, e.g., { "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1", "title": "Bad Request", "status": 400, "detail": "Invalid input" }). Include trace IDs for correlation.
- **Testing**:
  - Unit: xUnit + Moq/NSubstitute.
  - Integration: TestContainers for spinning up DBs/RabbitMQ; end-to-end with SpecFlow for behavior-driven tests.
  - Chaos: Introduce fault injection using Chaos Monkey or similar in staging.
- **Configuration**: appsettings.json overlaid with environment variables; use Azure App Configuration or Consul for dynamic config in production.
- **Versioning**: URL path (e.g., /api/v1/products); support API evolution with backward-compatible changes.
- **Security**:
  - HTTPS enforcement, JWT (with RS256 for asymmetric signing), OWASP compliance (e.g., SQL injection prevention via parameterized queries).
  - Rate limiting (AspNetCore.RateLimit with Redis backend), IP whitelisting for admin APIs.
  - Secrets: Never hardcode; use Kubernetes Secrets or HashiCorp Vault.
  - Compliance: GDPR/CCPA via data minimization, consent tracking in user profiles.
- **Logging**: Serilog with sinks (console, file, Seq/ELK stack); structured logging with {SourceContext}, {TraceId}.
- **Observability**: Integrate OpenTelemetry for traces/metrics/logs; export to Jaeger/Prometheus/Grafana.
- **API Documentation**: Auto-generate with Swashbuckle.AspNetCore (Swagger UI at /swagger); include OpenAPI schemas for all endpoints.
- **Performance**: Use output caching (ResponseCaching middleware) for read-heavy endpoints; profile with dotnet-trace.

### 1. Product Catalog Service

**Purpose**: Manages product data, categories, inventory, and supports dynamic attributes.

**Database**: MongoDB (v7+ for sharding support); enable change streams for real-time updates.

**Collections** (with indexes for performance):
- **Products**: { _id: ObjectId, Name: string (indexed), Description: string, Price: decimal (indexed), Stock: int, CategoryId: ObjectId (indexed), Attributes: [{ Key: string, Value: any }], Images: string[], IsActive: bool (default: true), CreatedAt: DateTime, UpdatedAt: DateTime }. Compound index on Name+Price.
- **Categories**: { _id: ObjectId, Name: string (unique), ParentId: ObjectId, Description: string, Slug: string (for SEO-friendly URLs) }.
- **Inventory**: { _id: ObjectId, ProductId: ObjectId (unique), Quantity: int, Reserved: int (for carts), LastUpdated: DateTime }. TTL index on LastUpdated if needed.

**Dependencies**: MongoDB.Driver (v2.28+), FluentValidation.

**API Endpoints** (under /api/v1; all with Swagger annotations):
- GET /products?category={id}&minPrice={value}&maxPrice={value}&sort={price_asc|name_desc}&page={1}&size={20}: Paginated/filtered/sorted list. Returns { Items: array, Total: int, Page: int, FiltersApplied: object }.
- GET /products/{id}: Details; 404 if not found or inactive.
- POST /products: Admin-only; body validation with FluentValidation (e.g., Price > 0).
- PUT /products/{id}: Partial updates (e.g., stock); optimistic concurrency with ETag.
- DELETE /products/{id}: Soft delete (set IsActive=false); publish ProductDeleted event.
- GET /categories: Hierarchical tree (recursive CTE or materialization); include slug for frontend routing.
- GET /products/{id}/inventory: Dedicated endpoint for stock checks (cached).
- **Admin-Only Enhancements (New)**: GET /admin/products?status={active|inactive|low_stock}&search={query}: Advanced search and filtering for admin dashboard. POST /admin/bulk-import: CSV/JSON bulk upload for products. PUT /admin/products/{id}/feature: Mark as featured for homepage.

**Events Published**: ProductCreated, ProductUpdated, ProductDeleted (to Search and Inventory sync).

**Security**: JWT for writes; public reads with CORS restrictions. Input sanitization to prevent NoSQL injection. Admin endpoints require 'Admin' role claim in JWT.

### 2. User Management Service

**Purpose**: Authentication, authorization, profiles, roles; add multi-factor authentication (MFA) support.

**Database**: PostgreSQL (v16+ for JSONB enhancements).

**Tables** (EF Core code-first migrations):
- **Users**: Id (PK, Guid), Username (unique index), Email (unique index), PasswordHash (BCrypt), Role (enum: User, Admin, Vendor), CreatedAt (DateTime), LastLogin (DateTime), IsMfaEnabled: bool.
- **Profiles**: UserId (FK, unique), FullName, Address (JSONB for structured data), Phone, AvatarUrl, Preferences: JSONB (e.g., language).
- **RefreshTokens**: Id (PK), UserId (FK), Token (hashed), Expires (DateTime), Revoked: bool.
- **AuditLogs**: Id (PK), UserId (FK), Action (string), Timestamp (DateTime), Details: JSONB.

**Dependencies**: Microsoft.AspNetCore.Identity.EntityFrameworkCore (v8+), BCrypt.Net-Next, Microsoft.EntityFrameworkCore.PostgreSql, Microsoft.IdentityModel.Tokens, Twilio for MFA SMS.

**API Endpoints** (under /api/v1/auth):
- POST /register: { Username, Email, Password, MfaPhone? }. Password policy: 12+ chars, complexity. Send verification email via SendGrid/Mailgun.
- POST /login: { Username, Password, MfaCode? }. Returns JWT (short-lived, 15min) + refresh token (long-lived, 7d).
- POST /refresh: Validates refresh token; rotate on use.
- POST /mfa/enable: Setup MFA (TOTP or SMS).
- GET /profile: JWT-required; include consent flags for GDPR.
- PUT /profile: Updates; audit changes.
- POST /forgot-password: Token-based reset flow.
- **Admin-Only Enhancements (New)**: GET /admin/users?role={filter}&status={active|banned}&search={query}: Paginated user list with filters. PUT /admin/users/{id}/role: Change role (e.g., promote to Vendor). DELETE /admin/users/{id}: Ban or delete user (soft delete with IsActive flag). GET /admin/users/{id}/audit: View audit logs for user activity.

**Security**: Rate limiting (e.g., 5 attempts/5min on login), CAPTCHA on register, JWT with refresh rotation. Store consents in Profiles. Admin endpoints require 'Admin' role and audit all actions.

**Events Published**: UserRegistered, UserLoggedIn (for analytics), UserProfileUpdated, UserRoleChanged (new, for notifications).

### 3. Shopping Cart Service

**Purpose**: Session or user-based carts; add wishlists as extension.

**Database**: MongoDB; TTL indexes for guest carts (expire after 7d).

**Collections**:
- **Carts**: { _id: ObjectId, UserId: Guid? (indexed), SessionId: string? (indexed), Items: [{ ProductId: ObjectId, Quantity: int, PriceAtAdd: decimal, AddedAt: DateTime }], Total: decimal (computed), CreatedAt: DateTime, ExpiresAt: DateTime }.
- **Wishlists**: { _id: ObjectId, UserId: Guid, ProductIds: ObjectId[] } (new addition for feature parity).

**API Endpoints** (under /api/v1):
- GET /carts/{id} (id=userId or sessionId): Retrieve; auto-merge if user logs in.
- POST /carts/{id}/items: Add; validate stock via synchronous call to Catalog (with fallback).
- PUT /carts/{id}/items/{productId}: Update; prevent negative quantities.
- DELETE /carts/{id}/items/{productId}: Remove.
- POST /carts/merge: Merge guest to authenticated.
- POST /wishlists/{userId}/add: Add to wishlist (JWT-required).
- **Admin-Only Enhancements (New)**: GET /admin/carts?userId={filter}&status={active|abandoned}: View abandoned carts for recovery campaigns (industry standard for cart abandonment recovery).

**Security**: Session cookies for guests (HttpOnly, Secure); JWT for user-linked.

### 4. Order Management Service

**Purpose**: Order lifecycle; add refund/cancellation workflows.

**Database**: PostgreSQL; use transactions for atomicity.

**Tables**:
- **Orders**: Id (PK, Guid), UserId (FK), Status (enum: Pending, Processing, Shipped, Delivered, Cancelled, Refunded), TotalAmount: decimal, CreatedAt: DateTime, UpdatedAt: DateTime, Currency: string (ISO 4217).
- **OrderItems**: Id (PK), OrderId (FK), ProductId (ObjectId), Quantity: int, Price: decimal, Discounts: decimal.
- **Shipping**: OrderId (FK, unique), Address: JSONB, Method: enum (Standard, Express), TrackingNumber: string, EstimatedDelivery: DateTime.
- **Refunds**: Id (PK), OrderId (FK), Amount: decimal, Reason: string, Status: enum.

**Dependencies**: Microsoft.EntityFrameworkCore (v8+).

**API Endpoints** (under /api/v1):
- POST /orders: From cart; transactionally reserve inventory, create order.
- GET /orders/{id}: Details; include tracking.
- GET /users/{userId}/orders?status={filter}&page={1}&size={10}: Paginated.
- PUT /orders/{id}/status: Admin; trigger events.
- POST /orders/{id}/refund: Initiate refund (integrate with Payment).
- **Admin-Only Enhancements (New)**: POST /admin/orders/{id}/cancel: Cancel order (check if not shipped, release inventory, initiate refund if paid, update status to Cancelled). GET /admin/orders?status={filter}&dateRange={start-end}&search={query}: Advanced filtering and export (CSV/PDF) for reporting. PUT /admin/orders/{id}/notes: Add internal notes for customer support.

**Events Subscribed**: PaymentSucceeded (update to Paid), InventoryUpdated (check stock).
**Events Published**: OrderStatusChanged, RefundRequested, OrderCancelled (new, triggers notifications and inventory release).

**Security**: JWT; role-based access control (RBAC) via claims. Admin actions audited.

**Industry Standard for Order Cancellation**: Workflows typically include pre-shipment checks (e.g., if status is Pending/Processing, allow cancel; if Shipped, require return process). Automatic inventory release and partial/full refunds via payment gateway. Notifications to user and admin. Compliance with consumer laws (e.g., 14-day cooling-off under EU regulations).

### 5. Payment Service

**Purpose**: Gateway integrations; support multiple providers (Stripe, PayPal, Apple Pay).

**Database**: PostgreSQL; log transactions immutably.

**Tables**: Transactions: Id (PK), OrderId (FK), Amount: decimal, Currency: string, Status (enum), Gateway: enum (Stripe, PayPal), Response: JSONB, CreatedAt: DateTime.

**Dependencies**: Stripe.NET (v45+), PayPalCheckoutSdk.

**API Endpoints** (under /api/v1):
- POST /payments/{orderId}: Create session; return client secret/URL.
- POST /payments/webhook: Validate signatures; handle async callbacks.
- GET /payments/methods: List available (for frontend).
- **Admin-Only Enhancements (New)**: GET /admin/payments?orderId={filter}&status={failed|refunded}: View transaction logs for dispute resolution.

**Security**: PCI DSS via tokenization; webhooks with signature verification. No sensitive data storage.

**Events Published**: PaymentSucceeded, PaymentFailed, PaymentRefunded (new, for order updates).

### 6. Search & Discovery Service

**Purpose**: Full-text search, recommendations; add AI-powered personalization.

**Database**: Elasticsearch (v8+); or OpenSearch for open-source alternative.

**Indices**:
- **Products**: Fields with analyzers (e.g., ngram for partial matches).
- **Recommendations**: User vectors for collaborative filtering.

**Dependencies**: Elastic.Clients.Elasticsearch (v8+), ML.NET for recommendations.

**API Endpoints** (under /api/v1):
- GET /search?q={query}&filters={json}&sort={relevance|price}&page={1}: With facets (e.g., category counts).
- GET /recommendations/{userId}?type={personal|similar}: Use ML models (train offline).
- POST /search/suggest: Autocomplete.
- **Admin-Only Enhancements (New)**: POST /admin/search/reindex: Manual reindexing trigger.

**Events Subscribed**: Product* events for re-indexing.

**Enhancements**: Integrate vector search for image-based recommendations (using embeddings from a model like CLIP).

### 7. Reviews & Ratings Service

**Purpose**: Feedback; add moderation queue.

**Database**: MongoDB.

**Collections**: Reviews: { _id: ObjectId, ProductId: ObjectId (indexed), UserId: Guid, Rating: int, Comment: string, Images: string[], VerifiedPurchase: bool, CreatedAt: DateTime, ModerationStatus: enum (Pending, Approved, Rejected) }.

**API Endpoints** (under /api/v1):
- POST /reviews: Submit; flag for moderation if suspicious (e.g., via sentiment analysis).
- GET /products/{id}/reviews?sort={date_desc|rating_asc}&page={1}: Filtered.
- GET /products/{id}/average-rating: { Average: float, Count: int, Distribution: {1: n, 2: n, ...} }.
- PUT /reviews/{id}/moderate: Admin-only.
- **Admin-Only Enhancements (New)**: GET /admin/reviews/pending: List for moderation queue.

**Security**: JWT; prevent spam with CAPTCHA on submit.

### 8. Notification Service (New Addition for End-to-End Completeness)

**Purpose**: Handles email, SMS, push notifications for users and admins (e.g., order updates, cancellations, promotions). Addresses gap in user communication.

**Database**: PostgreSQL for logging sent notifications.

**Tables**:
- **Notifications**: Id (PK, Guid), UserId (FK), Type (enum: Email, SMS, Push), Content: string, Status (enum: Sent, Failed), SentAt: DateTime.

**Dependencies**: SendGrid for email, Twilio for SMS, Firebase for push.

**API Endpoints** (under /api/v1/notifications):
- POST /send: Internal; triggered by events.
- GET /admin/notifications?userId={filter}: View sent history.

**Events Subscribed**: All major events (e.g., OrderStatusChanged, UserRegistered, OrderCancelled).

**Security**: JWT for internal calls; rate limiting to prevent abuse.

**Industry Standard**: Templates for personalization, opt-in/out for marketing, delivery tracking with retries.

### 9. Analytics & Reporting Service (New Addition for End-to-End Completeness)

**Purpose**: Aggregates data for dashboards; provides insights on sales, users, inventory. Addresses gap in business intelligence.

**Database**: ClickHouse for high-performance analytics queries; or PostgreSQL with TimescaleDB extension.

**Indices**: Time-series data for metrics (e.g., daily sales).

**Dependencies**: Microsoft.Extensions.Caching.StackExchangeRedis for caching reports.

**API Endpoints** (under /api/v1/analytics):
- GET /admin/dashboard: Real-time metrics { SalesToday: decimal, NewUsers: int, TopProducts: array }.
- GET /admin/reports/sales?dateRange={start-end}: Exportable reports (CSV/JSON).
- GET /admin/reports/users?metric={retention|churn}: User behavior analytics.

**Events Subscribed**: All user/order/product events for aggregation.

**Security**: Admin-only; data anonymized for GDPR.

**Industry Standard**: Real-time dashboards, KPI tracking (e.g., AOV, conversion rate), integration with tools like Google Analytics.

## API Gateway (Ocelot)

**Purpose**: Central entry point; add request aggregation.

**Configuration**: ocelot.json for routes, authentication, caching (Redis with sliding expiration).

**Dependencies**: Ocelot (v23+), Ocelot.Provider.Polly, StackExchange.Redis.

**Enhancements**: GraphQL federation for complex queries; rate limiting per user/IP. Add admin-specific routes with RBAC.

## Frontend Specifications: ReactJS SPA

The frontend is a React 19+ SPA using Vite for fast builds, Tailwind CSS v3+ for styling, TypeScript 5+, and TanStack Query (formerly React Query) for data fetching/caching. Structure: src/components (reusable), src/pages (routed views), src/api (clients), src/store (state), src/hooks (custom logic).

### General Frontend Guidelines

- **Routing**: React Router v6+; code-splitting with lazy().
- **State Management**: Redux Toolkit v2+ for global state; slices for auth, cart. Use RTK Query for API endpoints with auto-caching/invalidation.
- **Data Fetching**: Axios v1+ with interceptors (add JWT, handle 401/403). Optimistic updates for cart.
- **UI**: Tailwind with custom plugins; shadcn/ui for components if needed (headless).
- **Testing**: Jest + RTL; Cypress for E2E; coverage >80%.
- **Performance**: Memoization (useMemo/useCallback), virtualization (react-window for lists), image lazy-loading/webp.
- **Accessibility**: WCAG 2.1 AA; axe-core for audits, ARIA, focus management.
- **Internationalization**: i18next with react-i18next; detect browser locale.
- **PWA Support** (new): Manifest.json, service workers via Vite PWA plugin; offline caching for carts.
- **SEO**: Server-side rendering (SSR) with Next.js migration path; meta tags via React Helmet.
- **Security**: Content-Security-Policy (CSP), XSS prevention via sanitized inputs.

### Component Hierarchy

**Core Components** (src/components/ui):
- Button: Props { variant, size, disabled, loading }; spinner for async.
- Input: With validation (error messages via React Hook Form).
- Card: Responsive, hover effects.
- Modal: Accessible, trap focus.

**Feature Components** (src/components/features):
- ProductCard: Clickable, with quick-add to cart.
- ProductList: Infinite scroll option (react-intersection-observer).
- ShoppingCartItem: Quantity stepper, subtotal.
- CheckoutForm: Multi-step wizard; payment integration (Stripe Elements).
- SearchBar: Debounced input, suggestions dropdown.

**Page Components** (src/pages):
- HomePage: Carousel for features, personalized recommendations.
- ProductDetailPage: Tabs (description, reviews, related); zoomable images.
- CartPage: Summary, promo codes.
- CheckoutPage: Guest checkout option.
- ProfilePage: Tabs for orders, wishlist, settings (MFA toggle).
- Login/Register: Social logins (OAuth via Google/Apple).

### Admin Panel (New Section for Management Features)

**Purpose**: Dedicated dashboard for admins to manage products, users, orders, etc. Role-based access (redirect if not Admin). Uses same tech stack but with protected routes.

**Industry Standard Features**: Real-time analytics dashboard, user/product/order management, inventory tracking, promotion tools, reports/export, custom workflows/automation, moderation queues, settings for site config (e.g., shipping rates, taxes).

**Routing**: /admin/* (protected by auth guard checking 'Admin' role).

**State Management**: Extend Redux with adminSlice for dashboard data.

**Page Components** (src/pages/admin):
- DashboardPage: Charts (using Recharts) for sales trends, user growth, low-stock alerts. KPI cards (e.g., Total Orders, Revenue).
- ProductsManagementPage: Table with search/filter/sort, bulk actions (edit/delete/feature), add new product form.
- UsersManagementPage: User list table, search by email/role, actions (edit role, ban, view profile/audit logs).
- OrdersManagementPage: Order list with filters (status/date), details view, cancel/refund buttons with confirmation modals.
- ReviewsModerationPage: Pending reviews queue, approve/reject with reasons.
- AnalyticsReportsPage: Custom date-range reports, export options.
- SettingsPage: Manage site configs (e.g., payment gateways, shipping methods, promotions/coupons).

**Integration**: Use RTK Query for admin-specific endpoints; real-time updates via WebSockets (e.g., SignalR) for notifications.

**Security**: Role checks on load; audit frontend actions via backend logs.

### State Management with Redux Toolkit

**Slices**:
- authSlice: Persist token with redux-persist; auto-logout on expire.
- cartSlice: Sync with backend on changes; guest persistence in localStorage.
- productsSlice: Caching with expiration.
- **New**: adminSlice: For dashboard metrics, with polling for real-time.

**RTK Query**: Define api.ts with endpoints; tags for invalidation (e.g., invalidate 'Cart' on addItem).

**Persistence**: Encrypt sensitive data in storage.

### Backend Integration

**API Client**: Base Axios instance; refresh token interceptor.
**Error Handling**: Global error boundary (React ErrorBoundary); toasts with sonner.
**Auth Flow**: Protected routes; silent refresh.

### Build and Deployment

**Vite Config**: Plugins for React, Tailwind, ESLint, Prettier, VitePWA.
**Deployment**: Vercel/Netlify for hosting; API proxy in dev.
**Docker for Frontend** (new): Containerize for consistent builds.

Sample Dockerfile:
```
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Configuration

Containerize all services (including frontend for edge deployment). Use multi-stage builds; support arm64/amd64 for multi-arch.

### General Docker Guidelines

- **Base Images**: dotnet/sdk:9.0-preview (if stable), node:20 for frontend.
- **Env Vars**: .env files; secrets via --secret in builds.
- **Health Checks**: CURL to /health; include readiness/liveness probes.
- **Security**: Run as non-root (USER 1001); scan with Trivy/Snyk.
- **Optimization**: Layering (copy csproj first for restore caching); slim images.

**Enhanced Sample Dockerfile** (Generic):
```
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ServiceName.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
USER appuser
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "ServiceName.dll"]
HEALTHCHECK CMD curl --fail http://localhost/health || exit 1
```

**Service-Specific** (e.g., User Management): Add ENV for JWT, DB; use multi-arch (buildx). Add new services (Notification, Analytics) similarly.

### Docker Compose for Local Development

Enhanced with volumes for persistence, networks for isolation. Add new services:

```
version: '3.9'
services:
  user-management:
    build: ./UserManagementService
    ports:
      - "5001:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__Postgres=Host=postgres-db;Database=users;Username=postgres;Password=${POSTGRES_PASSWORD:-devpass}
      - JWT__Key=${JWT_KEY:-dev-secret-key}
    depends_on:
      postgres-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - backend

  postgres-db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpass}
      POSTGRES_DB: users
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-guest}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS:-guest}
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - backend

  # Add other services similarly
  api-gateway:
    build: ./ApiGateway
    ports:
      - "8080:80"
    depends_on:
      - user-management
    networks:
      - backend

  notification-service:
    build: ./NotificationService
    ports:
      - "5008:80"
    environment:
      - SendGrid__ApiKey=${SENDGRID_KEY}
    depends_on:
      - rabbitmq
    networks:
      - backend

  analytics-service:
    build: ./AnalyticsService
    ports:
      - "5009:80"
    depends_on:
      - clickhouse-db  # Assuming ClickHouse image added
    networks:
      - backend

  clickhouse-db:
    image: clickhouse/clickhouse-server:latest
    ports:
      - "8123:8123"
    volumes:
      - clickhouse-data:/var/lib/clickhouse
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  postgres-data:
  clickhouse-data:
```

### Production Deployment

- **Kubernetes**: Use Helm v3+ charts; Deployments with replicas=3, HPA for autoscaling (CPU>70%), PDB for zero-downtime.
- **Secrets**: Kubernetes Secrets from YAML or external (Sealed Secrets).
- **CI/CD**: GitHub Actions/Jenkins; build/push images, deploy via ArgoCD.
- **Monitoring**: Prometheus operator, Grafana dashboards; alert on high latency/errors.

## RabbitMQ Integration

Use RabbitMQ 3.13+ for clustering; topic exchange with AVRO/JSON schemas for events (new: use Confluent Schema Registry for validation).

### RabbitMQ Guidelines

- **Exchange**: drobble.events (topic); keys like "order.created.v1".
- **Queues**: Durable, auto-delete false; DLQ with x-dead-letter-exchange.
- **Reliability**: Publisher confirms, consumer acks; idempotency with message IDs.
- **Monitoring**: Management UI; integrate with Prometheus exporter.
- **Security**: TLS 1.3, vhosts per env, credentials via secrets.
- **Scaling**: Cluster mode; use consistent hashing for partitioning.

**Dependencies**: MassTransit v8+, MassTransit.RabbitMQ.

**Configuration** (enhanced):
```
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderCreatedConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"], h =>
        {
            h.Username(builder.Configuration["RabbitMQ:Username"]);
            h.Password(builder.Configuration["RabbitMQ:Password"]);
            h.UseSsl(s => s.Protocol = SslProtocols.Tls13);
        });
        cfg.ReceiveEndpoint("payment-queue", e =>
        {
            e.ConfigureConsumer<OrderCreatedConsumer>(context);
            e.UseMessageRetry(r => r.Interval(5, TimeSpan.FromSeconds(10)));
        });
    });
});
```

**Publishing** (with schema):
Use records with DataContract for serialization.

**Consuming**: Ensure idempotency (check processed via DB). Add consumers for new events like OrderCancelled.

## Key Configurations and Imports

### Common NuGet Packages (pinned versions where critical)

- Microsoft.AspNetCore.Authentication.JwtBearer (~8.0)
- FluentValidation.AspNetCore (~11.0)
- Serilog.AspNetCore (~8.0)
- Polly (~8.0)
- Ocelot (~23.0)
- Swashbuckle.AspNetCore (~6.0)
- OpenTelemetry.Exporter.Prometheus (~0.8)

### Service-Specific

**User Management**:
- NuGet: As original + OtpNet for TOTP MFA.
- Imports: As original + using OtpNet;
- Config: Add MFA in JWT claims.

**Product Catalog**:
- Config: Add change stream watcher for events.

**Logging**: Enhanced with enrichers (e.g., from HTTP context).

**CORS**: Restrict to specific origins in prod (e.g., https://drobble.com).

**New Services**:
- Notification: NuGet: SendGrid (~4.0), Twilio (~6.0).
- Analytics: NuGet: ClickHouse.Client (~2.0).

## Overall System Output and Completeness

**Overall Output**: The Drobble platform delivers a fully functional e-commerce application with user-facing features (browsing, cart, checkout, profiles) and admin management tools. Outputs include: responsive web app (PWA-capable), secure APIs, real-time events/notifications, analytics reports, and scalable infrastructure. End-users get personalized shopping experiences; admins get dashboards for oversight and operations.

**What Was Missing and Added for Complete End-to-End**:
- **Admin Management Specs**: Previously implicit in admin-only APIs; now explicit with industry-standard features like dashboards, bulk actions, moderation queues, and workflows (e.g., order cancellation).
- **Notification Service**: For user/admin alerts (e.g., email on cancellation).
- **Analytics Service**: For business insights and reporting.
- **Other Gaps Addressed**: Customer support integration (e.g., via notes in orders), promotion tools (added to admin settings), export functionalities, real-time dashboards.
- **Remaining Potential Enhancements (Not Critical)**: Customer support chat (e.g., integrate Intercom), backup/restore automation, A/B testing, multi-vendor support (if expanding to marketplace).

This enhanced specification provides a robust, future-proof blueprint for Drobble, incorporating industry best practices for 2025 and beyond. Implementation should prioritize iterative development with MVPs for core services.