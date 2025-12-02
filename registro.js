let pasoActual = 1;
const totalPasos = 4;
let datosRegistro = {};

// Actualizar barra de progreso (US001)
function actualizarProgreso() {
  const progreso = (pasoActual / totalPasos) * 100;
  document.getElementById("progressBar").style.width = progreso + "%";
  document.getElementById("progressPercent").textContent =
    Math.round(progreso) + "%";
}

// Navegar a siguiente paso
function siguientePaso(paso) {
  // Validar paso actual antes de continuar
  if (!validarPasoActual()) {
    return;
  }

  // Guardar datos del paso actual
  guardarDatosPaso(pasoActual);

  // Ocultar paso actual
  document.getElementById("seccion" + pasoActual).classList.remove("active");

  // Mostrar siguiente paso
  pasoActual = paso;
  document.getElementById("seccion" + paso).classList.add("active");

  // Actualizar progreso
  actualizarProgreso();

  // Habilitar botón de crear perfil en el último paso
  if (pasoActual === totalPasos) {
    document.getElementById("btnCrearPerfil").disabled = false;
  }
}

// Navegar a paso anterior
function anteriorPaso(paso) {
  document.getElementById("seccion" + pasoActual).classList.remove("active");
  pasoActual = paso;
  document.getElementById("seccion" + paso).classList.add("active");
  actualizarProgreso();
}

// Validar paso actual (US001)
function validarPasoActual() {
  switch (pasoActual) {
    case 1:
      return validarPaso1();
    case 2:
      return validarPaso2();
    case 3:
      return validarPaso3();
    case 4:
      return true; // Paso opcional
    default:
      return true;
  }
}

// Validar Paso 1: Información Básica (US001)
function validarPaso1() {
  const nombre = document.getElementById("nombre").value.trim();
  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("email-registro").value.trim();
  const password = document.getElementById("password-registro").value;
  const passwordConfirm = document.getElementById("password-confirm").value;

  if (!nombre || !nickname || !email || !password || !passwordConfirm) {
    alert("Por favor completa todos los campos obligatorios");
    return false;
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Por favor ingresa un email válido");
    return false;
  }

  // Validar contraseña (mínimo 8 caracteres)
  if (password.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres");
    return false;
  }

  // Validar que las contraseñas coincidan
  if (password !== passwordConfirm) {
    alert("Las contraseñas no coinciden");
    return false;
  }

  // Simular validación de email único (en producción consultar backend)
  const emailsExistentes = JSON.parse(
    localStorage.getItem("emailsRegistrados") || "[]"
  );
  if (emailsExistentes.includes(email)) {
    alert("Este email ya está registrado");
    return false;
  }

  return true;
}

// Validar Paso 2: Selección de Juegos (US001)
function validarPaso2() {
  const juegosSeleccionados = document.querySelectorAll(
    'input[name="juego"]:checked'
  );

  if (juegosSeleccionados.length === 0) {
    alert("Debes seleccionar al menos un juego competitivo");
    return false;
  }

  return true;
}

// Validar Paso 3: Privacidad (US003)
function validarPaso3() {
  const selects = document.querySelectorAll("#seccion3 select");

  for (let select of selects) {
    if (!select.value) {
      alert("Por favor configura todos los niveles de privacidad");
      return false;
    }
  }

  return true;
}

// Guardar datos de cada paso
function guardarDatosPaso(paso) {
  switch (paso) {
    case 1:
      datosRegistro.nombre = document.getElementById("nombre").value;
      datosRegistro.nickname = document.getElementById("nickname").value;
      datosRegistro.email = document.getElementById("email-registro").value;
      datosRegistro.password =
        document.getElementById("password-registro").value;
      break;

    case 2:
      const juegos = [];
      document
        .querySelectorAll('input[name="juego"]:checked')
        .forEach((checkbox) => {
          juegos.push(checkbox.value);
        });
      datosRegistro.juegos = juegos;
      break;

    case 3:
      datosRegistro.privacidad = {
        estadisticas: document.querySelector('select[name="priv-estadisticas"]')
          .value,
        historial: document.querySelector('select[name="priv-historial"]')
          .value,
        contacto: document.querySelector('select[name="priv-contacto"]').value,
        metricas: document.querySelector('select[name="priv-metricas"]').value,
      };
      break;

    case 4:
      datosRegistro.notificaciones = {
        email: document.querySelector('input[name="notif-email"]').checked,
        push: document.querySelector('input[name="notif-push"]').checked,
        perfil: document.querySelector('input[name="notif-perfil"]').checked,
        mensajes: document.querySelector('input[name="notif-mensajes"]')
          .checked,
      };
      break;
  }
}

// Validación en tiempo real de email (US001)
document
  .getElementById("email-registro")
  ?.addEventListener("input", function () {
    const email = this.value.trim();
    const validationSpan = document.getElementById("emailValidation");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length === 0) {
      validationSpan.textContent = "";
      return;
    }

    if (emailRegex.test(email)) {
      validationSpan.textContent = "✓ Email válido";
      validationSpan.className = "email-validation valid";
    } else {
      validationSpan.textContent = "✗ Email inválido";
      validationSpan.className = "email-validation invalid";
    }
  });

// Submit del formulario completo
document
  .getElementById("registroForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Guardar datos del último paso
    guardarDatosPaso(4);

    // Generar ID único para el perfil (US001)
    datosRegistro.id = "user_" + Date.now();
    datosRegistro.fechaCreacion = new Date().toISOString();
    datosRegistro.perfilVerificado = false; // US010 - inicialmente no verificado
    datosRegistro.estadoVerificacion = "pendiente";

    // Guardar en localStorage (simula backend)
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    usuarios.push(datosRegistro);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Guardar email en lista de emails registrados
    const emailsRegistrados = JSON.parse(
      localStorage.getItem("emailsRegistrados") || "[]"
    );
    emailsRegistrados.push(datosRegistro.email);
    localStorage.setItem(
      "emailsRegistrados",
      JSON.stringify(emailsRegistrados)
    );

    // Crear sesión activa
    localStorage.setItem("usuarioActivo", JSON.stringify(datosRegistro));

    // Mensaje de confirmación (US001)
    alert(
      `¡Perfil creado exitosamente! 🎉\n\nID de Perfil: ${datosRegistro.id}\nNickname: ${datosRegistro.nickname}\n\nBienvenido a ArenaMetrics`
    );

    // Redirigir a la landing
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  });

// Inicializar
actualizarProgreso();
