/*
 * Allow fields to submit the form whenever they are changed or user presses enter.
 * Eg: Submit ajax form as soon as user clicks a checkbox.
 * Eg: Submit autosuggest when user types in a textbox.
 * Eg: Submit search box when user hits enter.
 *
 * WARNING: Rails jquery_ujs performs unexpected POST when you use data-remote on a textbox, so
 *          we assume data-remote="true" even if you did not specify it on the autosubmit element.
 *
 * v1.0.0 - Oct 2012
 * https://github.com/georgeadamson/autosubmit
 * Copyright (c) 2012 George Adamson; Licensed MIT, GPL
 */
(function ($,document) {

  var timer, autosubmit = function (e) {

    // For keyboard events, we assume a default delay unless a data-delay attribute has been specified:
    var el = $(this),
        delay = parseInt(el.data('delay'),10) || ( e.type.indexOf('key') === 0 ? 400 : 0 ),
        href,
        attrs,
        fnSubmit;

    // Discard any existing timeout if there is one:
    if( delay ){ clearTimeout(timer); }

    // Derive explicitly specified href: Eg: <a href="xxx/yyy"> or <option data-href="/xxx/yyy"> or <option value="/xxx/yyy">
    href  = el.find(':selected').data('href') || el.data('href') || el.attr('href') || el.filter('select').val();
    attrs = { href: href, 'data-remote': true };

    if ( href ) {

      // Attempt to simulate a link using the specified href attribure:
      // This should trigger any click handlers such as ajax or pjax to do their stuff.
      // Note a default native click behaviour cannot be simulated in script, so this can only trigger handlers.

      // Interpolate element value into the url:
      attrs.href = attrs.href.replace( '--value--', el.val() );

      // Copy all data-attributes from "this": (Except data-autosubmit, to avoid any recursive autosubmit shenanigans!)
      $.each( this.attributes, function(i,attr){
        if( attr.name.indexOf('data-') === 0 ){ attrs[attr.name] = attr.value; }
      });
      delete attrs['data-autosubmit'];

      // Add temporary data-remote link to the dom, simulate click then remove it when the response has been handled:
      fnSubmit = function(){
        $('<a>').hide().attr(attrs).one('ajax:complete', function(){ $(this).remove(); }).insertAfter(el).click();
      };

    } else {

      // Otherwise simply submit the form, if there is one:
      fnSubmit = function(){
        el.closest('form').submit();
      };

    }


    // Perform the autosubmit: (After a delay if applicable)
    timer = setTimeout( fnSubmit, delay );

  };


  // Any field with a data-autosubmit attribute can be used to submit the form:
  $(document)
    .on( 'change', '[data-autosubmit=change],[data-autosubmit=true]', autosubmit )
    .on( 'keyup',  '[data-autosubmit=keyup]', autosubmit )
    .on( 'keydown','[data-autosubmit=enter]', function(e){ if(e.keyCode===13){ autosubmit.call(this,e); } } );

})(jQuery,document);
