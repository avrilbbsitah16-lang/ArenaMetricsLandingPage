// Detectar usuario logueado y mostrar su nombre
window.addEventListener("load", () => {
  const usuarioActivoStr = localStorage.getItem("usuarioActivo");

  if (usuarioActivoStr) {
    try {
      const usuario = JSON.parse(usuarioActivoStr);

      // Cambiar botones del navbar para usuario logueado
      const authButtons = document.querySelector(".auth-buttons");
      if (authButtons) {
        authButtons.innerHTML = `
          <button class="btn-auth" onclick="irADashboard()">
            ${usuario.nickname || usuario.nombre} 👤
          </button>
          <button class="btn-auth" onclick="cerrarSesion()">
            Cerrar Sesión
          </button>
        `;
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    }
  }
});

// Ir al dashboard
function irADashboard() {
  window.location.href = "dashboard.html";
}

// Cerrar sesión
function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuarioActivo");
    alert("Sesión cerrada exitosamente");
    window.location.reload();
  }
}

// Toggle Menu para móviles
function toggleMenu() {
  const menu = document.getElementById("menuHorizontal");
  menu.classList.toggle("active");
}
