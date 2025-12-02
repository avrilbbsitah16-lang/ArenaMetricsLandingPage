// ========== INICIALIZACIÓN ==========
let usuarioActual = null;

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si hay usuario logueado
  const usuarioActivo = localStorage.getItem("usuarioActivo");

  if (!usuarioActivo) {
    alert("Debes iniciar sesión para acceder al dashboard");
    window.location.href = "login.html";
    return;
  }

  usuarioActual = JSON.parse(usuarioActivo);
  cargarDatosUsuario();
  cargarHistorialEquipos();
  cargarLogros();
  cargarNotificaciones();
  generarNotificacionesDemo();
});

// ========== CARGAR DATOS DEL USUARIO ==========
function cargarDatosUsuario() {
  // Header - Mostrar nombre real del usuario
  document.getElementById("nombreUsuario").textContent =
    usuarioActual.nickname || usuarioActual.nombre;
  document.getElementById("nombreCompleto").textContent =
    usuarioActual.nombre || "Usuario";
  document.getElementById("idUsuario").textContent = usuarioActual.id || "N/A";

  // Badge de verificación (US010)
  const badge = document.getElementById("badgeVerificacion");
  if (usuarioActual.perfilVerificado) {
    badge.textContent = "✓ Perfil Verificado";
    badge.classList.remove("pendiente");
    badge.classList.add("verificado");
  } else {
    badge.textContent = "⏳ Verificación Pendiente";
    badge.classList.remove("verificado");
    badge.classList.add("pendiente");
  }

  // US005: Cargar datos en formulario de edición
  document.getElementById("edit-nombre").value = usuarioActual.nombre || "";
  document.getElementById("edit-nickname").value = usuarioActual.nickname || "";
  document.getElementById("edit-email").value = usuarioActual.email || "";
  document.getElementById("edit-telefono").value = usuarioActual.telefono || "";
  document.getElementById("edit-biografia").value =
    usuarioActual.biografia || "";
  document.getElementById("edit-disponibilidad").value =
    usuarioActual.disponibilidad || "tiempo-completo";

  // Cargar especialidades por juego
  cargarEspecialidades();

  // US002: Cargar estado de sincronización de juegos
  cargarEstadoSincronizacion();
}

// ========== US005: ACTUALIZACIÓN DE DATOS PERSONALES ==========
const datosOriginales = {};

// Guardar datos originales (FUNCIÓN CORREGIDA AQUÍ)
function guardarDatosOriginales() {
  datosOriginales.nombre = document.getElementById("edit-nombre").value || "";
  datosOriginales.nickname =
    document.getElementById("edit-nickname").value || "";
  datosOriginales.email = document.getElementById("edit-email").value || "";
  datosOriginales.telefono =
    document.getElementById("edit-telefono").value || "";
  datosOriginales.biografia =
    document.getElementById("edit-biografia").value || "";
  datosOriginales.disponibilidad =
    document.getElementById("edit-disponibilidad").value || "tiempo-completo";
}

// Llamar a la función después de cargar los datos
setTimeout(() => {
  guardarDatosOriginales();
}, 500);

// Detectar cambios en tiempo real
document
  .querySelectorAll(
    "#formActualizarPerfil input, #formActualizarPerfil textarea, #formActualizarPerfil select"
  )
  .forEach((input) => {
    input.addEventListener("input", () => {
      const hayCambios = verificarCambios();
      document.getElementById("btnActualizar").disabled = !hayCambios;
    });
  });

function verificarCambios() {
  return (
    document.getElementById("edit-nombre").value !== datosOriginales.nombre ||
    document.getElementById("edit-nickname").value !==
      datosOriginales.nickname ||
    document.getElementById("edit-email").value !== datosOriginales.email ||
    document.getElementById("edit-telefono").value !==
      datosOriginales.telefono ||
    document.getElementById("edit-biografia").value !==
      datosOriginales.biografia ||
    document.getElementById("edit-disponibilidad").value !==
      datosOriginales.disponibilidad
  );
}

// Validación en tiempo real de email
document.getElementById("edit-email").addEventListener("input", function () {
  const email = this.value;
  const msg = document.getElementById("emailValidationMsg");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email.length === 0) {
    msg.textContent = "";
    return;
  }

  if (emailRegex.test(email)) {
    msg.textContent = "✓ Email válido";
    msg.className = "validation-msg valid";
  } else {
    msg.textContent = "✗ Email inválido";
    msg.className = "validation-msg invalid";
  }
});

// Submit actualización de perfil
document
  .getElementById("formActualizarPerfil")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Validaciones
    const email = document.getElementById("edit-email").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Por favor ingresa un email válido");
      return;
    }

    // Confirmar cambios
    if (!confirm("¿Estás seguro de que deseas actualizar tu información?")) {
      return;
    }

    // Actualizar datos
    usuarioActual.nombre = document.getElementById("edit-nombre").value;
    usuarioActual.nickname = document.getElementById("edit-nickname").value;
    usuarioActual.email = document.getElementById("edit-email").value;
    usuarioActual.telefono = document.getElementById("edit-telefono").value;
    usuarioActual.biografia = document.getElementById("edit-biografia").value;
    usuarioActual.disponibilidad = document.getElementById(
      "edit-disponibilidad"
    ).value;

    // Guardar en localStorage
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

    // Actualizar en array de usuarios
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const index = usuarios.findIndex((u) => u.id === usuarioActual.id);
    if (index !== -1) {
      usuarios[index] = usuarioActual;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    alert("✓ Información actualizada correctamente");

    // Guardar nuevos datos originales
    guardarDatosOriginales();
    document.getElementById("btnActualizar").disabled = true;

    // Actualizar header
    document.getElementById("nombreUsuario").textContent =
      usuarioActual.nickname;
    document.getElementById("nombreCompleto").textContent =
      usuarioActual.nombre;
  });

function cancelarCambios() {
  if (!confirm("¿Estás seguro de que deseas cancelar los cambios?")) {
    return;
  }

  document.getElementById("edit-nombre").value = datosOriginales.nombre;
  document.getElementById("edit-nickname").value = datosOriginales.nickname;
  document.getElementById("edit-email").value = datosOriginales.email;
  document.getElementById("edit-telefono").value = datosOriginales.telefono;
  document.getElementById("edit-biografia").value = datosOriginales.biografia;
  document.getElementById("edit-disponibilidad").value =
    datosOriginales.disponibilidad;

  document.getElementById("btnActualizar").disabled = true;
  document.getElementById("emailValidationMsg").textContent = "";
}

// ========== ESPECIALIDADES DINÁMICAS ==========
function cargarEspecialidades() {
  const container = document.getElementById("especialidades-container");
  const juegos = usuarioActual.juegos || [];

  container.innerHTML = "";

  juegos.forEach((juego) => {
    const especialidad = usuarioActual.especialidades?.[juego] || "";

    const div = document.createElement("div");
    div.className = "especialidad-item";
    div.innerHTML = `
      <span style="min-width: 150px; font-weight: 600;">${juego}:</span>
      <input 
        type="text" 
        placeholder="Ej: Mid Laner, Duelist, AWPer..." 
        value="${especialidad}"
        data-juego="${juego}"
        onchange="guardarEspecialidad(this)"
      />
    `;
    container.appendChild(div);
  });
}

function guardarEspecialidad(input) {
  const juego = input.dataset.juego;
  if (!usuarioActual.especialidades) {
    usuarioActual.especialidades = {};
  }
  usuarioActual.especialidades[juego] = input.value;

  // Actualizar localStorage
  localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));
}

// ========== US002: SINCRONIZACIÓN DE JUEGOS ==========
function cargarEstadoSincronizacion() {
  const juegosSincronizados = usuarioActual.juegosSincronizados || {};

  Object.keys(juegosSincronizados).forEach((juego) => {
    const estado = juegosSincronizados[juego];
    actualizarEstadoJuego(juego, estado);
  });
}

function conectarJuego(juego) {
  const btn = event.target;
  const card = btn.closest(".sync-card");
  const statusDiv = card.querySelector(".sync-status");
  const infoP = card.querySelector(".sync-info");

  // Simular autenticación OAuth
  btn.disabled = true;
  btn.textContent = "Conectando...";
  statusDiv.innerHTML =
    '<span class="status-badge sincronizando">🔄 Conectando...</span>';

  setTimeout(() => {
    // Simular conexión exitosa
    const estadoSync = {
      conectado: true,
      fechaConexion: new Date().toISOString(),
      ultimaSync: new Date().toISOString(),
      partidasImportadas: Math.floor(Math.random() * 500) + 100,
    };

    if (!usuarioActual.juegosSincronizados) {
      usuarioActual.juegosSincronizados = {};
    }
    usuarioActual.juegosSincronizados[juego] = estadoSync;

    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

    actualizarEstadoJuego(juego, estadoSync);

    alert(
      `✓ ${juego.toUpperCase()} conectado exitosamente!\n\nPartidas importadas: ${
        estadoSync.partidasImportadas
      }\nÚltima sincronización: Ahora`
    );
  }, 2000);
}

function actualizarEstadoJuego(juego, estado) {
  const card = document.querySelector(`.sync-card[data-juego="${juego}"]`);
  if (!card) return;

  const statusDiv = card.querySelector(".sync-status");
  const btn = card.querySelector(".btn-sync");
  const infoP = card.querySelector(".sync-info");

  if (estado.conectado) {
    statusDiv.innerHTML =
      '<span class="status-badge conectado">✓ Conectado</span>';
    btn.textContent = "Desconectar Cuenta";
    btn.className = "btn-sync desconectar";
    btn.onclick = () => desconectarJuego(juego);

    const fecha = new Date(estado.ultimaSync).toLocaleDateString();
    infoP.textContent = `Última sync: ${fecha} | Partidas: ${estado.partidasImportadas}`;
  } else {
    statusDiv.innerHTML =
      '<span class="status-badge desconectado">❌ Desconectado</span>';
    btn.textContent = "Conectar Cuenta";
    btn.className = "btn-sync";
    btn.onclick = () => conectarJuego(juego);
    infoP.textContent = "";
  }

  btn.disabled = false;
}

function desconectarJuego(juego) {
  if (
    !confirm(
      `¿Deseas desconectar tu cuenta de ${juego.toUpperCase()}?\n\nSe mantendrán los datos históricos ya importados.`
    )
  ) {
    return;
  }

  if (
    usuarioActual.juegosSincronizados &&
    usuarioActual.juegosSincronizados[juego]
  ) {
    usuarioActual.juegosSincronizados[juego].conectado = false;
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

    actualizarEstadoJuego(juego, { conectado: false });
    alert(`Cuenta de ${juego.toUpperCase()} desconectada`);
  }
}

// ========== US004: HISTORIAL DE EQUIPOS ==========
function cargarHistorialEquipos() {
  const timeline = document.getElementById("historialTimeline");
  const equipos = usuarioActual.historialEquipos || [];

  if (equipos.length === 0) {
    timeline.innerHTML =
      '<p style="opacity: 0.6; text-align: center; padding: 40px;">No hay equipos registrados aún. ¡Agrega tu primer equipo!</p>';
    return;
  }

  // Ordenar por fecha de inicio (más reciente primero)
  equipos.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

  timeline.innerHTML = equipos
    .map(
      (equipo, index) => `
    <div class="timeline-item">
      <h3>${equipo.nombre}</h3>
      <p class="periodo">
        ${new Date(equipo.fechaInicio).toLocaleDateString()} - 
        ${
          equipo.fechaFin
            ? new Date(equipo.fechaFin).toLocaleDateString()
            : "Actualidad"
        }
      </p>
      <p><strong>Organización:</strong> ${
        equipo.organizacion || "Independiente"
      }</p>
      <p><strong>Rol:</strong> ${equipo.rol}</p>
      ${equipo.logros ? `<p><strong>Logros:</strong> ${equipo.logros}</p>` : ""}
      <div class="timeline-actions">
        <button class="btn-editar" onclick="editarEquipo(${index})">✏️ Editar</button>
        <button class="btn-eliminar" onclick="eliminarEquipo(${index})">🗑️ Eliminar</button>
      </div>
    </div>
  `
    )
    .join("");
}

function abrirModalEquipo() {
  document.getElementById("modalEquipo").classList.add("show");
}

function cerrarModalEquipo() {
  document.getElementById("modalEquipo").classList.remove("show");
  document.getElementById("formAgregarEquipo").reset();
}

document
  .getElementById("formAgregarEquipo")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const fechaInicio = document.getElementById("equipo-inicio").value;
    const fechaFin = document.getElementById("equipo-fin").value;

    // Validación de fechas
    if (fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      alert("La fecha de inicio no puede ser posterior a la fecha de fin");
      return;
    }

    const equipo = {
      nombre: document.getElementById("equipo-nombre").value,
      organizacion: document.getElementById("equipo-org").value,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      rol: document.getElementById("equipo-rol").value,
      logros: document.getElementById("equipo-logros").value,
    };

    if (!usuarioActual.historialEquipos) {
      usuarioActual.historialEquipos = [];
    }

    usuarioActual.historialEquipos.push(equipo);
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

    alert("✓ Equipo agregado al historial correctamente");
    cerrarModalEquipo();
    cargarHistorialEquipos();
  });

function eliminarEquipo(index) {
  if (
    !confirm("¿Estás seguro de que deseas eliminar este equipo del historial?")
  ) {
    return;
  }

  usuarioActual.historialEquipos.splice(index, 1);
  localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

  alert("Equipo eliminado");
  cargarHistorialEquipos();
}

function editarEquipo(index) {
  alert("Función de edición en desarrollo");
}

// ========== US006: MÉTRICAS AVANZADAS ==========
function filtrarMetricas() {
  const juego = document.getElementById("filtro-juego").value;
  const periodo = document.getElementById("filtro-periodo").value;

  // Aquí irían las llamadas a APIs para obtener métricas reales
  console.log(`Filtrando métricas: ${juego} - ${periodo}`);
  alert(
    `Filtrando métricas de ${juego} del período: ${periodo}\n\n(Funcionalidad de backend pendiente)`
  );
}

function verDetalleMetrica(tipo) {
  alert(
    `Ver detalles de métrica: ${tipo}\n\n(Modal con gráficos detallados - pendiente de implementación)`
  );
}

function exportarReporteMetricas() {
  alert(
    "📄 Generando reporte de métricas en PDF...\n\n(Funcionalidad de exportación pendiente)"
  );
}

// ========== US007: LOGROS Y CERTIFICACIONES ==========
function cargarLogros() {
  const grid = document.getElementById("logrosGrid");
  const logros = usuarioActual.logros || [];

  if (logros.length === 0) {
    grid.innerHTML =
      '<p style="opacity: 0.6; text-align: center; padding: 40px; grid-column: 1/-1;">No hay logros registrados aún. ¡Agrega tu primer logro!</p>';
    return;
  }

  grid.innerHTML = logros
    .map(
      (logro, index) => `
    <div class="logro-card">
      <div class="logro-icono">🏆</div>
      <h3>${logro.titulo}</h3>
      <p class="logro-fecha">${new Date(logro.fecha).toLocaleDateString()}</p>
      <p>${logro.descripcion || "Sin descripción"}</p>
      ${
        logro.evidencia
          ? `<a href="${logro.evidencia}" target="_blank" class="logro-evidencia">📎 Ver Evidencia</a>`
          : ""
      }
      <div class="logro-actions">
        <button class="btn-editar" onclick="editarLogro(${index})">✏️ Editar</button>
        <button class="btn-eliminar" onclick="eliminarLogro(${index})">🗑️ Eliminar</button>
      </div>
    </div>
  `
    )
    .join("");
}

function abrirModalLogro() {
  document.getElementById("modalLogro").classList.add("show");
}

function cerrarModalLogro() {
  document.getElementById("modalLogro").classList.remove("show");
  document.getElementById("formAgregarLogro").reset();
}

function validarArchivo(input) {
  const file = input.files[0];
  if (!file) return;

  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (file.size > maxSize) {
    alert("El archivo es demasiado grande. Máximo 5MB");
    input.value = "";
    return;
  }

  if (!allowedTypes.includes(file.type)) {
    alert("Formato no permitido. Solo JPG, PNG o PDF");
    input.value = "";
    return;
  }
}

document
  .getElementById("formAgregarLogro")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("logro-evidencia");
    let evidenciaURL = "";

    if (fileInput.files[0]) {
      // En producción, aquí se subiría el archivo a un servidor
      // Por ahora simulamos con un URL local
      evidenciaURL = URL.createObjectURL(fileInput.files[0]);
    }

    const logro = {
      titulo: document.getElementById("logro-titulo").value,
      descripcion: document.getElementById("logro-descripcion").value,
      fecha: document.getElementById("logro-fecha").value,
      evidencia: evidenciaURL,
    };

    if (!usuarioActual.logros) {
      usuarioActual.logros = [];
    }

    usuarioActual.logros.push(logro);
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

    alert("✓ Logro agregado correctamente");
    cerrarModalLogro();
    cargarLogros();
  });

function eliminarLogro(index) {
  if (!confirm("¿Estás seguro de que deseas eliminar este logro?")) {
    return;
  }

  usuarioActual.logros.splice(index, 1);
  localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));

  alert("Logro eliminado");
  cargarLogros();
}

function editarLogro(index) {
  alert("Función de edición en desarrollo");
}

// ========== US008: NOTIFICACIONES ==========
function cargarNotificaciones() {
  const lista = document.getElementById("notificacionesLista");
  const notificaciones = usuarioActual.notificaciones || [];

  if (notificaciones.length === 0) {
    lista.innerHTML =
      '<p style="opacity: 0.6; text-align: center; padding: 40px;">No tienes notificaciones aún</p>';
    return;
  }

  lista.innerHTML = notificaciones
    .map(
      (notif, index) => `
    <div class="notificacion-item ${
      notif.leida ? "" : "no-leida"
    }" onclick="marcarComoLeida(${index})">
      <div class="notificacion-header">
        <span class="notificacion-tipo">${notif.tipo}</span>
        <span class="notificacion-tiempo">${calcularTiempo(notif.fecha)}</span>
      </div>
      <div class="notificacion-contenido">${notif.contenido}</div>
    </div>
  `
    )
    .join("");
}

function generarNotificacionesDemo() {
  if (
    !usuarioActual.notificaciones ||
    usuarioActual.notificaciones.length === 0
  ) {
    usuarioActual.notificaciones = [
      {
        tipo: "👁️ Visita a Perfil",
        contenido: "Un entrenador de Team Liquid ha visto tu perfil",
        fecha: new Date(Date.now() - 3600000).toISOString(),
        leida: false,
      },
      {
        tipo: "📨 Mensaje Nuevo",
        contenido: "Cloud9 te ha enviado una invitación para tryouts",
        fecha: new Date(Date.now() - 7200000).toISOString(),
        leida: false,
      },
      {
        tipo: "✓ Sistema",
        contenido: "Tu perfil ha sido creado exitosamente",
        fecha: new Date(Date.now() - 86400000).toISOString(),
        leida: true,
      },
      {
        tipo: "📊 Estadísticas",
        contenido: "Conecta tus juegos para ver tus estadísticas actualizadas",
        fecha: new Date(Date.now() - 172800000).toISOString(),
        leida: true,
      },
    ];
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));
    cargarNotificaciones();
  }
}

function filtrarNotificaciones(tipo) {
  // Actualizar botones activos
  document.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Filtrar notificaciones (implementación básica)
  console.log(`Filtrando notificaciones: ${tipo}`);
}

function marcarComoLeida(index) {
  if (
    usuarioActual.notificaciones[index] &&
    !usuarioActual.notificaciones[index].leida
  ) {
    usuarioActual.notificaciones[index].leida = true;
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActual));
    cargarNotificaciones();
  }
}

function calcularTiempo(fecha) {
  const ahora = new Date();
  const notifFecha = new Date(fecha);
  const diff = ahora - notifFecha;

  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  return `Hace ${dias} días`;
}

// ========== US009: BACKUP Y EXPORTACIÓN ==========
function generarBackup() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = "⏳ Generando...";

  // Obtener secciones seleccionadas
  const seccionesSeleccionadas = [];
  document
    .querySelectorAll('input[name="export"]:checked')
    .forEach((checkbox) => {
      seccionesSeleccionadas.push(checkbox.value);
    });

  if (seccionesSeleccionadas.length === 0) {
    alert("Debes seleccionar al menos una sección para exportar");
    btn.disabled = false;
    btn.textContent = "📦 Generar Backup";
    return;
  }

  // Obtener formato
  const formato = document.querySelector('input[name="formato"]:checked').value;

  // Mostrar progreso
  const progressDiv = document.getElementById("progressExport");
  const progressFill = document.getElementById("progressFillExport");
  const progressText = document.getElementById("progressTextExport");

  progressDiv.style.display = "block";
  progressFill.style.width = "0%";

  // Simular generación de backup
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = progress + "%";

    if (progress === 30) progressText.textContent = "Recopilando datos...";
    if (progress === 60) progressText.textContent = "Comprimiendo archivos...";
    if (progress === 90) progressText.textContent = "Finalizando backup...";

    if (progress >= 100) {
      clearInterval(interval);

      // Crear datos de backup
      const datosBackup = {
        usuario: {
          id: usuarioActual.id,
          nombre: usuarioActual.nombre,
          nickname: usuarioActual.nickname,
          email: usuarioActual.email,
        },
        fechaBackup: new Date().toISOString(),
        secciones: {},
      };

      if (seccionesSeleccionadas.includes("perfil")) {
        datosBackup.secciones.perfil = {
          nombre: usuarioActual.nombre,
          nickname: usuarioActual.nickname,
          email: usuarioActual.email,
          telefono: usuarioActual.telefono,
          biografia: usuarioActual.biografia,
          disponibilidad: usuarioActual.disponibilidad,
          especialidades: usuarioActual.especialidades,
        };
      }

      if (seccionesSeleccionadas.includes("estadisticas")) {
        datosBackup.secciones.estadisticas =
          usuarioActual.juegosSincronizados || {};
      }

      if (seccionesSeleccionadas.includes("historial")) {
        datosBackup.secciones.historial = usuarioActual.historialEquipos || [];
      }

      if (seccionesSeleccionadas.includes("logros")) {
        datosBackup.secciones.logros = usuarioActual.logros || [];
      }

      if (seccionesSeleccionadas.includes("notificaciones")) {
        datosBackup.secciones.notificaciones =
          usuarioActual.notificaciones || [];
      }

      // Descargar archivo
      descargarBackup(datosBackup, formato);

      progressText.textContent = "✓ Backup generado exitosamente";

      setTimeout(() => {
        progressDiv.style.display = "none";
        btn.disabled = false;
        btn.textContent = "📦 Generar Backup";
        alert(
          "✓ Backup descargado exitosamente\n\nSe ha enviado un email de confirmación con enlace válido por 48 horas"
        );
      }, 1500);
    }
  }, 200);
}

function descargarBackup(datos, formato) {
  let contenido, nombreArchivo, mimeType;

  if (formato === "json") {
    contenido = JSON.stringify(datos, null, 2);
    nombreArchivo = `ArenaMetrics_Backup_${Date.now()}.json`;
    mimeType = "application/json";
  } else if (formato === "csv") {
    contenido = convertirACSV(datos);
    nombreArchivo = `ArenaMetrics_Backup_${Date.now()}.csv`;
    mimeType = "text/csv";
  } else if (formato === "pdf") {
    alert("Generación de PDF en desarrollo. Por ahora se exportará como JSON");
    contenido = JSON.stringify(datos, null, 2);
    nombreArchivo = `ArenaMetrics_Backup_${Date.now()}.json`;
    mimeType = "application/json";
  }

  const blob = new Blob([contenido], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertirACSV(datos) {
  let csv = "Sección,Campo,Valor\n";

  Object.keys(datos.secciones).forEach((seccion) => {
    const datos_seccion = datos.secciones[seccion];
    if (typeof datos_seccion === "object" && !Array.isArray(datos_seccion)) {
      Object.keys(datos_seccion).forEach((campo) => {
        csv += `${seccion},${campo},${datos_seccion[campo]}\n`;
      });
    }
  });

  return csv;
}

// ========== NAVEGACIÓN DE TABS ==========
function cambiarTab(tab) {
  // Desactivar todos los tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Activar tab seleccionado
  event.target.classList.add("active");
  document.getElementById(`tab-${tab}`).classList.add("active");

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ========== FUNCIONES GLOBALES ==========
function toggleMenu() {
  const menu = document.getElementById("menuHorizontal");
  menu.classList.toggle("active");
}

function verPerfil() {
  cambiarTab("perfil");
}

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuarioActivo");
    alert("Sesión cerrada exitosamente");
    window.location.href = "index.html";
  }
}
