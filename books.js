// Function to fetch the JSON file
async function fetchJsonData() {
    try {
        const response = await fetch('books.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        return null;
    }
}

async function queryByISBN(ISBN) {
    console.log("fetching book by "+ISBN)
    const goodReadsRoot = "https://www.goodreads.com";
    const url = goodReadsRoot+"/book/auto_complete?format=json&q=" + ISBN
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        var data = await response.json();
        data = data[0];
        return {
            "title": data.title,
            "author": data.author.name,
            "url": goodReadsRoot+data.bookUrl,
            "imageUrl": data.imageUrl
        }
    } catch (error) {
        console.error(`Error fetching image from ${url}:`, error);
        return null;
    }
}
function getInitials(fullName) {
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase());
    return initials.join('');
}

function generateYearSnippet(year, booksOfYearHtmlSnippet) {
    return `
    <div style="margin-top: 32px;">
    <h2>${year}</h2>
    <div>
        ${booksOfYearHtmlSnippet}
    </div>
    <hr>
    <div>
    `;
}
function generateHtmlSnippet(book) {
    return `
        <div class="book">
            <div class="side spine">
            <span class="spine-title"> ${book.title}</span>
            <span class="spine-author"> ${getInitials(book.author)} </span>
            </div>
            <div class="side top"></div>
            <div class="side cover" onclick="location.href='${book.url}'"
            style="background-image: url(${book.imageUrl})">
            </div>
        </div>
    `;
}
// <img src="${imageUrl}" alt="${name}">
// function queryByISBN(ISBN) {
//     console.log("isbn" + ISBN);
//     return { "title": "rapunzel basda adsasd", "author": "meco", };
// }
// Function to process the JSON data and update the HTML
async function processJsonData() {
    const jsonData = await fetchJsonData();
    if (!jsonData) return;

    const contentDiv = document.getElementById('content');

    for (const obj of jsonData) {
        const year = obj.year;
        var booksOfYearHtmlSnippet = "";
        const books = obj.books;
        console.log(books);
        books.forEach(book => {
            if (book.ISBN) {
                bookResponse = queryByISBN(book.ISBN)
            }
            if (book.title) {
                // console.log(book.title)
                // bookResponse = queryByTitle(item.title)                
            }
            // if (imageUrl) {
            //     const imageUrl = await fetchImage(url);
            // }
            const bookHtml = generateHtmlSnippet(bookResponse);
            booksOfYearHtmlSnippet += bookHtml;
        })

        contentDiv.innerHTML += generateYearSnippet(year, booksOfYearHtmlSnippet);

    }
}

// Start the process when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', processJsonData);
