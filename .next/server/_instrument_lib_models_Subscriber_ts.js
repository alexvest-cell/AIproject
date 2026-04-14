"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_instrument_lib_models_Subscriber_ts";
exports.ids = ["_instrument_lib_models_Subscriber_ts"];
exports.modules = {

/***/ "(instrument)/./lib/models/Subscriber.ts":
/*!**********************************!*\
  !*** ./lib/models/Subscriber.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst subscriberSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    email: {\n        type: String,\n        required: true,\n        unique: true\n    },\n    topics: [\n        String\n    ],\n    timezone: {\n        type: String,\n        default: 'UTC'\n    },\n    createdAt: {\n        type: Date,\n        default: Date.now\n    }\n});\nconst Subscriber = (mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).Subscriber || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model('Subscriber', subscriberSchema);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Subscriber);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vbGliL21vZGVscy9TdWJzY3JpYmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFnQztBQUVoQyxNQUFNQyxtQkFBbUIsSUFBSUQsd0RBQWUsQ0FBQztJQUN6Q0csT0FBTztRQUFFQyxNQUFNQztRQUFRQyxVQUFVO1FBQU1DLFFBQVE7SUFBSztJQUNwREMsUUFBUTtRQUFDSDtLQUFPO0lBQ2hCSSxVQUFVO1FBQUVMLE1BQU1DO1FBQVFLLFNBQVM7SUFBTTtJQUN6Q0MsV0FBVztRQUFFUCxNQUFNUTtRQUFNRixTQUFTRSxLQUFLQyxHQUFHO0lBQUM7QUFDL0M7QUFFQSxNQUFNQyxhQUFjZCx3REFBZSxDQUFDYyxVQUFVLElBQUlkLHFEQUFjLENBQUMsY0FBY0M7QUFDL0UsaUVBQWVhLFVBQVVBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcYWxleHZcXE9uZURyaXZlXFxEb2t1bWVudFxcQ29kaW5nIHByb2pcXEFJc2l0ZVxcbGliXFxtb2RlbHNcXFN1YnNjcmliZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcblxuY29uc3Qgc3Vic2NyaWJlclNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICAgIGVtYWlsOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUsIHVuaXF1ZTogdHJ1ZSB9LFxuICAgIHRvcGljczogW1N0cmluZ10sXG4gICAgdGltZXpvbmU6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnVVRDJyB9LFxuICAgIGNyZWF0ZWRBdDogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBEYXRlLm5vdyB9LFxufSk7XG5cbmNvbnN0IFN1YnNjcmliZXIgPSAobW9uZ29vc2UubW9kZWxzLlN1YnNjcmliZXIgfHwgbW9uZ29vc2UubW9kZWwoJ1N1YnNjcmliZXInLCBzdWJzY3JpYmVyU2NoZW1hKSkgYXMgaW1wb3J0KCdtb25nb29zZScpLk1vZGVsPGFueT47XG5leHBvcnQgZGVmYXVsdCBTdWJzY3JpYmVyO1xuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwic3Vic2NyaWJlclNjaGVtYSIsIlNjaGVtYSIsImVtYWlsIiwidHlwZSIsIlN0cmluZyIsInJlcXVpcmVkIiwidW5pcXVlIiwidG9waWNzIiwidGltZXpvbmUiLCJkZWZhdWx0IiwiY3JlYXRlZEF0IiwiRGF0ZSIsIm5vdyIsIlN1YnNjcmliZXIiLCJtb2RlbHMiLCJtb2RlbCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(instrument)/./lib/models/Subscriber.ts\n");

/***/ })

};
;