package com.tp.jpa.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "detalles_pedido")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true, exclude = {"pedido"}) 
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class DetallePedido extends Base {

    @Column(name = "cantidad", nullable = false)
    private int cantidad; 

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    @EqualsAndHashCode.Include
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    public void calcularSubtotal() {
        if (this.producto != null && this.cantidad > 0) {
            this.subtotal = this.producto.getPrecio() * this.cantidad;
        }
    }
}