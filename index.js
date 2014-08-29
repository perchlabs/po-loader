/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author David Schissler @dschissler
*/
var po2json = require('po2json');

module.exports = function(source) {
	this.cacheable();

	jsonData = po2json.parse(source, {stringify:true});

	return jsonData;
}
