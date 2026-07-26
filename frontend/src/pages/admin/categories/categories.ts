interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string;
    eliminado: boolean;
}

let categorias: Categoria[] = [];
const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

const tbody = document.getElementById('categorias-tbody') as HTMLTableSectionElement;
const modal = document.getElementById('modal-categoria') as HTMLDialogElement;
const form = document.getElementById('categoria-form') as HTMLFormElement;
const btnNueva = document.getElementById('btn-nueva-cat') as HTMLButtonElement;
const btnCerrarModal = document.getElementById('btn-cerrar-modal') as HTMLButtonElement;
const tituloModal = document.getElementById('modal-titulo') as HTMLHeadingElement;

async function init() {
    if (!usuarioLogueado.id || usuarioLogueado.rol !== 'ADMIN') {
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }
    await cargarCategorias();
}

init();

async function cargarCategorias() {
    try {
        if (categorias.length === 0) {
            const response = await fetch('/data/categorias.json')
            categorias = await response.json();
        }
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

function renderizarTabla() {
    tbody.innerHTML = '';
    
    const activas = categorias.filter(c => c.eliminado !== true);

    if (activas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay categorías registradas.</td></tr>';
        return;
    }

    activas.forEach(cat => {
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 1rem;">${cat.id}</td>
                <td style="padding: 1rem;">
                    <img src="${cat.imagen || 'https://via.placeholder.com/50'}" alt="${cat.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                </td>
                <td style="padding: 1rem; font-weight: bold;">${cat.nombre}</td>
                <td style="padding: 1rem; color: #666;">${cat.descripcion}</td>
                <td style="padding: 1rem; text-align: right;">
                    <button class="btn-base btn-outline" onclick="editarCategoria(${cat.id})" style="margin-right: 5px;">✏️ Editar</button>
                    <button class="btn-base btn-danger" onclick="eliminarCategoria(${cat.id})">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
}

btnNueva.addEventListener('click', () => {
    form.reset();
    (document.getElementById('cat-id') as HTMLInputElement).value = '';
    tituloModal.textContent = 'Nueva Categoría';
    modal.showModal();
});

btnCerrarModal.addEventListener('click', () => modal.close());

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const idInput = (document.getElementById('cat-id') as HTMLInputElement).value;
    const nombre = (document.getElementById('cat-nombre') as HTMLInputElement).value;
    const desc = (document.getElementById('cat-desc') as HTMLTextAreaElement).value;
    const img = (document.getElementById('cat-img') as HTMLInputElement).value;

    if (idInput) {
        const index = categorias.findIndex(c => c.id === parseInt(idInput));
        if (index !== -1) {
            categorias[index].nombre = nombre;
            categorias[index].descripcion = desc;
            categorias[index].imagen = img;
        }
    } else {
        const nuevoId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1;
        categorias.push({
            id: nuevoId,
            nombre: nombre,
            descripcion: desc,
            imagen: img,
            eliminado: false
        });
    }

    modal.close();
    renderizarTabla();
});

(window as any).editarCategoria = (id: number) => {
    const cat = categorias.find(c => c.id === id);
    if (cat) {
        (document.getElementById('cat-id') as HTMLInputElement).value = cat.id.toString();
        (document.getElementById('cat-nombre') as HTMLInputElement).value = cat.nombre;
        (document.getElementById('cat-desc') as HTMLTextAreaElement).value = cat.descripcion;
        (document.getElementById('cat-img') as HTMLInputElement).value = cat.imagen;
        
        tituloModal.textContent = 'Editar Categoría';
        modal.showModal();
    }
};

(window as any).eliminarCategoria = (id: number) => {
    const cat = categorias.find(c => c.id === id);
    if (cat && confirm(`¿Estás seguro que deseas eliminar la categoría "${cat.nombre}"?`)) {
        cat.eliminado = true;
        renderizarTabla();
    }
};

document.getElementById('btn-logout')!.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/src/pages/auth/login/login.html';
});