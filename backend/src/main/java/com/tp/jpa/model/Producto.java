package com.tp.jpa.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Producto extends Base {

    @EqualsAndHashCode.Include
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "precio", nullable = false)
    private Double precio;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "stock", nullable = false)
    private int stock;

    @Column(name = "imagen")
    private String imagen;

    @Builder.Default
    @Column(name = "disponible")
    private Boolean disponible = Boolean.TRUE;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

}