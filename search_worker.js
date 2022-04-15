function supercompare(search_word, word) {
  //Second method
  var matches = 0;
  var missMatches = 0;
  var word_freq = {};
  var search_freq = {};
  for (var i = 0; i < word.length; i++) {
    //if not exists
    if (word_freq[word[i]] == null) {
      word_freq[word[i]] = 1;
    } //already exists
    else {
      var count = word_freq[word[i]];
      count++;
      word_freq[word[i]] = count;
    }
  }
  for (var i = 0; i < search_word.length; i++) {
    //if not exists
    if (search_freq[search_word[i]] == null) {
      search_freq[search_word[i]] = 1;
    } //already exists
    else {
      var count = search_freq[search_word[i]];
      count++;
      search_freq[search_word[i]] = count;
    }
  }
  //
  matches = 0;
  missMatches = 0;
  for (var key in search_freq) {
    //both have same letter
    if (search_freq[key] != null && word_freq[key] != null) {
      //
      if (search_freq[key] == word_freq[key]) {
        matches += search_freq[key];
      } else {
        //give the lowest value of matches
        matches +=
          search_freq[key] < word_freq[key] ? search_freq[key] : word_freq[key];
        var difference = Math.abs(search_freq[key] - word_freq[key]);
        missMatches += difference;
      }
    } else {
      missMatches++;
    }
  }
  //count missmatches if word bigger than search word
  for (var key in word_freq) {
    if (search_freq[key] == null && word_freq[key] != null) {
      missMatches++;
    }
  }
  //adding a new compare index
  var index_supplement = this.indexSuplement(word, search_word);

  var compare_index = matches / (matches + missMatches);
  //
  return compare_index + index_supplement;
}
function indexSuplement(word, search_word) {
  if (search_word.length >= 3)
    return search_word[0] == word[0] &&
      search_word[1] == word[1] &&
      search_word[2] == word[2]
      ? 0.3
      : -0.3;
  else {
    if (search_word.length >= 2) {
      return search_word[0] == word[0] && search_word[1] == word[1]
        ? 0.2
        : -0.2;
    } else {
      if (search_word.length >= 1) {
        return search_word[0] == word[0] ? 0.1 : -0.1;
      } else {
        return 0;
      }
    }
  }
}
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
function SearchWorker(bible_data, search_query, start_index) {
  //let search_query = "brado jesus"
  //document.getElementById("search").value = "Deus"
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
            //.filter((word) => (word.trim() != "") & (word.trim().length > 2))
            .forEach((word, word_index) => {
              let verse_word2 = removeAccents(verse_word)
                .toLowerCase()
                .replaceAll(";", "")
                .replaceAll(":", "")
                .replaceAll(",", "")
                .replaceAll(".", "");
              let matches_found = {};
              let verse_exact_found_words = {};
              let verse_word_key = verse_word2;
              if (Match(verse_word_key, word) & (word.trim() != "")) {
                verse_exact_found_words[verse_word] = "";
                if (Object.keys(tmp_match) == 0) {
                  matches_found[verse_word_key] = supercompare(
                    removeAccents(word).toLowerCase(),
                    verse_word_key
                  );
                  tmp_match = {
                    book_index: start_index + book_index,
                    book_name: book.name,
                    abbrev: book.abbrev,
                    chapter_index: chapter_index,
                    verse_index: verse_index,
                    verse: verse,
                    matches_found: matches_found,
                    match_score: 0,
                    verse_exact_found_words: verse_exact_found_words,
                  };
                } else {
                  tmp_match.verse_exact_found_words[verse_word]='';
                  if (tmp_match.matches_found[verse_word_key] != null) {
                    tmp_match.matches_found[verse_word_key] += supercompare(
                      removeAccents(word).toLowerCase(),
                      verse_word_key
                    );
                  } else {
                    tmp_match.matches_found[verse_word_key] = supercompare(
                      removeAccents(word).toLowerCase(),
                      verse_word_key
                    );
                  }
                }
              }
            });
        });
        if (Object.keys(tmp_match).length > 0) {
          let match_score = 0;
          let words = search_query
            .split(" ")
            .map((word) => removeAccents(word).toLowerCase());
          Object.keys(tmp_match.matches_found).forEach((key, key_index) => {
            match_score += 10 + tmp_match.matches_found[key];
            if (words[key_index] == key) {
              match_score += 10;
            }
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
  return matches;
}

this.onmessage = function (input_data) {
  let matches = SearchWorker(
    input_data.data.bible_data,
    input_data.data.search_query,
    input_data.data.start_index
  );
  this.postMessage(matches);
};
