# Food Store - Backend JPA Consola

Esta es la capa de persistencia y logica de negocio que desarrolle para el sistema. Implemente un menu interactivo por consola que permite realizar todas las operaciones CRUD de manera transaccional sobre la base de datos.

## Tecnologias Utilizadas
* Java
* Jakarta Persistence API (JPA) / Hibernate
* Base de Datos H2
* Gradle

## Instrucciones de Ejecucion
El proyecto esta construido y gestionado con Gradle. Para ejecutar el menu interactivo, hay dos opciones:

Opcion 1 (Desde un IDE):
Abrir el proyecto en IntelliJ IDEA o Eclipse, localizar la clase ubicada en src/main/java/com/tp/jpa/Main.java y ejecutar el metodo main().

Opcion 2 (Desde la Terminal):
Abrir una consola en la raiz de esta carpeta (/backend) y ejecutar el comando:
* En Windows: gradlew run
* En Linux o Mac: ./gradlew run

## Sobre la Base de Datos
Configure la base de datos H2 para que funcione en modo archivo local (se generara automaticamente en el directorio ./data/jpa_db). El sistema maneja bajas logicas para preservar el historial de datos y todas las operaciones de alta de pedido son transaccionales.