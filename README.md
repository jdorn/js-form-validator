Form Validator
===================

This is an extremely light weight javascript form validation class.

Unlike most validation libraries out there,
JS Form Validator doesn't make any assumptions about how your code is structured or how/when you run validation.
It relies heavily on configuration over convention.

JS Form Validator is javascript framework agnostic.  It will work fine without a framework and can 
also take advantage of MooTools, jQuery, etc. if desired.


Configuration
===================

To use JS Form Validator, you need to include the script on the page, define the validation rules and callback functions,
and finally tell the validator when to run validation.

```html
<script type='text/javascript' src='validator.js'></script>
<script>
var options = {};
var validator = new FormValidator(options);
</script>
```

Here are the different configuration options.  They can either be set globally (see below) or
passed in when creating the FormValidator object.

addError
---------------
This is a callback function that is called when a field fails validation. It takes the field and an error message as arguments.

```javascript
options.addError = function(field, message) {
  //jquery example
  field.addClass('error').after('<span class="error_message">'+message+'</span>');
  
  //mootools example
  field.addClass('error');
  new Element('span',{'class': 'error_message'}).set('text',message).inject(field,'after');
  
  //straight javascript
  field.className += " error";
  var errorspan = document.createElement("span");
  message = document.createTextNode(message);
  errorspan.appendChild(message);
  field.parentNode.insertBefore(errorspan,field.nextSibling);
};
```

For the rest of the examples, I will only use jQuery.  
Mootools and others will be similar and writing straight javascript is a pain.

removeError
----------------
This is a callback function that is called when a field passes validation.  It takes the field as an argument.

```javascript
options.removeError = function(field) {
  //jquery example
  field.removeClass('error').next('.error_message').remove();
};
```
onErrors
----------------
This is an optional callback that occurs after validation fails for 1 or more fields.
It can be used to show a summary of errors at the top of the form, scroll to the first error, etc.

The first argument is an array of errors. Each element in the array is an object with a 'field' and 'message' property.

The second argument is the event that caused the validation. This could be 'blur', 'submit', 'click', or whatever you pass in to the validate call.

```javascript
options.onErrors = function(errors, event) {
  //jquery example of scrolling to the first error on submit
  //we don't want to scroll the page when a field loses focus because that's annoying
  if(event === 'submit') {
  	var scrollto = null;
    
  	//determine the highest error on the page
  	$.each(errors,function(key,error) {
  		var top = error.field.offset().top;
  		if(!scrollto || top < scrollto) scrollto = top;
  	});
  	
  	//if the highest error is above the fold, scroll up to it
  	if(scrollto && $('html,body').scrollTop() > scrollto) {
  	     $('html,body').animate({
  	         scrollTop: scrollto - 20
  	     }, 500);
  	}
  }
};
```
rules
--------------------
This is an object containing all the validation logic.  
The keys are field identifiers and the values are validation functions.  The functions should throw an exception with error message on failure.

Most of the time, you would probably want to use the field's id or name as the identifier.

The 1st argument to the validation function is the field.  The 2nd argument is the event that caused the validation.

```javascript
options.rules = {
  'name': function(field, event) {
    //jquery example
    if(field.val().length < 2) throw "Names must be at least 2 letters.";
    if(/[^a-zA-Z '\-]/.test(field.val())) throw "That name contains invalid characters";
  },
  'home_phone': function(field, event) {
    //only fail validation when submitting
    if(event==='submit') {
      if(!field.val().length) throw "Please enter a phone number";
    }
  }
};
```

If you try and validate a field that doesn't have a rule associated, it will automatically pass validation.

getFieldKey
----------------
This is a callback that takes a field as an argument and returns back the field's identifier.
The returned identifier is used to look up the validation rule to use.

```javascript
options.getFieldKey = function(field) {
  //jquery example
  return field.attr('id');
}
```

Running Validation
=====================

After all that configuration, it's finally time to tell the validator when to run.

The most common case is to run validation when a form submits.

```javascript
//jquery example
$('#my_form').on('submit',function() {
  var fields = [];
  
  //get a collection of all input elements and build array of jQuery objects
  $('input,select,textarea',$(this)).each(function() {
    fields.push($(this));
  });
  
  return validator.validateFields(fields,'submit');
});
```

Another common use case is to validate an input when it loses focus.

```javascript
//jquery example
$('#my_form').on('blur','input,select,textarea',function() {
  validator.validateField($(this),'blur');
});
```

It is also common to remove an error as soon as a field gains focus again.

```javascript
//jquery example
$('#my_form').on('focus','input,select,textarea',function() {
  validator.clearError($(this));
});
```

There is also a clearErrors method that accepts an array of fields (much like validateFields).

Setting Default Configuration Options
===================================

If you are going to use the FormValidator multiple places, it would probably be useful to set defaults for some of 
the configuration options.

```javascript
FormValidator.prototype.defaults.getFieldKey = function(field) {
  //jquery example
  return field.attr('id');
};

//when creating a validator object, you now don't need to pass in the getFieldKey option
```