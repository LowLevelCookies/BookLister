//Book class

class Book{
  constructor(title, author, isbn){
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }
}
//UI class
class UI{
  static displayBooks(){

    const books = Store.getBooks();
    for(const book of books){
      UI.addBookToList(book);
    }
  }
  static addBookToList(book){
    //create the row to put in the table body
    const list = document.querySelector('#book-list');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</td>
    `;
    list.appendChild(row);
  }
  static deleteBook(deleteElement){
    //make sure the element has delete class
    if (deleteElement.classList.contains('delete')) {
      //also remove the parent of the parent element of this element <tr> which is the whole row (event propagation)
      deleteElement.parentElement.parentElement.remove();
    }
  }

  static clearField(){
    document.querySelector('#title').value = '';
    document.querySelector('#author').value = '';
    document.querySelector('#isbn').value = '';
  }
  //show error on document
  static showAlert(message, className){
    const div = document.createElement('div');
    //use bootstrap classname for alert
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.container');
    const button = document.querySelector('#tableId');
    //insert the container div before the button element
    container.insertBefore(div, button);
    //vanish in 3 seconds
    setTimeout(()=> document.querySelector('.alert').remove(), 3000);
  }
}
//Storage Class

class Store{
  static getBooks(){ // from local storage
    let books;
    //check if a books exists
    if(localStorage.getItem('books') === null){
      books = [];
    }
    else{
      books = JSON.parse(localStorage.getItem('books')); // returns a string. use JSON.parse() to converto into an array of objects
    }
    return books;
  }

  static addBooks(book){
    //add books to local storage
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books)); //parse into a string
  }
  static removeBooks(isbn){
    // use isbn as id to remove books
    const books = Store.getBooks();
    books.forEach((book, index) => {
      if (book.isbn === isbn) {
        books.splice(index, 1); //remove if isbn is present
      }  
    });
    localStorage.setItem('books', JSON.stringify(books));

  }
}
//Event to display books
document.addEventListener('DOMContentLoaded', UI.displayBooks);
//Event to Add a book
document.querySelector('#book-form').addEventListener('submit', (e) =>{
  e.preventDefault();  
  const title = document.querySelector('#title').value.trim();
  const author = document.querySelector('#author').value.trim();
  const isbn = document.querySelector('#isbn').value.replaceAll(' ', '');

  //validation
  
  if (title === '' || author === '' || isbn === '') {
    UI.showAlert("Please fill all fields", "danger");
  }
  else if(!is_valid_isbn(isbn)){

    UI.showAlert("Invalid ISBN", "danger");
  }
  else{
    //create book object

    const book = new Book(title, author, isbn);
    UI.addBookToList(book);

    //add books to store
    Store.addBooks(book);
    // show success
    UI.showAlert("Book added", 'success');

    //clear field
    UI.clearField();
  }

  }
);
//Event to Remove a book
document.querySelector('#book-list').addEventListener('click', (e) => {
  UI.deleteBook(e.target);
  //access the isbn of the element by parentElement -> previousElementSibling
  try {
    Store.removeBooks(e.target.parentElement.previousElementSibling.textContent );
    if (e.target === null) {
      UI.showAlert("Book removed", 'success');
    }
  } catch (error) {
  }
});
function is_valid_isbn(isbn) {
  if (isbn.includes('-')){ //if isbn has  dashes
    const isbnFormat = new RegExp(/97(8|9)-\d{1,5}-\d{1,7}-\d{1,6}-\d{1}/); //isbn Regex
    if (!isbnFormat.test(isbn)) {
      return false;
    }
    return isbnValidator(isbn.replace(/-/g, '')); //remove all the dashes
  }
  else{ //if isbn is only digits
    return isbnValidator(isbn);
  }
}

function isbnValidator(isbn) {
  //take the first 12 digits into an array
  const lastDigit = Number(isbn) % 10;
  let isbnArr = [];
  let isbnArrMultiply = [];
  let sum = 0;
  for (let i = 0; i < isbn.length - 1; i++) { // remove last digit
    isbnArr.push(Number(isbn[i]));    
  }
  //Multiply each digit alternately by 1 and 3, starting with 1 for the first digit.
  for (let i = 0; i < isbnArr.length; i++) {
    if (i%2 === 0) { // even *1 (basically don't multiply and just push)
      isbnArrMultiply.push(isbnArr[i]);
    }
    else{ //odd multiply by 3
      isbnArrMultiply.push(isbnArr[i] * 3);
    }
  }
  //sum all elements
  for (let i = 0; i < isbnArrMultiply.length; i++) {
    sum += isbnArrMultiply[i];
  }
  //Calculate the remainder: when this sum is divided by 10 (sum modulo 10). Then subtract this remainder from 10.
  let result = 10 - (sum % 10);
    // compare final result and lastDigit 
  if (result === lastDigit) {
    return true;
  }
  else{
    false;
  }

}