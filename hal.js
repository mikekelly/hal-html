(function() {
  // jQuery extensions
  var extensions = {
    getLink: function(rel, options) {
      if (rel && options) {
        // deal with selection by rel and then name and type
      } else {
        return $(this).find('> .links > a[rel~="' + rel + '"]');
      }
    },
    getProperty: function(name) {
      return $(this).find('> .properties > [class~="' + name + '"]').contents()[0];
    },
    getResource: function(rel) {
      return $(this).find('> .embedded > [class~="' + rel + '"]');
    },
    getControl: function(name) {
      return $(this).find('> .controls > form[name~="' + name + '"]');
    },
    fill_in: function(input_name, opts) {
      opts = opts || {};
      var $el = $(this).find('> input[name~="' + input_name + '"]');
      $el.val(opts['with']);
      return $(this);
    }
  };

  $.extend($.fn, extensions);

  // make extensions top level methods which work off the body element
  $.each(['getLink', 'getProperty', 'getResource', 'getControl'],
         function(i, func_name) {
           $[func_name] = function(args) {
             var $body = $('body');
             return $body[func_name].apply($body, arguments);
           };
         });

  // presentational fixes
  $(function() {
    // 1. Label inputs
    $('input').each(function(idx, input) {
      input = $(input);
      input.attr('placeholder', input.attr('name'));
    });
    // 2. link to docs for rels that are URLs
    $('.links > a').each(function(idx, link) {
      $el = $(link);
      var url = makeURL($el.attr('rel'));
      if (url) {
        var doc_link = $('<span class="doc"><a href="' + url + '">[ docs ]</a></span>');
        $el.attr('style', 'display: inline');
        doc_link.insertAfter($el);
      }
    });
  });

  var urlRegex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  var makeURL = function(str) {
    if(!str) { return false; }
    if(str.match(urlRegex)) { return str; }
    return makeCurie(str);
  };

  var makeCurie = function(str) {
    try {
      return $('body').curie(str)._string;
    } catch(e) {
      return false;
    }
  };
})();
