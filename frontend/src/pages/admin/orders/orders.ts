interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    mail: string;
}

interface Pedido {
    id: number;
    fecha: string | string[];
    estado: string;
    total: number;
    formaPago: string;
    idUsuario: number;
    detalles: any[];
}

let pedidosTotales: Pedido[] = [];
let usuariosTotales: Usuario[] = [];
let pedidoActualSeleccionado: Pedido | null = null;
const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

const container = document.getElementById('pedidos-admin-container') as HTMLDivElement;
const filtroSelect = document.getElementById('filtro-estado') as HTMLSelectElement;
const modal = document.getElementById('modal-pedido-admin') as HTMLDialogElement;
const btnCerrarModal = document.getElementById('btn-cerrar-modal') as HTMLButtonElement;
const modalTitulo = document.getElementById('modal-titulo') as HTMLHeadingElement;
const modalContenido = document.getElementById('modal-contenido') as HTMLDivElement;
const selectNuevoEstado = document.getElementById('select-nuevo-estado') as HTMLSelectElement;
const btnActualizarEstado = document.getElementById('btn-actualizar-estado') as HTMLButtonElement;

async function init() {
    if (!usuarioLogueado.id || usuarioLogueado.rol !== 'ADMIN') {
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }
    await cargarDatos();
}

async function cargarDatos() {
    try {
        const [pedRes, usuRes] = await Promise.all([
            fetch('/data/pedidos.json'),
            fetch('/data/usuarios.json')
        ]);

        const pedidosHistoricos = await pedRes.json();
        usuariosTotales = await usuRes.json();

        const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
        
        pedidosTotales = [...pedidosHistoricos, ...pedidosLocales].sort((a, b) => b.id - a.id);

        renderizarPedidos();
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

function renderizarPedidos() {
    container.innerHTML = '';
    const filtro = filtroSelect.value;

    let pedidosFiltrados = pedidosTotales;
    if (filtro !== 'TODOS') {
        pedidosFiltrados = pedidosTotales.filter(p => p.estado.toUpperCase() === filtro);
    }

    if (pedidosFiltrados.length === 0) {
        container.innerHTML = `<p class="text-center" style="padding: 2rem;">No hay pedidos registrados con estado ${filtro}.</p>`;
        return;
    }

    pedidosFiltrados.forEach(pedido => {
        const claseBadge = obtenerClaseEstado(pedido.estado);
        const nombreCliente = obtenerNombreCliente(pedido.idUsuario);
        const fecha = Array.isArray(pedido.fecha) ? pedido.fecha.join('-') : pedido.fecha;

        const card = document.createElement('div');
        card.className = "pedido-card";
        card.innerHTML = `
            <div class="pedido-card-header">
                <div>
                    <h3 class="pedido-id">Pedido #${pedido.id}</h3>
                    <p style="margin: 0 0 5px 0; color: #4b5563;"><strong>Cliente:</strong> ${nombreCliente}</p>
                    <small class="pedido-fecha">📅 ${fecha}</small>
                </div>
                <span class="badge ${claseBadge}">${pedido.estado}</span>
            </div>
            <div class="pedido-card-footer">
                <p style="margin: 0; color: #666;">${pedido.detalles.length} tipo(s) de producto(s)</p>
                <h3 class="pedido-total">$${pedido.total.toFixed(2)}</h3>
            </div>
        `;

        card.addEventListener('click', () => abrirModal(pedido, fecha, nombreCliente));
        container.appendChild(card);
    });
}

function obtenerNombreCliente(idUsuario: number): string {
    const user = usuariosTotales.find(u => u.id === idUsuario);
    return user ? `${user.nombre} ${user.apellido}` : 'Cliente Desconocido';
}

function abrirModal(pedido: Pedido, fecha: string, nombreCliente: string) {
    pedidoActualSeleccionado = pedido;
    modalTitulo.textContent = `Detalle del Pedido #${pedido.id}`;
    
    let detallesHtml = pedido.detalles.map((d: any) => `
        <div class="modal-fila-producto">
            <span>Prod ID ${d.idProducto} (x${d.cantidad})</span>
            <strong>$${d.subtotal.toFixed(2)}</strong>
        </div>
    `).join('');

    modalContenido.innerHTML = `
        <div class="modal-info-basica">
            <p><strong>Cliente:</strong> ${nombreCliente}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Forma de pago:</strong> ${pedido.formaPago}</p>
        </div>
        <div class="modal-productos">
            <h4 style="margin-top:0; color:#333;">Productos:</h4>
            ${detallesHtml}
        </div>
        <div class="modal-total" style="border-top: none; margin-top: 0;">
            <h3>Total:</h3>
            <h3 class="color-destacado">$${pedido.total.toFixed(2)}</h3>
        </div>
    `;

    selectNuevoEstado.value = pedido.estado.toUpperCase();
    modal.showModal();
}

btnActualizarEstado.addEventListener('click', () => {
    if (!pedidoActualSeleccionado) return;

    const nuevoEstado = selectNuevoEstado.value;
    pedidoActualSeleccionado.estado = nuevoEstado;

    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
    const indexLocal = pedidosLocales.findIndex((p: any) => p.id === pedidoActualSeleccionado!.id);
    if (indexLocal !== -1) {
        pedidosLocales[indexLocal].estado = nuevoEstado;
        localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));
    }

    modal.close();
    renderizarPedidos();
    alert(`El pedido #${pedidoActualSeleccionado.id} ahora está en estado: ${nuevoEstado}`);
});

filtroSelect.addEventListener('change', renderizarPedidos);

btnCerrarModal.addEventListener('click', () => modal.close());

document.getElementById('btn-logout')!.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/src/pages/auth/login/login.html';
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

init();
