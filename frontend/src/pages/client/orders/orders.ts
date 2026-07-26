const ordersContainer = document.getElementById('orders-container') as HTMLDivElement;
const modalDetalle = document.getElementById('modal-detalle') as HTMLDialogElement;
const modalContenido = document.getElementById('modal-contenido') as HTMLDivElement;
const modalTitulo = document.getElementById('modal-titulo') as HTMLHeadingElement;
const btnCerrarModal = document.getElementById('btn-cerrar-modal') as HTMLButtonElement;

const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

document.addEventListener('DOMContentLoaded', async () => {
    if (!usuarioLogueado.id) {
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }
    await cargarPedidos();
});

async function cargarPedidos() {
    try {
        const response = await fetch('/data/pedidos.json');
        const pedidosJson = response.ok ? await response.json() : [];
        
        const pedidosHistoricos = pedidosJson.filter((p: any) => p.idUsuario === usuarioLogueado.id);

        const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
        const misPedidosLocales = pedidosLocales.filter((p: any) => p.idUsuario === usuarioLogueado.id);

        const todosMisPedidos = [...misPedidosLocales, ...pedidosHistoricos].sort((a, b) => b.id - a.id);

        renderizarPedidos(todosMisPedidos);
    } catch (error) {
        console.error("Error cargando pedidos:", error);
        ordersContainer.innerHTML = '<p>Ocurrió un error al cargar el historial.</p>';
    }
}

function renderizarPedidos(pedidos: any[]) {
    ordersContainer.innerHTML = '';

    if (pedidos.length === 0) {
        ordersContainer.innerHTML = '<p class="text-gray text-center" style="padding: 2rem;">Aún no tienes pedidos registrados.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const claseBadge = obtenerClaseEstado(pedido.estado);
        const fecha = Array.isArray(pedido.fecha) ? pedido.fecha.join('-') : pedido.fecha;

        const resumenProductos = pedido.detalles.slice(0, 3).map((d: any) => 
            `<li class="resumen-item">📦 Producto ID ${d.idProducto} (x${d.cantidad})</li>`
        ).join('');

        const card = document.createElement('div');
        card.className = "pedido-card";
        card.innerHTML = `
            <div class="pedido-card-header">
                <div>
                    <h3 class="pedido-id">Pedido #${pedido.id}</h3>
                    <small class="pedido-fecha">📅 ${fecha}</small>
                </div>
                <span class="badge ${claseBadge}">${pedido.estado}</span>
            </div>
            <ul class="pedido-resumen-lista">
                ${resumenProductos}
                ${pedido.detalles.length > 3 ? `<li class="resumen-item text-gray">... y ${pedido.detalles.length - 3} más</li>` : ''}
            </ul>
            <div class="pedido-card-footer">
                <h3 class="pedido-total">$${pedido.total.toFixed(2)}</h3>
            </div>
        `;

        card.addEventListener('click', () => abrirModal(pedido, fecha, claseBadge));
        ordersContainer.appendChild(card);
    });
}

function abrirModal(pedido: any, fecha: string, claseBadge: string) {
    modalTitulo.textContent = `Pedido #${pedido.id}`;
    
    let detallesHtml = pedido.detalles.map((d: any) => `
        <div class="modal-fila-producto">
            <span>Producto ID ${d.idProducto} (x${d.cantidad})</span>
            <strong>$${d.subtotal.toFixed(2)}</strong>
        </div>
    `).join('');

    modalContenido.innerHTML = `
        <div class="modal-info-basica">
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Forma de pago:</strong> ${pedido.formaPago}</p>
            <p><strong>Estado:</strong> <span class="badge ${claseBadge}">${pedido.estado}</span></p>
        </div>
        <div class="modal-productos">
            <h4 style="margin-top:0; color:#333;">Productos incluidos:</h4>
            ${detallesHtml}
        </div>
        <div class="modal-total">
            <h3>Total Pagado:</h3>
            <h3 class="color-destacado">$${pedido.total.toFixed(2)}</h3>
        </div>
    `;

    modalDetalle.showModal();
}

btnCerrarModal.addEventListener('click', () => {
    modalDetalle.close();
});

function obtenerClaseEstado(estado: string): string {
    switch(estado.toUpperCase()) {
        case 'PENDIENTE': return 'badge-pendiente';
        case 'CONFIRMADO': return 'badge-confirmado';
        case 'TERMINADO': return 'badge-terminado';
        case 'CANCELADO': return 'badge-cancelado';
        default: return 'badge-pendiente';
    }
}
