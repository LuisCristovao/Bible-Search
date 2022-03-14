var bible_data;
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function writeHtml(html) {
  document.getElementById("content").innerHTML = html;
}
function bookHtml(book_index,book){
  return `<a href="?book=${book_index + 1}"><h1>Livro ${book_index + 1} ${book.name}</h1></a>`;
}
function chapterHtml(book_index,chapter_index){
  return `<a href="?book=${book_index + 1};chapter=${chapter_index + 1}"><h2>Capítulo ${chapter_index + 1}</h2></a>`;
}
function verseHtml(book_index,chapter_index,verse_index,verse){
  return `<p>${verse_index + 1}: ${verse} &nbsp;&nbsp;<a href="?book=${book_index + 1};chapter=${chapter_index + 1};verse=${verse_index + 1}">></a></p>`;
}
function showBibleVerse(book_index = -1, chapter_index = -1, verse_index = -1) {
  let html = "";
  if (book_index == -1) {
    showAllBible();
    return true;
  } else {
    var book = bible_data[book_index];
    html += bookHtml(book_index,book)
  }
  if (chapter_index != -1) {
    var chapter = book.chapters[chapter_index];
    if (verse_index != -1) {
      let verse = chapter[verse_index];
      html += chapterHtml(book_index,chapter_index)
      html += verseHtml(book_index,chapter_index,verse_index,verse);
    } else {
      html += chapterHtml(book_index,chapter_index);
      chapter.forEach((verse, index) => {
        html += verseHtml(book_index,chapter_index,index,verse);
      });
    }
  } else {
    book.chapters.forEach((chapter, index) => {
      let chapter_index=index
      html += chapterHtml(book_index,chapter_index)
      chapter.forEach((verse, index) => {
        html += verseHtml(book_index,chapter_index,index,verse)
      });
    });
  }
  writeHtml(html);
}
function showAllBible() {
  let html = "";
  bible_data.forEach((book, index) => {
    let book_index=index
    html += bookHtml(book_index,book)
    book.chapters.forEach((chapter, index) => {
      let chapter_index=index;
      html += chapterHtml(book_index,chapter_index);
      chapter.forEach((verse, index) => {
        html += verseHtml(book_index,chapter_index,index,verse)
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
  
  //let data = await fetch("bible_data/PT/biblia.json");
  let data = await fetch("https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_aa.json");
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
    //window.location.search=`?book=${book_index+1};chapter=${chapter_index+1};verse=${verse_index+1}`
  } else {
    let data = readQuery();
    showBibleVerse(data.book, data.chapter, data.verse);
  }
};
