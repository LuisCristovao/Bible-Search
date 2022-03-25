var bible_data;
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function writeHtml(html) {
  document.getElementById("content").innerHTML = html;
}
function bookHtml(book_index, book) {
  return `<a href="?book=${book_index + 1}"><h1>Livro ${book_index + 1} ${
    book.name
  }</h1></a>`;
}
function chapterHtml(book_index, chapter_index) {
  return `<a href="?book=${book_index + 1};chapter=${
    chapter_index + 1
  }"><h2>Capítulo ${chapter_index + 1}</h2></a>`;
}
function verseHtml(book_index, chapter_index, verse_index, verse) {
  return `<p>${verse_index + 1}: ${verse} &nbsp;&nbsp;<a href="?book=${
    book_index + 1
  };chapter=${chapter_index + 1};verse=${verse_index + 1}">></a></p>`;
}
function showBibleVerse(book_index = -1, chapter_index = -1, verse_index = -1) {
  let html = "";
  if (book_index == -1) {
    showAllBible();
    return true;
  } else {
    var book = bible_data[book_index];
    html += bookHtml(book_index, book);
  }
  if (chapter_index != -1) {
    var chapter = book.chapters[chapter_index];
    if (verse_index != -1) {
      let verse = chapter[verse_index];
      html += chapterHtml(book_index, chapter_index);
      html += verseHtml(book_index, chapter_index, verse_index, verse);
    } else {
      html += chapterHtml(book_index, chapter_index);
      chapter.forEach((verse, index) => {
        html += verseHtml(book_index, chapter_index, index, verse);
      });
    }
  } else {
    book.chapters.forEach((chapter, index) => {
      let chapter_index = index;
      html += chapterHtml(book_index, chapter_index);
      chapter.forEach((verse, index) => {
        html += verseHtml(book_index, chapter_index, index, verse);
      });
    });
  }
  writeHtml(html);
}
function showAllBible() {
  let html = "";
  bible_data.forEach((book, index) => {
    let book_index = index;
    html += bookHtml(book_index, book);
    book.chapters.forEach((chapter, index) => {
      let chapter_index = index;
      html += chapterHtml(book_index, chapter_index);
      chapter.forEach((verse, index) => {
        html += verseHtml(book_index, chapter_index, index, verse);
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
//Menu function -----
function menu() {
  let state = window.location.search.split("menu=")[1].split(";")[0];
  let menu_states = {
    start_menu: () => {
      let html = `
      <a href="?" ><h1 class="menu_class">Home</h1></a>
      <a href="?menu=books_menu" ><h1 class="menu_class">Books</h1></a>
      `;
      return html;
    },
    books_menu: () => {
      let html = ``;

      bible_data.forEach((book, book_index) => {
        html += `
        <a href="?menu=book_menu;${book_index + 1}"><h2>${book.name}</h2></a>
        `;
      });
      return html;
    },
    book_menu: () => {
      let book_index = parseInt(window.location.search.split("book_menu;")[1]) - 1;
      let book = bible_data[book_index];
      let html = `<h1>${book.name}</h1>`;
      book.chapters.forEach((chapter, chapter_index) => {
        html += `
        <a href="?book=${book_index + 1};chapter=${chapter_index + 1}" style="font-size:x-large;padding:3px">${
          chapter_index + 1
        }</a>
        `;
      });
      return html;
    }
  };
  writeHtml(menu_states[state]());
}

//-----
//Search functions-----------
function Match(w1,w2){
  return w1.includes(w2)
}
function removeAccents(str){
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}
function Search() {
  let search_query = removeAccents(decodeURI(window.location.search.split("search=")[1])).toLowerCase()
  document.getElementById("search").value=decodeURI(window.location.search.split("search=")[1])
  let matches=[]
  bible_data.forEach((book,book_index)=>{
    let name=removeAccents(book.name).toLowerCase()
    let abbrev=removeAccents(book.abbrev).toLowerCase()
    book.chapters.forEach((chapter,chapter_index)=>{

      //search_query.split(" ").forEach((word)=>{
        /* if (Match(name,word) || Match(word,abbrev)){
          matches.push({"book_index":book_index,"book_name":book.name,"abbrev":book.abbrev})
        } */
        chapter.forEach((verse,verse_index)=>{
          if (Match(removeAccents(verse).toLowerCase(),search_query)) {
            matches.push(
              {"book_index":book_index,
              "book_name":book.name,
              "abbrev":book.abbrev,
              "chapter_index":chapter_index,
              "verse_index":verse_index,
              "verse":verse
            })
          } 
        })
      //})
    })
  })
  /* let html=""
  matches.forEach((match)=>{
    html+=`
    <a href="?menu=book_menu;${match.book_index+1}"><h1>${match.book_name}</h1></a>
    `
  }) */
  //writeHtml(html)
  createSearchSugestions(matches)
}
function createSearchSugestions(matches){
  html=""
  new_testement=matches.filter(match=>match.book_index>=39)
  old_testement=matches.filter(match=>match.book_index<39)
  books_from_new_testement=[... new Set(new_testement.map(book=>{return book.book_name}))]
  books_from_old_testement=[... new Set(old_testement.map(book=>{return book.book_name}))]
  books_from_new_testement_array=[]
  books_from_old_testement_array=[]
  books_from_new_testement.forEach(book_name=>{
    books_from_new_testement_array.push({"book_name":book_name,"data":new_testement.filter(book=>book.book_name==book_name)})
  })
  books_from_old_testement.forEach(book_name=>{
    books_from_old_testement_array.push({"book_name":book_name,"data":old_testement.filter(book=>book.book_name==book_name)})
  })
  console.log(books_from_new_testement_array)
  console.log(books_from_old_testement_array)
  /*html=`<h1 style>Novo Testamento</h1>`
  books_from_new_testement_array.forEach(b)
  writeHtml(html)*/


}
function startSearch(e) {
  if (e.key === "Enter") {
    let search = document.getElementById("search").value;
    window.location.search = `?search=${search}`;
    //alert("Enter is pressed!");
  }
}

//Pages-----
function selectBiBlePart() {
  let data = readQuery();
  showBibleVerse(data.book, data.chapter, data.verse);
}

async function createHome() {
  bible_data = await readBiBle();
  let book_index = getRndInteger(0, bible_data.length);
  let chapter_index = getRndInteger(0, bible_data[book_index].chapters.length);
  let verse_index = getRndInteger(
    0,
    bible_data[book_index].chapters[chapter_index].length
  );

  showBibleVerse(book_index, chapter_index, verse_index);
  //window.location.search=`?book=${book_index+1};chapter=${chapter_index+1};verse=${verse_index+1}`
}
//----------
function showChildren(element) {
  if(element.innerText.includes("▼")){
    element.innerText=element.innerText.replace("▼","▲")
  }else{
    element.innerText=element.innerText.replace("▲","▼")
  }
  let div=element.parentElement
  
  let child_div=div.children[1]
  if(child_div.style.display=="none"){
    child_div.style.display="block"
  }else{
    child_div.style.display="none"
  } 
}
async function readBiBle() {
  //let data = await fetch("bible_data/PT/biblia.json");
  let data = await fetch(
    "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_aa.json"
  );
  return await data.json();
}
// Main -----
const pages = {
  "": () => {
    createHome();
  },
  "?search": () => {
    Search();
  },
  "?book": () => {
    selectBiBlePart();
  },
  "?menu": () => {
    menu("start menu");
  },
};

window.onload = async () => {
  bible_data = await readBiBle();
  let page = window.location.search.split("=")[0];
  pages[page]();
  let search = document.getElementById("search");
  search.addEventListener("keydown", startSearch);
  //handle footer
  if (window.outerHeight >= document.body.offsetHeight) {
    footer.setAttribute(
      "style",
      `position:absolute;top:${window.innerHeight - 50}px`
    );
  } else {
    footer.setAttribute("style", `margin-top:10%`);
  }
  
};
