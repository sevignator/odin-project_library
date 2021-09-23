const button = document.querySelector('.display-mode-button');
const buttonIcon = document.querySelector('.display-mode-button > i');

let isDark = JSON.parse(window.localStorage.getItem('isDark')) ?? false;

function initDisplayMode() {
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  }
  setDisplayModeIcon();
}

function changeDisplayMode() {
  document.documentElement.classList.toggle('dark-mode');
  isDark = !isDark;
  window.localStorage.setItem('isDark', JSON.stringify(isDark));
  setDisplayModeIcon();
}

function setDisplayModeIcon() {
  if (isDark) {
    buttonIcon.classList.add('fa-sun');
    buttonIcon.classList.remove('fa-moon');
  } else {
    buttonIcon.classList.add('fa-moon');
    buttonIcon.classList.remove('fa-sun');
  }
}

initDisplayMode();

button.addEventListener('click', changeDisplayMode);
