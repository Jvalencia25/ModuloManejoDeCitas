const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

//validación usuario
if(!usuario || usuario.rol!=="paciente"){
    alert("Acceso no autorizado");
    window.location.href = "index.html";
}

const nombrePaciente = document.getElementById("nombrePaciente");
const formCita = document.getElementById("formCita");
const listaCitas = document.getElementById("listaCitas");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

nombrePaciente.textContent = usuario.nombre;

//obtener citas
function obtenerCitas(){
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    return citas.filter(c=>c.pacienteId === usuario.numId);
}

//mostrar citas
function mostrarCitas(){
    listaCitas.innerHTML = "";
    const citas = obtenerCitas();

    if (citas.length === 0){
        listaCitas.innerHTML = "<li>No tienes citas agendadas.</li>";
        return;
    }

    citas.forEach(cita => {
        const li = document.createElement("li");
        li.textContent = `Fecha: ${cita.fecha} Hora: ${cita.hora} - ${cita.especialidad}`;
        listaCitas.appendChild(li);
    });
}
//TODO: El usuario deberia ver rangos disponibles
//guardar cita
formCita.addEventListener("submit", function (e) {
    e.preventDefault();

    const fecha = document.getElementById("fechaCita").value;
    const hora = document.getElementById("horaCita").value;
    const especialidad = document.getElementById("especialidadCita").value;

    const fechaHoy = new Date().toISOString().split("T")[0];
    if (fecha < fechaHoy) {
        alert("No puedes agendar citas en fechas pasadas");
    }

    const nuevaHoraInicio = hora;
    const [h, m] = hora.split(":");
    const nuevaHoraFin = sumarMinutos(hora, 30);

    const citas = JSON.parse(localStorage.getItem("citas")) || [];

    //Validar horarios
    const citasPacientes = citas.filter(c =>
        c.fecha === fecha
    )

    for (const cita of citasPacientes) {
        const citaInicio = cita.hora;
        const citaFin = sumarMinutos(cita.hora, 30);

        if (intervalosSeCruzan(nuevaHoraInicio, nuevaHoraFin, citaInicio, citaFin)) {
            alert("Horario no disponible");
            return;
        }
    }

    // Validar 2 citas el mismo día
    const citasPacienteMismoDia = citasPacientes.filter(c =>
        c.pacienteId === usuario.numId 
    );

    if (citasPacienteMismoDia.length > 1) {
        alert("No puedes agendar más de 2 citas el mismo día.");
        return;
    }


    const nuevaCita = {
        pacienteId: usuario.numId,
        fecha,
        hora: nuevaHoraInicio,
        especialidad
    };


    citas.push(nuevaCita);
    localStorage.setItem("citas", JSON.stringify(citas));

    alert("Cita agendada correctamente");
    formCita.reset();
    mostrarCitas();
})

// Cerrar sesión
btnCerrarSesion.addEventListener("click", () => {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "index.html";
});

mostrarCitas();

function sumarMinutos(horaStr, minutos) {
  const [h, m] = horaStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + minutos, 0, 0);
  return date.toTimeString().slice(0, 5); // Formato HH:MM
}

function intervalosSeCruzan(inicio1, fin1, inicio2, fin2) {
  return !(fin1 <= inicio2 || inicio1 >= fin2);
}
