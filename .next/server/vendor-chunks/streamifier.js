"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/streamifier";
exports.ids = ["vendor-chunks/streamifier"];
exports.modules = {

/***/ "(rsc)/./node_modules/streamifier/lib/index.js":
/*!***********************************************!*\
  !*** ./node_modules/streamifier/lib/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar util = __webpack_require__(/*! util */ \"util\");\nvar stream = __webpack_require__(/*! stream */ \"stream\");\n\nmodule.exports.createReadStream = function (object, options) {\n  return new MultiStream (object, options);\n};\n\nvar MultiStream = function (object, options) {\n  if (object instanceof Buffer || typeof object === 'string') {\n    options = options || {};\n    stream.Readable.call(this, {\n      highWaterMark: options.highWaterMark,\n      encoding: options.encoding\n    });\n  } else {\n    stream.Readable.call(this, { objectMode: true });\n  }\n  this._object = object;\n};\n\nutil.inherits(MultiStream, stream.Readable);\n\nMultiStream.prototype._read = function () {\n  this.push(this._object);\n  this._object = null;\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvc3RyZWFtaWZpZXIvbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLFdBQVcsbUJBQU8sQ0FBQyxrQkFBTTtBQUN6QixhQUFhLG1CQUFPLENBQUMsc0JBQVE7O0FBRTdCLCtCQUErQjtBQUMvQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0osaUNBQWlDLGtCQUFrQjtBQUNuRDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcYWxleHZcXE9uZURyaXZlXFxEb2t1bWVudFxcQ29kaW5nIHByb2pcXEFJc2l0ZVxcbm9kZV9tb2R1bGVzXFxzdHJlYW1pZmllclxcbGliXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVSZWFkU3RyZWFtID0gZnVuY3Rpb24gKG9iamVjdCwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IE11bHRpU3RyZWFtIChvYmplY3QsIG9wdGlvbnMpO1xufTtcblxudmFyIE11bHRpU3RyZWFtID0gZnVuY3Rpb24gKG9iamVjdCwgb3B0aW9ucykge1xuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgQnVmZmVyIHx8IHR5cGVvZiBvYmplY3QgPT09ICdzdHJpbmcnKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgc3RyZWFtLlJlYWRhYmxlLmNhbGwodGhpcywge1xuICAgICAgaGlnaFdhdGVyTWFyazogb3B0aW9ucy5oaWdoV2F0ZXJNYXJrLFxuICAgICAgZW5jb2Rpbmc6IG9wdGlvbnMuZW5jb2RpbmdcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzdHJlYW0uUmVhZGFibGUuY2FsbCh0aGlzLCB7IG9iamVjdE1vZGU6IHRydWUgfSk7XG4gIH1cbiAgdGhpcy5fb2JqZWN0ID0gb2JqZWN0O1xufTtcblxudXRpbC5pbmhlcml0cyhNdWx0aVN0cmVhbSwgc3RyZWFtLlJlYWRhYmxlKTtcblxuTXVsdGlTdHJlYW0ucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnB1c2godGhpcy5fb2JqZWN0KTtcbiAgdGhpcy5fb2JqZWN0ID0gbnVsbDtcbn07Il0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/streamifier/lib/index.js\n");

/***/ })

};
;