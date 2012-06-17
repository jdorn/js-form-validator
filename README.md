Form Validator
===================

This is an extremely light weight javascript form validation class.

Unlike most validation libraries out there,
JS Form Validator doesn't make any assumptions about how your code is structured or how/when you run validation.
It relies heavily on configuration over convention and as a result can easily be integrated into existing projects.

JS Form Validator is javascript framework agnostic.  It will work fine without a framework and can 
also take advantage of MooTools, jQuery, etc. if desired.

Check out example.html for a fully working demonstration.

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
This is a callback function that should remove a field's errors.  It takes the field as an argument.

This should fail gracefully if the field doesn't currently have an error.

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
The keys are field identifiers and the values are objects containing a 'field' and 'validate' parameter.
Most of the time, you probably want to use the field's id or name as the key.
The 'field' parameter is what will pass into the validate function as well as addError, removeError, etc.
The 'validate' parameter is a function that throws an exception message when validation fails.
The 1st argument to the validation function is the field.  The 2nd argument is the event that caused the validation.

```javascript
//jquery example
options.rules = {
  'name': {
    'field': $('#name'),
    'validate': function(field, event) {
      if(field.val().length < 2) throw "Names must be at least 2 letters.";
      if(/[^a-zA-Z '\-]/.test(field.val())) throw "That name contains invalid characters";
    }
  },
  'home_phone': {
    'field': $('#home_phone'),
    'validate': function(field, event) {
      //only fail validation when submitting
      if(event==='submit') {
        if(!field.val().length) throw "Please enter a phone number";
      }
    }
  }
};
```

If you try and validate a field that doesn't have a rule associated, it will automatically pass validation.

Running Validation
=====================

After all that configuration, it's finally time to tell the validator when to run.

The most common case is to run validation when a form submits.

```javascript
//jquery example
$('#my_form').on('submit',function() {
  //this will run all the validation rules
  return validator.validateFields('submit');
  
  //this will only run the selected validation rules
  return validator.validateFields(['name','home_phone']);
});
```

Another common use case is to validate an input when it loses focus.

```javascript
//jquery example
$('#my_form').on('blur','input,select,textarea',function() {
  validator.validateField($(this).attr('id'),'blur');
});
```

It is also common to remove an error as soon as a field gains focus again.

```javascript
//jquery example
$('#my_form').on('focus','input,select,textarea',function() {
  validator.clearError($(this).attr('id'));
});
```
To clear multiple errors at once:

```javascript
//clear all errors
validator.clearErrors();

//clear selected errors
validator.clearErrors(['name','home_phone']);
```

Setting Default Configuration Options
===================================

If you are going to use the FormValidator multiple places, it would probably be useful to set defaults for some of 
the configuration options.

```javascript
FormValidator.prototype.defaults.addError = function(field, message) {
  //jquery example
  field.addClass('error');
  alert(message);
};

//when creating a validator object, you now don't need to pass in the addError option
```
