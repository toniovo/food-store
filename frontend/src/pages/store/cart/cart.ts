interface ItemCarrito {
    producto: any;
    cantidad: number;
    subtotal: number;
}

const ENVIO = 500;
let carrito: ItemCarrito[] = JSON.parse(localStorage.getItem('carrito') || '[]');
const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

const cartItemsContainer = document.getElementById('cart-items') as HTMLDivElement;
const subtotalEl = document.getElementById('resumen-subtotal') as HTMLSpanElement;
const totalEl = document.getElementById('resumen-total') as HTMLElement;
const btnVaciar = document.getElementById('btn-vaciar') as HTMLButtonElement;
const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement;

document.addEventListener('DOMContentLoaded', () => {
    if (!usuarioLogueado.id) {
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }
    renderizarCarrito();
});

function renderizarCarrito() {
    cartItemsContainer.innerHTML = '';
    
    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray" style="text-align:center; padding: 2rem;">Tu carrito está vacío. ¡Agrega algunos productos deliciosos!</p>';
        actualizarResumen();
        return;
    }

    carrito.forEach((item, index) => {
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.producto.nombre}</h4>
                    <p class="text-gray">$${item.producto.precio.toFixed(2)} c/u</p>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-circulo" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <span class="cantidad-texto">${item.cantidad}</span>
                    <button class="btn-circulo" onclick="cambiarCantidad(${index}, 1)">+</button>
                    
                    <strong class="item-subtotal">$${item.subtotal.toFixed(2)}</strong>
                    
                    <button class="btn-eliminar" onclick="eliminarItem(${index})" title="Eliminar producto">🗑️</button>
                </div>
            </div>
        `;
    });
    
    actualizarResumen();
}

(window as any).cambiarCantidad = (index: number, cambio: number) => {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad > 0 && nuevaCantidad <= item.producto.stock) {
        item.cantidad = nuevaCantidad;
        item.subtotal = item.cantidad * item.producto.precio;
        guardarYRenderizar();
    } else if (nuevaCantidad > item.producto.stock) {
        alert(`Solo hay ${item.producto.stock} unidades disponibles de ${item.producto.nombre}.`);
    }
};

(window as any).eliminarItem = (index: number) => {
    carrito.splice(index, 1);
    guardarYRenderizar();
};

btnVaciar.addEventListener('click', () => {
    carrito = [];
    guardarYRenderizar();
});

function guardarYRenderizar() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
}

function actualizarResumen() {
    const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    subtotalEl.textContent = subtotal.toFixed(2);
    
    if (carrito.length > 0) {
        const total = subtotal + ENVIO;
        totalEl.textContent = total.toFixed(2);
    } else {
        totalEl.textContent = "0.00";
    }
}

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
        alert("Agrega productos al carrito antes de confirmar.");
        return;
    }

    const formaPago = (document.getElementById('forma-pago') as HTMLSelectElement).value;
    const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    const totalPedido = subtotal + ENVIO;

    const nuevoPedido = {
        id: Date.now(),
        fecha: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE',
        total: totalPedido,
        formaPago: formaPago,
        idUsuario: usuarioLogueado.id,
        detalles: carrito.map(item => ({
            idProducto: item.producto.id,
            cantidad: item.cantidad,
            subtotal: item.subtotal
        }))
    };

    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
    pedidosLocales.push(nuevoPedido);
    localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));

    localStorage.removeItem('carrito');
    
    alert(`¡Pedido confirmado con éxito! Total a pagar: $${totalPedido.toFixed(2)}`);
    
    window.location.href = '/src/pages/client/orders/orders.html';
});