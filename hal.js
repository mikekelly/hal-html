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
      var $el = $(this);
      var find_property = function(el,name) {
        return el.find('> .properties > [name~="' + name + '"]')[0].value;
      };

      if ($el.length > 1) {
        return $.map($el, function(parent) {
          return find_property($(parent), name);
        });
      } else {
        return find_property($el, name);
      }
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
    // 1. Placeholder on control inputs
    $('.controls input').each(function(idx, input) {
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
    // 3. Label property inputs
    $('.properties input').each(function(idx, input) {
      input = $(input);
      if (input.attr('type') !== 'hidden') {
        var input_name = input.attr('name');
        var $label = $('<label for="' + input_name + '">' + input_name + ':</label>');
        $label.insertBefore(input);
      }
    });
    // 4. Make control and embedded relations hyperlinks to docs (if URL or CURIE)
    $('.controls > form').each(function(idx, control) {
      control = $(control);
      var rel = control.attr('name');
      var href = makeURL(rel);
      if (href) {
        control.prepend('<style>form[name="' + rel + '"]:before { content: none; }</style>');
        control.prepend('<p class="name">' + rel + '<a href="' + href + '">[ docs ]</a></p>');
      }
    });
    $('.embedded > div').each(function(idx, resource) {
      resource = $(resource);
      var rel = resource.attr('class');
      var href = makeURL(rel);
      if (href) {
        resource.prepend('<style>.embedded *[class="' + rel + '"]:before { content: none; }</style>');
        resource.prepend('<p class="name">' + rel + '<a href="' + href + '">[ docs ]</a></p>');
      }
    });
    // 5. Convert large inputs to textareas
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
