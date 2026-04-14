"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_instrument_lib_mongodb_ts";
exports.ids = ["_instrument_lib_mongodb_ts"];
exports.modules = {

/***/ "(instrument)/./lib/mongodb.ts":
/*!************************!*\
  !*** ./lib/mongodb.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectDB: () => (/* binding */ connectDB)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst MONGODB_URI = process.env.MONGODB_URI;\nif (!MONGODB_URI) {\n    throw new Error('MONGODB_URI environment variable is not defined');\n}\nconst cached = global._mongooseCache ?? {\n    conn: null,\n    promise: null\n};\nglobal._mongooseCache = cached;\nasync function connectDB() {\n    if (cached.conn) return cached.conn;\n    if (!cached.promise) {\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(MONGODB_URI, {\n            bufferCommands: false\n        });\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vbGliL21vbmdvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWdDO0FBRWhDLE1BQU1DLGNBQWNDLFFBQVFDLEdBQUcsQ0FBQ0YsV0FBVztBQUUzQyxJQUFJLENBQUNBLGFBQWE7SUFDZCxNQUFNLElBQUlHLE1BQU07QUFDcEI7QUFZQSxNQUFNQyxTQUF3QkMsT0FBT0MsY0FBYyxJQUFJO0lBQUVDLE1BQU07SUFBTUMsU0FBUztBQUFLO0FBQ25GSCxPQUFPQyxjQUFjLEdBQUdGO0FBRWpCLGVBQWVLO0lBQ2xCLElBQUlMLE9BQU9HLElBQUksRUFBRSxPQUFPSCxPQUFPRyxJQUFJO0lBRW5DLElBQUksQ0FBQ0gsT0FBT0ksT0FBTyxFQUFFO1FBQ2pCSixPQUFPSSxPQUFPLEdBQUdULHVEQUFnQixDQUFDQyxhQUFhO1lBQzNDVyxnQkFBZ0I7UUFDcEI7SUFDSjtJQUVBUCxPQUFPRyxJQUFJLEdBQUcsTUFBTUgsT0FBT0ksT0FBTztJQUNsQyxPQUFPSixPQUFPRyxJQUFJO0FBQ3RCIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGFsZXh2XFxPbmVEcml2ZVxcRG9rdW1lbnRcXENvZGluZyBwcm9qXFxBSXNpdGVcXGxpYlxcbW9uZ29kYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xuXG5jb25zdCBNT05HT0RCX1VSSSA9IHByb2Nlc3MuZW52Lk1PTkdPREJfVVJJIGFzIHN0cmluZztcblxuaWYgKCFNT05HT0RCX1VSSSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTU9OR09EQl9VUkkgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbm90IGRlZmluZWQnKTtcbn1cblxuaW50ZXJmYWNlIE1vbmdvb3NlQ2FjaGUge1xuICAgIGNvbm46IHR5cGVvZiBtb25nb29zZSB8IG51bGw7XG4gICAgcHJvbWlzZTogUHJvbWlzZTx0eXBlb2YgbW9uZ29vc2U+IHwgbnVsbDtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12YXJcbiAgICB2YXIgX21vbmdvb3NlQ2FjaGU6IE1vbmdvb3NlQ2FjaGUgfCB1bmRlZmluZWQ7XG59XG5cbmNvbnN0IGNhY2hlZDogTW9uZ29vc2VDYWNoZSA9IGdsb2JhbC5fbW9uZ29vc2VDYWNoZSA/PyB7IGNvbm46IG51bGwsIHByb21pc2U6IG51bGwgfTtcbmdsb2JhbC5fbW9uZ29vc2VDYWNoZSA9IGNhY2hlZDtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbm5lY3REQigpOiBQcm9taXNlPHR5cGVvZiBtb25nb29zZT4ge1xuICAgIGlmIChjYWNoZWQuY29ubikgcmV0dXJuIGNhY2hlZC5jb25uO1xuXG4gICAgaWYgKCFjYWNoZWQucHJvbWlzZSkge1xuICAgICAgICBjYWNoZWQucHJvbWlzZSA9IG1vbmdvb3NlLmNvbm5lY3QoTU9OR09EQl9VUkksIHtcbiAgICAgICAgICAgIGJ1ZmZlckNvbW1hbmRzOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FjaGVkLmNvbm4gPSBhd2FpdCBjYWNoZWQucHJvbWlzZTtcbiAgICByZXR1cm4gY2FjaGVkLmNvbm47XG59XG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJNT05HT0RCX1VSSSIsInByb2Nlc3MiLCJlbnYiLCJFcnJvciIsImNhY2hlZCIsImdsb2JhbCIsIl9tb25nb29zZUNhY2hlIiwiY29ubiIsInByb21pc2UiLCJjb25uZWN0REIiLCJjb25uZWN0IiwiYnVmZmVyQ29tbWFuZHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(instrument)/./lib/mongodb.ts\n");

/***/ })

};
;