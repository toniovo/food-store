interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen: string;
    disponible: boolean;
    categoria: { id: number, nombre: string, descripcion: string };
}

interface ItemCarrito {
    producto: Producto;
    cantidad: number;
    subtotal: number;
}

let productoActual: Producto | null = null;
let cantidadSeleccionada = 1;

const imgEl = document.getElementById('detalle-imagen') as HTMLImageElement;
const nombreEl = document.getElementById('detalle-nombre') as HTMLHeadingElement;
const descEl = document.getElementById('detalle-desc') as HTMLParagraphElement;
const precioEl = document.getElementById('detalle-precio') as HTMLHeadingElement;
const stockEl = document.getElementById('detalle-stock') as HTMLElement;
const inputCantidad = document.getElementById('input-cantidad') as HTMLInputElement;
const btnSumar = document.getElementById('btn-sumar') as HTMLButtonElement;
const btnRestar = document.getElementById('btn-restar') as HTMLButtonElement;
const btnAgregar = document.getElementById('btn-agregar-carrito') as HTMLButtonElement;
const cartCount = document.getElementById('cart-count') as HTMLSpanElement;

document.addEventListener('DOMContentLoaded', async () => {
    actualizarContadorCarrito();

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (!idParam) {
        alert("Producto no encontrado");
        window.location.href = '/src/pages/store/home/home.html';
        return;
    }

    try {
        const response = await fetch('/data/productos.json');
        const productos: Producto[] = await response.json();
        
        productoActual = productos.find(p => p.id === parseInt(idParam)) || null;

        if (!productoActual) {
            alert("Producto no encontrado en la base de datos");
            return;
        }

        renderizarDetalle();
    } catch (error) {
        console.error("Error al cargar el producto:", error);
    }
});

function renderizarDetalle() {
    if (!productoActual) return;

    imgEl.src = productoActual.imagen;
    nombreEl.textContent = productoActual.nombre;
    descEl.textContent = productoActual.descripcion;
    precioEl.textContent = `$${productoActual.precio.toFixed(2)}`;
    stockEl.textContent = productoActual.stock.toString();

    if (!productoActual.disponible || productoActual.stock === 0) {
        btnAgregar.disabled = true;
        btnAgregar.textContent = "Sin Stock / No Disponible";
        btnAgregar.style.background = "gray";
        inputCantidad.value = "0";
        btnSumar.disabled = true;
        btnRestar.disabled = true;
    }
}

btnSumar.addEventListener('click', () => {
    if (productoActual && cantidadSeleccionada < productoActual.stock) {
        cantidadSeleccionada++;
        inputCantidad.value = cantidadSeleccionada.toString();
    }
});

btnRestar.addEventListener('click', () => {
    if (cantidadSeleccionada > 1) {
        cantidadSeleccionada--;
        inputCantidad.value = cantidadSeleccionada.toString();
    }
});

btnAgregar.addEventListener('click', () => {
    if (!productoActual) return;

    let carrito: ItemCarrito[] = JSON.parse(localStorage.getItem('carrito') || '[]');

    const itemExistente = carrito.find(item => item.producto.id === productoActual!.id);

    if (itemExistente) {
        if (itemExistente.cantidad + cantidadSeleccionada > productoActual.stock) {
            alert(`No puedes agregar más. Solo quedan ${productoActual.stock} en stock.`);
            return;
        }
        itemExistente.cantidad += cantidadSeleccionada;
        itemExistente.subtotal = itemExistente.cantidad * productoActual.precio;
    } else {
        carrito.push({
            producto: productoActual,
            cantidad: cantidadSeleccionada,
            subtotal: cantidadSeleccionada * productoActual.precio
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    alert(`¡Se agregaron ${cantidadSeleccionada} ${productoActual.nombre} al carrito!`);
    actualizarContadorCarrito();
    
    cantidadSeleccionada = 1;
    inputCantidad.value = "1";
});

function actualizarContadorCarrito() {
    const carrito: ItemCarrito[] = JSON.parse(localStorage.getItem('carrito') || '[]');
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartCount.textContent = totalItems.toString();
}