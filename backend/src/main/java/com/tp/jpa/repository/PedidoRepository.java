package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.util.JPAUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.List;

/**
 * Repositorio de Pedido. Además del CRUD heredado implementa consultas por
 * usuario y por estado.
 */
public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    /**
     * Retorna los pedidos activos del usuario indicado.
     */
    public List<Pedido> buscarPorUsuario(Long idUsuario) {
            EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();

        try {
            // Consulta JPQL: Retorna todos los pedidos activos de un usuario activo buscando por su id.
            String jpql = "SELECT p FROM Pedido p WHERE p.usuario.id = :id AND p.eliminado = false";
            TypedQuery<Pedido> q = em.createQuery(jpql, Pedido.class);
            q.setParameter("id", idUsuario);

            return q.getResultList();
        } finally {
            em.close();
        }
    }

    /**
     * Retorna los pedidos activos que coinciden con el estado indicado.
     */
    public List<Pedido> buscarPorEstado(EstadoPedido estadoPedido) {
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            // Consulta JPQL: retorna todos los pedidos activos que coincidan con un estado específico.
            // Permite al administrador filtrar pedidos con estado PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO.
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            TypedQuery<Pedido> q = em.createQuery(jpql, Pedido.class);
            q.setParameter("estado", estadoPedido);
            
            return q.getResultList();
        } finally {
            em.close();
        }
    }
}
