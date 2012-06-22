$(function() {

  $('#new-comments').live('click', function() {
    setSinceMarker();
    $.get('/comments', { since: sinceMarker }, function(data) {
      $('#new-comments, #no-results').remove();
      $('#recent-comments').prepend(data);
    });
  });

  $('#comment-form, #guest-form').submit(function() {
    setSinceMarker();
    postDelay = true;

    $.post('/post', $(this).serialize(), function(data) {

      if (data.status === 'negative') {
        $('#notification').removeAttr('class').addClass('negative');
        $('#notification').stop(true, false).empty().html(data.text).slideDown();
      }
      else {
        $('#notification').removeAttr('class').addClass('positive');
        $('#notification').stop(true, false).empty().html(data.text).slideDown().delay(4000).slideUp();

        $('.comment-editor').val('');
        $('#name-field, #email-field').val('');
        $('.chars-left').html('200');

        $('.compose, #guest-form').hide();
        $('.process-intro').show();
        
        $.get('/comments', { since: sinceMarker }, function(data) {
          $('#new-comments, #no-results').remove();
          $('#recent-comments').prepend(data);
          
          postDelay = false;

        });
      }
    });
    return false;
  });

  setCursorMarker();
  $.get('/comments', { cursor: cursorMarker }, function(data) {
    if (data.length > 0) {
      $('.msgs').append('<div class="top-shadow"><div id="more-posts" class="more-posts"><img src="/images/ajax-loader.gif" alt="" id="loading-pic">Load More Posts</div></div>');
    }
  });

  $('#more-posts').live('click', function() {
    $('#loading-pic').css('display', 'inline-block');
    setCursorMarker();
    $.get('/comments', { cursor: cursorMarker }, function(data) {
      $('#loading-pic').hide();
      if (data.length > 0) {
        $('.msg').last().after(data);
        cursorMarker = $('.msg').last().data('comment-id');
        $.get('/comments', { cursor: cursorMarker }, function(data) {
          if (data.length < 1) {
            $('#more-posts').remove();
          }
        });
      }
      else {
        $('#more-posts').remove();
      }
    });
  });

  socket = io.connect();

  socket.on("comments:added", function(data) {
    setSinceMarker();
    if (postDelay !== true) {
      $.get('/comments', { since: sinceMarker }, function(data) {
        if (data.length > 0) {
          if ($('#new-comments').length < 1) {
            $('#recent-comments').prepend('<div id="new-comments">More comments have been made</div>');
            $('#new-comments').slideDown();
          }
        }
      });
    }
  });
  
});