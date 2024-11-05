// Define constants for API URL and DOM elements
const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchType = document.getElementById("search-type");
const searchButton = document.getElementById("search-button"); // Ensure this ID is correct in HTML
const bookList = document.getElementById("book-list");
const selectedBook = document.getElementById("selected-book");
const sortRatingButton = document.getElementById("sort-rating");
const ebookFilterCheckbox = document.getElementById("ebook-filter");

let allBooks = []; // Store all fetched books

// Add event listeners
searchForm.addEventListener("submit", handleSearch);
sortRatingButton.addEventListener("click", handleSort);
ebookFilterCheckbox.addEventListener("change", handleFilter);

/**
 * Searches for books using the Google Books API based on the given query and type.
 *
 * @async
 * @param {string} query - The search term (title, ISBN, or author name).
 * @param {string} type - The type of search to perform (e.g., 'title', 'isbn', 'author').
 * @returns {Promise<Array>} A promise that resolves to an array of book objects.
 */
async function searchBooks(query, type) {
    const url = `${API_BASE_URL}?q=${type}:${query}&maxResults=10`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check if items exist in the response
        if (!data.items) {
            console.error("No items found.");
            return []; // Return an empty array if no items are found
        }

        // Map data to relevant book properties
        const books = data.items.map(item => ({
            title: item.volumeInfo.title || "Unknown",
            author_name: item.volumeInfo.authors?.join(", ") || "Unknown",
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || "Unknown",
            cover_i: item.volumeInfo.imageLinks?.thumbnail || "",
            ebook_access: item.accessInfo?.isEbook ? "E-book Access: Available" : "E-book Access: Unavailable",
            first_publish_year: item.volumeInfo.publishedDate?.split("-")[0] || "Unknown",
            ratings_sortable: item.volumeInfo.averageRating || 0 // Default to 0 if rating is unavailable
        }));
        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
        return []; // Return an empty array in case of an error
    }
}

/**
 * Displays the list of books in the UI.
 *
 * @param {Array} books - An array of book objects to be displayed.
 */
function displayBookList(books) {
    bookList.innerHTML = ""; // Clear existing book list
    if (books.length === 0) {
        bookList.innerHTML = "<li>No books available.</li>"; // Handle case when no books are available
    } else {
        books.forEach(book => {
            const li = document.createElement("li");

            li.innerHTML = `
                <h3 class="title-element">${book.title}</h3>
                <p class="author-element">Author: ${book.author_name}</p>
                <img class="cover-element" src="${book.cover_i}" alt="${book.title} cover">
                <p class="rating-element">Rating: ${book.ratings_sortable}</p>
                <p class="ebook-element">${book.ebook_access}</p>
            `;
            
            li.addEventListener("click", () => displaySingleBook(book));
            bookList.appendChild(li);
        });
    }
    bookList.style.display = "block"; // Ensure book list is visible
    selectedBook.style.display = "none"; // Hide selected book details  
}

/**
 * Handles the search form submission and updates the UI with search results.
 *
 * @async
 * @param {Event} event - The form submission event.
 */
async function handleSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim(); // Trim whitespace from input
    const type = searchType.value;
    
    if (query === "") {
        console.error("Search query cannot be empty."); // Log error for empty query
        return; // Prevent search if the query is empty
    }
    
    allBooks = await searchBooks(query, type); // Store fetched books in the global variable
    displayBookList(allBooks); // Display the fetched books
}

/**
 * Displays detailed information about a single book when it's clicked.
 *
 * @param {Object} book - The book object containing detailed information.
 */
function displaySingleBook(book) {
    selectedBook.innerHTML = `
        <h2 class="title-element">${book.title}</h2>
        <p class="author-element">Author: ${book.author_name}</p>
        <img class="cover-element" src="${book.cover_i}" alt="${book.title} cover">
        <p class="published-element">Published: ${book.first_publish_year}</p>
        <p class="rating-element">Rating: ${book.ratings_sortable}</p>
        <p class="ebook-element">${book.ebook_access}</p>
        <p class="isbn-element">ISBN: ${book.isbn}</p>
    `;
    bookList.style.display = "none"; // Hide the book list
    selectedBook.style.display = "block"; // Show selected book details
}

/**
 * Filters the displayed book list to show only e-books when the checkbox is checked.
 */
function handleFilter() {
    const isEbookFilterEnabled = ebookFilterCheckbox.checked;
    const filteredBooks = allBooks.filter(book => {
        const isAvailable = book.ebook_access === "E-book Access: Available"; 
        return isEbookFilterEnabled ? isAvailable : true; 
    });

    // Log the filtered books for debugging
    console.log("Filtered Books:", filteredBooks);
    
    displayBookList(filteredBooks); // Re-display filtered books
}

/**
 * Sorts the displayed book list by rating in descending order when the button is clicked.
 */
function handleSort() {
    const sortedBooks = [...allBooks].sort((a, b) => {
        const ratingA = parseFloat(a.ratings_sortable) || 0; // Handle unknown ratings
        const ratingB = parseFloat(b.ratings_sortable) || 0; // Handle unknown ratings
        return ratingB - ratingA;
    });
    displayBookList(sortedBooks); // Display sorted books
}
