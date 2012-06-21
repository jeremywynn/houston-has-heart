var trimWhiteSpace = function(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

var hashtags = {
  regex: /(^#[a-zA-Z0-9]{2,})|(\s+#[a-zA-Z0-9]{2,})/g,
  linkBuilder: function(match) {
    trimmedMatch = trimWhiteSpace(match);
    return ' <a href="/search/' + trimmedMatch.substr(1) + '">' + trimmedMatch + '</a>';
  },
  hashLinker: function(str) {
    return str.replace(this.regex, this.linkBuilder);
    //return str.replace(/(?:\s){0,1}#[a-zA-Z0-9]{2,}/g, this.linkBuilder);
  },
  tagPusher: function(str) {
    var tags = [];
    str.replace(this.regex, function(match) {
      tags.push(trimWhiteSpace(match));
    });
    return tags;
  }
}