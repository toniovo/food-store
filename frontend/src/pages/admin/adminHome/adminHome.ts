const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

document.addEventListener('DOMContentLoaded', async () => {
    if (!usuarioLogueado.id || usuarioLogueado.rol !== 'ADMIN') {
        alert('Acceso denegado. Se requiere rol de Administrador.');
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }

    document.getElementById('admin-user-name')!.textContent = `Hola, ${usuarioLogueado.nombre}`;
    
    await cargarEstadisticas();
});

async function cargarEstadisticas() {
    try {
        const [catRes, prodRes, pedRes] = await Promise.all([
            fetch('/data/categorias.json'),
            fetch('/data/productos.json'),
            fetch('/data/pedidos.json')
        ]);

        const categorias = await catRes.json();
        const productos = await prodRes.json();
        const pedidosHistoricos = await pedRes.json();
        const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
        const todosLosPedidos = [...pedidosHistoricos, ...pedidosLocales];

        document.getElementById('stat-categorias')!.textContent = categorias.length.toString();
        document.getElementById('stat-productos')!.textContent = productos.length.toString();
        document.getElementById('stat-pedidos')!.textContent = todosLosPedidos.length.toString();
        
        const disponibles = productos.filter((p: any) => p.disponible === true && p.eliminado === false).length;
        document.getElementById('stat-disponibles')!.textContent = disponibles.toString();

        const catActivas = categorias.filter((c: any) => c.eliminado === false).length;
        document.getElementById('resumen-cat-activas')!.textContent = `Activas: ${catActivas}`;
        document.getElementById('resumen-cat-inactivas')!.textContent = `Inactivas (Baja): ${categorias.length - catActivas}`;

        const prodActivos = productos.filter((p: any) => p.eliminado === false).length;
        document.getElementById('resumen-prod-activos')!.textContent = `Activos: ${prodActivos}`;
        document.getElementById('resumen-prod-inactivos')!.textContent = `Inactivos (Baja): ${productos.length - prodActivos}`;

        const estados = { PENDIENTE: 0, CONFIRMADO: 0, TERMINADO: 0, CANCELADO: 0 };
        todosLosPedidos.forEach((p: any) => {
            if (estados[p.estado as keyof typeof estados] !== undefined) {
                estados[p.estado as keyof typeof estados]++;
            }
        });

        const listaPedidos = document.getElementById('resumen-pedidos-lista')!;
        listaPedidos.innerHTML = `
            <li style="color: #d97706">Pendientes: <strong>${estados.PENDIENTE}</strong></li>
            <li style="color: #2563eb">Confirmados: <strong>${estados.CONFIRMADO}</strong></li>
            <li style="color: #059669">Terminados: <strong>${estados.TERMINADO}</strong></li>
            <li style="color: #dc2626">Cancelados: <strong>${estados.CANCELADO}</strong></li>
        `;

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}

document.getElementById('btn-logout')!.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/src/pages/auth/login/login.html';
});
