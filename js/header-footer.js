document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('main-header');
  if (header) {
    header.innerHTML = `
      <div class="header-row">
        <nav>
          <a href="index.html">Home</a>
          <a href="about.html">About Me</a>
          <a href="experience.html">Experience</a>
          <a href="games.html">Games</a>
          <a href="contact.html">Contact</a>
        </nav>
        <div class="socials">
          <a href="https://github.com/780APM" target="_blank">GitHub</a> |
          <a href="https://www.linkedin.com/in/morgankemp/" target="_blank">LinkedIn</a> |
          <a href="https://x.com/Mog_780" target="_blank">Twitter</a>
        </div>
      </div>
    `;
  }
  const footer = document.getElementById('main-footer');
  if (footer) {
    footer.innerHTML = `
      <div>© 2025 Morgan. All rights reserved.</div>
    `;
  }
  // Highlight active nav link
  const navLinks = document.querySelectorAll('.header-row nav a');
  const path = window.location.pathname.replace(/\/$/, ''); // remove trailing slash
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (
      (href === 'index.html' && (path.endsWith('/index.html') || path === '' || path.endsWith('/'))) ||
      (href !== 'index.html' && path.endsWith(href))
    ) {
      link.classList.add('active');
    }
  });
}); 