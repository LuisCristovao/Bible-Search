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
  let db = readLocalDB();
  let star = "&star;";
  if (db != "") {
    if (
      getFavoriteVerse(book_index + 1, chapter_index + 1, verse_index + 1) !=
      undefined
    ) {
      star = "&starf;";
    }
  }
  return `<p>${verse_index + 1}: ${verse} &nbsp;&nbsp;<a href="?book=${
    book_index + 1
  };chapter=${chapter_index + 1};verse=${
    verse_index + 1
  }">></a>&nbsp;&nbsp;<a style="cursor:pointer" onclick="saveToFavorites(this,${
    book_index + 1
  },${chapter_index + 1},${verse_index + 1})" >${star}</a></p>`;
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
      <a href="?" ><h1 class="menu_class">Inicio</h1></a>
      <a href="?menu=books_menu" ><h1 class="menu_class">Livros</h1></a>
      <a href="?favorite_page" ><h1 class="menu_class">Favoritos</h1></a>
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

//Favorites-----
function readLocalDB() {
  if (localStorage["Bible-Search"] == undefined) {
    return "";
  }
  return JSON.parse(localStorage["Bible-Search"]);
}
function writeLocalDB(db) {
  if (localStorage["Bible-Search"] == undefined) {
    localStorage["Bible-Search"] = {};
  }
  localStorage["Bible-Search"] = JSON.stringify(db);
}
function saveToFavorites(start_el, book_index, chapter_index, verse_index) {
  if (localStorage["Bible-Search"] == undefined) {
    let db = { favorites_list: {} };
    db["favorites_list"][`${book_index}_${chapter_index}_${verse_index}`] = {
      notes: "",
    };
    writeLocalDB(db);
  } else {
    let db = readLocalDB();
    //if already exists on favorites it means he/she wants to remove
    if (
      db["favorites_list"][`${book_index}_${chapter_index}_${verse_index}`] !=
      undefined
    ) {
      removeFromFavorites(book_index, chapter_index, verse_index);
      start_el.innerHTML = "&star;";
    } else {
      db["favorites_list"][`${book_index}_${chapter_index}_${verse_index}`] = {
        notes: "",
      };
      writeLocalDB(db);
      start_el.innerHTML = "&starf;";
    }
  }
}
function getFavoriteVerse(book_index, chapter_index, verse_index) {
  let db = readLocalDB();
  return db["favorites_list"][`${book_index}_${chapter_index}_${verse_index}`];
}
function removeFromFavorites(book_index, chapter_index, verse_index) {
  let db = readLocalDB();
  delete db["favorites_list"][`${book_index}_${chapter_index}_${verse_index}`];
  writeLocalDB(db);
}
function editFavoriteVerseNotes(book_index, chapter_index, verse_index, notes) {
  let db = readLocalDB();
  db["favorites_list"][`${book_index}_${chapter_index}_${verse_index}`][
    "notes"
  ] = notes.value;
  writeLocalDB(db);
}
function favoriteHiperLink(book_index, chapter_index, verse_index) {
  let name = bible_data[book_index].name;
  let html = `<p><a href="?book=${book_index + 1};chapter=${
    chapter_index + 1
  };verse=${verse_index + 1}">${name} ${chapter_index + 1}:${
    verse_index + 1
  }</a></p>`;
  return html;
}
function favoriteNotes(book_index, chapter_index, verse_index, notes) {
  let html = "";
  if (notes != "") {
    html += `<textarea oninput="editFavoriteVerseNotes(${book_index}, ${chapter_index}, ${verse_index}, this)">${notes}</textarea>`;
  } else {
    html += `<textarea oninput="editFavoriteVerseNotes(${book_index}, ${chapter_index}, ${verse_index}, this)">notas...</textarea>`;
  }
  return html;
}
function favoritePage() {
  let html = "";
  let db = readLocalDB();
  if (db != "" && Object.keys(db["favorites_list"]).length > 0) {
    let favorites = db["favorites_list"];
    for (key in favorites) {
      let book_index = parseInt(key.split("_")[0]) - 1;
      let chapter_index = parseInt(key.split("_")[1]) - 1;
      let verse_index = parseInt(key.split("_")[2]) - 1;
      let verse = bible_data[book_index].chapters[chapter_index][verse_index];
      html += favoriteHiperLink(book_index, chapter_index, verse_index);
      html += verseHtml(book_index, chapter_index, verse_index, verse);
      html += favoriteNotes(book_index+1, chapter_index+1, verse_index+1,favorites[key]["notes"]);
    }
    writeHtml(html);
  } else {
    writeHtml("<h2>Sem Favoritos</h2>");
  }
}
//Search functions-----------
function Match(w1, w2) {
  let w11 = removeAccents(w1).toLowerCase();
  let w21 = removeAccents(w2).toLowerCase();
  if (supercompare(w11, w21) >= 1.1) {
    return true;
  } else {
    return false;
  }
  //return w11.includes(w21);
}
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function Search() {
  let search_query = removeAccents(
    decodeURI(window.location.search.split("search=")[1])
  ).toLowerCase();
  document.getElementById("search").value = decodeURI(
    window.location.search.split("search=")[1]
  );
  let matches = [];
  let book_matches = [];
  let tmp_match = {};
  //web workers------------
  let workers_done = 0;
  let n_partitions = 5;
  let n_regists_per_partition = Math.round(bible_data.length / n_partitions);
  range(0, n_partitions - 1, 1).forEach((index) => {
    let w = new Worker("./search_worker.js");
    w.onmessage = (msg) => {
      console.log("Dados do worker ");
      matches = matches.concat(msg.data);
      workers_done += 1;
    };
    let start_index = n_regists_per_partition * index;

    w.postMessage({
      bible_data: bible_data.filter((el, i) => {
        if (index + 1 == n_partitions) {
          if (n_regists_per_partition * (index + 1) < bible_data.length) {
            return (
              i >= n_regists_per_partition * index && i <= bible_data.length
            );
          } else {
            return (
              i >= n_regists_per_partition * index &&
              i <= n_regists_per_partition * (index + 1)
            );
          }
        } else {
          return (
            i >= n_regists_per_partition * index &&
            i < n_regists_per_partition * (index + 1)
          );
        }
      }),
      search_query: search_query,
      start_index: start_index,
    });
  });
  while (workers_done < n_partitions) {
    document.getElementById(
      "content"
    ).innerHTML = `<h2>Loading...(${workers_done}/${n_partitions})</h2>`;
    await sleep(300);
  }
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
      let words_to_highlight = chapter_obj.verse_exact_found_words;
      let verse = highLightVerse({
        verse: chapter_obj.verse,
        high_light_words: Object.keys(words_to_highlight),
      });
      //html+=chapterHtml(book_index,chapter_index)
      html += verseHtml(book_index, chapter_index, verse_index, verse);
    });
    html += `</div>`;
    html += `</div>`;
  });
  html += `</div></div>`;
  return html;
}
function highLightVerse(inputs) {
  let verse = inputs.verse;
  inputs.high_light_words.forEach((word) => {
    verse = verse.replaceAll(word, `<b><font color="gold">${word}</font></b>`);
  });
  return verse;
}
function createSearchSugestions(matches, best_matches) {
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
    let words_to_highlight = match.verse_exact_found_words;
    let verse = highLightVerse({
      verse: match.verse,
      high_light_words: Object.keys(words_to_highlight),
    });

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
  //bible_data = await readBiBle();
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
    setTimeout(Search, 100);
  },
  "?book": () => {
    selectBiBlePart();
  },
  "?menu": () => {
    menu("start menu");
  },
  "?favorite_page": () => {
    favoritePage();
  },
};
const range = (start, stop, step) => {
  return Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step
  );
};

window.onload = async () => {
  bible_data = await readBiBle();
  let page = window.location.search.split("=")[0];
  pages[page]();
  let search = document.getElementById("search");
  search.addEventListener("keydown", startSearch);
  window.onscroll = () => {
    scrollFunction(document.getElementById("scrollTopBtn"));
  };
  //handle footer
  /* if (window.outerHeight >= document.body.offsetHeight) {
    footer.setAttribute(
      "style",
      `position:absolute;top:${window.innerHeight - 50}px`
    );
  } else {
    footer.setAttribute("style", `margin-top:10%`);
  } */
  //teste web worker-----
};
