// ========== VARIABLES GLOBALES DE SCOUTING ==========
let listasScoutingActuales = [];
let jugadoresDisponibles = [];
let listaSeleccionadaActual = null;
let jugadorSeleccionadoActual = null;
let alertasTalento = [];
let paginaActual = 1;
const jugadoresPorPagina = 20;

// ========== INICIALIZACIÓN DEL MÓDULO DE SCOUTING ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosScouting();
  generarJugadoresDemo();
  configurarEventosScouting();
});

function cargarDatosScouting() {
  // Cargar listas de scouting desde localStorage
  const datosGuardados = localStorage.getItem("listasScoutingData");
  if (datosGuardados) {
    listasScoutingActuales = JSON.parse(datosGuardados);
  }

  // Cargar alertas
  const alertasGuardadas = localStorage.getItem("alertasTalentoData");
  if (alertasGuardadas) {
    alertasTalento = JSON.parse(alertasGuardadas);
  }

  // Cargar jugadores disponibles
  const jugadoresGuardados = localStorage.getItem("jugadoresDisponiblesData");
  if (jugadoresGuardados) {
    jugadoresDisponibles = JSON.parse(jugadoresGuardados);
  }

  actualizarSidebarListas();
  actualizarAlertasActivas();
}

function guardarDatosScouting() {
  localStorage.setItem(
    "listasScoutingData",
    JSON.stringify(listasScoutingActuales)
  );
  localStorage.setItem("alertasTalentoData", JSON.stringify(alertasTalento));
  localStorage.setItem(
    "jugadoresDisponiblesData",
    JSON.stringify(jugadoresDisponibles)
  );
}

// ========== US501: BÚSQUEDA AVANZADA DE JUGADORES ==========
function habilitarBusqueda() {
  const juego = document.getElementById("filtro-scout-juego").value;
  const rol = document.getElementById("filtro-scout-rol").value;
  const edadMin = document.getElementById("filtro-edad-min").value;
  const edadMax = document.getElementById("filtro-edad-max").value;
  const region = document.getElementById("filtro-scout-region").value;

  // Habilitar botón si al menos un filtro está seleccionado
  const hayFiltros = juego || rol || edadMin || edadMax || region;
  document.getElementById("btnBuscarScouting").disabled = !hayFiltros;
}

function restablecerFiltros() {
  document.getElementById("filtro-scout-juego").value = "";
  document.getElementById("filtro-scout-rol").value = "";
  document.getElementById("filtro-edad-min").value = "";
  document.getElementById("filtro-edad-max").value = "";
  document.getElementById("filtro-scout-region").value = "";

  document.getElementById("btnBuscarScouting").disabled = true;
  document.getElementById("resultadosScoutingSection").style.display = "none";
  document.getElementById("listaDetalleSection").style.display = "none";
}

document
  .getElementById("formBusquedaScouting")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    realizarBusquedaScouting();
  });

function realizarBusquedaScouting() {
  const filtros = {
    juego: document.getElementById("filtro-scout-juego").value,
    rol: document.getElementById("filtro-scout-rol").value,
    edadMin: parseInt(document.getElementById("filtro-edad-min").value) || 0,
    edadMax: parseInt(document.getElementById("filtro-edad-max").value) || 100,
    region: document.getElementById("filtro-scout-region").value,
  };

  // Filtrar jugadores según criterios
  let resultados = jugadoresDisponibles.filter((jugador) => {
    let cumple = true;

    if (filtros.juego && jugador.juego !== filtros.juego) cumple = false;
    if (filtros.rol && jugador.rol !== filtros.rol) cumple = false;
    if (jugador.edad < filtros.edadMin || jugador.edad > filtros.edadMax)
      cumple = false;
    if (filtros.region && jugador.region !== filtros.region) cumple = false;

    return cumple;
  });

  mostrarResultadosBusqueda(resultados);
}

function mostrarResultadosBusqueda(resultados) {
  const seccion = document.getElementById("resultadosScoutingSection");
  const grid = document.getElementById("jugadoresGrid");
  const total = document.getElementById("totalResultados");

  document.getElementById("listaDetalleSection").style.display = "none";
  seccion.style.display = "block";
  total.textContent = resultados.length;

  if (resultados.length === 0) {
    grid.innerHTML =
      '<p style="text-align: center; opacity: 0.7; padding: 40px;">No se encontraron jugadores con esos criterios. Intenta ajustar los filtros.</p>';
    document.getElementById("paginacionContainer").style.display = "none";
    return;
  }

  // Paginación
  paginaActual = 1;
  const totalPaginas = Math.ceil(resultados.length / jugadoresPorPagina);

  mostrarPaginaJugadores(resultados, paginaActual);

  if (totalPaginas > 1) {
    mostrarPaginacion(totalPaginas, resultados);
  } else {
    document.getElementById("paginacionContainer").style.display = "none";
  }
}

function mostrarPaginaJugadores(resultados, pagina) {
  const inicio = (pagina - 1) * jugadoresPorPagina;
  const fin = inicio + jugadoresPorPagina;
  const jugadoresPagina = resultados.slice(inicio, fin);

  const grid = document.getElementById("jugadoresGrid");

  grid.innerHTML = jugadoresPagina
    .map(
      (jugador) => `
    <div class="jugador-card" data-id="${jugador.id}">
      <div class="jugador-foto">${jugador.nombre.charAt(0)}</div>
      <h4>${jugador.nombre}</h4>
      <p class="jugador-nickname">@${jugador.nickname}</p>
      
      <div class="jugador-metricas">
        <div class="metrica-mini">
          <span class="metrica-mini-label">KDA</span>
          <span class="metrica-mini-valor">${jugador.kda}</span>
        </div>
        <div class="metrica-mini">
          <span class="metrica-mini-label">Win Rate</span>
          <span class="metrica-mini-valor">${jugador.winrate}%</span>
        </div>
        <div class="metrica-mini">
          <span class="metrica-mini-label">Partidas</span>
          <span class="metrica-mini-valor">${jugador.partidas}</span>
        </div>
      </div>

      <p class="jugador-bio">${
        jugador.biografia || "Sin descripción disponible."
      }</p>

      <div class="jugador-actions">
        <button class="btn-ver-perfil" onclick="verPerfilDetallado('${
          jugador.id
        }')">
          👁️ Ver Perfil
        </button>
        <button class="btn-anadir-lista" onclick="abrirModalAnadirJugador('${
          jugador.id
        }')">
          ➕ Añadir
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function mostrarPaginacion(totalPaginas, resultados) {
  const container = document.getElementById("paginacionContainer");
  container.style.display = "flex";

  let html =
    '<button onclick="cambiarPagina(' +
    (paginaActual - 1) +
    ", " +
    JSON.stringify(resultados) +
    ')" ' +
    (paginaActual === 1 ? "disabled" : "") +
    ">◀ Anterior</button>";

  for (let i = 1; i <= Math.min(totalPaginas, 5); i++) {
    html +=
      '<button onclick="cambiarPagina(' +
      i +
      ", " +
      JSON.stringify(resultados) +
      ')" ' +
      (i === paginaActual ? 'class="active"' : "") +
      ">" +
      i +
      "</button>";
  }

  if (totalPaginas > 5) {
    html += "<button disabled>...</button>";
    html +=
      '<button onclick="cambiarPagina(' +
      totalPaginas +
      ", " +
      JSON.stringify(resultados) +
      ')">' +
      totalPaginas +
      "</button>";
  }

  html +=
    '<button onclick="cambiarPagina(' +
    (paginaActual + 1) +
    ", " +
    JSON.stringify(resultados) +
    ')" ' +
    (paginaActual === totalPaginas ? "disabled" : "") +
    ">Siguiente ▶</button>";

  container.innerHTML = html;
}

function cambiarPagina(pagina, resultados) {
  if (pagina < 1 || pagina > Math.ceil(resultados.length / jugadoresPorPagina))
    return;

  paginaActual = pagina;
  mostrarPaginaJugadores(resultados, pagina);
  mostrarPaginacion(
    Math.ceil(resultados.length / jugadoresPorPagina),
    resultados
  );

  window.scrollTo({ top: 300, behavior: "smooth" });
}

function ordenarResultados() {
  const criterio = document.getElementById("ordenarPor").value;

  // Obtener resultados actuales y reordenar
  const jugadoresMostrados = Array.from(
    document.querySelectorAll(".jugador-card")
  ).map((card) => {
    const id = card.dataset.id;
    return jugadoresDisponibles.find((j) => j.id === id);
  });

  if (criterio === "kda") {
    jugadoresMostrados.sort((a, b) => b.kda - a.kda);
  } else if (criterio === "winrate") {
    jugadoresMostrados.sort((a, b) => b.winrate - a.winrate);
  } else if (criterio === "reciente") {
    jugadoresMostrados.sort(
      (a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
    );
  }

  mostrarPaginaJugadores(jugadoresMostrados, 1);
  alert(`Resultados ordenados por: ${criterio}`);
}

// ========== US502: PERFIL DETALLADO DE JUGADOR ==========
function verPerfilDetallado(jugadorId) {
  const jugador = jugadoresDisponibles.find((j) => j.id === jugadorId);
  if (!jugador) return;

  jugadorSeleccionadoActual = jugador;

  const overlay = document.getElementById("perfilDetalladoOverlay");
  const body = document.getElementById("perfilDetalladoBody");

  body.innerHTML = `
    <div class="perfil-header-detalle">
      <div class="perfil-foto-grande">${jugador.nombre.charAt(0)}</div>
      <div class="perfil-info-principal">
        <h2>${jugador.nombre}</h2>
        <p style="opacity: 0.7; font-size: 1.1rem;">@${jugador.nickname}</p>
        <p style="margin-top: 10px;">
          <span style="color: #10b981;">🎮 ${jugador.juego}</span> | 
          <span style="color: #fbbf24;">⚔️ ${jugador.rol}</span> | 
          <span style="color: #818cf8;">📍 ${jugador.region}</span> | 
          <span style="opacity: 0.7;">🎂 ${jugador.edad} años</span>
        </p>
        <button class="btn-actualizar" style="margin-top: 15px;" onclick="abrirModalAnadirJugador('${
          jugador.id
        }')">
          ➕ Añadir a Lista de Interés
        </button>
      </div>
    </div>

    <div class="perfil-tabs-detalle">
      <button class="perfil-tab-btn active" onclick="cambiarTabPerfil('estadisticas')">📊 Estadísticas</button>
      <button class="perfil-tab-btn" onclick="cambiarTabPerfil('historial')">📜 Historial</button>
      <button class="perfil-tab-btn" onclick="cambiarTabPerfil('logros')">🏆 Logros</button>
      <button class="perfil-tab-btn" onclick="cambiarTabPerfil('videos')">🎥 Videos</button>
    </div>

    <div id="perfil-tab-estadisticas" class="perfil-tab-content-detalle active">
      <h3 style="color: #ff6b9d; margin-bottom: 20px;">Estadísticas Avanzadas</h3>
      <div class="metricas-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="metrica-card">
          <h3>KDA</h3>
          <div class="metrica-valor">${jugador.kda}</div>
        </div>
        <div class="metrica-card">
          <h3>Win Rate</h3>
          <div class="metrica-valor">${jugador.winrate}%</div>
        </div>
        <div class="metrica-card">
          <h3>Partidas Jugadas</h3>
          <div class="metrica-valor">${jugador.partidas}</div>
        </div>
        <div class="metrica-card">
          <h3>Tiempo Reacción</h3>
          <div class="metrica-valor">${jugador.tiempoReaccion}ms</div>
        </div>
      </div>
      <p style="margin-top: 20px; opacity: 0.8;">${
        jugador.biografia || "Sin descripción disponible."
      }</p>
    </div>

    <div id="perfil-tab-historial" class="perfil-tab-content-detalle">
      <h3 style="color: #ff6b9d; margin-bottom: 20px;">Historial de Equipos</h3>
      <div class="historial-timeline" style="padding-left: 0;">
        ${
          jugador.historialEquipos && jugador.historialEquipos.length > 0
            ? jugador.historialEquipos
                .map(
                  (equipo) => `
            <div class="timeline-item">
              <h3>${equipo.nombre}</h3>
              <p class="periodo">${equipo.periodo}</p>
              <p>${equipo.logros || "Sin logros registrados"}</p>
            </div>
          `
                )
                .join("")
            : '<p style="opacity: 0.7;">No hay historial de equipos disponible.</p>'
        }
      </div>
    </div>

    <div id="perfil-tab-logros" class="perfil-tab-content-detalle">
      <h3 style="color: #ff6b9d; margin-bottom: 20px;">Logros y Certificaciones</h3>
      <div class="logros-grid">
        ${
          jugador.logros && jugador.logros.length > 0
            ? jugador.logros
                .map(
                  (logro) => `
            <div class="logro-card">
              <div class="logro-icono">🏆</div>
              <h3>${logro.titulo}</h3>
              <p>${logro.descripcion}</p>
            </div>
          `
                )
                .join("")
            : '<p style="opacity: 0.7; grid-column: 1/-1;">No hay logros registrados.</p>'
        }
      </div>
    </div>

    <div id="perfil-tab-videos" class="perfil-tab-content-detalle">
      <h3 style="color: #ff6b9d; margin-bottom: 20px;">Videos Destacados</h3>
      ${
        jugador.videos && jugador.videos.length > 0
          ? jugador.videos
              .map(
                (video) => `
          <div style="margin-bottom: 20px;">
            <iframe width="100%" height="315" src="${video.url}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen style="border-radius: 10px;">
            </iframe>
            <p style="margin-top: 10px; opacity: 0.8;">${video.descripcion}</p>
          </div>
        `
              )
              .join("")
          : '<p style="opacity: 0.7;">No hay videos disponibles. El jugador puede agregar clips destacados desde su perfil.</p>'
      }
    </div>
  `;

  overlay.style.display = "flex";
}

function cerrarPerfilDetallado() {
  document.getElementById("perfilDetalladoOverlay").style.display = "none";
  jugadorSeleccionadoActual = null;
}

function cambiarTabPerfil(tab) {
  // Desactivar todos los tabs
  document
    .querySelectorAll(".perfil-tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".perfil-tab-content-detalle")
    .forEach((content) => content.classList.remove("active"));

  // Activar tab seleccionado
  event.target.classList.add("active");
  document.getElementById(`perfil-tab-${tab}`).classList.add("active");
}

// ========== US503: CREACIÓN DE LISTAS DE SCOUTING ==========
function abrirModalCrearLista() {
  document.getElementById("modalCrearLista").classList.add("show");
}

function cerrarModalCrearLista() {
  document.getElementById("modalCrearLista").classList.remove("show");
  document.getElementById("formCrearLista").reset();
  document.getElementById("btnCrearLista").disabled = true;
}

// Habilitar botón crear lista solo si hay nombre
document.getElementById("lista-nombre").addEventListener("input", function () {
  document.getElementById("btnCrearLista").disabled = this.value.trim() === "";
});

document
  .getElementById("formCrearLista")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nuevaLista = {
      id: "lista_" + Date.now(),
      nombre: document.getElementById("lista-nombre").value,
      descripcion: document.getElementById("lista-descripcion").value,
      jugadores: [],
      fechaCreacion: new Date().toISOString(),
    };

    listasScoutingActuales.push(nuevaLista);
    guardarDatosScouting();
    actualizarSidebarListas();

    alert("✓ Lista creada exitosamente");
    cerrarModalCrearLista();
  });

function actualizarSidebarListas() {
  const container = document.getElementById("listasScoutingContainer");

  if (listasScoutingActuales.length === 0) {
    container.innerHTML =
      '<p style="opacity: 0.6; font-size: 0.9rem; text-align: center;">No tienes listas aún. Crea una nueva lista.</p>';
    return;
  }

  container.innerHTML = listasScoutingActuales
    .map(
      (lista) => `
    <div class="lista-item ${
      listaSeleccionadaActual?.id === lista.id ? "active" : ""
    }" 
         onclick="seleccionarLista('${lista.id}')">
      <h4>${lista.nombre}</h4>
      <p>${lista.jugadores.length} jugador(es)</p>
    </div>
  `
    )
    .join("");
}

function seleccionarLista(listaId) {
  listaSeleccionadaActual = listasScoutingActuales.find(
    (l) => l.id === listaId
  );
  actualizarSidebarListas();
  mostrarDetallesLista();
}

// ========== US504: ADICIÓN DE JUGADORES A LISTAS ==========
function abrirModalAnadirJugador(jugadorId) {
  jugadorSeleccionadoActual = jugadoresDisponibles.find(
    (j) => j.id === jugadorId
  );
  if (!jugadorSeleccionadoActual) return;

  // Preview del jugador
  document.getElementById("jugadorPreview").innerHTML = `
    <h4>${jugadorSeleccionadoActual.nombre}</h4>
    <p style="opacity: 0.7;">@${jugadorSeleccionadoActual.nickname} | ${jugadorSeleccionadoActual.juego}</p>
  `;

  // Llenar dropdown con listas disponibles
  const select = document.getElementById("selectListaDestino");
  select.innerHTML =
    '<option value="">Seleccionar lista...</option>' +
    listasScoutingActuales
      .map(
        (lista) => `
      <option value="${lista.id}">${lista.nombre} (${lista.jugadores.length} jugadores)</option>
    `
      )
      .join("");

  document.getElementById("modalAnadirALista").classList.add("show");
}

function cerrarModalAnadirALista() {
  document.getElementById("modalAnadirALista").classList.remove("show");
  jugadorSeleccionadoActual = null;
}

function confirmarAnadirALista() {
  const listaId = document.getElementById("selectListaDestino").value;

  if (!listaId) {
    alert("Por favor selecciona una lista");
    return;
  }

  const lista = listasScoutingActuales.find((l) => l.id === listaId);

  // Verificar si el jugador ya está en la lista
  if (lista.jugadores.find((j) => j.id === jugadorSeleccionadoActual.id)) {
    alert("Este jugador ya está en la lista seleccionada");
    return;
  }

  // Añadir jugador con nota vacía
  lista.jugadores.push({
    ...jugadorSeleccionadoActual,
    notaEntrenador: "",
    fechaAdicion: new Date().toISOString(),
  });

  guardarDatosScouting();
  actualizarSidebarListas();

  // Mostrar notificación de éxito
  alert(`✓ ${jugadorSeleccionadoActual.nombre} añadido a "${lista.nombre}"`);

  cerrarModalAnadirALista();

  // Si la lista añadida está seleccionada, actualizar vista
  if (listaSeleccionadaActual?.id === listaId) {
    mostrarDetallesLista();
  }
}

// ========== US505: VISUALIZACIÓN DE MÉTRICAS AGREGADAS ==========
function mostrarDetallesLista() {
  if (!listaSeleccionadaActual) return;

  document.getElementById("resultadosScoutingSection").style.display = "none";
  const seccion = document.getElementById("listaDetalleSection");
  seccion.style.display = "block";

  document.getElementById("listaDetalleNombre").textContent =
    listaSeleccionadaActual.nombre;
  document.getElementById("listaDetalleDescripcion").textContent =
    listaSeleccionadaActual.descripcion || "";

  // Calcular métricas agregadas
  const jugadores = listaSeleccionadaActual.jugadores;

  if (jugadores.length === 0) {
    document.getElementById("metricasAgregadas").innerHTML =
      '<p style="opacity: 0.7;">No hay jugadores en esta lista aún.</p>';
    document.getElementById("listaJugadoresContainer").innerHTML = "";
    return;
  }

  const kdaPromedio = (
    jugadores.reduce((sum, j) => sum + j.kda, 0) / jugadores.length
  ).toFixed(2);
  const winratePromedio = (
    jugadores.reduce((sum, j) => sum + j.winrate, 0) / jugadores.length
  ).toFixed(1);
  const tiempoReaccionPromedio = Math.round(
    jugadores.reduce((sum, j) => sum + j.tiempoReaccion, 0) / jugadores.length
  );

  document.getElementById("metricasAgregadas").innerHTML = `
    <div class="metrica-agregada-card">
      <h4>KDA Promedio</h4>
      <div class="metrica-agregada-valor">${kdaPromedio}</div>
    </div>
    <div class="metrica-agregada-card">
      <h4>Win Rate Promedio</h4>
      <div class="metrica-agregada-valor">${winratePromedio}%</div>
    </div>
    <div class="metrica-agregada-card">
      <h4>Tiempo Reacción Promedio</h4>
      <div class="metrica-agregada-valor">${tiempoReaccionPromedio}ms</div>
    </div>
    <div class="metrica-agregada-card">
      <h4>Total Jugadores</h4>
      <div class="metrica-agregada-valor">${jugadores.length}</div>
    </div>
  `;

  // Mostrar jugadores de la lista con notas (US507)
  document.getElementById("listaJugadoresContainer").innerHTML = jugadores
    .map(
      (jugador, index) => `
    <div class="lista-jugador-item">
      <div class="lista-jugador-foto">${jugador.nombre.charAt(0)}</div>
      
      <div class="lista-jugador-info">
        <h4>${jugador.nombre} (@${jugador.nickname})</h4>
        <p style="opacity: 0.7; margin-bottom: 5px;">${jugador.juego} | ${
        jugador.rol
      } | ${jugador.region}</p>
        
        <div class="lista-jugador-metricas-inline">
          <span>📊 KDA: <strong>${jugador.kda}</strong></span>
          <span>🎯 Win Rate: <strong>${jugador.winrate}%</strong></span>
          <span>⚡ ${jugador.tiempoReaccion}ms</span>
        </div>

        ${
          jugador.notaEntrenador
            ? `
          <div class="nota-entrenador">
            <div class="nota-entrenador-label">📝 Nota del Entrenador:</div>
            <div>${jugador.notaEntrenador}</div>
          </div>
        `
            : '<p style="opacity: 0.5; font-size: 0.85rem;">Sin notas del entrenador</p>'
        }
      </div>

      <div class="lista-jugador-actions">
        <button class="btn-editar-nota" onclick="editarNotaJugador(${index})">
          📝 ${jugador.notaEntrenador ? "Editar" : "Añadir"} Nota
        </button>
        <button class="btn-quitar-lista" onclick="quitarJugadorDeLista(${index})">
          🗑️ Quitar
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// ========== US506: EXPORTACIÓN DE LISTAS ==========
function abrirModalExportarLista() {
  if (!listaSeleccionadaActual) {
    alert("Selecciona una lista primero");
    return;
  }

  document.getElementById("modalExportarLista").classList.add("show");
}

function cerrarModalExportarLista() {
  document.getElementById("modalExportarLista").classList.remove("show");
}

function confirmarExportarLista() {
  const formato = document.querySelector(
    'input[name="formato-lista"]:checked'
  ).value;
  const progressDiv = document.getElementById("progressExportLista");
  const progressFill = document.getElementById("progressFillExportLista");
  const progressText = document.getElementById("progressTextExportLista");

  progressDiv.style.display = "block";
  progressFill.style.width = "0%";

  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    progressFill.style.width = progress + "%";

    if (progress === 45)
      progressText.textContent = "Recopilando datos de jugadores...";
    if (progress === 75) progressText.textContent = "Generando documento...";
    if (progress === 90)
      progressText.textContent = "Finalizando exportación...";

    if (progress >= 100) {
      clearInterval(interval);

      if (formato === "pdf") {
        exportarListaPDF();
      } else {
        exportarListaCSV();
      }

      progressText.textContent = "✓ Exportación completada";

      setTimeout(() => {
        cerrarModalExportarLista();
        progressDiv.style.display = "none";
      }, 1500);
    }
  }, 150);
}

function exportarListaPDF() {
  // Simulación de PDF (en producción usarías jsPDF o similar)
  const contenido = {
    lista: listaSeleccionadaActual.nombre,
    descripcion: listaSeleccionadaActual.descripcion,
    jugadores: listaSeleccionadaActual.jugadores.map((j) => ({
      nombre: j.nombre,
      nickname: j.nickname,
      juego: j.juego,
      rol: j.rol,
      kda: j.kda,
      winrate: j.winrate,
      notas: j.notaEntrenador || "Sin notas",
    })),
  };

  const blob = new Blob([JSON.stringify(contenido, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Lista_Scouting_${
    listaSeleccionadaActual.nombre
  }_${Date.now()}.pdf.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  alert(
    "PDF simulado exportado (JSON). En producción se generaría un PDF real con jsPDF."
  );
}

function exportarListaCSV() {
  let csv =
    "Nombre,Nickname,Juego,Rol,Región,Edad,KDA,Win Rate,Tiempo Reacción,Notas\n";

  listaSeleccionadaActual.jugadores.forEach((j) => {
    csv += `"${j.nombre}","${j.nickname}","${j.juego}","${j.rol}","${
      j.region
    }",${j.edad},${j.kda},${j.winrate},${j.tiempoReaccion},"${
      j.notaEntrenador || ""
    }"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Lista_Scouting_${
    listaSeleccionadaActual.nombre
  }_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ========== US507: NOTAS Y EVALUACIONES PERSONALIZADAS ==========
function editarNotaJugador(index) {
  const jugador = listaSeleccionadaActual.jugadores[index];

  const notaActual = jugador.notaEntrenador || "";
  const nuevaNota = prompt(
    `Nota para ${jugador.nombre}:\n(Puedes describir observaciones, puntos fuertes, áreas de mejora, etc.)`,
    notaActual
  );

  if (nuevaNota !== null) {
    jugador.notaEntrenador = nuevaNota.trim();
    guardarDatosScouting();
    mostrarDetallesLista();

    if (nuevaNota.trim()) {
      alert("✓ Nota guardada correctamente");
    } else {
      alert("Nota eliminada");
    }
  }
}

function quitarJugadorDeLista(index) {
  const jugador = listaSeleccionadaActual.jugadores[index];

  if (!confirm(`¿Quitar a ${jugador.nombre} de esta lista?`)) {
    return;
  }

  listaSeleccionadaActual.jugadores.splice(index, 1);
  guardarDatosScouting();
  actualizarSidebarListas();
  mostrarDetallesLista();

  alert("Jugador eliminado de la lista");
}

function editarLista() {
  const nuevoNombre = prompt(
    "Nuevo nombre de la lista:",
    listaSeleccionadaActual.nombre
  );
  if (nuevoNombre && nuevoNombre.trim()) {
    listaSeleccionadaActual.nombre = nuevoNombre.trim();

    const nuevaDesc = prompt(
      "Nueva descripción (opcional):",
      listaSeleccionadaActual.descripcion
    );
    if (nuevaDesc !== null) {
      listaSeleccionadaActual.descripcion = nuevaDesc.trim();
    }

    guardarDatosScouting();
    actualizarSidebarListas();
    mostrarDetallesLista();
    alert("✓ Lista actualizada");
  }
}

function eliminarListaActual() {
  if (
    !confirm(
      `¿Eliminar la lista "${listaSeleccionadaActual.nombre}"?\n\nEsta acción no se puede deshacer.`
    )
  ) {
    return;
  }

  const index = listasScoutingActuales.findIndex(
    (l) => l.id === listaSeleccionadaActual.id
  );
  listasScoutingActuales.splice(index, 1);

  listaSeleccionadaActual = null;

  guardarDatosScouting();
  actualizarSidebarListas();

  document.getElementById("listaDetalleSection").style.display = "none";
  alert("Lista eliminada");
}

// ========== US508: NOTIFICACIONES DE NUEVOS TALENTOS ==========
function abrirModalAlertas() {
  document.getElementById("modalAlertas").classList.add("show");
  cargarAlertasGuardadas();
}

function cerrarModalAlertas() {
  document.getElementById("modalAlertas").classList.remove("show");
}

document.getElementById("formAlertas").addEventListener("submit", function (e) {
  e.preventDefault();

  const nuevaAlerta = {
    id: "alerta_" + Date.now(),
    juego: document.getElementById("alerta-juego").value,
    rol: document.getElementById("alerta-rol").value || "Cualquiera",
    kdaMinimo: parseFloat(document.getElementById("alerta-kda").value) || 0,
    winrateMinimo:
      parseInt(document.getElementById("alerta-winrate").value) || 0,
    activa: true,
    fechaCreacion: new Date().toISOString(),
  };

  alertasTalento.push(nuevaAlerta);
  guardarDatosScouting();
  cargarAlertasGuardadas();
  actualizarAlertasActivas();

  this.reset();
  alert(
    "✓ Alerta configurada. Recibirás notificaciones cuando nuevos jugadores cumplan estos criterios."
  );
});

function cargarAlertasGuardadas() {
  const container = document.getElementById("alertasGuardadasList");

  if (alertasTalento.length === 0) {
    container.innerHTML =
      '<h3>Alertas Activas</h3><p style="opacity: 0.7;">No tienes alertas configuradas.</p>';
    return;
  }

  container.innerHTML =
    "<h3>Alertas Activas</h3>" +
    alertasTalento
      .map(
        (alerta, index) => `
    <div class="alerta-item">
      <div class="alerta-item-info">
        <p><strong>${alerta.juego}</strong> ${
          alerta.rol !== "Cualquiera" ? `| ${alerta.rol}` : ""
        }</p>
        <p style="font-size: 0.85rem; opacity: 0.7;">
          KDA ≥ ${alerta.kdaMinimo} | Win Rate ≥ ${alerta.winrateMinimo}%
        </p>
      </div>
      <button class="btn-eliminar-alerta" onclick="eliminarAlerta(${index})">🗑️</button>
    </div>
  `
      )
      .join("");
}

function eliminarAlerta(index) {
  if (confirm("¿Eliminar esta alerta?")) {
    alertasTalento.splice(index, 1);
    guardarDatosScouting();
    cargarAlertasGuardadas();
    actualizarAlertasActivas();
  }
}

function actualizarAlertasActivas() {
  const container = document.getElementById("alertasActivas");

  if (alertasTalento.length === 0) {
    container.innerHTML =
      '<p style="font-size: 0.85rem; opacity: 0.6; margin-top: 10px;">Sin alertas</p>';
  } else {
    container.innerHTML = `<p style="font-size: 0.85rem; color: #10b981; margin-top: 10px;">
      ✓ ${alertasTalento.length} alerta(s) activa(s)
    </p>`;
  }
}

// Simular notificación de nuevo talento (para demo)
function simularNuevoTalento() {
  if (alertasTalento.length === 0) return;

  const alerta = alertasTalento[0];
  const nuevoJugador = {
    nombre: 'Carlos "Shadow" Méndez',
    juego: alerta.juego,
    rol: alerta.rol !== "Cualquiera" ? alerta.rol : "Mid Laner",
    kda: 4.2,
    winrate: 68,
  };

  alert(
    `🔔 NUEVA ALERTA DE TALENTO\n\n${nuevoJugador.nombre}\n${nuevoJugador.juego} - ${nuevoJugador.rol}\nKDA: ${nuevoJugador.kda} | Win Rate: ${nuevoJugador.winrate}%\n\n¡Revisa su perfil ahora!`
  );
}

// ========== US509: INTEGRACIÓN CON PLATAFORMAS ==========
function conectarPlataforma(plataforma) {
  const plataformas = {
    battlefy: "Battlefy",
    challonge: "Challonge",
  };

  if (
    confirm(
      `¿Conectar con ${plataformas[plataforma]}?\n\nSe abrirá ventana de autenticación OAuth.`
    )
  ) {
    alert(
      `🔗 Conectando con ${plataformas[plataforma]}...\n\n(Funcionalidad de integración OAuth pendiente de implementación con APIs reales)`
    );

    // Simular importación exitosa
    setTimeout(() => {
      const jugadoresImportados = Math.floor(Math.random() * 15) + 5;
      alert(
        `✓ Importación completada\n\n${jugadoresImportados} jugadores nuevos agregados a tu base de datos desde ${plataformas[plataforma]}`
      );
    }, 2000);
  }
}

// ========== US510: ACCESO MÓVIL (Responsive ya implementado en CSS) ==========
// El diseño responsive está manejado completamente en dashboard.css

// ========== GENERAR JUGADORES DEMO ==========
function generarJugadoresDemo() {
  if (jugadoresDisponibles.length > 0) return; // Ya hay datos

  const nombres = [
    "Carlos",
    "Ana",
    "Luis",
    "María",
    "Diego",
    "Sofía",
    "Miguel",
    "Laura",
    "Pedro",
    "Valentina",
  ];
  const apellidos = [
    "García",
    "Rodríguez",
    "Martínez",
    "López",
    "González",
    "Pérez",
    "Sánchez",
    "Ramírez",
  ];
  const nicknames = [
    "Shadow",
    "Phoenix",
    "Blade",
    "Storm",
    "Ninja",
    "Titan",
    "Viper",
    "Ghost",
    "Falcon",
    "Dragon",
  ];
  const juegos = ["League of Legends", "Valorant", "Dota 2", "CS2"];
  const roles = {
    "League of Legends": [
      "Top Laner",
      "Jungler",
      "Mid Laner",
      "ADC",
      "Support",
    ],
    Valorant: ["Duelist", "Controller", "Sentinel", "Initiator"],
    "Dota 2": ["Carry", "Support", "Offlaner", "Mid", "Roamer"],
    CS2: ["AWPer", "Rifler", "Entry Fragger", "Support", "IGL"],
  };
  const regiones = ["LAN", "LAS", "NA", "EUW", "BR", "KR"];

  for (let i = 0; i < 50; i++) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    const nickname =
      nicknames[Math.floor(Math.random() * nicknames.length)] +
      Math.floor(Math.random() * 1000);
    const juego = juegos[Math.floor(Math.random() * juegos.length)];
    const rol = roles[juego][Math.floor(Math.random() * roles[juego].length)];

    jugadoresDisponibles.push({
      id: "jugador_" + Date.now() + "_" + i,
      nombre: `${nombre} ${apellido}`,
      nickname: nickname,
      juego: juego,
      rol: rol,
      region: regiones[Math.floor(Math.random() * regiones.length)],
      edad: Math.floor(Math.random() * 15) + 18, // 18-32 años
      kda: (Math.random() * 3 + 1).toFixed(2),
      winrate: Math.floor(Math.random() * 40) + 45, // 45-85%
      partidas: Math.floor(Math.random() * 800) + 200,
      tiempoReaccion: Math.floor(Math.random() * 150) + 180, // 180-330ms
      biografia: `Jugador competitivo de ${juego} con ${
        Math.floor(Math.random() * 5) + 1
      } años de experiencia. Especializado en ${rol}.`,
      historialEquipos: [],
      logros: [],
      videos: [],
      fechaRegistro: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  guardarDatosScouting();
}

// ========== CONFIGURAR EVENTOS ADICIONALES ==========
function configurarEventosScouting() {
  // Cerrar modales con ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      cerrarModalCrearLista();
      cerrarModalAnadirALista();
      cerrarModalAlertas();
      cerrarModalExportarLista();
      cerrarPerfilDetallado();
    }
  });

  // Cerrar overlay de perfil al hacer clic fuera
  document
    .getElementById("perfilDetalladoOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        cerrarPerfilDetallado();
      }
    });
}
