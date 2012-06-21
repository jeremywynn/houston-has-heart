$(function() {

  $('#comment-form, #guest-form').submit(function() {

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
        
      }
    });
    return false;
  });

  socket = io.connect();
  
});