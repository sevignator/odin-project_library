const bookGrid = document.querySelector('.book-grid');
const addBookButton = document.querySelector('.add-book-button');
const addBookForm = document.querySelector('.js-add-book-form');
const editBookForm = document.querySelector('.js-edit-book-form');

let lastEditedId = null;

// Library constructor

function Library() {
  this.books = [];
}
Library.prototype.addBook = function (title, author, pages) {
  const newBook = new Book(title, author, pages);
  this.books.push(newBook);
};
Library.prototype.removeBook = function (bookId) {
  const bookIndex = this.books.findIndex(book => book.id === bookId);
  console.log(bookIndex);
  this.books.splice(bookIndex, 1);
};
Library.prototype.findBook = function (bookId) {
  return this.books.find(book => book.id === bookId);
};

// Book constructor definition

function Book(title, author, pages) {
  this.id = uuidv4();
  this.title = title;
  this.author = author;
  this._pages = pages;
  this._progress = 0;
  this._read = false;
}
Book.prototype.info = function () {
  const message = this.read ? 'has been read' : 'not read yet';
  return `${this.title} by ${this.author}, ${this.pages} pages, ${message}`;
};
Book.prototype.updateProgress = function (page) {
  if (page > this.pages) return;
  this.progress = page;
};
Object.defineProperty(Book.prototype, 'pages', {
  get() {
    return this._pages;
  },
  set(value) {
    this._pages = Number.parseInt(value);
  },
});
Object.defineProperty(Book.prototype, 'progress', {
  get() {
    return this._progress;
  },
  set(value) {
    if (value > this.pages) return;
    this._progress = Number.parseInt(value);
    if (this._progress === this.pages) {
      this._read = true;
    } else {
      this._read = false;
    }
  },
});

// Card functions

function generateCard(book) {
  const progressBarWidth = `${(book.progress * 100) / book.pages}%`;
  return `
    <article class="book-card" data-book-id="${book.id}" tabindex=0>
      <div class="book-card-body">
        <h2 class="js-title">${book.title}</h2>
        <p class="js-author">${book.author}</p>
      </div>
      <footer class="book-card-footer">
        <div class="book-card-pages">
          <div class="book-card-pages__progress-bar" style="width:${progressBarWidth}"></div>
          <p class="book-card-page-count">
            <span class="js-progress">${book._progress}</span> / <span class="js-pages">${book._pages}</span><br> pages
          </p>
        </div>
        <div class="book-card-options">
          <button class="book-card-edit">Edit</button>
          <button class="book-card-delete">Delete</button>
        </div>
      </footer>
    </article>
  `;
}

function updateCard(card, book) {
  const titleEl = card.querySelector('.js-title');
  const authorEl = card.querySelector('.js-author');
  const pagesEl = card.querySelector('.js-pages');
  const progressEl = card.querySelector('.js-progress');
  const progressBar = card.querySelector('.book-card-pages__progress-bar');

  titleEl.textContent = book.title;
  authorEl.textContent = book.author;
  pagesEl.textContent = book.pages;
  progressEl.textContent = book.progress;

  progressBar.style.width = `${(book.progress * 100) / book.pages}%`;
}

function handleReadIcon(card, book) {
  if (book._read) {
    card.classList.add('is-read');
  } else {
    card.classList.remove('is-read');
  }
}

// Grid functions

function addToGrid(book) {
  bookGrid.insertAdjacentHTML('afterbegin', generateCard(book));
}

function removeFromGrid(card) {
  card.remove();
}

function renderGrid() {
  getStorage();
  myLibrary.books?.forEach(book => {
    const card = generateCard(book);
    bookGrid.insertAdjacentHTML('afterbegin', card);

    const currentCard = bookGrid.querySelector(`[data-book-id="${book.id}"]`);
    handleReadIcon(currentCard, book);
  });
}

// Modal popup functions

function openModal(modal) {
  document.body.classList.add('modal-open');
  modal.classList.add('modal--open');
}

function closeModal(modal) {
  document.body.classList.remove('modal-open');
  modal.classList.remove('modal--open');
}

// Form functions

function clearFormInputs(inputs) {
  inputs.forEach(input => {
    input.value = '';
  });
}

function populateEditForm(book) {
  const editForm = document.querySelector('.js-edit-book-form');
  const titleInput = editForm.querySelector('#book-title');
  const authorInput = editForm.querySelector('#book-author');
  const progressInput = editForm.querySelector('#book-progress');
  const pagesInput = editForm.querySelector('#book-pages');

  titleInput.value = book.title;
  authorInput.value = book.author;
  progressInput.value = book.progress;
  pagesInput.value = book.pages;
}

// Utility functions

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorage() {
  const myBooks = JSON.parse(window.localStorage.getItem('myBooks'));

  myBooks.forEach(book => {
    Object.setPrototypeOf(book, Book.prototype);
  });

  if (myBooks != null) {
    myLibrary.books = myBooks;
  }
}

function updateStorage() {
  const myBooks = JSON.stringify(myLibrary.books);
  window.localStorage.setItem('myBooks', myBooks);
}

// Forms handling

// Add book form
addBookForm.addEventListener('submit', e => {
  e.preventDefault;

  const inputs = e.currentTarget.querySelectorAll('input');
  const modal = document.querySelector('.modal--open');

  [title, author, pages] = [...inputs].map(input => input.value);

  myLibrary.addBook(title, author, Number.parseInt(pages));
  addToGrid(myLibrary.books.at(-1));

  updateStorage();

  clearFormInputs(inputs);
  closeModal(modal);
});

// Edit book form
editBookForm.addEventListener('submit', e => {
  e.preventDefault();

  const modal = document.querySelector('.modal--open');
  const currentBook = myLibrary.findBook(lastEditedId);
  const currentCard = bookGrid.querySelector(
    `[data-book-id="${lastEditedId}"]`
  );

  currentBook.title = e.currentTarget.querySelector('#book-title').value;
  currentBook.author = e.currentTarget.querySelector('#book-author').value;
  currentBook.pages = e.currentTarget.querySelector('#book-pages').value;
  currentBook.progress = e.currentTarget.querySelector('#book-progress').value;

  handleReadIcon(currentCard, currentBook);

  updateStorage();

  updateCard(currentCard, currentBook);
  closeModal(modal);
});

// Event listeners

// Handles click on the "add book" button
addBookButton.addEventListener('click', () => {
  const modal = document.querySelector('.js-add-book');
  openModal(modal);
});

document.addEventListener('click', e => {
  // Handles closing a modal by clicking outside of the body
  if (e.target.classList.contains('modal')) {
    const modal = document.querySelector('.modal--open');
    closeModal(modal);
  }
  // Handles closing a modal by clicking on the close button
  if (e.target.classList.contains('close-button')) {
    const modal = document.querySelector('.modal--open');
    closeModal(modal);
  }
  // Handles click on edit button
  if (e.target.classList.contains('book-card-edit')) {
    lastEditedId = e.target.closest('.book-card').dataset.bookId;
    const currentBook = myLibrary.findBook(lastEditedId);
    populateEditForm(currentBook);

    const modal = document.querySelector('.js-edit-book');
    openModal(modal);
  }
  // Handles click on the "delete" button
  if (e.target.classList.contains('book-card-delete')) {
    const card = e.target.closest('.book-card');
    const cardId = card.dataset.bookId;

    myLibrary.removeBook(cardId);
    updateStorage();
    removeFromGrid(card);
  }
});

window.addEventListener('keydown', e => {
  // Handles closing a modal by pressing the Escape key
  if (e.code === 'Escape') {
    if (document.querySelector('.modal--open')) {
      const modal = document.querySelector('.modal--open');
      closeModal(modal);
    }
  }
});

// Runtime script initialization

setTimeout(() => {
  document.documentElement.classList.remove('no-animation');
}, 0);
const myLibrary = new Library();
renderGrid();
