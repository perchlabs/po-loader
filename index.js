/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author David Schissler @dschissler
*/
var po2json = require('po2json');

module.exports = function(source) {
	this.cacheable();

// console.log(source);
// process.exit(1);

	jsonData = po2json.parse(source, {stringify:true});
// console.log("Made it");
// console.log(jsonData);
// process.exit(1);

	return jsonData;
}
