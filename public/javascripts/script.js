var cursorMarker;
var sinceMarker;
var postDelay = false;
var setCursorMarker = function () {
  return cursorMarker = $('.msg').last().data('comment-id');
};
var setSinceMarker = function () {
  return sinceMarker = $('.msg').first().data('comment-id');
};

function removeHash () { 
  var scrollV, scrollH, loc = window.location;
  if ("pushState" in history)
    history.pushState("", document.title, loc.pathname + loc.search);
  else {
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;

    loc.hash = "";

    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}

if (window.location.hash == '#_=_') {
  removeHash();
}

$(function() {

  $('#notification').click(function () {
    $(this).slideUp();
  });

  $('#share-love').click(function () {
    $('.process-intro').hide();
    $('.posting-info, .compose').show();
  });

  $('.love-button').live('click', function() {
    $.post('/love', { commentId: $(this).attr('data-love-id') });
  });

  $('#submit-comment').click(function() {
    if ($(this).hasClass('disabled')) {
      return false;
    }
  });

  socket = io.connect();
  socket.on("loves:changed", function(data) {
    $('#love-id-' + data['_id']).html(data['loves']).removeClass('unloved');
  });

  socket.on("comments:removed", function(data) {
    if (data) {
      var purgeCount = data.length;
      var purgeHandle = '#comment-id-';
      while (purgeCount--) {
        $('#comment-id-' + data[purgeCount]).remove();
      }
    }
  });

  $('#guest-post').click(function() {
    $('.process-intro').hide();
    $('#guest-form').show();
    $('.posting-info').hide();
    return false;
  });

  $('#guest-refuse').click(function() {
    $('#guest-form').hide();
    $('.process-intro').show();
    $('#post-options').show();
    return false;
  });

  $('#loggedin-comment-editor').bind('keydown, keyup', function() {
    if (/\S/.test(this.value)) {
      $('#submit-comment').removeClass('disabled');
    }
    else {
      $('#submit-comment').addClass('disabled');
    }
  });

  $('.comment-editor').bind('keydown, keyup', function() {
    $('.chars-left').html(200 - this.value.length);
  });

  $('#guest-comment-editor, .guest-field').bind('keydown, keyup', function() {
    if (/\S/.test($('#name-field').val()) && /\S/.test($('#email-field').val()) && /\S/.test($('#guest-comment-editor').val())) {
      $('#submit-comment').removeClass('disabled');
    }
    else {
      $('#submit-comment').addClass('disabled');
    }
  });
  
});