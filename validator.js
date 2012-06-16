var formValidator = function(options) {
	//extend the default options
	this.options = this.defaults;
	for(var i in options) {
		this.options[i] = options[i];
	}
}

//default configuration options
//you can override these to change them globally
formValidator.prototype.defaults = {
	addError: function(field, message) {},
	removeError: function(field) {},
	rules: {},
	getFieldKey: function(field) { return field; },
	onErrors: function(errors, event) {}
};

formValidator.prototype.validateField = function(field, event) {
	try {
		this.runValidation(field, event);
		this.options.removeError(field);
		return true;
	}
	catch(message) {
		this.options.addError(field, message);
		
		var errors = [
			{
				field: field,
				message: message
			}
		];
		
		this.options.onErrors(errors, event);
		
		return false;
	}
}
formValidator.prototype.validateFields = function(fields,event) {
	var errors = [];
	
	for(var i in fields) {
		try {
			this.runValidation(fields[i], event);
			this.options.removeError(fields[i]);
		}
		catch(message) {
			this.options.addError(fields[i], message);
			
			errors.push(
				{
					field: fields[i],
					message: message
				}
			);
		}
	}
	
	if(errors.length) {
		this.options.onErrors(errors, event);
		return false;
	}
	else {
		return true;
	}
}

formValidator.prototype.runValidation = function(field, event) {
	var key = this.options.getFieldKey(field);
	
	//if a rule exists for this field, run it
	//the rule will throw an exception if it fails
	if(typeof this.options.rules[key] !== 'undefined') {
		this.options.rules[key](field, event);
	}
	
	return true;
}

formValidator.prototype.clearError = function(field) {
	this.options.removeError(field);
}

formValidator.prototype.clearErrors = function(fields) {
	for(var i in fields) {
		this.options.removeError(fields[i]);
	}
}
