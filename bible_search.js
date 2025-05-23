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
const copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function writeHtml(html) {
  document.getElementById("content").innerHTML = html;
}
function bookHtml(book_index, book) {
  return `<a href="?menu=book_menu;${book_index + 1}"><h1>Livro ${book_index + 1
    } ${book.name}</h1></a>`;
}
function chapterHtml(book_index, chapter_index) {
  return `<table>
  <tbody>
  <tr>
  <td>
  <a href="?book=${book_index + 1};chapter=${chapter_index + 1
    }"><h2>Capítulo ${chapter_index + 1} </h2></a>
  </td>
  <td>
  <h2 onclick="speakBible(this)" style="padding-left:5px;cursor:pointer">| Ouvir</h2>
  </td>
  </tr>
  </tbody>
  </table>  
    `;
}
function speakBible(self) {
  if (self.innerText == "| Ouvir") {

    let verses = Array.from(document.getElementsByTagName("p")).map(el => el.innerText.replaceAll(">", ""))
    verses.forEach((verse) => {
      var msg = new SpeechSynthesisUtterance();
      msg.lang = "pt"
      msg.text = verse
      speechSynthesis.speak(msg);
    })
    self.innerText = "| Parar de Ouvir"
    //stop screen from hibernating
    navigator.wakeLock.request('screen');
  } else {
    speechSynthesis.cancel()
    self.innerText = "| Ouvir"
  }
}
function verseHtml(
  book_index,
  chapter_index,
  verse_index,
  verse,
  is_bionic_reading_active = true
) {
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
  if (is_bionic_reading_active) {
    verse = bionicReading(verse);
  }
  return `<p>${verse_index + 1}: ${verse} &nbsp;&nbsp;<a href="?book=${book_index + 1
    };chapter=${chapter_index + 1};verse=${verse_index + 1
    }">></a>&nbsp;&nbsp;<a style="cursor:pointer" onclick="saveToFavorites(this,${book_index + 1
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
      <a href="?settings" ><h1 class="menu_class">Definições</h1></a>
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
      html+="<div>"
      book.chapters.forEach((chapter, chapter_index) => {
        html += `
        <a href="?book=${book_index + 1};chapter=${chapter_index + 1
          }" style="font-size:x-large;padding:3px">${chapter_index + 1}</a>
        `;
      });
      html+="</div>"
      return html;
    },
  };
  writeHtml(menu_states[state]());
}

//Favorites-----
function readLocalDB() {
  if (
    localStorage["Bible-Search"] == undefined ||
    localStorage["Bible-Search"].trim() == ""
  ) {
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
    start_el.innerHTML = "&starf;";
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
  let html = `<p><a href="?book=${book_index + 1};chapter=${chapter_index + 1
    };verse=${verse_index + 1}">${name} ${chapter_index + 1}:${verse_index + 1
    }</a></p>`;
  return html;
}
function showNoteButtons() { }
function addNotesButton() { }
function favoriteNotes(book_index, chapter_index, verse_index, notes) {
  let html = "";
  if (notes != "") {
    html += `<textarea oninput="editFavoriteVerseNotes(${book_index}, ${chapter_index}, ${verse_index}, this)">${notes}</textarea>`;
  } else {
    html += `<textarea oninput="editFavoriteVerseNotes(${book_index}, ${chapter_index}, ${verse_index}, this)" placeholder="notas..."></textarea>`;
  }
  return html;
}
function favoriteSearch(search_query) {
  console.log("fav search");
  let html = "";
  let db = readLocalDB();
  if (db != "" && Object.keys(db["favorites_list"]).length > 0) {
    let favorites = db["favorites_list"];
    let search_favorites = {};
    search_query
      .split(" ")
      .map((word) => removeAccents(word).toLowerCase())
      .forEach((search_word) => {
        for (key in favorites) {
          let book_index = parseInt(key.split("_")[0]) - 1;
          let chapter_index = parseInt(key.split("_")[1]) - 1;
          let verse_index = parseInt(key.split("_")[2]) - 1;
          let verse =
            bible_data[book_index].chapters[chapter_index][verse_index];
          let notes = favorites[key]["notes"];
          if (
            removeAccents(verse).toLowerCase().includes(search_word) ||
            removeAccents(notes).toLowerCase().includes(search_word)
          ) {
            search_favorites[key] = "";
          }
        }
      });
    for (key in search_favorites) {
      let book_index = parseInt(key.split("_")[0]) - 1;
      let chapter_index = parseInt(key.split("_")[1]) - 1;
      let verse_index = parseInt(key.split("_")[2]) - 1;
      let verse = bible_data[book_index].chapters[chapter_index][verse_index];
      html += favoriteHiperLink(book_index, chapter_index, verse_index);
      html += verseHtml(book_index, chapter_index, verse_index, verse);
      html += favoriteNotes(
        book_index + 1,
        chapter_index + 1,
        verse_index + 1,
        favorites[key]["notes"]
      );
    }
    if (html != "") {
      writeHtml(html);
    } else {
      writeHtml(
        `<h2>Não encontrou favoritos com pesquisa: ${search_query}</h2>`
      );
    }
  } else {
    //do nothing...
  }
}
function startFavSearch(e) {
  //if (e.key === "Enter" || e.key==="Tab") {

  let search = document.getElementById("search").value;
  favoriteSearch(search);
  //alert("Enter is pressed!");
  //}
}
/*
Using this function because removeEventListener does not work
*/
function replaceSearchInputElement() {
  let search = document.getElementById("search");
  let search_parent = search.parentNode;
  search_parent.removeChild(search);
  let new_search = document.createElement("input");
  new_search.setAttribute("placeholder", "Pesquisar favoritos");
  new_search.setAttribute("type", "text");
  new_search.setAttribute("id", "search");
  search_parent.appendChild(new_search);
  new_search.addEventListener("keydown", startFavSearch);
  return new_search;
}
function favoritePage() {
  let new_search = replaceSearchInputElement();
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
      html += favoriteNotes(
        book_index + 1,
        chapter_index + 1,
        verse_index + 1,
        favorites[key]["notes"]
      );
    }
    writeHtml(html);
  } else {
    writeHtml("<h2>Sem Favoritos</h2>");
  }
}
function exportFav(btn) {
  let old_text = btn.innerText;
  btn.innerText = "Favoritos Copiados!";
  copyToClipboard(localStorage["Bible-Search"]);
  setTimeout(() => {
    btn.innerText = old_text;
  }, 1000);
}
function importFav(btn) {
  let old_text = btn.innerText;
  btn.innerText = "Favoritos Importados com Sucesso!";
  localStorage["Bible-Search"] =
    document.getElementsByTagName("textarea")[0].value;
  setTimeout(() => {
    btn.innerText = old_text;
  }, 1000);
}
function RandomPassSync(size) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < size; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
function shareConnectionUrl(btn) {
  let peer_id = btn.getAttribute("peer_id");
  if (peer_id != null) {
    copyToClipboard(window.location.origin + "/Bible-Search/?Connect::" + peer_id);
    let old_text = btn.innerText;
    btn.innerText = "Copied Link!";
    setTimeout(() => {
      btn.innerText = old_text;
    }, 1000);
  }
}
function connect(peer, host_name, receive_info, ms = 1000) {
  //host that initiates invitation for connection
  conn = peer.connect(window.location.search.split("::")[1]);

  conn.on("open", function () {
    // Receive messages
    conn.on("data", function (data) {
      console.log("Received0", data);
      receive_info = true
      conn.send(`Hello!${host_name}`)
      if (data.slice(0, 6).includes("Hello!")) {
        createConnectionEstablishedPage(data.slice(6), host_name, conn);
      } else {
        receiveDataPage(data, other_host_name);
      }
    });
  });

  //try to connect on fail
  setTimeout(() => {
    if (!receive_info) {
      connect(peer, host_name, receive_info, ms + 500)
    }
  }, ms)
}
function syncPage() {
  var peer_id = null;
  var receive_info = false;
  const host_name = RandomPassSync(5);
  var other_host_name = null;
  var peer = new Peer();
  var conn = null;
  let html = "";
  html += `<h3>You host name is: ${host_name}</h3><br>`;
  html += `<h3>Read QR Code to connect</h3><br>`;
  html += `<img><br>`;
  html += `<button style="font-size:large" onclick="shareConnectionUrl(this)">Share Connection Url</button>`;

  // first host to receive connection
  peer.on("open", function (id) {
    peer_id = id;
    document.getElementsByTagName("button")[0].setAttribute("peer_id", peer_id);
    console.log("My peer ID is: " + id);
    document
      .getElementsByTagName("img")[0]
      .setAttribute(
        "src",
        "https://api.qrserver.com/v1/create-qr-code/?data=" +
        window.location.origin +
        "/Bible-Search/?Connect::" +
        id +
        "&amp;size=100x100"
      );
  });
  //on connection
  peer.on("connection", function (_conn) {
    console.log("connected with " + _conn.peer);
    connection_established = true;
    // Send messages
    conn = _conn;

    setTimeout(() => {
      conn.send(`Hello!${host_name}`);
    }, 300);

    conn.on("data", (data) => {
      console.log("Received3: ", data);
      if (data.slice(0, 6).includes("Hello!")) {
        other_host_name = data.slice(6)
        createConnectionEstablishedPage(data.slice(6), host_name, conn);
      } else {
        receiveDataPage(data, other_host_name);
      }
    });
  });

  if (window.location.search.split("::")[1] != undefined) {
    connect(peer, host_name, receive_info);
  }

  return html;
}
function sendPasswordsEncrypted(conn) {
  if (localStorage["Bible-Search"] == undefined || localStorage["Bible-Search"].trim() == "") {
    alert("You have nothing to send!");
  } else {
    conn.send(localStorage["Bible-Search"]);
  }
}
function createConnectionEstablishedPage(_other_host_name, host_name, conn) {
  other_host_name = _other_host_name;
  let html = `<h3>You host name is: ${host_name}</h3><br>`;
  html += `<button style="font-size:large" >Send Data to ${other_host_name}</button>`;
  writeHtml(html);
  setTimeout(() => {
    document.getElementsByTagName("button")[0].addEventListener("click", () => { sendPasswordsEncrypted(conn) })
  }, 300)
}
function receiveDataPage(data, other_host_name) {
  let html = `<h3>Receiving data from host : ${other_host_name}</h3><br>`;
  html += `<textarea style="width:250px;height:300px">${data}</textarea><br>`;
  html += `<button style="font-size:large" onclick='importFav(this)'>Importar Favoritos</button>`;

  // html += `<button style="font-size:large" onclick='alert("Sending data")'>Cancel</button>`;
  writeHtml(html);
}
function settingsPage() {
  //document.body.innerHTML=""
  let state = null;
  try {
    state = window.location.search.split("settings=")[1];
  } catch {
    state = "";
  }

  let html = `<h1 align="center" onclick="exportFav(this)" style="text-decoration:underline rgb(5, 134, 167);cursor:pointer">Exportar Favoritos</h1>`;
  html += `<a href="${window.location.origin}/Bible-Search/?settings=import" align="center" ><h1>Importar Favoritos</h1></a>`;
  html += `<a href="${window.location.origin}/Bible-Search/?settings=sync" align="center" ><h1>Sincronizar Favoritos</h1></a>`;

  if (state === "import") {
    html = `<div align="center">`;
    html += `<textarea placeholder="Colocar Json aqui!" style="width:300px;height:300px"> </textarea><br>`;
    html += `<button onclick="importFav(this)">Importar</button>`;
    html += `</div>`;
  }
  if (state === "sync") {
    html = syncPage();
  }

  writeHtml(html);
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
  let n_partitions = navigator.hardwareConcurrency || 5;
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
      html += verseHtml(book_index, chapter_index, verse_index, verse, false);
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
    html += verseHtml(book_index, chapter_index, verse_index, verse, false);
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
  //english
  /*let data = await fetch(
    "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_bbe.json"
  );*/
  return await data.json();
}
function bionicReading(paragraph_text) {
  let bionic_text = "";
  //split in words paragraph
  paragraph_text.split(" ").forEach((word) => {
    let word_length = word.length;
    if (word_length > 1) {
      let bionic_word = `<b style="color:rgb(212, 208, 208);">${word.substring(
        0,
        Math.floor(word.length / 2)
      )}</b>${word.substring(Math.floor(word.length / 2), word_length)}`;
      bionic_text += `${bionic_word} `;
    } else {
      bionic_text += `<b style="color:rgb(212, 208, 208);">${word}</b> `;
    }
  });
  return bionic_text;
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
  "?settings": () => {
    settingsPage();
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
  let search = document.getElementById("search");
  search.addEventListener("keydown", startSearch);
  if (page.includes("?Connect")) {
    writeHtml(syncPage());
  } else {
    pages[page]();
  }
  window.onscroll = () => {
    scrollFunction(document.getElementById("scrollTopBtn"));
  };
  //bionic reading
  //bionicReading();
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
