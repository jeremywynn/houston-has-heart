var moment = require('moment');
var check = require('validator').check;
var sanitize = require('validator').sanitize;

var comments = {
  formatDate: function(timestamp) {
    return moment(timestamp).format('MMMM D, YYYY');
  },
  processOutput: function(docs) {
    var decodedText;
    var retrievedText;
    docs.forEach(function (item) {
      retrievedText = item['text'];
      item['formattedDate'] = comments.formatDate(item['createdAt']);
      decodedText = sanitize(retrievedText).entityEncode();
      hashLinkedText = hashtags.hashLinker(decodedText);
      item['text'] = sanitize(hashLinkedText).xss();
    });
  },
  valid: /\S/
}