# Food Store

Sistema de gestion de pedidos para un comercio de comida, dividido en dos aplicaciones independientes: una tienda web para clientes/administradores y una app de consola para la gestion de datos con persistencia.

## Estructura del Proyecto
El codigo fuente se encuentra dividido en dos directorios principales. Cada uno cuenta con su propio archivo README con instrucciones especificas:

* /frontend: Contiene la aplicacion web que desarrolle utilizando Vite y TypeScript.
* /backend: Contiene el modelo de persistencia y la aplicacion de consola que construi utilizando Java, JPA, Hibernate y la base de datos H2.

## Arquitectura
El frontend y el backend son **dos aplicaciones independientes que no se comunican entre si**.

* El **frontend** simula el consumo de datos mediante fetch a archivos JSON locales (`/public/data`), por lo que puede ejecutarse de forma totalmente aislada.
* El **backend** es una aplicacion de consola que opera directamente contra una base de datos H2 en archivo, sin exponer ninguna API HTTP.

```
Food_Store/
├── backend/                  # App de consola (Java + JPA/Hibernate + H2)
│   └── src/main/java/com/tp/jpa/
│       ├── model/             # Entidades: Usuario, Producto, Categoria, Pedido, DetallePedido
│       ├── repository/        # Repositorios genericos (BaseRepository) y especificos
│       └── util/               # JPAUtil (EntityManagerFactory)
│
└── frontend/                  # App web (Vite + TypeScript)
    └── src/pages/
        ├── auth/               # login, register
        ├── store/              # home, productDetail, cart
        ├── client/orders/      # historial de pedidos del cliente
        └── admin/              # adminHome, products, categories, orders
```