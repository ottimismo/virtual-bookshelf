import { getRootCssStyles } from './cssUtils.js';

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

async function queryGoodReadsAPI(query) {
    console.log("fetching book by " + query)
    const goodReadsRoot = "https://www.goodreads.com";
    const url = goodReadsRoot + "/book/auto_complete?format=json&q=" + query
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
            "author_initials": getInitials(data.author.name),
            "url": goodReadsRoot + data.bookUrl,
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
    <h2>${year}</h2>
    <div style="margin-top: 32px; display: flex">
    ${booksOfYearHtmlSnippet}
    <div>
    `;
}
function get_first_words(title) {
    const words = title.split(/\s+/);
    const first10Words = words.slice(0, 10);
    return first10Words.join(' ');
}
function removeSmallSize(url) {
    return url.split(/\._S\w\d+_/).join('')
}
function generateHtmlSnippet(book) {
    return `
        <div class="book">
            <div class="side spine">
            <span class="spine-title"> ${get_first_words(book.title)}</span>
            <span class="spine-author"> ${book.author_initials} </span>
            </div>
            <div class="side top"></div>
            <div class="side cover" onclick="location.href='${book.url}'"
            style="background-image: url(${removeSmallSize(book.imageUrl)})">
            </div>
        </div>
    `;
}

async function processJsonData() {
    const jsonData = await fetchJsonData();
    if (!jsonData) return;

    const contentDiv = document.getElementById('content');

    for (const obj of jsonData) {
        var booksOfYearHtmlSnippet = "";
        for (const book of obj.books) {
            const bookResponse = await queryGoodReadsAPI(book);
            if (bookResponse) {
                const bookHtml = generateHtmlSnippet(bookResponse);
                booksOfYearHtmlSnippet += bookHtml;
            }
        }
        contentDiv.innerHTML += generateYearSnippet(obj.year, booksOfYearHtmlSnippet);

    }

    let spines = Object.values(document.getElementsByClassName("spine"));
    let covers = Object.values(document.getElementsByClassName("cover"));
    let tops = Object.values(document.getElementsByClassName("top"));

    let availablePatterns = getRootCssStyles();

    let availableColors = [
        "maroon",
        "darkgreen",
        "darkolivegreen",
        "brown",
        "saddlebrown",
        "sienna",
        "midnightblue",
    ];

    // assign a random height, pattern and colour to each book
    spines.map(function (s, i) {
        let randomHeight = getRandomInt(220, 290);
        s.style.height = `${randomHeight}px`;
        s.style.top = `${280 - randomHeight}px`;

        let randomPattern = randomChoice(availablePatterns);
        s.style.backgroundImage = `var(${randomPattern})`;

        let randomColor = randomChoice(availableColors);
        s.style.backgroundColor = randomColor;

        covers[i].style.height = `${randomHeight}px`;
        covers[i].style.top = `${280 - randomHeight}px`;

        tops[i].style.top = `${280 - randomHeight}px`;
    });
}

// Start the process when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', processJsonData);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}
