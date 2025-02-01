// script.js
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });
});

var buttons = document.querySelectorAll('.accordion-button');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    // Toggle the 'active' class on the clicked button
    this.classList.toggle('active');

    // Toggle the display of the corresponding content
    var content = this.nextElementSibling;
    if (content.style.display === 'block') {
      content.style.display = 'none';
    } else {
      content.style.display = 'block';
    }
  });
}


