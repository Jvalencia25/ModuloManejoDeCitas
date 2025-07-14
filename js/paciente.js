//Bloquear dias anteriores en el calendario
const fechaInput = document.getElementById("fechaCita");

const hoy = new Date();
const yyyy = hoy.getFullYear();
const mm = String(hoy.getMonth() + 1).padStart(2, '0');
const dd = String(hoy.getDate()).padStart(2, '0');

fechaInput.min = `${yyyy}-${mm}-${dd}`;

const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
const horaCitaSelect = document.getElementById("horaCita");

// Horarios de 8AM - 12PM y 2PM a 5PM
// Las citas duran media hora
const bloquesDisponibles = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30"
];

document.getElementById("fechaCita").addEventListener("change", mostrarHorasDisponibles);

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
        listaCitas.innerHTML = `
            <li class="list-group-item text-center text-muted">No tienes citas agendadas.</li>
        `;
        return;
    }

    let especialidad;

    citas.forEach(cita => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        switch(cita.especialidad){
            case "general" : especialidad = "Medicina General";break;
            case "pediatria" : especialidad = "Pediatría" ;break;
            case "odontologia": especialidad = "Odontología" ;break;
            case "psicologia" : especialidad = "Psicología" ;break;
        }
        const citaInfo = document.createElement("div");
        citaInfo.innerHTML = `
            <strong>${especialidad}</strong><br>
            <small>Fecha: ${cita.fecha} - Hora: ${cita.hora}</small>
        `;

        const btnCancelar = document.createElement("button");
        btnCancelar.textContent = "Cancelar";
        btnCancelar.className = "btn btn-outline-danger btn-sm";
        btnCancelar.addEventListener("click", () => cancelarCita(cita));

        li.appendChild(citaInfo);
        li.appendChild(btnCancelar);

        listaCitas.appendChild(li);
    });
}

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

    // Guardar cita
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

function mostrarHorasDisponibles() {
    const fecha = document.getElementById("fechaCita").value;
    const hoy = new Date().toISOString().split("T")[0];

    horaCitaSelect.innerHTML = "";

    if (!fecha || fecha < hoy){
        horaCitaSelect.innerHTML = "<option value=''>Selecciona una fecha válida</option>";
        return;
    }

    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const ocupadas = citas.filter(c=>c.fecha===fecha).map(c=>c.hora);

    const disponibles = bloquesDisponibles.filter(hora => !ocupadas.includes(hora));

    if (disponibles.length===0){
        horaCitaSelect.innerHTML = "<option value=''>No hay horarios disponibles</option>";
        return;
    }

    disponibles.forEach(hora => {
        const option=document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        horaCitaSelect.appendChild(option);
    })
}

// Cancelar cita
function cancelarCita(citaACancelar) {
    if (!confirm("¿Estás seguro de cancelar esta cita?")) return;

    let citas = JSON.parse(localStorage.getItem("citas")) || [];

    citas = citas.filter(c =>
        !(
            c.pacienteId === citaACancelar.pacienteId &&
            c.fecha === citaACancelar.fecha &&
            c.hora === citaACancelar.hora &&
            c.especialidad === citaACancelar.especialidad
        )
    );

    localStorage.setItem("citas", JSON.stringify(citas));
    alert("Cita cancelada correctamente.");
    mostrarCitas();
}

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


