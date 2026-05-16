const body = document.body;
const progress = document.querySelector(".scroll-progress");
const revealNodes = document.querySelectorAll("[data-reveal]");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const arrowLinks = document.querySelectorAll(".link-panel__arrow[href]");
const glassPanels = document.querySelectorAll(".glass-panel");

const currentPage = window.location.pathname.split("/").pop() || "index.html";
const pageIndexes = new Map([
  ["index.html", 0],
  ["", 0],
  ["about-altitude.html", 0],
  ["team.html", 1],
  ["cansat.html", 2],
  ["about-cansat.html", 2],
]);
const activeIndex = pageIndexes.get(currentPage) ?? 0;
let selectedIndex = activeIndex;
let pendingNavigation = 0;

if (nav) {
  nav.style.setProperty("--active-index", activeIndex);
}

navLinks.forEach((link) => {
  const linkPage = link.getAttribute("href");
  const linkIndex = pageIndexes.get(linkPage);

  if (linkIndex === activeIndex) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }

  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const isSamePage = linkPage === currentPage || (currentPage === "" && linkPage === "index.html");

    if (linkIndex === undefined || (linkIndex === selectedIndex && isSamePage)) {
      return;
    }

    event.preventDefault();
    selectedIndex = linkIndex;
    window.clearTimeout(pendingNavigation);

    navLinks.forEach((item) => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    });

    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");

    if (nav) {
      nav.dataset.switching = "true";
      nav.style.setProperty("--active-index", linkIndex);
    }

    pendingNavigation = window.setTimeout(() => {
      window.location.assign(linkPage);
    }, 260);
  });
});

arrowLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.assign(link.getAttribute("href"));
  });
});

let lastScrollY = window.scrollY;
let ticking = false;

function updateScrollState() {
  const scrollTop = window.scrollY;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const amount = scrollTop / maxScroll;

  if (progress) {
    progress.style.transform = `scaleX(${amount})`;
  }

  body.classList.toggle("scrolling-down", scrollTop > lastScrollY && scrollTop > 80);
  body.classList.toggle("scrolling-up", scrollTop < lastScrollY);
  lastScrollY = Math.max(0, scrollTop);
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  },
  { passive: true }
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  glassPanels.forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      panel.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      panel.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
      panel.style.setProperty("--panel-lift", "-3px");
    });

    panel.addEventListener("pointerleave", () => {
      panel.style.setProperty("--tilt-x", "0deg");
      panel.style.setProperty("--tilt-y", "0deg");
      panel.style.setProperty("--panel-lift", "0px");
    });
  });
}

window.addEventListener("load", () => {
  updateScrollState();
});
