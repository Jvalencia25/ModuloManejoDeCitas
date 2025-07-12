const loginForm = document.getElementById("loginForm");
const registroForm = document.getElementById("registroForm");

const tipoDocSelect = document.getElementById("seltipoDoc");
const fechaNacInput = document.getElementById("fechaNac");
const rolSelect = document.getElementById("selMedPac");

const getUsuarios = () => JSON.parse(localStorage.getItem("usuarios")) || [];

loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const numId = document.getElementById("loginUsuario").value.trim();
    const password = document.getElementById("loginContrasena").value.trim();

    const passwordHash = await hashPassword(password);

    const usuarios = getUsuarios();

    const usuarioEncontrado = usuarios.find(u =>
        u.numId === numId && u.password === passwordHash
    );

    // Guardar usuario activo
    if (usuarioEncontrado) {
        localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));

        // Redirigir según rol
        if (usuarioEncontrado.rol === "paciente") {
        window.location.href = "paciente.html";
        } 
        else window.location.href = "medico.html";
    } 
    else alert("Número de identificación o contraseña incorrectos");
  
});
registroForm.addEventListener("submit", async function(e){
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const fechaNac = document.getElementById("fechaNac").value;
    const tipoDoc = document.getElementById("seltipoDoc").value;
    const numId = document.getElementById("numId").value;
    const genero = document.getElementById("selgen").value;
    const celular = document.getElementById("cel").value;
    const password = document.getElementById("pass").value;
    const rol = document.getElementById("selMedPac").value;

    const edad = calcularEdad(fechaNac);
    if (edad <18 && (tipoDoc === "cc" || tipoDoc === "ce")){
        alert("Si eres menor de edad no puedes seleccionar Cédula de ciudadanía ni Cédula de extranjería.")
        return;
    }

    const usuarios = getUsuarios();
    const yaExiste = usuarios.find(u => u.numId === numId);

    if (yaExiste) {
        alert("Ya existe un usuario con ese número de identificación.");
        return;
    }

    const passwordHash = await hashPassword(password);

    const nuevoUsuario = {
        nombre: nombre,
        fechaNac: fechaNac,
        tipoDoc: tipoDoc,
        numId: numId,
        genero: genero,
        celular: celular,
        password: passwordHash,
        rol: rol
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Registro exitoso");
    registroForm.reset();
});

function calcularEdad(fechaNacStr){
    const hoy = new Date();
    const fechaNac = new Date(fechaNacStr);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes<0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--;

    return edad;
}

//bloquear "cc" y "ce" si la edad es menor a 18
fechaNacInput.addEventListener("change", () => {
    const edad = calcularEdad(fechaNacInput.value);
    const opcionesDoc = tipoDocSelect.options;
    const opcionesRol = rolSelect.options;

    for (let i = 0; i < opcionesDoc.length; i++) {
        const opcion = opcionesDoc[i];
        opcion.disabled = (edad < 18 && (opcion.value === "cc" || opcion.value === "ce"));
        if (opcion.disabled && tipoDocSelect.value === opcion.value) {
            tipoDocSelect.value = "";
        }
    }

    for (let i = 0; i < opcionesRol.length; i++) {
        const opcion = opcionesRol[i];
        opcion.disabled = (edad < 18 && opcion.value === "medico");
        if (opcion.disabled && rolSelect.value === opcion.value) {
            rolSelect.value = "";
        }
    }
});

async function hashPassword(password){
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b=>b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}