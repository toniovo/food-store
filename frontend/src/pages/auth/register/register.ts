const registerForm = document.getElementById('register-form') as HTMLFormElement;

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = (document.getElementById('nombre') as HTMLInputElement).value;
    const emailInput = (document.getElementById('email') as HTMLInputElement).value;
    const passwordInput = (document.getElementById('password') as HTMLInputElement).value;

    if (passwordInput.length < 6) {
        alert('La contraseña debe tener un mínimo de 6 caracteres.');
        return;
    }

    try {
        const response = await fetch('/data/usuarios.json');
        const usuarios = await response.json();

        const emailExiste = usuarios.find((u: any) => u.mail === emailInput);
        if (emailExiste) {
            alert('Este email ya se encuentra registrado. Inicia sesión.');
            return;
        }

        const nuevoCliente = {
            id: Date.now(),
            nombre: nombreInput,
            mail: emailInput,
            rol: 'USUARIO' 
        };

        localStorage.setItem('usuarioLogueado', JSON.stringify(nuevoCliente));

        alert('¡Registro exitoso! Ingresando a Food Store...');
        
        window.location.href = '/src/pages/store/home/home.html';

    } catch (error) {
        console.error('Error al intentar registrar:', error);
        alert('Ocurrió un error al conectar con el servidor local.');
    }
});