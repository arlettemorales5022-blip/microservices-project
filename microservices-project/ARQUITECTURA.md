# Arquitectura del Proyecto

Este documento describe la arquitectura de `microservices-project` con diagramas Mermaid compatibles con GitHub.

## 1. Arquitectura General de Microservicios

```mermaid
flowchart TB
    Client[Cliente HTTP] --> Gateway[API Gateway<br/>gateway-service]

    Gateway --> Auth[auth-service<br/>Login, register, JWT]
    Gateway --> Users[users-service<br/>CRUD usuarios]
    Gateway --> Products[products-service<br/>CRUD productos]
    Gateway --> Orders[orders-service<br/>Ordenes]

    Auth --> AuthMemory[(Memoria local<br/>usuarios auth)]
    Users --> UsersMemory[(Memoria local<br/>usuarios)]
    Products --> ProductsMemory[(Memoria local<br/>productos)]
    Orders --> OrdersMemory[(Memoria local<br/>ordenes)]

    Prometheus[Prometheus] --> Gateway
    Prometheus --> Auth
    Prometheus --> Users
    Prometheus --> Products
    Prometheus --> Orders
    Grafana[Grafana] --> Prometheus

    Istio[Istio Service Mesh] -. Observabilidad .- Gateway
    Istio -. Telemetria .- Auth
    Istio -. Telemetria .- Users
    Istio -. Telemetria .- Products
    Istio -. Telemetria .- Orders

    ChaosMesh[Chaos Mesh] -. Experimentos .- Products
    ChaosMesh -. Latencia .- Orders
```

## 2. Comunicacion Entre Servicios

```mermaid
flowchart LR
    Client[Cliente] -->|REST| Gateway[gateway-service]

    Gateway -->|/auth/*| Auth[auth-service]
    Gateway -->|/users/* + Bearer JWT| Users[users-service]
    Gateway -->|/products/* + Bearer JWT| Products[products-service]
    Gateway -->|/orders/* + Bearer JWT| Orders[orders-service]

    Orders -->|GET /:productId<br/>Axios + Bearer JWT| Products

    Auth -->|JWT firmado| Client
    Products -->|Producto validado| Orders
    Orders -->|Orden creada| Gateway
    Gateway -->|Respuesta JSON| Client
```

## 3. Flujo de Autenticacion JWT

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as gateway-service
    participant A as auth-service
    participant S as Servicio protegido

    C->>G: POST /auth/register
    G->>A: POST /register
    A->>A: Hash password con bcrypt
    A-->>G: Usuario creado
    G-->>C: 201 Created

    C->>G: POST /auth/login
    G->>A: POST /login
    A->>A: Validar password con bcrypt
    A->>A: Firmar JWT
    A-->>G: Token JWT
    G-->>C: Token Bearer

    C->>G: GET /products Authorization: Bearer JWT
    G->>S: Reenvia Authorization
    S->>S: Verifica JWT con JWT_SECRET
    S-->>G: Datos protegidos
    G-->>C: Respuesta JSON
```

## 4. Pipeline CI/CD

```mermaid
flowchart TB
    Push[Push o Pull Request<br/>rama main] --> Actions[GitHub Actions]

    Actions --> Matrix{Matriz de servicios}
    Matrix --> AuthCI[auth-service]
    Matrix --> UsersCI[users-service]
    Matrix --> ProductsCI[products-service]
    Matrix --> OrdersCI[orders-service]
    Matrix --> GatewayCI[gateway-service]

    AuthCI --> InstallAuth[npm install]
    UsersCI --> InstallUsers[npm install]
    ProductsCI --> InstallProducts[npm install]
    OrdersCI --> InstallOrders[npm install]
    GatewayCI --> InstallGateway[npm install]

    InstallAuth --> CheckAuth[node --check server.js]
    InstallUsers --> CheckUsers[node --check server.js]
    InstallProducts --> CheckProducts[node --check server.js]
    InstallOrders --> CheckOrders[node --check server.js]
    InstallGateway --> CheckGateway[node --check server.js]

    CheckAuth --> BuildAuth[Docker build]
    CheckUsers --> BuildUsers[Docker build]
    CheckProducts --> BuildProducts[Docker build]
    CheckOrders --> BuildOrders[Docker build]
    CheckGateway --> BuildGateway[Docker build]

    BuildAuth --> Result[Pipeline finalizado]
    BuildUsers --> Result
    BuildProducts --> Result
    BuildOrders --> Result
    BuildGateway --> Result
```

## 5. Kubernetes Deployments y Services

```mermaid
flowchart TB
    subgraph Cluster[Kubernetes Cluster]
        subgraph NS[microservices-project namespace]
            Ingress[Ingress<br/>microservices.local] --> GatewaySvc[Service<br/>gateway-service:3000]

            GatewaySvc --> GatewayDep[Deployment<br/>gateway-service<br/>replicas: 2]

            GatewayDep --> AuthSvc[Service<br/>auth-service:3001]
            GatewayDep --> UsersSvc[Service<br/>users-service:3002]
            GatewayDep --> ProductsSvc[Service<br/>products-service:3003]
            GatewayDep --> OrdersSvc[Service<br/>orders-service:3004]

            AuthSvc --> AuthDep[Deployment<br/>auth-service<br/>replicas: 2]
            UsersSvc --> UsersDep[Deployment<br/>users-service<br/>replicas: 2]
            ProductsSvc --> ProductsDep[Deployment<br/>products-service<br/>replicas: 2]
            OrdersSvc --> OrdersDep[Deployment<br/>orders-service<br/>replicas: 2]

            OrdersDep -->|REST interno| ProductsSvc

            ConfigMap[ConfigMap<br/>microservices-config] --> GatewayDep
            ConfigMap --> AuthDep
            ConfigMap --> UsersDep
            ConfigMap --> ProductsDep
            ConfigMap --> OrdersDep

            Secret[Secret<br/>microservices-secrets] --> GatewayDep
            Secret --> AuthDep
            Secret --> UsersDep
            Secret --> ProductsDep
            Secret --> OrdersDep

            HPA1[HPA<br/>gateway-service] --> GatewayDep
            HPA2[HPA<br/>products-service] --> ProductsDep
        end

        subgraph Monitoring[monitoring namespace]
            PromSvc[Service<br/>prometheus:9090] --> PromDep[Deployment<br/>prometheus]
            GrafanaSvc[Service<br/>grafana:3000] --> GrafanaDep[Deployment<br/>grafana]
            GrafanaDep --> PromSvc
        end

        PromDep -->|Scrape /metrics| GatewaySvc
        PromDep -->|Scrape /metrics| AuthSvc
        PromDep -->|Scrape /metrics| UsersSvc
        PromDep -->|Scrape /metrics| ProductsSvc
        PromDep -->|Scrape /metrics| OrdersSvc
    end
```
