$(function() {

  var postDelay = false;
  var setSinceMarker = function () {
    return sinceMarker = $('.msg').first().data('comment-id');
  };

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