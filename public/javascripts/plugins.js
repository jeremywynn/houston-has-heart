/*
 Form Sentinel - jQuery Form Validator Plugin
*/

(function($) {

  var formSentinel = {
    rules: {
      required: /./,
      requiredNotWhitespace: /\S/,
      positiveInteger: /^\d*[1-9]\d*$/,
      positiveOrZeroInteger: /^\d+$/,
      integer: /^-?\d+$/,
      decimal: /^-?\d+(\.\d+)?$/,
      email: /^[\w\.\-]+@([\w\-]+\.)+[a-zA-Z]+$/,
      telephone: /^(\+\d+)?( |\-)?(\(?\d+\)?)?( |\-)?(\d+( |\-)?)*\d+$/
    },
    init: function(form) {
      var fields = form.elements;
      for (var i = 0; i < fields.length; i++) {
        if ($(fields[i]).val() != '') {
          formSentinel.fieldListener(fields[i]);
        }
        $(fields[i]).bind('blur', function() {
          formSentinel.fieldListener(this);
        });
        $(fields[i]).bind('focus', function() {
          var self = $(this);
          if (self.hasClass('invalid') || self.hasClass('valid')) {
            self.bind('keyup', function() {
              formSentinel.fieldListener(this);
            });
          }
        });
      }
      $(form).submit(function () {
        formSentinel.submitListener(this);
        return false;
      });
    },
    fieldListener: function(field) {
      var className = field.className;
      var classRegExp = /(^| )(\S+)( |$)/g;
      var classResult;
      while (classResult = classRegExp.exec(className)) {
        var oneClass = classResult[2];
        var rule = this.rules[oneClass];
        if (typeof rule != "undefined") {
          if (!rule.test(field.value)) {
            $(field).addClass('invalid').removeClass('valid');
          }
          else {
            $(field).addClass('valid').removeClass('invalid');
          }
        }
      }
    },
    submitListener: function(form) {
      var failure = false;
      var fields = form.elements;
      for (var i = 0; i < fields.length; i++) {
        var className = fields[i].className;
        var classRegExp = /(^| )(\S+)( |$)/g;
        var classResult;
        while (classResult = classRegExp.exec(className)) {
          var oneClass = classResult[2];
          var rule = this.rules[oneClass];
          if (typeof rule != "undefined") {
            if (!rule.test(fields[i].value)) {
              if (!$(fields[i]).hasClass('invalid')) {
                fields[i].className += ' invalid';
              }
              failure = true;
            }
          }
        }
      }
      $('.invalid').effect('shake', {distance: 5, times: 2}, 50);
      if (failure) {
        return false;
      }
      else {
        form.submit();
      }
    }
  }

  $.fn.formSentinel = function() {
      
    return this.each(function() {
      formSentinel.init(this);
    });

  };
  
})(jQuery);