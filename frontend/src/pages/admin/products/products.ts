interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    eliminado?: boolean;
}

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen: string;
    disponible: boolean;
    eliminado?: boolean;
    categoria: { id: number, nombre: string, descripcion: string };
}

let productos: Producto[] = [];
let categorias: Categoria[] = [];
const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

const tbody = document.getElementById('productos-tbody') as HTMLTableSectionElement;
const selectCategoria = document.getElementById('prod-categoria') as HTMLSelectElement;
const modal = document.getElementById('modal-producto') as HTMLDialogElement;
const form = document.getElementById('producto-form') as HTMLFormElement;
const btnNuevo = document.getElementById('btn-nuevo-prod') as HTMLButtonElement;
const btnCerrarModal = document.getElementById('btn-cerrar-modal') as HTMLButtonElement;
const tituloModal = document.getElementById('modal-titulo') as HTMLHeadingElement;

async function init() {
    // Validar acceso ADMIN
    if (!usuarioLogueado.id || usuarioLogueado.rol !== 'ADMIN') {
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }
    await cargarDatos();
}

async function cargarDatos() {
    try {
        if (productos.length === 0 || categorias.length === 0) {
            const [prodRes, catRes] = await Promise.all([
                fetch('/data/productos.json'),
                fetch('/data/categorias.json')
            ]);
            
            productos = await prodRes.json();
            categorias = await catRes.json();
        }
        cargarSelectCategorias();
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function cargarSelectCategorias() {
    selectCategoria.innerHTML = '<option value="">-- Seleccione una categoría --</option>';
    const activas = categorias.filter(c => c.eliminado !== true);
    activas.forEach(cat => {
        selectCategoria.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
    });
}

function renderizarTabla() {
    tbody.innerHTML = '';
    
    const activos = productos.filter(p => p.eliminado !== true);

    if (activos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">No hay productos registrados.</td></tr>';
        return;
    }

    activos.forEach(prod => {
        const badgeDisp = prod.disponible 
            ? '<span class="badge" style="background:#10b981; color:white;">Disponible</span>' 
            : '<span class="badge" style="background:#ef4444; color:white;">Agotado</span>';

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 1rem;">${prod.id}</td>
                <td style="padding: 1rem;">
                    <img src="${prod.imagen || 'https://via.placeholder.com/50'}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                </td>
                <td style="padding: 1rem; font-weight: bold;">${prod.nombre}</td>
                <td style="padding: 1rem; color: #666;">${prod.categoria.nombre}</td>
                <td style="padding: 1rem; color: #e65100; font-weight: bold;">$${prod.precio.toFixed(2)}</td>
                <td style="padding: 1rem;">${prod.stock}</td>
                <td style="padding: 1rem;">${badgeDisp}</td>
                <td style="padding: 1rem; text-align: right; min-width: 180px;">
                    <button class="btn-base btn-outline" onclick="editarProducto(${prod.id})" style="margin-right: 5px;">✏️</button>
                    <button class="btn-base btn-danger" onclick="eliminarProducto(${prod.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

btnNuevo.addEventListener('click', () => {
    form.reset();
    (document.getElementById('prod-id') as HTMLInputElement).value = '';
    tituloModal.textContent = 'Nuevo Producto';
    
    // Validar que existan categorías activas antes de crear (Exigencia FHU-09)
    const categoriasActivas = categorias.filter(c => c.eliminado !== true);
    if (categoriasActivas.length === 0) {
        alert("No hay categorías activas en el sistema. Debe crear una categoría primero.");
        return;
    }
    
    modal.showModal();
});

btnCerrarModal.addEventListener('click', () => modal.close());

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const idInput = (document.getElementById('prod-id') as HTMLInputElement).value;
    const nombre = (document.getElementById('prod-nombre') as HTMLInputElement).value;
    const desc = (document.getElementById('prod-desc') as HTMLTextAreaElement).value;
    const precioStr = (document.getElementById('prod-precio') as HTMLInputElement).value;
    const stockStr = (document.getElementById('prod-stock') as HTMLInputElement).value;
    const catId = selectCategoria.value;
    const img = (document.getElementById('prod-img') as HTMLInputElement).value;
    const disponible = (document.getElementById('prod-disponible') as HTMLInputElement).checked;

    const categoriaAsignada = categorias.find(c => c.id === parseInt(catId));

    if (idInput) {
        const index = productos.findIndex(p => p.id === parseInt(idInput));
        if (index !== -1) {
            let p = productos[index];
            
            if (nombre.trim() !== '') p.nombre = nombre;
            if (desc.trim() !== '') p.descripcion = desc;
            if (img.trim() !== '') p.imagen = img;
            if (categoriaAsignada) p.categoria = { id: categoriaAsignada.id, nombre: categoriaAsignada.nombre, descripcion: categoriaAsignada.descripcion };
            
            p.disponible = disponible;

            if (precioStr.trim() !== '') {
                const nuevoPrecio = parseFloat(precioStr);
                if (nuevoPrecio > 0) p.precio = nuevoPrecio;
                else alert("Precio inválido. Se conservará el anterior.");
            }

            if (stockStr.trim() !== '') {
                const nuevoStock = parseInt(stockStr);
                if (nuevoStock >= 0) p.stock = nuevoStock;
                else alert("Stock inválido. Se conservará el anterior.");
            }
        }
    } else {
        if (nombre.trim() === '') { alert("El nombre es obligatorio"); return; }
        
        const precio = parseFloat(precioStr);
        const stock = parseInt(stockStr);

        if (isNaN(precio) || precio <= 0) { alert("El precio debe ser mayor a 0"); return; }
        if (isNaN(stock) || stock < 0) { alert("El stock no puede ser negativo"); return; }
        if (!categoriaAsignada) { alert("Debe seleccionar una categoría válida"); return; }

        const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
        
        productos.push({
            id: nuevoId,
            nombre: nombre,
            descripcion: desc,
            precio: precio,
            stock: stock,
            imagen: img,
            disponible: disponible,
            eliminado: false,
            categoria: { id: categoriaAsignada.id, nombre: categoriaAsignada.nombre, descripcion: categoriaAsignada.descripcion }
        });
    }

    modal.close();
    renderizarTabla();
});

(window as any).editarProducto = (id: number) => {
    const prod = productos.find(p => p.id === id);
    if (prod) {
        form.reset(); 
        
        (document.getElementById('prod-id') as HTMLInputElement).value = prod.id.toString();
        selectCategoria.value = prod.categoria.id.toString();
        (document.getElementById('prod-disponible') as HTMLInputElement).checked = prod.disponible;
        
        (document.getElementById('prod-nombre') as HTMLInputElement).placeholder = prod.nombre;
        (document.getElementById('prod-desc') as HTMLTextAreaElement).placeholder = prod.descripcion;
        (document.getElementById('prod-precio') as HTMLInputElement).placeholder = prod.precio.toString();
        (document.getElementById('prod-stock') as HTMLInputElement).placeholder = prod.stock.toString();

        tituloModal.textContent = `Editar: ${prod.nombre}`;
        modal.showModal();
    }
};

(window as any).eliminarProducto = (id: number) => {
    const prod = productos.find(p => p.id === id);
    if (prod && confirm(`¿Seguro que quieres dar de baja el producto "${prod.nombre}"?`)) {
        prod.eliminado = true;
        renderizarTabla();
    }
};

document.getElementById('btn-logout')!.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/src/pages/auth/login/login.html';
});

init();