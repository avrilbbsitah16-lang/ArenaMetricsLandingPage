const btn = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu-horizontal");

btn.addEventListener("click", () => {
  menu.classList.toggle("active");
});

document.querySelectorAll(".menu-horizontal a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
      });
      menu.classList.remove("active");
    }
  });
});
