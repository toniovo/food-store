package com.tp.jpa;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Scanner;

/**
 * Clase principal: menú de consola del sistema Food Store.
 * Orden de uso natural: Categorías -> Productos -> Usuarios -> Pedidos.
 */
public class Main {

    private static final Scanner sc = new Scanner(System.in);

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        boolean salir = false;
        while (!salir) {
            System.out.println();
            System.out.println("===== FOOD STORE - MENÚ PRINCIPAL =====");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1": menuCategorias(); break;
                case "2": menuProductos(); break;
                case "3": menuUsuarios(); break;
                case "4": menuPedidos(); break;
                case "5": menuReportes(); break;
                case "0": salir = true; break;
                default: System.out.println("Opción inválida.");
            }
        }
        JPAUtil.close();
        System.out.println("Aplicación finalizada.");
    }

    // 1. Submenú Categorías
    private static void menuCategorias() {
        System.out.println("------------------------------------------");
        System.out.println("1. Alta de Categoría");
        System.out.println("2. Baja de Categoría");
        System.out.println("3. Modificación de Categoría");
        System.out.println("4. Listado de Categorías activas");
        System.out.println("------------------------------------------");
        System.out.print("Elige una opción: ");
        String opcion = sc.nextLine();

        switch (opcion) {
            case "1":
                Categoria categoria = new Categoria();
                System.out.print("Escriba el nombre de la categoría a guardar: ");
                String catNombre = sc.nextLine();
                if (catNombre.trim().isEmpty()) {
                    System.out.println("El nombre de la categoría no puede estar vacío. Operación cancelada.");
                    break;
                }
                categoria.setNombre(catNombre);
                System.out.print("Escriba la descripción de la categoría a guardar: ");
                String catDescripcion = sc.nextLine();
                categoria.setDescripcion(catDescripcion);
                try {
                    categoria = categoriaRepo.guardar(categoria);
                    System.out.println("Categoría guardada correctamente. ID:" + categoria.getId());
                } catch (Exception e) {
                    System.out.println("Ocurrió un error al intentar guardar en la base de datos.");
                }
                break;

            case "2":
                System.out.print("Ingrese el ID de la categoría para la baja de la misma: ");
                Long idBaja = Long.parseLong(sc.nextLine());
                if (categoriaRepo.eliminarLogico(idBaja)) {
                    System.out.println("Categoría eliminada correctamente.");
                } else {
                    System.out.println("No se encontró ninguna categoría activa con ese ID.");
                }
                break;

            case "3":
                System.out.print("Ingrese el ID de la categoría para la modificación de la misma: ");
                Long idModificacion = Long.parseLong(sc.nextLine());
                Optional<Categoria> opcionalCategoria = categoriaRepo.buscarPorId(idModificacion);
                if (opcionalCategoria.isPresent() && !opcionalCategoria.get().isEliminado()) {
                    Categoria categoriaAModificar = opcionalCategoria.get();
                    System.out.println("Valores actuales: ");
                    System.out.println("Nombre actual: " + categoriaAModificar.getNombre());
                    System.out.println("Descripción actual: " + categoriaAModificar.getDescripcion());
                    
                    System.out.print("Escriba el nuevo nombre o presione Enter para dejar el actual: ");
                    String nuevoNombre = sc.nextLine();
                    if (!nuevoNombre.trim().isEmpty()) {
                        categoriaAModificar.setNombre(nuevoNombre);
                    }
                    
                    System.out.print("Escriba la nueva descripción o presione Enter para dejar la actual: ");
                    String nuevaDescripcion = sc.nextLine();
                    if (!nuevaDescripcion.trim().isEmpty()) {
                        categoriaAModificar.setDescripcion(nuevaDescripcion);
                    }
                    categoriaRepo.guardar(categoriaAModificar);
                    System.out.println("Categoría modificada correctamente.");
                } else {
                    System.out.println("No se encontró ninguna categoría activa con ese ID.");
                }
                break;

            case "4":
                List<Categoria> categoriasActivas = categoriaRepo.listarActivos();
                if (categoriasActivas.isEmpty()) {
                    System.out.println("No hay categorías activas registradas en el sistema.");
                } else {
                    for (Categoria c: categoriasActivas) {
                        System.out.println("ID: " + c.getId() + " | Nombre: " + c.getNombre() + " | Desc: " + c.getDescripcion());
                    }
                }
                break;

            default:
                System.out.println("Opción no válida.");
        }
    }

    // 2. Submenú Productos
    private static void menuProductos() {
        System.out.println("------------------------------------------");
        System.out.println("1. Alta de Producto");
        System.out.println("2. Baja de Producto");
        System.out.println("3. Modificación de Producto");
        System.out.println("4. Listado de Productos activos");
        System.out.println("------------------------------------------");
        System.out.print("Elige una opción: ");
        String opcion = sc.nextLine();

        switch (opcion) {
            case "1":
                List<Categoria> categoriasDisponibles = categoriaRepo.listarActivos();
                if (categoriasDisponibles.isEmpty()) {
                    System.out.println("No hay categorías activas en el sistema. Debe crear una categoría primero.");
                    break;
                }
                System.out.println("Categorías disponibles:");
                for (Categoria c : categoriasDisponibles) {
                    System.out.println("ID: " + c.getId() + " - " + c.getNombre());
                }
                System.out.print("Ingrese el ID de la categoría elegida: ");
                Long idCatElegida = Long.parseLong(sc.nextLine());
                Optional<Categoria> catOpcional = categoriaRepo.buscarPorId(idCatElegida);
                
                if (catOpcional.isPresent() && !catOpcional.get().isEliminado()) {
                    System.out.print("Escriba el nombre del producto: ");
                    String prodNombre = sc.nextLine();
                    System.out.print("Escriba la descripción del producto: ");
                    String prodDesc = sc.nextLine();
                    System.out.print("Escriba el precio: ");
                    Double prodPrecio = Double.parseDouble(sc.nextLine());
                    System.out.print("Escriba el stock: ");
                    int prodStock = Integer.parseInt(sc.nextLine());

                    if (prodPrecio <= 0 || prodStock < 0) {
                        System.out.println("El precio debe ser > 0 y stock >= 0. Operación cancelada.");
                        break;
                    }
                    Producto nuevoProducto = new Producto();
                    nuevoProducto.setNombre(prodNombre);
                    nuevoProducto.setDescripcion(prodDesc);
                    nuevoProducto.setPrecio(prodPrecio);
                    nuevoProducto.setStock(prodStock);
                    nuevoProducto.setCategoria(catOpcional.get());
                    nuevoProducto.setDisponible(true);

                    try {
                        nuevoProducto = productoRepo.guardar(nuevoProducto);
                        System.out.println("Producto guardado exitosamente. ID: " + nuevoProducto.getId());
                    } catch (Exception e) {
                        System.out.println("Error al guardar el producto en la base de datos.");
                    }
                } else {
                    System.out.println("El ID de categoría ingresado no es válido.");
                }
                break;

            case "2":
                System.out.print("Ingrese el ID del producto para la baja del mismo: ");
                Long idBaja = Long.parseLong(sc.nextLine());
                Optional<Producto> prodOpcional = productoRepo.buscarPorId(idBaja);
                if (prodOpcional.isPresent() && !prodOpcional.get().isEliminado()) {
                    if (productoRepo.eliminarLogico(idBaja)) {
                        System.out.println("El producto " + prodOpcional.get().getNombre() + " ha sido eliminado correctamente.");
                    }
                } else {
                    System.out.println("No se encontró ningún producto activo con ese ID.");
                }
                break;

            case "3":
                List<Producto> productosActivos = productoRepo.listarActivos();
                if (productosActivos.isEmpty()) {
                    System.out.println("No hay productos activos en el sistema.");
                    break;
                }
                System.out.println("Productos disponibles:");
                for (Producto p : productosActivos) {
                    System.out.println("ID: " + p.getId() + " - " + p.getNombre());
                }
                System.out.print("Ingrese el ID del producto para la modificación: ");
                Long idModificacion = Long.parseLong(sc.nextLine());
                Optional<Producto> opcionalProducto = productoRepo.buscarPorId(idModificacion);
                
                if (opcionalProducto.isPresent() && !opcionalProducto.get().isEliminado()) {
                    Producto prod = opcionalProducto.get();
                    System.out.println("Nombre actual: " + prod.getNombre());
                    System.out.println("Precio actual: " + prod.getPrecio());
                    System.out.println("Stock actual: " + prod.getStock());

                    System.out.print("Nuevo nombre (Enter para omitir): ");
                    String nuevoNombre = sc.nextLine();
                    if (!nuevoNombre.trim().isEmpty()) prod.setNombre(nuevoNombre);

                    System.out.print("Nuevo precio (Enter para omitir): ");
                    String precioStr = sc.nextLine();
                    if (!precioStr.trim().isEmpty()) {
                        double nuevoPrecio = Double.parseDouble(precioStr);
                        if (nuevoPrecio > 0) prod.setPrecio(nuevoPrecio);
                        else System.out.println("Precio inválido. Se conserva el anterior.");
                    }

                    System.out.print("Nuevo stock (Enter para omitir): ");
                    String stockStr = sc.nextLine();
                    if (!stockStr.trim().isEmpty()) {
                        int nuevoStock = Integer.parseInt(stockStr);
                        if (nuevoStock >= 0) prod.setStock(nuevoStock);
                        else System.out.println("Stock inválido. Se conserva el anterior.");
                    }
                    productoRepo.guardar(prod);
                    System.out.println("Producto modificado correctamente.");
                } else {
                    System.out.println("Producto no válido.");
                }
                break;

            case "4":
                List<Producto> listaProductos = productoRepo.listarActivos();
                if (listaProductos.isEmpty()) {
                    System.out.println("No hay productos activos.");
                } else {
                    for (Producto p: listaProductos) {
                        System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock() + " | Cat: " + p.getCategoria().getNombre());
                    }
                }
                break;
            default:
                System.out.println("Opción no válida.");
        }
    }

    // 3. Submenú Usuarios
    private static void menuUsuarios() {
        System.out.println("------------------------------------------");
        System.out.println("1. Alta de Usuario");
        System.out.println("2. Modificación de Usuario");
        System.out.println("3. Baja de Usuario");
        System.out.println("4. Listado de Usuarios activos");
        System.out.println("5. Buscar por mail");
        System.out.println("------------------------------------------");
        System.out.print("Elige una opción: ");
        String opcion = sc.nextLine();

        switch (opcion) {
            case "1":
                System.out.print("Nombre: "); String nombre = sc.nextLine();
                System.out.print("Apellido: "); String apellido = sc.nextLine();
                System.out.print("Mail: "); String mail = sc.nextLine();

                if (usuarioRepo.buscarPorMail(mail).isPresent()) {
                    System.out.println("Error: Ya existe un usuario activo con ese mail.");
                    break;
                }

                System.out.print("Celular: "); String celular = sc.nextLine();
                System.out.print("Contraseña: "); String pass = sc.nextLine();
                System.out.print("Rol (escriba ADMIN o USUARIO): ");
                String rolStr = sc.nextLine().toUpperCase();
                Rol rol = rolStr.equals("ADMIN") ? Rol.ADMIN : Rol.USUARIO;

                Usuario nuevoUsu = new Usuario();
                nuevoUsu.setNombre(nombre);
                nuevoUsu.setApellido(apellido);
                nuevoUsu.setMail(mail);
                nuevoUsu.setCelular(celular);
                nuevoUsu.setContrasena(pass);
                nuevoUsu.setRol(rol);

                try {
                    nuevoUsu = usuarioRepo.guardar(nuevoUsu);
                    System.out.println("Usuario guardado exitosamente. ID: " + nuevoUsu.getId());
                } catch (Exception e) {
                    System.out.println("Error al guardar en la base de datos.");
                }
                break;

            case "2":
                List<Usuario> activos = usuarioRepo.listarActivos();
                if (activos.isEmpty()) { System.out.println("No hay usuarios activos."); break; }
                activos.forEach(u -> System.out.println("ID: " + u.getId() + " - " + u.getNombre() + " " + u.getApellido()));

                System.out.print("Ingrese ID del usuario a modificar: ");
                Long idMod = Long.parseLong(sc.nextLine());
                Optional<Usuario> usuOpt = usuarioRepo.buscarPorId(idMod);
                
                if (usuOpt.isPresent() && !usuOpt.get().isEliminado()) {
                    Usuario u = usuOpt.get();
                    System.out.println("Nombre: " + u.getNombre() + " | Mail: " + u.getMail());

                    System.out.print("Nuevo nombre (Enter para omitir): ");
                    String nNombre = sc.nextLine();
                    if (!nNombre.trim().isEmpty()) u.setNombre(nNombre);

                    System.out.print("Nuevo apellido (Enter para omitir): ");
                    String nApellido = sc.nextLine();
                    if (!nApellido.trim().isEmpty()) u.setApellido(nApellido);

                    System.out.print("Nuevo mail (Enter para omitir): ");
                    String nMail = sc.nextLine();
                    if (!nMail.trim().isEmpty() && !nMail.equals(u.getMail())) {
                        if (usuarioRepo.buscarPorMail(nMail).isPresent()) {
                            System.out.println("Error: Mail en uso. Se conservará el anterior.");
                        } else {
                            u.setMail(nMail);
                        }
                    }

                    System.out.print("Nueva contraseña (Enter para omitir): ");
                    String nPass = sc.nextLine();
                    if (!nPass.trim().isEmpty()) u.setContrasena(nPass);

                    usuarioRepo.guardar(u);
                    System.out.println("Usuario modificado exitosamente.");
                } else {
                    System.out.println("Usuario no encontrado.");
                }
                break;

            case "3":
                System.out.print("Ingrese el ID del usuario para dar de baja: ");
                Long idBaja = Long.parseLong(sc.nextLine());
                Optional<Usuario> usuBajaOpt = usuarioRepo.buscarPorId(idBaja);
                if (usuBajaOpt.isPresent() && !usuBajaOpt.get().isEliminado()) {
                    if (usuarioRepo.eliminarLogico(idBaja)) {
                        System.out.println("Usuario " + usuBajaOpt.get().getNombre() + " eliminado.");
                    }
                } else {
                    System.out.println("Error: No se encontró usuario.");
                }
                break;

            case "4":
                List<Usuario> lista = usuarioRepo.listarActivos();
                if (lista.isEmpty()) System.out.println("No hay usuarios activos.");
                else lista.forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " | " + u.getMail() + " | " + u.getRol()));
                break;

            case "5":
                System.out.print("Ingrese mail a buscar: ");
                String mailBusqueda = sc.nextLine();
                Optional<Usuario> usuMail = usuarioRepo.buscarPorMail(mailBusqueda);
                if (usuMail.isPresent()) {
                    Usuario u = usuMail.get();
                    System.out.println("Usuario encontrado: ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " | Rol: " + u.getRol());
                } else {
                    System.out.println("No existe usuario activo con ese mail.");
                }
                break;

            default:
                System.out.println("Opción no válida.");
        }
    }

    // 4. Submenú Pedidos
    private static void menuPedidos() {
        System.out.println("------------------------------------------");
        System.out.println("1. Alta de Pedido");
        System.out.println("2. Cambiar estado");
        System.out.println("3. Baja lógica");
        System.out.println("4. Listado");
        System.out.println("------------------------------------------");
        System.out.print("Elige una opción: ");
        String opcion = sc.nextLine();

        switch (opcion) {
            case "1":
                List<Usuario> usuarios = usuarioRepo.listarActivos();
                if (usuarios.isEmpty()) {
                    System.out.println("No hay usuarios activos. Registre uno primero.");
                    break;
                }
                System.out.println("Usuarios disponibles:");
                usuarios.forEach(u -> System.out.println("ID: " + u.getId() + " - " + u.getNombre() + " " + u.getApellido()));
                System.out.print("Ingrese ID de Usuario: ");
                Long idUsu = Long.parseLong(sc.nextLine());

                System.out.println("Formas de pago: 1. TARJETA, 2. TRANSFERENCIA, 3. EFECTIVO");
                System.out.print("Seleccione forma de pago (1/2/3): ");
                String fp = sc.nextLine();
                FormaPago formaPago = fp.equals("1") ? FormaPago.TARJETA : (fp.equals("2") ? FormaPago.TRANSFERENCIA : FormaPago.EFECTIVO);

                List<long[]> itemsTemporales = new ArrayList<>();
                boolean agregando = true;

                while (agregando) {
                    List<Producto> prods = productoRepo.listarActivos();
                    System.out.println("\n--- Catálogo de Productos ---");
                    for (Producto p : prods) {
                        if (p.getDisponible()) {
                            System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock());
                        }
                    }
                    
                    System.out.print("Ingrese ID del producto: ");
                    Long idProd = Long.parseLong(sc.nextLine());

                    Optional<Producto> optProd = productoRepo.buscarPorId(idProd);
                    if (optProd.isEmpty() || optProd.get().isEliminado() || !optProd.get().getDisponible()) {
                        System.out.println("Error: Producto no válido o no disponible.");
                        continue;
                    }

                    System.out.print("Ingrese cantidad: ");
                    int cant = Integer.parseInt(sc.nextLine());

                    if (cant <= 0 || cant > optProd.get().getStock()) {
                        System.out.println("Error: Cantidad inválida o stock insuficiente (" + optProd.get().getStock() + " disponibles).");
                        continue;
                    }

                    itemsTemporales.add(new long[]{idProd, cant});

                    System.out.print("¿Desea agregar otro producto? (S/N): ");
                    if (sc.nextLine().equalsIgnoreCase("n")) {
                        agregando = false;
                    }
                }

                if (itemsTemporales.isEmpty()) {
                    System.out.println("Operación cancelada. El pedido debe tener al menos un producto.");
                    break;
                }

                EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
                EntityTransaction tx = em.getTransaction();
                
                try {
                    tx.begin();
                    Usuario usuarioPersistido = em.find(Usuario.class, idUsu);

                    Pedido nuevoPedido = new Pedido();
                    nuevoPedido.setUsuario(usuarioPersistido);
                    nuevoPedido.setFecha(java.time.LocalDate.now());
                    nuevoPedido.setEstado(EstadoPedido.PENDIENTE);
                    nuevoPedido.setFormaPago(formaPago);

                    for (long[] item : itemsTemporales) {
                        Long idProducto = item[0];
                        int cantidad = (int) item[1];

                        Producto p = em.find(Producto.class, idProducto);

                        if (p.getStock() < cantidad) {
                            throw new RuntimeException("Stock insuficiente para: " + p.getNombre());
                        }

                        nuevoPedido.addDetallePedido(cantidad, p);

                        p.setStock(p.getStock() - cantidad);
                    }

                    nuevoPedido.calcularTotal();
                    em.persist(nuevoPedido);
                    tx.commit();

                    System.out.println("¡Pedido guardado exitosamente!");
                    System.out.println("ID Generado: " + nuevoPedido.getId() + " | Total: $" + nuevoPedido.getTotal());

                } catch (Exception e) {
                    if (tx.isActive()) tx.rollback();
                    System.out.println("Error grave: Transacción cancelada (Rollback). " + e.getMessage());
                } finally {
                    em.close();
                }
                break;

            case "2":
                System.out.print("Ingrese ID del pedido a modificar: ");
                Long idMod = Long.parseLong(sc.nextLine());
                Optional<Pedido> optPed = pedidoRepo.buscarPorId(idMod);
                if (optPed.isPresent() && !optPed.get().isEliminado()) {
                    Pedido p = optPed.get();
                    System.out.println("Estado actual: " + p.getEstado());
                    System.out.println("Opciones: 1. PENDIENTE, 2. CONFIRMADO, 3. TERMINADO, 4. CANCELADO");
                    System.out.print("Seleccione nuevo estado: ");
                    String est = sc.nextLine();
                    
                    if (est.equals("1")) p.setEstado(EstadoPedido.PENDIENTE);
                    else if (est.equals("2")) p.setEstado(EstadoPedido.CONFIRMADO);
                    else if (est.equals("3")) p.setEstado(EstadoPedido.TERMINADO);
                    else if (est.equals("4")) p.setEstado(EstadoPedido.CANCELADO);

                    pedidoRepo.guardar(p);
                    System.out.println("Estado actualizado exitosamente.");
                } else {
                    System.out.println("Error: Pedido no encontrado o dado de baja.");
                }
                break;

            case "3":
                System.out.print("Ingrese el ID del pedido para dar de baja: ");
                Long idBaja = Long.parseLong(sc.nextLine());
                Optional<Pedido> pedBajaOpt = pedidoRepo.buscarPorId(idBaja);
                if (pedBajaOpt.isPresent() && !pedBajaOpt.get().isEliminado()) {
                    if (pedidoRepo.eliminarLogico(idBaja)) {
                        System.out.println("Pedido #" + idBaja + " eliminado correctamente. (Total: $" + pedBajaOpt.get().getTotal() + ")");
                    }
                } else {
                    System.out.println("Error: No se encontró pedido activo con ese ID.");
                }
                break;

            case "4":
                List<Pedido> listaPedidos = pedidoRepo.listarActivos();
                if (listaPedidos.isEmpty()) {
                    System.out.println("No hay pedidos registrados.");
                } else {
                    listaPedidos.forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() + " | Total: $" + p.getTotal()));
                }
                break;

            default:
                System.out.println("Opción no válida.");
        }
    }

    // 5. Submenú Reportes
    private static void menuReportes() {
        System.out.println("------------------------------------------");
        System.out.println("1. Productos por categoría");
        System.out.println("2. Pedidos por usuario");
        System.out.println("3. Pedidos por estado");
        System.out.println("4. Total facturado");
        System.out.println("------------------------------------------");
        System.out.print("Elige una opción: ");
        String opcion = sc.nextLine();

        switch (opcion) {
            case "1":
                List<Categoria> cats = categoriaRepo.listarActivos();
                if (cats.isEmpty()) {
                    System.out.println("No hay categorías activas.");
                    break;
                }
                cats.forEach(c -> System.out.println("ID: " + c.getId() + " - " + c.getNombre()));
                System.out.print("Ingrese ID de la Categoría: ");
                Long idCat = Long.parseLong(sc.nextLine());
                
                List<Producto> prods = productoRepo.buscarPorCategoria(idCat);
                if (prods.isEmpty()) {
                    System.out.println("No hay productos activos en esa categoría.");
                } else {
                    prods.forEach(p -> System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock()));
                }
                break;

            case "2":
                List<Usuario> usus = usuarioRepo.listarActivos();
                if (usus.isEmpty()) {
                    System.out.println("No hay usuarios registrados.");
                    break;
                }
                usus.forEach(u -> System.out.println("ID: " + u.getId() + " - " + u.getNombre() + " " + u.getApellido()));
                System.out.print("Ingrese ID del usuario: ");
                Long idU = Long.parseLong(sc.nextLine());
                
                List<Pedido> pUsus = pedidoRepo.buscarPorUsuario(idU);
                if (pUsus.isEmpty()) {
                    System.out.println("El usuario no tiene pedidos activos.");
                } else {
                    pUsus.forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() + " | Total: $" + p.getTotal()));
                }
                break;

            case "3":
                System.out.println("Estados: 1. PENDIENTE, 2. CONFIRMADO, 3. TERMINADO, 4. CANCELADO");
                System.out.print("Seleccione estado: ");
                String opE = sc.nextLine();
                EstadoPedido ep = opE.equals("1") ? EstadoPedido.PENDIENTE : (opE.equals("2") ? EstadoPedido.CONFIRMADO : (opE.equals("3") ? EstadoPedido.TERMINADO : EstadoPedido.CANCELADO));
                
                List<Pedido> pEst = pedidoRepo.buscarPorEstado(ep);
                if (pEst.isEmpty()) {
                    System.out.println("No hay pedidos con el estado " + ep);
                } else {
                    pEst.forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Usuario: " + p.getUsuario().getNombre() + " | Total: $" + p.getTotal()));
                }
                break;

            case "4":
                List<Pedido> terminados = pedidoRepo.buscarPorEstado(EstadoPedido.TERMINADO);
                double totalFacturado = terminados.stream().mapToDouble(Pedido::getTotal).sum();
                System.out.println("Total facturado: " + String.format(Locale.US, "$%.2f", totalFacturado));
                break;

            default:
                System.out.println("Opción inválida.");
        }
    }
}