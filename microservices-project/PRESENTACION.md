## 1. Portada

# Proyecto final

**Materia:** Computacion Tolerante a Fallas  
**Alumno:** Arlette Guadalupe Morales Jaime  
**Tema:** Arquitectura de microservicios con Docker, Kubernetes, seguridad y resiliencia

**Nota tecnica:** El proyecto integra servicios independientes desplegables mediante contenedores y orquestacion.

---

## 2. Introduccion

### Que son los microservicios

Los microservicios son un estilo de arquitectura donde una aplicacion se divide en servicios pequenos, independientes y especializados. Cada servicio cumple una responsabilidad especifica y se comunica con otros mediante interfaces bien definidas.

### Objetivo del proyecto

- Implementar una arquitectura distribuida basada en microservicios.
- Separar responsabilidades por dominio funcional.
- Usar contenedores para facilitar ejecucion, despliegue y portabilidad.
- Preparar el sistema para escenarios de escalabilidad, seguridad y tolerancia a fallos.

**Nota tecnica:** La separacion por servicios permite actualizar, escalar o recuperar componentes sin afectar todo el sistema.

---

## 3. Arquitectura del sistema

### Servicios principales

- **auth-service:** Gestiona autenticacion, inicio de sesion y generacion de tokens.
- **users-service:** Administra informacion relacionada con usuarios.
- **products-service:** Gestiona el catalogo de productos.
- **orders-service:** Procesa ordenes y operaciones asociadas a compras.
- **gateway-service:** Funciona como punto de entrada central para las peticiones externas.

### Flujo general

1. El cliente envia solicitudes al **gateway-service**.
2. El gateway redirige las peticiones al microservicio correspondiente.
3. Los servicios procesan la logica de negocio de forma independiente.
4. Las respuestas regresan al cliente a traves del gateway.

**Nota tecnica:** El API Gateway reduce el acoplamiento entre clientes y servicios internos.

---

## 4. Docker

### Contenerizacion

Docker permite empaquetar cada microservicio con sus dependencias, configuracion y entorno de ejecucion. Esto facilita que el sistema se ejecute de forma consistente en distintos equipos o servidores.

### Beneficios

- Portabilidad entre ambientes.
- Aislamiento de dependencias.
- Despliegues mas rapidos.
- Facilidad para replicar servicios.
- Menor diferencia entre desarrollo y produccion.

### Docker Compose

Docker Compose permite levantar multiples contenedores mediante un solo archivo de configuracion, facilitando la ejecucion local del sistema completo.

**Nota tecnica:** Cada microservicio puede tener su propio `Dockerfile` y ser ejecutado como contenedor independiente.

---

## 5. Kubernetes

### Componentes utilizados

- **Deployments:** Definen como se ejecutan y actualizan los pods de cada microservicio.
- **Services:** Exponen los pods internamente dentro del cluster.
- **Ingress:** Permite enrutar trafico externo hacia los servicios.
- **Escalabilidad:** Kubernetes puede aumentar o reducir replicas segun la demanda.

### Ventajas en el proyecto

- Administracion centralizada de contenedores.
- Recuperacion automatica ante fallos.
- Balanceo de carga entre replicas.
- Despliegue organizado de servicios independientes.

**Nota tecnica:** Si un pod falla, Kubernetes puede crear uno nuevo para mantener disponible el servicio.

---

## 6. Comunicacion entre microservicios

### APIs REST

Los microservicios se comunican mediante APIs REST, usando endpoints HTTP para solicitar o enviar informacion entre servicios.

### Axios

Axios permite realizar peticiones HTTP desde un servicio hacia otro, facilitando la integracion entre componentes del sistema.

### API Gateway

El **gateway-service** centraliza el acceso externo y dirige las peticiones a los microservicios correspondientes.

### Beneficios

- Comunicacion clara y estandarizada.
- Separacion entre cliente y servicios internos.
- Mejor control del trafico entrante.
- Posibilidad de aplicar validaciones o filtros en un solo punto.

**Nota tecnica:** REST facilita la interoperabilidad porque utiliza metodos HTTP comunes como `GET`, `POST`, `PUT` y `DELETE`.

---

## 7. Seguridad

### JWT

JSON Web Token permite autenticar usuarios mediante tokens firmados. Despues del inicio de sesion, el cliente usa el token para acceder a recursos protegidos.

### Bearer Token

El token se envia en el encabezado HTTP `Authorization` usando el esquema `Bearer`.

### bcrypt

bcrypt permite proteger contrasenas mediante hashing, evitando almacenar contrasenas en texto plano.

### Autorizacion

La autorizacion valida si un usuario autenticado tiene permiso para acceder a una ruta o ejecutar una accion.

**Nota tecnica:** Autenticacion responde a "quien eres"; autorizacion responde a "que puedes hacer".

---

## 8. Monitorizacion y observabilidad

### Prometheus

Prometheus permite recolectar metricas de los servicios y del cluster para analizar rendimiento, disponibilidad y comportamiento.

### Grafana

Grafana permite visualizar metricas mediante dashboards, facilitando la interpretacion del estado del sistema.

### Istio

Istio agrega capacidades de service mesh, como gestion de trafico, telemetria, seguridad y observabilidad entre microservicios.

### Beneficios

- Deteccion temprana de errores.
- Analisis de latencia y consumo de recursos.
- Visualizacion del estado del sistema.
- Mejor toma de decisiones durante incidentes.

**Nota tecnica:** La observabilidad ayuda a entender el comportamiento interno del sistema a partir de logs, metricas y trazas.

---

## 9. Chaos Engineering y resiliencia

### Chaos Mesh

Chaos Mesh permite simular fallos controlados dentro de Kubernetes para evaluar la capacidad de recuperacion del sistema.

### Recuperacion ante fallos

El sistema puede beneficiarse de mecanismos como reinicio automatico de pods, multiples replicas y balanceo de carga.

### Alta disponibilidad

La alta disponibilidad busca mantener el servicio funcionando aunque existan errores en componentes individuales.

### Escenarios de prueba

- Caida de pods.
- Latencia en red.
- Errores temporales entre servicios.
- Consumo elevado de recursos.

**Nota tecnica:** Chaos Engineering no busca romper el sistema, sino descubrir debilidades antes de que ocurran en produccion.

---

## 10. Conclusiones

### Beneficios de la arquitectura

- Separacion clara de responsabilidades.
- Servicios independientes y mantenibles.
- Facilidad para integrar nuevas funcionalidades.
- Mejor organizacion del codigo y del despliegue.

### Escalabilidad

La arquitectura permite escalar servicios especificos segun la demanda, sin necesidad de aumentar todos los componentes del sistema.

### Tolerancia a fallos

El uso de Docker, Kubernetes, monitorizacion y pruebas de resiliencia fortalece la disponibilidad del sistema ante fallos.

### Cierre

Este proyecto demuestra como una arquitectura de microservicios puede mejorar la flexibilidad, escalabilidad y resiliencia de una aplicacion moderna.

**Nota tecnica:** La tolerancia a fallos se logra combinando buenas practicas de diseno, automatizacion, monitoreo y recuperacion.
