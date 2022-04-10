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
