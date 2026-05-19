Microservices Project

Arquitectura completa de microservicios con Node.js 18, Express, Docker, Kubernetes, JWT, API Gateway, Prometheus, Grafana, Istio y Chaos Mesh.

# Arquitectura

- `auth-service`: registro, login, hashing con bcrypt y emisión de JWT.
- `users-service`: CRUD de usuarios protegido con JWT.
- `products-service`: CRUD de productos protegido con JWT.
- `orders-service`: creación y consulta de órdenes. Valida productos llamando por REST a `products-service` con Axios.
- `gateway-service`: API Gateway con `express-http-proxy`.
- `k8s/`: deployments, services, HPA, ingress, observabilidad y chaos engineering.
- `.github/workflows/ci-cd.yml`: pipeline de CI/CD con instalación, lint básico y builds Docker.

> Este proyecto usa almacenamiento en memoria para mantenerlo simple y funcional para laboratorio. En producción, conecta cada servicio a su propia base de datos.

## Estructura

```text
microservices-project/
  auth-service/
  users-service/
  products-service/
  orders-service/
  gateway-service/
  k8s/
    auth/
    users/
    products/
    orders/
    gateway/
    monitoring/
    istio/
    chaos/
  .github/workflows/
```

## Requisitos

- Node.js 18+
- Docker
- kubectl
- Minikube
- Istio CLI
- Helm

## Ejecución Local

En terminales separadas:

```bash
cd auth-service && npm install && npm start
cd users-service && npm install && npm start
cd products-service && npm install && npm start
cd orders-service && npm install && npm start
cd gateway-service && npm install && npm start
```

El gateway escucha en `http://localhost:3000`.

Rutas principales:

```bash
POST   /auth/register
POST   /auth/login
GET    /users
POST   /users
GET    /products
POST   /products
POST   /orders
GET    /orders
```

Ejemplo:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123","name":"Admin"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123"}'
```

Usa el token recibido:

```bash
curl http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>"
```

## Docker Build

Desde la raíz del proyecto:

```bash
docker build -t microservices-project/auth-service:1.0 ./auth-service
docker build -t microservices-project/users-service:1.0 ./users-service
docker build -t microservices-project/products-service:1.0 ./products-service
docker build -t microservices-project/orders-service:1.0 ./orders-service
docker build -t microservices-project/gateway-service:1.0 ./gateway-service
```

## Docker Compose Local

Levanta todos los microservicios, Prometheus y Grafana:

```bash
docker compose up --build
```

URLs locales:

- Gateway: `http://localhost:3000`
- Auth service: `http://localhost:3001`
- Users service: `http://localhost:3002`
- Products service: `http://localhost:3003`
- Orders service: `http://localhost:3004`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3030`

Grafana:

- Usuario: `admin`
- Password: `admin`

## Despliegue con Minikube

1. Inicia Minikube:

```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
minikube addons enable metrics-server
```

2. Usa el Docker daemon de Minikube:

```bash
eval $(minikube docker-env)
```

En PowerShell:

```powershell
minikube docker-env | Invoke-Expression
```

3. Construye imágenes:

```bash
docker build -t microservices-project/auth-service:1.0 ./auth-service
docker build -t microservices-project/users-service:1.0 ./users-service
docker build -t microservices-project/products-service:1.0 ./products-service
docker build -t microservices-project/orders-service:1.0 ./orders-service
docker build -t microservices-project/gateway-service:1.0 ./gateway-service
```

4. Aplica Kubernetes:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/auth/
kubectl apply -f k8s/users/
kubectl apply -f k8s/products/
kubectl apply -f k8s/orders/
kubectl apply -f k8s/gateway/
kubectl apply -f k8s/ingress.yaml
```

5. Escalabilidad horizontal:

```bash
kubectl apply -f k8s/hpa.yaml
kubectl get hpa -n microservices-project
```

6. Accede al gateway:

```bash
minikube tunnel
kubectl get ingress -n microservices-project
```

Agrega al archivo hosts:

```text
127.0.0.1 microservices.local
```

Luego abre:

```text
http://microservices.local
```

## Prometheus y Grafana

Instalación simple con manifests incluidos:

```bash
kubectl apply -f k8s/monitoring/
kubectl port-forward -n monitoring svc/prometheus 9090:9090
kubectl port-forward -n monitoring svc/grafana 3030:3000
```

Grafana:

- URL: `http://localhost:3030`
- Usuario: `admin`
- Password: `admin`

## Istio

Instala Istio:

```bash
istioctl install --set profile=demo -y
kubectl label namespace microservices-project istio-injection=enabled
kubectl rollout restart deployment -n microservices-project
kubectl apply -f k8s/istio/
```

Observabilidad:

```bash
istioctl dashboard kiali
istioctl dashboard grafana
istioctl dashboard prometheus
```

## Chaos Engineering con Chaos Mesh

Instala Chaos Mesh:

```bash
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update
kubectl create ns chaos-mesh
helm install chaos-mesh chaos-mesh/chaos-mesh -n chaos-mesh --set chaosDaemon.runtime=containerd --set chaosDaemon.socketPath=/run/containerd/containerd.sock
```

Aplica experimentos:

```bash
kubectl apply -f k8s/chaos/
```

## Seguridad

- JWT firmado con `JWT_SECRET`.
- Passwords cifrados con bcrypt.
- Servicios protegidos con middleware de autorización.
- El gateway enruta la cabecera `Authorization` hacia los servicios internos.

## Endpoints de Salud y Métricas

Cada servicio expone:

```text
GET /health
GET /metrics
```

Prometheus usa `/metrics` para scraping.
