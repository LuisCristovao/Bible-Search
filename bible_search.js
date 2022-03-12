var bible_data;
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function writeHtml(html) {
  document.getElementById("content").innerHTML = html;
}
function showBibleVerse(book_index = -1, chapter_index = -1, verse_index = -1) {
  let html = "";
  if (book_index == -1) {
    showAllBible();
    return true;
  } else {
    var book = bible_data[book_index];
    html += `<h1>Livro ${book_index + 1} ${book.name}</h1>`;
  }
  if (chapter_index != -1) {
    var chapter = book.chapters[chapter_index];
    if (verse_index != -1) {
      let verse = chapter[verse_index];
      html += `<h2>Capítulo ${chapter_index + 1}</h2>`;
      html += `<p>${verse_index + 1}: ${verse}</p>`;
    } else {
      html += `<h2>Capítulo ${chapter_index + 1}</h2>`;
      chapter.forEach((verse, index) => {
        html += `<p>${index + 1}: ${verse}</p>`;
      });
    }
  } else {
    book.chapters.forEach((chapter, index) => {
      html += `<h2>Capítulo ${index + 1}</h2>`;
      chapter.forEach((verse, index) => {
        html += `<p>${index + 1}: ${verse}</p>`;
      });
    });
  }
  writeHtml(html);
}
function showAllBible() {
  let html = "";
  bible_data.forEach((book, index) => {
    html += `<h1>Livro ${index + 1} ${book.name}</h1>`;
    book.chapters.forEach((chapter, index) => {
      html += `<h2>Capítulo ${index + 1}</h2>`;
      chapter.forEach((verse, index) => {
        html += `<p>${index + 1}: ${verse}</p>`;
      });
    });
  });
  writeHtml(html);
}

function readQuery() {
  let query = window.location.search;
  if (query == "" || query == "?") {
    return "";
  }
  try {
    var book = parseInt(query.split("book=")[1].split(";")[0]);
  } catch {
    var book = "";
  }
  try {
    var chapter = parseInt(query.split("chapter=")[1].split(";")[0]);
  } catch {
    var chapter = "";
  }
  try {
    var verse = parseInt(query.split("verse=")[1].split(";")[0]);
  } catch {
    var verse = "";
  }
  return { book: book - 1, chapter: chapter - 1, verse: verse - 1 };
}

async function readBiBle() {
  
  let data = await fetch("bible_data/PT/biblia.json");
  return await data.json();
}

window.onload = async () => {
  bible_data = await readBiBle();
  let book_index = getRndInteger(0, bible_data.length);
  let chapter_index = getRndInteger(0, bible_data[book_index].chapters.length);
  let verse_index = getRndInteger(
    0,
    bible_data[book_index].chapters[chapter_index].length
  );
  if (readQuery() == "") {
    showBibleVerse(book_index, chapter_index, verse_index);
  } else {
    let data = readQuery();
    showBibleVerse(data.book, data.chapter, data.verse);
  }
};
