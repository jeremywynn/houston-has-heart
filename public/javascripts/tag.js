var searchQuery = window.location.pathname;
var tagQuery = searchQuery.substr(searchQuery.lastIndexOf('/'));
var realTagQuery = tagQuery.substr(1);

$(function() {

  $('#new-comments').live('click', function() {
    setSinceMarker();
    $.get('/comments/tagged/' + realTagQuery, { since: sinceMarker }, function(data) {
      $('#new-comments, #no-results').remove();
      $('.msgs').prepend(data);
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
        
        $.get('/comments/tagged/' + realTag, { since: sinceMarker }, function(data) {
          $('#new-comments, #no-results').remove();
          $('.msgs').prepend(data);
          
          postDelay = false;

        });
      }
    });
    return false;
  });

  setCursorMarker();
  $.get('/comments/tagged/' + realTagQuery, { cursor: cursorMarker }, function(data) {
    if (data.length > 0) {
      $('.msgs').append('<div class="top-shadow"><div id="more-posts" class="more-posts"><img src="/images/ajax-loader.gif" alt="" id="loading-pic">Load More Posts</div></div>');
    }
  });

  $('#more-posts').live('click', function() {
    setCursorMarker();
    $.get('/comments/tagged/' + realTagQuery, { cursor: cursorMarker }, function(data) {
      if (data.length > 0) {
        $('.msg').last().after(data);
        cursorMarker = $('.msg').last().data('comment-id');
        $.get('/comments/tagged/' + realTagQuery, { cursor: cursorMarker }, function(data) {
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
      $.get('/comments/tagged/' + realTagQuery, { since: sinceMarker }, function(data) {
        if (data.length > 0) {
          if ($('#new-comments').length < 1) {
            $('.msgs').prepend('<div id="new-comments">More comments have been made</div>');
            $('#new-comments').slideDown();
          }
        }
      });
    }
  });
  
});