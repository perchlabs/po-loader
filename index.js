/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author David Schissler @dschissler
*/
var po2json = require('po2json');
var loaderUtils = require('loader-utils');

module.exports = function(source) {
	this.cacheable();

	var options = loaderUtils.parseQuery(this.query);

	// default option
	if (!('stringify' in options)) {
		options.stringify = true;
	}

	jsonData = po2json.parse(source, options);

	return jsonData;
}
