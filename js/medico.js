const btnBuscar = document.getElementById("btnBuscar");
const tbodyCitas = document.getElementById("tbodyCitas");

btnBuscar.addEventListener("click", mostrarCitasFiltradas);

document.addEventListener("DOMContentLoaded", () => {
    const inputDesde = document.getElementById("fechaDesde");
    const inputHasta = document.getElementById("fechaHasta");

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()+1).padStart(2,"0");
    const dd = String(hoy.getDate()).padStart(2,"0");

    inputDesde.value = `${yyyy}-${mm}-01`;

    // Hasta hoy + 7 días
    const unaSemanaDespues = new Date(hoy);
    unaSemanaDespues.setDate(hoy.getDate() + 7);
    const yyyyF = unaSemanaDespues.getFullYear();
    const mmF = String(unaSemanaDespues.getMonth() + 1).padStart(2, "0");
    const ddF = String(unaSemanaDespues.getDate()).padStart(2, "0");
    inputHasta.value = `${yyyyF}-${mmF}-${ddF}`;

    mostrarCitasFiltradas();
})

function mostrarCitasFiltradas() {
    const fechaDesde = document.getElementById("fechaDesde").value;
    const fechaHasta = document.getElementById("fechaHasta").value;

    if(!fechaDesde || !fechaHasta) {
        alert("Selecciona fechas válidas");
        return;
    }

    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const citasFiltradas = citas.filter(c=>{
        return (
            c.fecha >= fechaDesde &&
            c.fecha <= fechaHasta
        );
    });

    tbodyCitas.innerHTML="";

    citasFiltradas.forEach((cita, index) => {
        const paciente = usuarios.find(u => u.numId === cita.paciente);
        const pacienteNombre = paciente ? paciente.nombre : "Desconocido";

        const fechaFormateada = formatearCita(cita.fecha, cita.hora);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${fechaFormateada}</td>
            <td>${cita.especialidad}</td>
            <td>${pacienteNombre}</td>
            <td>
                <button onclick="editarCita(${index})">Editar</button>
                <button onclick="cancelarCita(${index})">Cancelar</button>
            </td>
        `;

        tr.dataset.fecha = cita.fecha;
        tr.dataset.hora = cita.hora;
        tr.dataset.paciente = cita.pacienteId;

        tbodyCitas.appendChild(tr);
    });
}

function formatearCita(fecha, horaInicio){
    const horaFin = sumarMinutos(horaInicio, 30);

    const [yyyy, mm, dd] = fecha.split("-");
    const fechaObj = new Date(fecha);
    const dia = dd;
    const mes = mm;
    const año = yyyy;

    const horaAMPM = (h) => {
        const [hora, minuto] = h.split(":");
        const hNum = parseInt(hora);
        const ampm = hNum >= 12 ? "pm" : "am";
        const h12 = hNum % 12 || 12;
        return `${h12}:${minuto} ${ampm}`;
    }

    return `${dia}/${mes}/${año} ${horaAMPM(horaInicio)} - ${horaAMPM(horaFin)}`;
}

function sumarMinutos(horaStr, minutos){
    const [h, m] = horaStr.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + minutos, 0, 0);
    return date.toTimeString().slice(0, 5);
}

//No disponible
function editarCita(index){
    alert("Funcionalidad no disponible");
}

// Cancelar cita
function cancelarCita(index) {
  if (!confirm("¿Estás seguro de cancelar esta cita?")) return;

  let citas = JSON.parse(localStorage.getItem("citas")) || [];

  // Obtenemos los datos desde la fila para identificar la cita
  const tr = tbodyCitas.rows[index];
  const fecha = tr.dataset.fecha;
  const hora = tr.dataset.hora;
  const pacienteId = tr.dataset.paciente;

  // Elimina la cita
  citas = citas.filter(c =>
    !(
      c.fecha === fecha &&
      c.hora === hora &&
      c.pacienteId === pacienteId
    )
  );

  localStorage.setItem("citas", JSON.stringify(citas));
  alert("Cita eliminada correctamente.");
  mostrarCitasFiltradas();
}
