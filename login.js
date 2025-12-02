document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validación básica (US001)
    if (!email || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Buscar usuario en localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuarioEncontrado = usuarios.find(
      (u) => u.email === email && u.password === password
    );

    if (!usuarioEncontrado) {
      alert("❌ Email o contraseña incorrectos");
      return;
    }

    // Guardar sesión en localStorage
    const usuarioActivo = {
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      nickname: usuarioEncontrado.nickname,
      email: usuarioEncontrado.email,
      telefono: usuarioEncontrado.telefono || "",
      biografia: usuarioEncontrado.biografia || "",
      disponibilidad: usuarioEncontrado.disponibilidad || "tiempo-completo",
      juegos: usuarioEncontrado.juegos || [],
      especialidades: usuarioEncontrado.especialidades || {},
      privacidad: usuarioEncontrado.privacidad || {},
      notificaciones: usuarioEncontrado.notificaciones || [],
      juegosSincronizados: usuarioEncontrado.juegosSincronizados || {},
      historialEquipos: usuarioEncontrado.historialEquipos || [],
      logros: usuarioEncontrado.logros || [],
      perfilVerificado: usuarioEncontrado.perfilVerificado || false,
      estadoVerificacion: usuarioEncontrado.estadoVerificacion || "pendiente",
      fechaCreacion: usuarioEncontrado.fechaCreacion,
    };

    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    // Mensaje de éxito
    alert(`¡Bienvenido de nuevo, ${usuarioActivo.nombre}! 🎉`);

    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  });
