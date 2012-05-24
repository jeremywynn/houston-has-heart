$(function() {

  $('.love-button').click(function(){
    $.post('love', { commentId: $(this).attr('data-love-id') });
  });

  $('#comment-form').submit(function() {
    $.post('post', $(this).serialize());
    return false;
  });

  socket = io.connect();
  // This works!
  socket.on("loves:changed", function(data) {
    $('#love-id-' + data['_id']).html(data['loves']);
  });

  socket.on("comments:changed", function(data) {
    if ($('#new-comments').length < 1) {
      $('.msgs').prepend('<div id="new-comments">More comments have been made</div>');
      $('#new-comments').slideDown();
    }
  });
  
  /*
  socket.on("connection", function() {
    alert('connected!');
  });
  */
});

/*
textarea.comment-editor(maxlength='200', name="comment")
            textarea.comment-editor.minifield(maxlength='200', name="name")
            textarea.comment-editor.minifield(maxlength='200', name="email")
            */