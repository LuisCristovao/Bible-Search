var bible_data;

function scrollToTop(btn) {
  //document.body.scrollTo(0,0)
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  btn.style.display = "none";
}
function scrollFunction(btn) {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function writeHtml(html) {
  document.getElementById("content").innerHTML = html;
}
function bookHtml(book_index, book) {
  return `<a href="?menu=book_menu;${book_index + 1}"><h1>Livro ${
    book_index + 1
  } ${book.name}</h1></a>`;
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
      let book_index =
        parseInt(window.location.search.split("book_menu;")[1]) - 1;
      let book = bible_data[book_index];
      let html = `<h1>${book.name}</h1>`;
      book.chapters.forEach((chapter, chapter_index) => {
        html += `
        <a href="?book=${book_index + 1};chapter=${
          chapter_index + 1
        }" style="font-size:x-large;padding:3px">${chapter_index + 1}</a>
        `;
      });
      return html;
    },
  };
  writeHtml(menu_states[state]());
}

//-----
//Search functions-----------
function Match(w1, w2) {
  let w11 = removeAccents(w1).toLowerCase();
  let w21 = removeAccents(w2).toLowerCase();
  return w11.includes(w21);
}
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function Search() {
  let search_query = removeAccents(
    decodeURI(window.location.search.split("search=")[1])
  ).toLowerCase();
  document.getElementById("search").value = decodeURI(
    window.location.search.split("search=")[1]
  );
  let matches = [];
  let book_matches = [];
  let tmp_match = {};
  bible_data.forEach((book, book_index) => {
    let name = removeAccents(book.name).toLowerCase();
    let abbrev = removeAccents(book.abbrev).toLowerCase();
    book.chapters.forEach((chapter, chapter_index) => {
      search_query.split(" ").forEach((word) => {
        if (Match(name, word) || Match(word, abbrev)) {
          book_matches.push({
            book_index: book_index,
            book_name: book.name,
            abbrev: book.abbrev,
          });
        }
      });
      chapter.forEach((verse, verse_index) => {
        tmp_match = {};
        verse.split(" ").forEach((verse_word) => {
          search_query
            .split(" ")
            .filter((word) => (word.trim() != "") & (word.trim().length > 2))
            .forEach((word, word_index) => {
              if (Match(verse_word, word) & (word.trim() != "")) {
                if (Object.keys(tmp_match) == 0) {
                  let matches_found = {};
                  let verse_word_key = removeAccents(verse_word)
                    .toLowerCase()
                    .replaceAll(";", "")
                    .replaceAll(":", "")
                    .replaceAll(",", "");
                  matches_found[verse_word_key] = 0.1;
                  tmp_match = {
                    book_index: book_index,
                    book_name: book.name,
                    abbrev: book.abbrev,
                    chapter_index: chapter_index,
                    verse_index: verse_index,
                    verse: verse,
                    matches_found: matches_found,
                    match_score: 0,
                  };
                } else {
                  let verse_word_key = removeAccents(verse_word)
                    .toLowerCase()
                    .replaceAll(";", "")
                    .replaceAll(":", "")
                    .replaceAll(",", "");
                  if (tmp_match.matches_found[verse_word_key] != null) {
                    tmp_match.matches_found[verse_word_key] += 0.1;
                  } else {
                    tmp_match.matches_found[verse_word_key] = 0.1;
                  }
                }
              }
            });
        });
        if (Object.keys(tmp_match).length > 0) {
          let match_score = 0;
          Object.keys(tmp_match.matches_found).forEach((key) => {
            match_score += 10 + tmp_match.matches_found[key];
          });
          tmp_match["match_score"] = match_score;
          matches.push(tmp_match);
        }
      });
    });
  });
  /* let html=""
  matches.forEach((match)=>{
    html+=`
    <a href="?menu=book_menu;${match.book_index+1}"><h1>${match.book_name}</h1></a>
    `
  }) */
  //writeHtml(html)
  matches = matches.sort((a, b) => {
    if (a.match_score > b.match_score) {
      return -1;
    }
    if (a.match_score < b.match_score) {
      return 1;
    }

    // names must be equal
    return 0;
  });
  //matches=matches.filter((m,i)=>{return i<20})
  createSearchSugestions(
    matches,
    book_matches,
    matches.filter((value, index) => index < 10)
  );
}

function createSearchSugestionsHtml(title, array) {
  let html = "<div>";
  html += `<h1 style="text-decoration:underline;cursor:pointer" onclick="showChildren(this)">${title} (${array.length}) &#x25BC;</h1>`;
  html += `<div style="display: none;">`;
  array.forEach((book_obj) => {
    html += `<div>`;
    html += `
    <h2 style="text-decoration:underline;cursor:pointer" onclick="showChildren(this)">
    ${book_obj.book_name} (${book_obj.data.length}) &#x25BC;
    </h2>
    <div style="display: none;">
    `;
    chapters = book_obj.data;
    chapters.forEach((chapter_obj) => {
      let book_index = chapter_obj.book_index;
      let chapter_index = chapter_obj.chapter_index;
      let verse_index = chapter_obj.verse_index;
      let verse = chapter_obj.verse;
      //html+=chapterHtml(book_index,chapter_index)
      html += verseHtml(book_index, chapter_index, verse_index, verse);
    });
    html += `</div>`;
    html += `</div>`;
  });
  html += `</div></div>`;
  return html;
}

function createSearchSugestions(matches, book_matches, best_matches) {
  let html = "";
  new_testement = matches.filter((match) => match.book_index >= 39); //.filter((m,i)=>{return i<10});
  old_testement = matches.filter((match) => match.book_index < 39); //.filter((m,i)=>{return i<10});
  books_from_new_testement = [
    ...new Set(
      new_testement.map((book) => {
        return book.book_name;
      })
    ),
  ];
  books_from_old_testement = [
    ...new Set(
      old_testement.map((book) => {
        return book.book_name;
      })
    ),
  ];
  books_from_new_testement_array = [];
  books_from_old_testement_array = [];
  books_from_new_testement.forEach((book_name) => {
    books_from_new_testement_array.push({
      book_name: book_name,
      data: new_testement.filter((book) => book.book_name == book_name),
    });
  });
  books_from_old_testement.forEach((book_name) => {
    books_from_old_testement_array.push({
      book_name: book_name,
      data: old_testement.filter((book) => book.book_name == book_name),
    });
  });
  console.log(best_matches);
  console.log(books_from_new_testement_array);
  console.log(books_from_old_testement_array);

  //Best search------
  html += "<div>";
  html += `<h1 style="text-decoration:underline;cursor:pointer" onclick="showChildren(this)">Melhores Pesquisas (${best_matches.length}) &#x25BC;</h1>`;
  html += `<div style="display: none;">`;
  best_matches.forEach((match) => {
    let book_index = match.book_index;
    let chapter_index = match.chapter_index;
    let verse_index = match.verse_index;
    let verse = match.verse;
    //html+=chapterHtml(book_index,chapter_index)
    html += verseHtml(book_index, chapter_index, verse_index, verse);
  });
  html += "</div>";
  html += "</div>";
  //books----
  //html+=createSearchSugestionsHtml("Livros",book_matches)
  //new testement
  html += createSearchSugestionsHtml(
    "Novo Testamento",
    books_from_new_testement_array
  );

  // old testement html----------------
  html += createSearchSugestionsHtml(
    "Antigo Testamento",
    books_from_old_testement_array
  );

  writeHtml(html);
}

function startSearch(e) {
  if (e.key === "Enter") {
    let search = document.getElementById("search").value;
    window.location.search = `?search=${search}`;
    //alert("Enter is pressed!");
  }
}
function showChildren(element) {
  if (element.innerText.includes("▼")) {
    element.innerText = element.innerText.replace("▼", "▲");
  } else {
    element.innerText = element.innerText.replace("▲", "▼");
  }
  let div = element.parentElement;

  let child_div = div.children[1];
  if (child_div.style.display == "none") {
    child_div.style.display = "block";
  } else {
    child_div.style.display = "none";
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
    document.getElementById("content").innerHTML = "<h2>Loading...</h2>";
    setTimeout(Search, 10);
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
  window.onscroll = ()=> {scrollFunction(document.getElementById("scrollTopBtn"))};
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
