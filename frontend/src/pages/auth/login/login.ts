interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    mail: string;
    celular: string;
    password?: string;
    rol: 'ADMIN' | 'USUARIO';
}

const loginForm = document.getElementById('login-form') as HTMLFormElement;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = (document.getElementById('email') as HTMLInputElement).value;
    const passwordInput = (document.getElementById('password') as HTMLInputElement).value;

    try {
        const response = await fetch('/data/usuarios.json');
        const usuarios: Usuario[] = await response.json();
        const usuarioEncontrado = usuarios.find(u => u.mail === emailInput && u.password === passwordInput);

        if (usuarioEncontrado) {
            delete usuarioEncontrado.password;
            
            localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));

            if (usuarioEncontrado.rol === 'ADMIN') {
                window.location.href = '/src/pages/admin/adminHome/adminHome.html'; 
            } else {
                window.location.href = '/src/pages/store/home/home.html'; 
            }
        } else {
            alert('Credenciales incorrectas o usuario inexistente.');
        }

    } catch (error) {
        console.error('Error al intentar realizar el login:', error);
        alert('Ocurrió un error al conectar con el servidor local.');
    }
});