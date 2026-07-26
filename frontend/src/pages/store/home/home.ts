interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen: string;
    disponible: boolean;
    eliminado: boolean;
    categoria: { 
        id: number; 
        nombre: string; 
        descripcion: string;
    }; 
}

let productosTotales: Producto[] = [];
let productosFiltrados: Producto[] = [];

const productosGrid = document.getElementById('productos-grid') as HTMLDivElement;
const categoriasLista = document.getElementById('categorias-lista') as HTMLUListElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;
const nombreUser = document.getElementById('nombre-usuario') as HTMLDivElement;

const usuarioGuardado = localStorage.getItem('usuarioLogueado') || 'Usuario';
const nombreUsuario = JSON.parse(usuarioGuardado).nombre || 'Usuario';
const apellidoUsuario = JSON.parse(usuarioGuardado).apellido || '';
const nombreCompletoUsuario = `${nombreUsuario} ${apellidoUsuario}`.trim();

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioString = localStorage.getItem('usuarioLogueado');
    
    if (!usuarioString) {
        window.location.href = '/src/pages/auth/login/login.html';
        return;
    }

    const usuarioLogueado = JSON.parse(usuarioString);

    const navAdmin = document.getElementById('nav-admin');
    if (usuarioLogueado.rol === 'ADMIN' && navAdmin) {
        navAdmin.style.display = 'inline-block'; // o 'block', según tu CSS
    }

    await cargarCategorias();
    await cargarProductos();
});

nombreUser.innerHTML = `${nombreCompletoUsuario}`;

async function cargarCategorias() {
    try {
        const response = await fetch('/data/categorias.json');
        const categorias: Categoria[] = await response.json();

        categoriasLista.innerHTML = `
            <li class="selected" style="cursor:pointer;" data-id="todas">
                Todas las categorías
            </li>
        `;

        categorias.forEach(cat => {
            categoriasLista.innerHTML += `
                <li style="cursor:pointer;" data-id="${cat.id}">
                    ${cat.nombre}
                </li>
            `;
        });

        categoriasLista.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                categoriasLista.querySelectorAll('li')
                    .forEach(item => item.classList.remove('selected'));

                const seleccionado = e.currentTarget as HTMLLIElement;
                seleccionado.classList.add('selected');

                const catId = seleccionado.getAttribute('data-id');
                filtrarPorCategoria(catId);
            });
        });
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

async function cargarProductos() {
    try {
        const response = await fetch('/data/productos.json');
        const data: Producto[] = await response.json();

        productosTotales = data.filter(p => p.disponible === true);
        productosFiltrados = [...productosTotales];
        
        renderizarProductos(productosFiltrados);
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

function renderizarProductos(productos: Producto[]) {
    productosGrid.innerHTML = '';
    if (productos.length === 0) {
        productosGrid.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    productos.forEach(prod => {
        productosGrid.innerHTML += `
            <div style="border: 1px solid #ccc; padding: 1rem; border-radius: 8px;">
                <img src="${prod.imagen}" alt="${prod.nombre}" style="width: 100%; height: 150px; object-fit: cover;">
                <h4>${prod.nombre}</h4>
                <p>$${prod.precio.toFixed(2)}</p>
                <span style="background: green; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">Disponible</span>
                <br><br>
                <button class="btn-base btn-outline" onclick="verDetalle(${prod.id})">Ver detalle</button>
            </div>
        `;
    });
}

function filtrarPorCategoria(catId: string | null) {
    if (catId === 'todas' || !catId) {
        productosFiltrados = [...productosTotales];
    } else {
        productosFiltrados = productosTotales.filter(p => p.categoria.id === parseInt(catId));
    }
    renderizarProductos(productosFiltrados);
}

searchInput.addEventListener('input', (e) => {
    const termino = (e.target as HTMLInputElement).value.toLowerCase();
    const resultados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(termino));
    renderizarProductos(resultados);
});

sortSelect.addEventListener('change', (e) => {
    const criterio = (e.target as HTMLSelectElement).value;
    let ordenados = [...productosFiltrados];

    if (criterio === 'precio-asc') ordenados.sort((a, b) => a.precio - b.precio);
    if (criterio === 'precio-desc') ordenados.sort((a, b) => b.precio - a.precio);
    if (criterio === 'nombre-asc') ordenados.sort((a, b) => a.nombre.localeCompare(b.nombre));

    renderizarProductos(ordenados);
});

(window as any).verDetalle = (id: number) => {
    window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${id}`;
};

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/src/pages/auth/login/login.html';
});