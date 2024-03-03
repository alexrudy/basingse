/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/frontend/ts/csrf.ts":
/*!*********************************!*\
  !*** ./src/frontend/ts/csrf.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get_csrf: () => (/* binding */ get_csrf)
/* harmony export */ });
/* harmony import */ var htmx_org__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! htmx.org */ "./node_modules/htmx.org/dist/htmx.min.js");
/* harmony import */ var htmx_org__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(htmx_org__WEBPACK_IMPORTED_MODULE_0__);

function get_csrf() {
    var csrf = document.querySelector('meta[name="csrf"]');
    return csrf === null || csrf === void 0 ? void 0 : csrf.content;
}


/***/ }),

/***/ "./src/frontend/ts/editor.ts":
/*!***********************************!*\
  !*** ./src/frontend/ts/editor.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createEditor: () => (/* binding */ createEditor)
/* harmony export */ });
/* harmony import */ var _editorjs_editorjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @editorjs/editorjs */ "./node_modules/@editorjs/editorjs/dist/editorjs.mjs");
/* harmony import */ var _editorjs_header__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @editorjs/header */ "./node_modules/@editorjs/header/dist/header.mjs");
/* harmony import */ var _editorjs_paragraph__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @editorjs/paragraph */ "./node_modules/@editorjs/paragraph/dist/paragraph.mjs");



function createEditor() {
    document.querySelectorAll(".editor-js").forEach(function (element) {
        var input = element.querySelector("input");
        var editorId = input === null || input === void 0 ? void 0 : input.id;
        console.log("Editor setup for ", editorId);
        var editor = new _editorjs_editorjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            holder: element,
            inlineToolbar: true,
            data: (input === null || input === void 0 ? void 0 : input.value) ? JSON.parse(input.value) : undefined,
            tools: {
                header: _editorjs_header__WEBPACK_IMPORTED_MODULE_1__["default"],
                paragraph: {
                    class: _editorjs_paragraph__WEBPACK_IMPORTED_MODULE_2__["default"],
                    inlineToolbar: true,
                },
            },
            placeholder: "Write your page here!"
        });
        var form = findParentBySelector(element, "form");
        var submit = form === null || form === void 0 ? void 0 : form.querySelector("input[name='submit']");
        submit === null || submit === void 0 ? void 0 : submit.addEventListener("click", function (event) {
            event.preventDefault();
            editor
                .save()
                .then(function (output) {
                input === null || input === void 0 ? void 0 : input.setAttribute("value", JSON.stringify(output));
                HTMLFormElement.prototype.submit.call(form);
            })
                .catch(console.error);
        });
    });
}
function findParentBySelector(element, selector) {
    while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
            return element.parentElement;
        }
        element = element.parentElement;
    }
    return null;
}


/***/ }),

/***/ "./src/frontend/ts/htmx.ts":
/*!*********************************!*\
  !*** ./src/frontend/ts/htmx.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   connect: () => (/* binding */ connect)
/* harmony export */ });
/* harmony import */ var htmx_org__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! htmx.org */ "./node_modules/htmx.org/dist/htmx.min.js");
/* harmony import */ var htmx_org__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(htmx_org__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _csrf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./csrf */ "./src/frontend/ts/csrf.ts");
/* harmony import */ var sortablejs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! sortablejs */ "./node_modules/sortablejs/modular/sortable.esm.js");



function connect() {
    htmx_org__WEBPACK_IMPORTED_MODULE_0___default().onLoad(function (content) {
        var csrf_token = (0,_csrf__WEBPACK_IMPORTED_MODULE_1__.get_csrf)();
        if (!csrf_token) {
            console.error("No CSRF token found");
            return;
        }
        document.body.addEventListener("htmx:configRequest", function (evt) {
            evt.detail.headers["X-CSRFToken"] = csrf_token; // add the CSRF token
        });
    });
    htmx_org__WEBPACK_IMPORTED_MODULE_0___default().defineExtension("json-enc", {
        onEvent: function (name, evt) {
            if (name === "htmx:configRequest") {
                evt.detail.headers["Content-Type"] = "application/json";
                var token = (0,_csrf__WEBPACK_IMPORTED_MODULE_1__.get_csrf)();
                if (token) {
                    evt.detail.headers["X-CSRFToken"] = token;
                }
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        encodeParameters: function (xhr, parameters, elt) {
            xhr.overrideMimeType("text/json");
            return JSON.stringify(parameters);
        },
    });
    htmx_org__WEBPACK_IMPORTED_MODULE_0___default().onLoad(function (content) {
        var sortables = content.querySelectorAll(".sortable");
        for (var i = 0; i < sortables.length; i++) {
            var sortable = sortables[i];
            new sortablejs__WEBPACK_IMPORTED_MODULE_2__["default"](sortable, {
                animation: 150,
                ghostClass: "blue-background-class",
            });
        }
    });
    htmx_org__WEBPACK_IMPORTED_MODULE_0___default().onLoad(function (content) {
        var sortables = content.querySelectorAll(".nav-sortable-admin .navbar-nav");
        for (var i = 0; i < sortables.length; i++) {
            var sortable = sortables[i];
            new sortablejs__WEBPACK_IMPORTED_MODULE_2__["default"](sortable, {
                animation: 150,
                draggable: ".nav-item",
                ghostClass: "blue-background-class",
            });
        }
    });
}


/***/ }),

/***/ "./node_modules/htmx.org/dist/htmx.min.js":
/*!************************************************!*\
  !*** ./node_modules/htmx.org/dist/htmx.min.js ***!
  \************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(e,t){if(true){!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}else {}})(typeof self!=="undefined"?self:this,function(){return function(){"use strict";var Q={onLoad:F,process:zt,on:de,off:ge,trigger:ce,ajax:Nr,find:C,findAll:f,closest:v,values:function(e,t){var r=dr(e,t||"post");return r.values},remove:_,addClass:z,removeClass:n,toggleClass:$,takeClass:W,defineExtension:Ur,removeExtension:Br,logAll:V,logNone:j,logger:null,config:{historyEnabled:true,historyCacheSize:10,refreshOnHistoryMiss:false,defaultSwapStyle:"innerHTML",defaultSwapDelay:0,defaultSettleDelay:20,includeIndicatorStyles:true,indicatorClass:"htmx-indicator",requestClass:"htmx-request",addedClass:"htmx-added",settlingClass:"htmx-settling",swappingClass:"htmx-swapping",allowEval:true,allowScriptTags:true,inlineScriptNonce:"",attributesToSettle:["class","style","width","height"],withCredentials:false,timeout:0,wsReconnectDelay:"full-jitter",wsBinaryType:"blob",disableSelector:"[hx-disable], [data-hx-disable]",useTemplateFragments:false,scrollBehavior:"smooth",defaultFocusScroll:false,getCacheBusterParam:false,globalViewTransitions:false,methodsThatUseUrlParams:["get"],selfRequestsOnly:false,ignoreTitle:false,scrollIntoViewOnBoost:true,triggerSpecsCache:null},parseInterval:d,_:t,createEventSource:function(e){return new EventSource(e,{withCredentials:true})},createWebSocket:function(e){var t=new WebSocket(e,[]);t.binaryType=Q.config.wsBinaryType;return t},version:"1.9.10"};var r={addTriggerHandler:Lt,bodyContains:se,canAccessLocalStorage:U,findThisElement:xe,filterValues:yr,hasAttribute:o,getAttributeValue:te,getClosestAttributeValue:ne,getClosestMatch:c,getExpressionVars:Hr,getHeaders:xr,getInputValues:dr,getInternalData:ae,getSwapSpecification:wr,getTriggerSpecs:it,getTarget:ye,makeFragment:l,mergeObjects:le,makeSettleInfo:T,oobSwap:Ee,querySelectorExt:ue,selectAndSwap:je,settleImmediately:nr,shouldCancel:ut,triggerEvent:ce,triggerErrorEvent:fe,withExtensions:R};var w=["get","post","put","delete","patch"];var i=w.map(function(e){return"[hx-"+e+"], [data-hx-"+e+"]"}).join(", ");var S=e("head"),q=e("title"),H=e("svg",true);function e(e,t=false){return new RegExp(`<${e}(\\s[^>]*>|>)([\\s\\S]*?)<\\/${e}>`,t?"gim":"im")}function d(e){if(e==undefined){return undefined}let t=NaN;if(e.slice(-2)=="ms"){t=parseFloat(e.slice(0,-2))}else if(e.slice(-1)=="s"){t=parseFloat(e.slice(0,-1))*1e3}else if(e.slice(-1)=="m"){t=parseFloat(e.slice(0,-1))*1e3*60}else{t=parseFloat(e)}return isNaN(t)?undefined:t}function ee(e,t){return e.getAttribute&&e.getAttribute(t)}function o(e,t){return e.hasAttribute&&(e.hasAttribute(t)||e.hasAttribute("data-"+t))}function te(e,t){return ee(e,t)||ee(e,"data-"+t)}function u(e){return e.parentElement}function re(){return document}function c(e,t){while(e&&!t(e)){e=u(e)}return e?e:null}function L(e,t,r){var n=te(t,r);var i=te(t,"hx-disinherit");if(e!==t&&i&&(i==="*"||i.split(" ").indexOf(r)>=0)){return"unset"}else{return n}}function ne(t,r){var n=null;c(t,function(e){return n=L(t,e,r)});if(n!=="unset"){return n}}function h(e,t){var r=e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector;return r&&r.call(e,t)}function A(e){var t=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i;var r=t.exec(e);if(r){return r[1].toLowerCase()}else{return""}}function a(e,t){var r=new DOMParser;var n=r.parseFromString(e,"text/html");var i=n.body;while(t>0){t--;i=i.firstChild}if(i==null){i=re().createDocumentFragment()}return i}function N(e){return/<body/.test(e)}function l(e){var t=!N(e);var r=A(e);var n=e;if(r==="head"){n=n.replace(S,"")}if(Q.config.useTemplateFragments&&t){var i=a("<body><template>"+n+"</template></body>",0);return i.querySelector("template").content}switch(r){case"thead":case"tbody":case"tfoot":case"colgroup":case"caption":return a("<table>"+n+"</table>",1);case"col":return a("<table><colgroup>"+n+"</colgroup></table>",2);case"tr":return a("<table><tbody>"+n+"</tbody></table>",2);case"td":case"th":return a("<table><tbody><tr>"+n+"</tr></tbody></table>",3);case"script":case"style":return a("<div>"+n+"</div>",1);default:return a(n,0)}}function ie(e){if(e){e()}}function I(e,t){return Object.prototype.toString.call(e)==="[object "+t+"]"}function k(e){return I(e,"Function")}function P(e){return I(e,"Object")}function ae(e){var t="htmx-internal-data";var r=e[t];if(!r){r=e[t]={}}return r}function M(e){var t=[];if(e){for(var r=0;r<e.length;r++){t.push(e[r])}}return t}function oe(e,t){if(e){for(var r=0;r<e.length;r++){t(e[r])}}}function X(e){var t=e.getBoundingClientRect();var r=t.top;var n=t.bottom;return r<window.innerHeight&&n>=0}function se(e){if(e.getRootNode&&e.getRootNode()instanceof window.ShadowRoot){return re().body.contains(e.getRootNode().host)}else{return re().body.contains(e)}}function D(e){return e.trim().split(/\s+/)}function le(e,t){for(var r in t){if(t.hasOwnProperty(r)){e[r]=t[r]}}return e}function E(e){try{return JSON.parse(e)}catch(e){b(e);return null}}function U(){var e="htmx:localStorageTest";try{localStorage.setItem(e,e);localStorage.removeItem(e);return true}catch(e){return false}}function B(t){try{var e=new URL(t);if(e){t=e.pathname+e.search}if(!/^\/$/.test(t)){t=t.replace(/\/+$/,"")}return t}catch(e){return t}}function t(e){return Tr(re().body,function(){return eval(e)})}function F(t){var e=Q.on("htmx:load",function(e){t(e.detail.elt)});return e}function V(){Q.logger=function(e,t,r){if(console){console.log(t,e,r)}}}function j(){Q.logger=null}function C(e,t){if(t){return e.querySelector(t)}else{return C(re(),e)}}function f(e,t){if(t){return e.querySelectorAll(t)}else{return f(re(),e)}}function _(e,t){e=g(e);if(t){setTimeout(function(){_(e);e=null},t)}else{e.parentElement.removeChild(e)}}function z(e,t,r){e=g(e);if(r){setTimeout(function(){z(e,t);e=null},r)}else{e.classList&&e.classList.add(t)}}function n(e,t,r){e=g(e);if(r){setTimeout(function(){n(e,t);e=null},r)}else{if(e.classList){e.classList.remove(t);if(e.classList.length===0){e.removeAttribute("class")}}}}function $(e,t){e=g(e);e.classList.toggle(t)}function W(e,t){e=g(e);oe(e.parentElement.children,function(e){n(e,t)});z(e,t)}function v(e,t){e=g(e);if(e.closest){return e.closest(t)}else{do{if(e==null||h(e,t)){return e}}while(e=e&&u(e));return null}}function s(e,t){return e.substring(0,t.length)===t}function G(e,t){return e.substring(e.length-t.length)===t}function J(e){var t=e.trim();if(s(t,"<")&&G(t,"/>")){return t.substring(1,t.length-2)}else{return t}}function Z(e,t){if(t.indexOf("closest ")===0){return[v(e,J(t.substr(8)))]}else if(t.indexOf("find ")===0){return[C(e,J(t.substr(5)))]}else if(t==="next"){return[e.nextElementSibling]}else if(t.indexOf("next ")===0){return[K(e,J(t.substr(5)))]}else if(t==="previous"){return[e.previousElementSibling]}else if(t.indexOf("previous ")===0){return[Y(e,J(t.substr(9)))]}else if(t==="document"){return[document]}else if(t==="window"){return[window]}else if(t==="body"){return[document.body]}else{return re().querySelectorAll(J(t))}}var K=function(e,t){var r=re().querySelectorAll(t);for(var n=0;n<r.length;n++){var i=r[n];if(i.compareDocumentPosition(e)===Node.DOCUMENT_POSITION_PRECEDING){return i}}};var Y=function(e,t){var r=re().querySelectorAll(t);for(var n=r.length-1;n>=0;n--){var i=r[n];if(i.compareDocumentPosition(e)===Node.DOCUMENT_POSITION_FOLLOWING){return i}}};function ue(e,t){if(t){return Z(e,t)[0]}else{return Z(re().body,e)[0]}}function g(e){if(I(e,"String")){return C(e)}else{return e}}function ve(e,t,r){if(k(t)){return{target:re().body,event:e,listener:t}}else{return{target:g(e),event:t,listener:r}}}function de(t,r,n){jr(function(){var e=ve(t,r,n);e.target.addEventListener(e.event,e.listener)});var e=k(r);return e?r:n}function ge(t,r,n){jr(function(){var e=ve(t,r,n);e.target.removeEventListener(e.event,e.listener)});return k(r)?r:n}var me=re().createElement("output");function pe(e,t){var r=ne(e,t);if(r){if(r==="this"){return[xe(e,t)]}else{var n=Z(e,r);if(n.length===0){b('The selector "'+r+'" on '+t+" returned no matches!");return[me]}else{return n}}}}function xe(e,t){return c(e,function(e){return te(e,t)!=null})}function ye(e){var t=ne(e,"hx-target");if(t){if(t==="this"){return xe(e,"hx-target")}else{return ue(e,t)}}else{var r=ae(e);if(r.boosted){return re().body}else{return e}}}function be(e){var t=Q.config.attributesToSettle;for(var r=0;r<t.length;r++){if(e===t[r]){return true}}return false}function we(t,r){oe(t.attributes,function(e){if(!r.hasAttribute(e.name)&&be(e.name)){t.removeAttribute(e.name)}});oe(r.attributes,function(e){if(be(e.name)){t.setAttribute(e.name,e.value)}})}function Se(e,t){var r=Fr(t);for(var n=0;n<r.length;n++){var i=r[n];try{if(i.isInlineSwap(e)){return true}}catch(e){b(e)}}return e==="outerHTML"}function Ee(e,i,a){var t="#"+ee(i,"id");var o="outerHTML";if(e==="true"){}else if(e.indexOf(":")>0){o=e.substr(0,e.indexOf(":"));t=e.substr(e.indexOf(":")+1,e.length)}else{o=e}var r=re().querySelectorAll(t);if(r){oe(r,function(e){var t;var r=i.cloneNode(true);t=re().createDocumentFragment();t.appendChild(r);if(!Se(o,e)){t=r}var n={shouldSwap:true,target:e,fragment:t};if(!ce(e,"htmx:oobBeforeSwap",n))return;e=n.target;if(n["shouldSwap"]){Fe(o,e,e,t,a)}oe(a.elts,function(e){ce(e,"htmx:oobAfterSwap",n)})});i.parentNode.removeChild(i)}else{i.parentNode.removeChild(i);fe(re().body,"htmx:oobErrorNoTarget",{content:i})}return e}function Ce(e,t,r){var n=ne(e,"hx-select-oob");if(n){var i=n.split(",");for(var a=0;a<i.length;a++){var o=i[a].split(":",2);var s=o[0].trim();if(s.indexOf("#")===0){s=s.substring(1)}var l=o[1]||"true";var u=t.querySelector("#"+s);if(u){Ee(l,u,r)}}}oe(f(t,"[hx-swap-oob], [data-hx-swap-oob]"),function(e){var t=te(e,"hx-swap-oob");if(t!=null){Ee(t,e,r)}})}function Re(e){oe(f(e,"[hx-preserve], [data-hx-preserve]"),function(e){var t=te(e,"id");var r=re().getElementById(t);if(r!=null){e.parentNode.replaceChild(r,e)}})}function Te(o,e,s){oe(e.querySelectorAll("[id]"),function(e){var t=ee(e,"id");if(t&&t.length>0){var r=t.replace("'","\\'");var n=e.tagName.replace(":","\\:");var i=o.querySelector(n+"[id='"+r+"']");if(i&&i!==o){var a=e.cloneNode();we(e,i);s.tasks.push(function(){we(e,a)})}}})}function Oe(e){return function(){n(e,Q.config.addedClass);zt(e);Nt(e);qe(e);ce(e,"htmx:load")}}function qe(e){var t="[autofocus]";var r=h(e,t)?e:e.querySelector(t);if(r!=null){r.focus()}}function m(e,t,r,n){Te(e,r,n);while(r.childNodes.length>0){var i=r.firstChild;z(i,Q.config.addedClass);e.insertBefore(i,t);if(i.nodeType!==Node.TEXT_NODE&&i.nodeType!==Node.COMMENT_NODE){n.tasks.push(Oe(i))}}}function He(e,t){var r=0;while(r<e.length){t=(t<<5)-t+e.charCodeAt(r++)|0}return t}function Le(e){var t=0;if(e.attributes){for(var r=0;r<e.attributes.length;r++){var n=e.attributes[r];if(n.value){t=He(n.name,t);t=He(n.value,t)}}}return t}function Ae(e){var t=ae(e);if(t.onHandlers){for(var r=0;r<t.onHandlers.length;r++){const n=t.onHandlers[r];e.removeEventListener(n.event,n.listener)}delete t.onHandlers}}function Ne(e){var t=ae(e);if(t.timeout){clearTimeout(t.timeout)}if(t.webSocket){t.webSocket.close()}if(t.sseEventSource){t.sseEventSource.close()}if(t.listenerInfos){oe(t.listenerInfos,function(e){if(e.on){e.on.removeEventListener(e.trigger,e.listener)}})}Ae(e);oe(Object.keys(t),function(e){delete t[e]})}function p(e){ce(e,"htmx:beforeCleanupElement");Ne(e);if(e.children){oe(e.children,function(e){p(e)})}}function Ie(t,e,r){if(t.tagName==="BODY"){return Ue(t,e,r)}else{var n;var i=t.previousSibling;m(u(t),t,e,r);if(i==null){n=u(t).firstChild}else{n=i.nextSibling}r.elts=r.elts.filter(function(e){return e!=t});while(n&&n!==t){if(n.nodeType===Node.ELEMENT_NODE){r.elts.push(n)}n=n.nextElementSibling}p(t);u(t).removeChild(t)}}function ke(e,t,r){return m(e,e.firstChild,t,r)}function Pe(e,t,r){return m(u(e),e,t,r)}function Me(e,t,r){return m(e,null,t,r)}function Xe(e,t,r){return m(u(e),e.nextSibling,t,r)}function De(e,t,r){p(e);return u(e).removeChild(e)}function Ue(e,t,r){var n=e.firstChild;m(e,n,t,r);if(n){while(n.nextSibling){p(n.nextSibling);e.removeChild(n.nextSibling)}p(n);e.removeChild(n)}}function Be(e,t,r){var n=r||ne(e,"hx-select");if(n){var i=re().createDocumentFragment();oe(t.querySelectorAll(n),function(e){i.appendChild(e)});t=i}return t}function Fe(e,t,r,n,i){switch(e){case"none":return;case"outerHTML":Ie(r,n,i);return;case"afterbegin":ke(r,n,i);return;case"beforebegin":Pe(r,n,i);return;case"beforeend":Me(r,n,i);return;case"afterend":Xe(r,n,i);return;case"delete":De(r,n,i);return;default:var a=Fr(t);for(var o=0;o<a.length;o++){var s=a[o];try{var l=s.handleSwap(e,r,n,i);if(l){if(typeof l.length!=="undefined"){for(var u=0;u<l.length;u++){var f=l[u];if(f.nodeType!==Node.TEXT_NODE&&f.nodeType!==Node.COMMENT_NODE){i.tasks.push(Oe(f))}}}return}}catch(e){b(e)}}if(e==="innerHTML"){Ue(r,n,i)}else{Fe(Q.config.defaultSwapStyle,t,r,n,i)}}}function Ve(e){if(e.indexOf("<title")>-1){var t=e.replace(H,"");var r=t.match(q);if(r){return r[2]}}}function je(e,t,r,n,i,a){i.title=Ve(n);var o=l(n);if(o){Ce(r,o,i);o=Be(r,o,a);Re(o);return Fe(e,r,t,o,i)}}function _e(e,t,r){var n=e.getResponseHeader(t);if(n.indexOf("{")===0){var i=E(n);for(var a in i){if(i.hasOwnProperty(a)){var o=i[a];if(!P(o)){o={value:o}}ce(r,a,o)}}}else{var s=n.split(",");for(var l=0;l<s.length;l++){ce(r,s[l].trim(),[])}}}var ze=/\s/;var x=/[\s,]/;var $e=/[_$a-zA-Z]/;var We=/[_$a-zA-Z0-9]/;var Ge=['"',"'","/"];var Je=/[^\s]/;var Ze=/[{(]/;var Ke=/[})]/;function Ye(e){var t=[];var r=0;while(r<e.length){if($e.exec(e.charAt(r))){var n=r;while(We.exec(e.charAt(r+1))){r++}t.push(e.substr(n,r-n+1))}else if(Ge.indexOf(e.charAt(r))!==-1){var i=e.charAt(r);var n=r;r++;while(r<e.length&&e.charAt(r)!==i){if(e.charAt(r)==="\\"){r++}r++}t.push(e.substr(n,r-n+1))}else{var a=e.charAt(r);t.push(a)}r++}return t}function Qe(e,t,r){return $e.exec(e.charAt(0))&&e!=="true"&&e!=="false"&&e!=="this"&&e!==r&&t!=="."}function et(e,t,r){if(t[0]==="["){t.shift();var n=1;var i=" return (function("+r+"){ return (";var a=null;while(t.length>0){var o=t[0];if(o==="]"){n--;if(n===0){if(a===null){i=i+"true"}t.shift();i+=")})";try{var s=Tr(e,function(){return Function(i)()},function(){return true});s.source=i;return s}catch(e){fe(re().body,"htmx:syntax:error",{error:e,source:i});return null}}}else if(o==="["){n++}if(Qe(o,a,r)){i+="(("+r+"."+o+") ? ("+r+"."+o+") : (window."+o+"))"}else{i=i+o}a=t.shift()}}}function y(e,t){var r="";while(e.length>0&&!t.test(e[0])){r+=e.shift()}return r}function tt(e){var t;if(e.length>0&&Ze.test(e[0])){e.shift();t=y(e,Ke).trim();e.shift()}else{t=y(e,x)}return t}var rt="input, textarea, select";function nt(e,t,r){var n=[];var i=Ye(t);do{y(i,Je);var a=i.length;var o=y(i,/[,\[\s]/);if(o!==""){if(o==="every"){var s={trigger:"every"};y(i,Je);s.pollInterval=d(y(i,/[,\[\s]/));y(i,Je);var l=et(e,i,"event");if(l){s.eventFilter=l}n.push(s)}else if(o.indexOf("sse:")===0){n.push({trigger:"sse",sseEvent:o.substr(4)})}else{var u={trigger:o};var l=et(e,i,"event");if(l){u.eventFilter=l}while(i.length>0&&i[0]!==","){y(i,Je);var f=i.shift();if(f==="changed"){u.changed=true}else if(f==="once"){u.once=true}else if(f==="consume"){u.consume=true}else if(f==="delay"&&i[0]===":"){i.shift();u.delay=d(y(i,x))}else if(f==="from"&&i[0]===":"){i.shift();if(Ze.test(i[0])){var c=tt(i)}else{var c=y(i,x);if(c==="closest"||c==="find"||c==="next"||c==="previous"){i.shift();var h=tt(i);if(h.length>0){c+=" "+h}}}u.from=c}else if(f==="target"&&i[0]===":"){i.shift();u.target=tt(i)}else if(f==="throttle"&&i[0]===":"){i.shift();u.throttle=d(y(i,x))}else if(f==="queue"&&i[0]===":"){i.shift();u.queue=y(i,x)}else if(f==="root"&&i[0]===":"){i.shift();u[f]=tt(i)}else if(f==="threshold"&&i[0]===":"){i.shift();u[f]=y(i,x)}else{fe(e,"htmx:syntax:error",{token:i.shift()})}}n.push(u)}}if(i.length===a){fe(e,"htmx:syntax:error",{token:i.shift()})}y(i,Je)}while(i[0]===","&&i.shift());if(r){r[t]=n}return n}function it(e){var t=te(e,"hx-trigger");var r=[];if(t){var n=Q.config.triggerSpecsCache;r=n&&n[t]||nt(e,t,n)}if(r.length>0){return r}else if(h(e,"form")){return[{trigger:"submit"}]}else if(h(e,'input[type="button"], input[type="submit"]')){return[{trigger:"click"}]}else if(h(e,rt)){return[{trigger:"change"}]}else{return[{trigger:"click"}]}}function at(e){ae(e).cancelled=true}function ot(e,t,r){var n=ae(e);n.timeout=setTimeout(function(){if(se(e)&&n.cancelled!==true){if(!ct(r,e,Wt("hx:poll:trigger",{triggerSpec:r,target:e}))){t(e)}ot(e,t,r)}},r.pollInterval)}function st(e){return location.hostname===e.hostname&&ee(e,"href")&&ee(e,"href").indexOf("#")!==0}function lt(t,r,e){if(t.tagName==="A"&&st(t)&&(t.target===""||t.target==="_self")||t.tagName==="FORM"){r.boosted=true;var n,i;if(t.tagName==="A"){n="get";i=ee(t,"href")}else{var a=ee(t,"method");n=a?a.toLowerCase():"get";if(n==="get"){}i=ee(t,"action")}e.forEach(function(e){ht(t,function(e,t){if(v(e,Q.config.disableSelector)){p(e);return}he(n,i,e,t)},r,e,true)})}}function ut(e,t){if(e.type==="submit"||e.type==="click"){if(t.tagName==="FORM"){return true}if(h(t,'input[type="submit"], button')&&v(t,"form")!==null){return true}if(t.tagName==="A"&&t.href&&(t.getAttribute("href")==="#"||t.getAttribute("href").indexOf("#")!==0)){return true}}return false}function ft(e,t){return ae(e).boosted&&e.tagName==="A"&&t.type==="click"&&(t.ctrlKey||t.metaKey)}function ct(e,t,r){var n=e.eventFilter;if(n){try{return n.call(t,r)!==true}catch(e){fe(re().body,"htmx:eventFilter:error",{error:e,source:n.source});return true}}return false}function ht(a,o,e,s,l){var u=ae(a);var t;if(s.from){t=Z(a,s.from)}else{t=[a]}if(s.changed){t.forEach(function(e){var t=ae(e);t.lastValue=e.value})}oe(t,function(n){var i=function(e){if(!se(a)){n.removeEventListener(s.trigger,i);return}if(ft(a,e)){return}if(l||ut(e,a)){e.preventDefault()}if(ct(s,a,e)){return}var t=ae(e);t.triggerSpec=s;if(t.handledFor==null){t.handledFor=[]}if(t.handledFor.indexOf(a)<0){t.handledFor.push(a);if(s.consume){e.stopPropagation()}if(s.target&&e.target){if(!h(e.target,s.target)){return}}if(s.once){if(u.triggeredOnce){return}else{u.triggeredOnce=true}}if(s.changed){var r=ae(n);if(r.lastValue===n.value){return}r.lastValue=n.value}if(u.delayed){clearTimeout(u.delayed)}if(u.throttle){return}if(s.throttle>0){if(!u.throttle){o(a,e);u.throttle=setTimeout(function(){u.throttle=null},s.throttle)}}else if(s.delay>0){u.delayed=setTimeout(function(){o(a,e)},s.delay)}else{ce(a,"htmx:trigger");o(a,e)}}};if(e.listenerInfos==null){e.listenerInfos=[]}e.listenerInfos.push({trigger:s.trigger,listener:i,on:n});n.addEventListener(s.trigger,i)})}var vt=false;var dt=null;function gt(){if(!dt){dt=function(){vt=true};window.addEventListener("scroll",dt);setInterval(function(){if(vt){vt=false;oe(re().querySelectorAll("[hx-trigger='revealed'],[data-hx-trigger='revealed']"),function(e){mt(e)})}},200)}}function mt(t){if(!o(t,"data-hx-revealed")&&X(t)){t.setAttribute("data-hx-revealed","true");var e=ae(t);if(e.initHash){ce(t,"revealed")}else{t.addEventListener("htmx:afterProcessNode",function(e){ce(t,"revealed")},{once:true})}}}function pt(e,t,r){var n=D(r);for(var i=0;i<n.length;i++){var a=n[i].split(/:(.+)/);if(a[0]==="connect"){xt(e,a[1],0)}if(a[0]==="send"){bt(e)}}}function xt(s,r,n){if(!se(s)){return}if(r.indexOf("/")==0){var e=location.hostname+(location.port?":"+location.port:"");if(location.protocol=="https:"){r="wss://"+e+r}else if(location.protocol=="http:"){r="ws://"+e+r}}var t=Q.createWebSocket(r);t.onerror=function(e){fe(s,"htmx:wsError",{error:e,socket:t});yt(s)};t.onclose=function(e){if([1006,1012,1013].indexOf(e.code)>=0){var t=wt(n);setTimeout(function(){xt(s,r,n+1)},t)}};t.onopen=function(e){n=0};ae(s).webSocket=t;t.addEventListener("message",function(e){if(yt(s)){return}var t=e.data;R(s,function(e){t=e.transformResponse(t,null,s)});var r=T(s);var n=l(t);var i=M(n.children);for(var a=0;a<i.length;a++){var o=i[a];Ee(te(o,"hx-swap-oob")||"true",o,r)}nr(r.tasks)})}function yt(e){if(!se(e)){ae(e).webSocket.close();return true}}function bt(u){var f=c(u,function(e){return ae(e).webSocket!=null});if(f){u.addEventListener(it(u)[0].trigger,function(e){var t=ae(f).webSocket;var r=xr(u,f);var n=dr(u,"post");var i=n.errors;var a=n.values;var o=Hr(u);var s=le(a,o);var l=yr(s,u);l["HEADERS"]=r;if(i&&i.length>0){ce(u,"htmx:validation:halted",i);return}t.send(JSON.stringify(l));if(ut(e,u)){e.preventDefault()}})}else{fe(u,"htmx:noWebSocketSourceError")}}function wt(e){var t=Q.config.wsReconnectDelay;if(typeof t==="function"){return t(e)}if(t==="full-jitter"){var r=Math.min(e,6);var n=1e3*Math.pow(2,r);return n*Math.random()}b('htmx.config.wsReconnectDelay must either be a function or the string "full-jitter"')}function St(e,t,r){var n=D(r);for(var i=0;i<n.length;i++){var a=n[i].split(/:(.+)/);if(a[0]==="connect"){Et(e,a[1])}if(a[0]==="swap"){Ct(e,a[1])}}}function Et(t,e){var r=Q.createEventSource(e);r.onerror=function(e){fe(t,"htmx:sseError",{error:e,source:r});Tt(t)};ae(t).sseEventSource=r}function Ct(a,o){var s=c(a,Ot);if(s){var l=ae(s).sseEventSource;var u=function(e){if(Tt(s)){return}if(!se(a)){l.removeEventListener(o,u);return}var t=e.data;R(a,function(e){t=e.transformResponse(t,null,a)});var r=wr(a);var n=ye(a);var i=T(a);je(r.swapStyle,n,a,t,i);nr(i.tasks);ce(a,"htmx:sseMessage",e)};ae(a).sseListener=u;l.addEventListener(o,u)}else{fe(a,"htmx:noSSESourceError")}}function Rt(e,t,r){var n=c(e,Ot);if(n){var i=ae(n).sseEventSource;var a=function(){if(!Tt(n)){if(se(e)){t(e)}else{i.removeEventListener(r,a)}}};ae(e).sseListener=a;i.addEventListener(r,a)}else{fe(e,"htmx:noSSESourceError")}}function Tt(e){if(!se(e)){ae(e).sseEventSource.close();return true}}function Ot(e){return ae(e).sseEventSource!=null}function qt(e,t,r,n){var i=function(){if(!r.loaded){r.loaded=true;t(e)}};if(n>0){setTimeout(i,n)}else{i()}}function Ht(t,i,e){var a=false;oe(w,function(r){if(o(t,"hx-"+r)){var n=te(t,"hx-"+r);a=true;i.path=n;i.verb=r;e.forEach(function(e){Lt(t,e,i,function(e,t){if(v(e,Q.config.disableSelector)){p(e);return}he(r,n,e,t)})})}});return a}function Lt(n,e,t,r){if(e.sseEvent){Rt(n,r,e.sseEvent)}else if(e.trigger==="revealed"){gt();ht(n,r,t,e);mt(n)}else if(e.trigger==="intersect"){var i={};if(e.root){i.root=ue(n,e.root)}if(e.threshold){i.threshold=parseFloat(e.threshold)}var a=new IntersectionObserver(function(e){for(var t=0;t<e.length;t++){var r=e[t];if(r.isIntersecting){ce(n,"intersect");break}}},i);a.observe(n);ht(n,r,t,e)}else if(e.trigger==="load"){if(!ct(e,n,Wt("load",{elt:n}))){qt(n,r,t,e.delay)}}else if(e.pollInterval>0){t.polling=true;ot(n,r,e)}else{ht(n,r,t,e)}}function At(e){if(Q.config.allowScriptTags&&(e.type==="text/javascript"||e.type==="module"||e.type==="")){var t=re().createElement("script");oe(e.attributes,function(e){t.setAttribute(e.name,e.value)});t.textContent=e.textContent;t.async=false;if(Q.config.inlineScriptNonce){t.nonce=Q.config.inlineScriptNonce}var r=e.parentElement;try{r.insertBefore(t,e)}catch(e){b(e)}finally{if(e.parentElement){e.parentElement.removeChild(e)}}}}function Nt(e){if(h(e,"script")){At(e)}oe(f(e,"script"),function(e){At(e)})}function It(e){var t=e.attributes;for(var r=0;r<t.length;r++){var n=t[r].name;if(s(n,"hx-on:")||s(n,"data-hx-on:")||s(n,"hx-on-")||s(n,"data-hx-on-")){return true}}return false}function kt(e){var t=null;var r=[];if(It(e)){r.push(e)}if(document.evaluate){var n=document.evaluate('.//*[@*[ starts-with(name(), "hx-on:") or starts-with(name(), "data-hx-on:") or'+' starts-with(name(), "hx-on-") or starts-with(name(), "data-hx-on-") ]]',e);while(t=n.iterateNext())r.push(t)}else{var i=e.getElementsByTagName("*");for(var a=0;a<i.length;a++){if(It(i[a])){r.push(i[a])}}}return r}function Pt(e){if(e.querySelectorAll){var t=", [hx-boost] a, [data-hx-boost] a, a[hx-boost], a[data-hx-boost]";var r=e.querySelectorAll(i+t+", form, [type='submit'], [hx-sse], [data-hx-sse], [hx-ws],"+" [data-hx-ws], [hx-ext], [data-hx-ext], [hx-trigger], [data-hx-trigger], [hx-on], [data-hx-on]");return r}else{return[]}}function Mt(e){var t=v(e.target,"button, input[type='submit']");var r=Dt(e);if(r){r.lastButtonClicked=t}}function Xt(e){var t=Dt(e);if(t){t.lastButtonClicked=null}}function Dt(e){var t=v(e.target,"button, input[type='submit']");if(!t){return}var r=g("#"+ee(t,"form"))||v(t,"form");if(!r){return}return ae(r)}function Ut(e){e.addEventListener("click",Mt);e.addEventListener("focusin",Mt);e.addEventListener("focusout",Xt)}function Bt(e){var t=Ye(e);var r=0;for(var n=0;n<t.length;n++){const i=t[n];if(i==="{"){r++}else if(i==="}"){r--}}return r}function Ft(t,e,r){var n=ae(t);if(!Array.isArray(n.onHandlers)){n.onHandlers=[]}var i;var a=function(e){return Tr(t,function(){if(!i){i=new Function("event",r)}i.call(t,e)})};t.addEventListener(e,a);n.onHandlers.push({event:e,listener:a})}function Vt(e){var t=te(e,"hx-on");if(t){var r={};var n=t.split("\n");var i=null;var a=0;while(n.length>0){var o=n.shift();var s=o.match(/^\s*([a-zA-Z:\-\.]+:)(.*)/);if(a===0&&s){o.split(":");i=s[1].slice(0,-1);r[i]=s[2]}else{r[i]+=o}a+=Bt(o)}for(var l in r){Ft(e,l,r[l])}}}function jt(e){Ae(e);for(var t=0;t<e.attributes.length;t++){var r=e.attributes[t].name;var n=e.attributes[t].value;if(s(r,"hx-on")||s(r,"data-hx-on")){var i=r.indexOf("-on")+3;var a=r.slice(i,i+1);if(a==="-"||a===":"){var o=r.slice(i+1);if(s(o,":")){o="htmx"+o}else if(s(o,"-")){o="htmx:"+o.slice(1)}else if(s(o,"htmx-")){o="htmx:"+o.slice(5)}Ft(e,o,n)}}}}function _t(t){if(v(t,Q.config.disableSelector)){p(t);return}var r=ae(t);if(r.initHash!==Le(t)){Ne(t);r.initHash=Le(t);Vt(t);ce(t,"htmx:beforeProcessNode");if(t.value){r.lastValue=t.value}var e=it(t);var n=Ht(t,r,e);if(!n){if(ne(t,"hx-boost")==="true"){lt(t,r,e)}else if(o(t,"hx-trigger")){e.forEach(function(e){Lt(t,e,r,function(){})})}}if(t.tagName==="FORM"||ee(t,"type")==="submit"&&o(t,"form")){Ut(t)}var i=te(t,"hx-sse");if(i){St(t,r,i)}var a=te(t,"hx-ws");if(a){pt(t,r,a)}ce(t,"htmx:afterProcessNode")}}function zt(e){e=g(e);if(v(e,Q.config.disableSelector)){p(e);return}_t(e);oe(Pt(e),function(e){_t(e)});oe(kt(e),jt)}function $t(e){return e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}function Wt(e,t){var r;if(window.CustomEvent&&typeof window.CustomEvent==="function"){r=new CustomEvent(e,{bubbles:true,cancelable:true,detail:t})}else{r=re().createEvent("CustomEvent");r.initCustomEvent(e,true,true,t)}return r}function fe(e,t,r){ce(e,t,le({error:t},r))}function Gt(e){return e==="htmx:afterProcessNode"}function R(e,t){oe(Fr(e),function(e){try{t(e)}catch(e){b(e)}})}function b(e){if(console.error){console.error(e)}else if(console.log){console.log("ERROR: ",e)}}function ce(e,t,r){e=g(e);if(r==null){r={}}r["elt"]=e;var n=Wt(t,r);if(Q.logger&&!Gt(t)){Q.logger(e,t,r)}if(r.error){b(r.error);ce(e,"htmx:error",{errorInfo:r})}var i=e.dispatchEvent(n);var a=$t(t);if(i&&a!==t){var o=Wt(a,n.detail);i=i&&e.dispatchEvent(o)}R(e,function(e){i=i&&(e.onEvent(t,n)!==false&&!n.defaultPrevented)});return i}var Jt=location.pathname+location.search;function Zt(){var e=re().querySelector("[hx-history-elt],[data-hx-history-elt]");return e||re().body}function Kt(e,t,r,n){if(!U()){return}if(Q.config.historyCacheSize<=0){localStorage.removeItem("htmx-history-cache");return}e=B(e);var i=E(localStorage.getItem("htmx-history-cache"))||[];for(var a=0;a<i.length;a++){if(i[a].url===e){i.splice(a,1);break}}var o={url:e,content:t,title:r,scroll:n};ce(re().body,"htmx:historyItemCreated",{item:o,cache:i});i.push(o);while(i.length>Q.config.historyCacheSize){i.shift()}while(i.length>0){try{localStorage.setItem("htmx-history-cache",JSON.stringify(i));break}catch(e){fe(re().body,"htmx:historyCacheError",{cause:e,cache:i});i.shift()}}}function Yt(e){if(!U()){return null}e=B(e);var t=E(localStorage.getItem("htmx-history-cache"))||[];for(var r=0;r<t.length;r++){if(t[r].url===e){return t[r]}}return null}function Qt(e){var t=Q.config.requestClass;var r=e.cloneNode(true);oe(f(r,"."+t),function(e){n(e,t)});return r.innerHTML}function er(){var e=Zt();var t=Jt||location.pathname+location.search;var r;try{r=re().querySelector('[hx-history="false" i],[data-hx-history="false" i]')}catch(e){r=re().querySelector('[hx-history="false"],[data-hx-history="false"]')}if(!r){ce(re().body,"htmx:beforeHistorySave",{path:t,historyElt:e});Kt(t,Qt(e),re().title,window.scrollY)}if(Q.config.historyEnabled)history.replaceState({htmx:true},re().title,window.location.href)}function tr(e){if(Q.config.getCacheBusterParam){e=e.replace(/org\.htmx\.cache-buster=[^&]*&?/,"");if(G(e,"&")||G(e,"?")){e=e.slice(0,-1)}}if(Q.config.historyEnabled){history.pushState({htmx:true},"",e)}Jt=e}function rr(e){if(Q.config.historyEnabled)history.replaceState({htmx:true},"",e);Jt=e}function nr(e){oe(e,function(e){e.call()})}function ir(a){var e=new XMLHttpRequest;var o={path:a,xhr:e};ce(re().body,"htmx:historyCacheMiss",o);e.open("GET",a,true);e.setRequestHeader("HX-Request","true");e.setRequestHeader("HX-History-Restore-Request","true");e.setRequestHeader("HX-Current-URL",re().location.href);e.onload=function(){if(this.status>=200&&this.status<400){ce(re().body,"htmx:historyCacheMissLoad",o);var e=l(this.response);e=e.querySelector("[hx-history-elt],[data-hx-history-elt]")||e;var t=Zt();var r=T(t);var n=Ve(this.response);if(n){var i=C("title");if(i){i.innerHTML=n}else{window.document.title=n}}Ue(t,e,r);nr(r.tasks);Jt=a;ce(re().body,"htmx:historyRestore",{path:a,cacheMiss:true,serverResponse:this.response})}else{fe(re().body,"htmx:historyCacheMissLoadError",o)}};e.send()}function ar(e){er();e=e||location.pathname+location.search;var t=Yt(e);if(t){var r=l(t.content);var n=Zt();var i=T(n);Ue(n,r,i);nr(i.tasks);document.title=t.title;setTimeout(function(){window.scrollTo(0,t.scroll)},0);Jt=e;ce(re().body,"htmx:historyRestore",{path:e,item:t})}else{if(Q.config.refreshOnHistoryMiss){window.location.reload(true)}else{ir(e)}}}function or(e){var t=pe(e,"hx-indicator");if(t==null){t=[e]}oe(t,function(e){var t=ae(e);t.requestCount=(t.requestCount||0)+1;e.classList["add"].call(e.classList,Q.config.requestClass)});return t}function sr(e){var t=pe(e,"hx-disabled-elt");if(t==null){t=[]}oe(t,function(e){var t=ae(e);t.requestCount=(t.requestCount||0)+1;e.setAttribute("disabled","")});return t}function lr(e,t){oe(e,function(e){var t=ae(e);t.requestCount=(t.requestCount||0)-1;if(t.requestCount===0){e.classList["remove"].call(e.classList,Q.config.requestClass)}});oe(t,function(e){var t=ae(e);t.requestCount=(t.requestCount||0)-1;if(t.requestCount===0){e.removeAttribute("disabled")}})}function ur(e,t){for(var r=0;r<e.length;r++){var n=e[r];if(n.isSameNode(t)){return true}}return false}function fr(e){if(e.name===""||e.name==null||e.disabled||v(e,"fieldset[disabled]")){return false}if(e.type==="button"||e.type==="submit"||e.tagName==="image"||e.tagName==="reset"||e.tagName==="file"){return false}if(e.type==="checkbox"||e.type==="radio"){return e.checked}return true}function cr(e,t,r){if(e!=null&&t!=null){var n=r[e];if(n===undefined){r[e]=t}else if(Array.isArray(n)){if(Array.isArray(t)){r[e]=n.concat(t)}else{n.push(t)}}else{if(Array.isArray(t)){r[e]=[n].concat(t)}else{r[e]=[n,t]}}}}function hr(t,r,n,e,i){if(e==null||ur(t,e)){return}else{t.push(e)}if(fr(e)){var a=ee(e,"name");var o=e.value;if(e.multiple&&e.tagName==="SELECT"){o=M(e.querySelectorAll("option:checked")).map(function(e){return e.value})}if(e.files){o=M(e.files)}cr(a,o,r);if(i){vr(e,n)}}if(h(e,"form")){var s=e.elements;oe(s,function(e){hr(t,r,n,e,i)})}}function vr(e,t){if(e.willValidate){ce(e,"htmx:validation:validate");if(!e.checkValidity()){t.push({elt:e,message:e.validationMessage,validity:e.validity});ce(e,"htmx:validation:failed",{message:e.validationMessage,validity:e.validity})}}}function dr(e,t){var r=[];var n={};var i={};var a=[];var o=ae(e);if(o.lastButtonClicked&&!se(o.lastButtonClicked)){o.lastButtonClicked=null}var s=h(e,"form")&&e.noValidate!==true||te(e,"hx-validate")==="true";if(o.lastButtonClicked){s=s&&o.lastButtonClicked.formNoValidate!==true}if(t!=="get"){hr(r,i,a,v(e,"form"),s)}hr(r,n,a,e,s);if(o.lastButtonClicked||e.tagName==="BUTTON"||e.tagName==="INPUT"&&ee(e,"type")==="submit"){var l=o.lastButtonClicked||e;var u=ee(l,"name");cr(u,l.value,i)}var f=pe(e,"hx-include");oe(f,function(e){hr(r,n,a,e,s);if(!h(e,"form")){oe(e.querySelectorAll(rt),function(e){hr(r,n,a,e,s)})}});n=le(n,i);return{errors:a,values:n}}function gr(e,t,r){if(e!==""){e+="&"}if(String(r)==="[object Object]"){r=JSON.stringify(r)}var n=encodeURIComponent(r);e+=encodeURIComponent(t)+"="+n;return e}function mr(e){var t="";for(var r in e){if(e.hasOwnProperty(r)){var n=e[r];if(Array.isArray(n)){oe(n,function(e){t=gr(t,r,e)})}else{t=gr(t,r,n)}}}return t}function pr(e){var t=new FormData;for(var r in e){if(e.hasOwnProperty(r)){var n=e[r];if(Array.isArray(n)){oe(n,function(e){t.append(r,e)})}else{t.append(r,n)}}}return t}function xr(e,t,r){var n={"HX-Request":"true","HX-Trigger":ee(e,"id"),"HX-Trigger-Name":ee(e,"name"),"HX-Target":te(t,"id"),"HX-Current-URL":re().location.href};Rr(e,"hx-headers",false,n);if(r!==undefined){n["HX-Prompt"]=r}if(ae(e).boosted){n["HX-Boosted"]="true"}return n}function yr(t,e){var r=ne(e,"hx-params");if(r){if(r==="none"){return{}}else if(r==="*"){return t}else if(r.indexOf("not ")===0){oe(r.substr(4).split(","),function(e){e=e.trim();delete t[e]});return t}else{var n={};oe(r.split(","),function(e){e=e.trim();n[e]=t[e]});return n}}else{return t}}function br(e){return ee(e,"href")&&ee(e,"href").indexOf("#")>=0}function wr(e,t){var r=t?t:ne(e,"hx-swap");var n={swapStyle:ae(e).boosted?"innerHTML":Q.config.defaultSwapStyle,swapDelay:Q.config.defaultSwapDelay,settleDelay:Q.config.defaultSettleDelay};if(Q.config.scrollIntoViewOnBoost&&ae(e).boosted&&!br(e)){n["show"]="top"}if(r){var i=D(r);if(i.length>0){for(var a=0;a<i.length;a++){var o=i[a];if(o.indexOf("swap:")===0){n["swapDelay"]=d(o.substr(5))}else if(o.indexOf("settle:")===0){n["settleDelay"]=d(o.substr(7))}else if(o.indexOf("transition:")===0){n["transition"]=o.substr(11)==="true"}else if(o.indexOf("ignoreTitle:")===0){n["ignoreTitle"]=o.substr(12)==="true"}else if(o.indexOf("scroll:")===0){var s=o.substr(7);var l=s.split(":");var u=l.pop();var f=l.length>0?l.join(":"):null;n["scroll"]=u;n["scrollTarget"]=f}else if(o.indexOf("show:")===0){var c=o.substr(5);var l=c.split(":");var h=l.pop();var f=l.length>0?l.join(":"):null;n["show"]=h;n["showTarget"]=f}else if(o.indexOf("focus-scroll:")===0){var v=o.substr("focus-scroll:".length);n["focusScroll"]=v=="true"}else if(a==0){n["swapStyle"]=o}else{b("Unknown modifier in hx-swap: "+o)}}}}return n}function Sr(e){return ne(e,"hx-encoding")==="multipart/form-data"||h(e,"form")&&ee(e,"enctype")==="multipart/form-data"}function Er(t,r,n){var i=null;R(r,function(e){if(i==null){i=e.encodeParameters(t,n,r)}});if(i!=null){return i}else{if(Sr(r)){return pr(n)}else{return mr(n)}}}function T(e){return{tasks:[],elts:[e]}}function Cr(e,t){var r=e[0];var n=e[e.length-1];if(t.scroll){var i=null;if(t.scrollTarget){i=ue(r,t.scrollTarget)}if(t.scroll==="top"&&(r||i)){i=i||r;i.scrollTop=0}if(t.scroll==="bottom"&&(n||i)){i=i||n;i.scrollTop=i.scrollHeight}}if(t.show){var i=null;if(t.showTarget){var a=t.showTarget;if(t.showTarget==="window"){a="body"}i=ue(r,a)}if(t.show==="top"&&(r||i)){i=i||r;i.scrollIntoView({block:"start",behavior:Q.config.scrollBehavior})}if(t.show==="bottom"&&(n||i)){i=i||n;i.scrollIntoView({block:"end",behavior:Q.config.scrollBehavior})}}}function Rr(e,t,r,n){if(n==null){n={}}if(e==null){return n}var i=te(e,t);if(i){var a=i.trim();var o=r;if(a==="unset"){return null}if(a.indexOf("javascript:")===0){a=a.substr(11);o=true}else if(a.indexOf("js:")===0){a=a.substr(3);o=true}if(a.indexOf("{")!==0){a="{"+a+"}"}var s;if(o){s=Tr(e,function(){return Function("return ("+a+")")()},{})}else{s=E(a)}for(var l in s){if(s.hasOwnProperty(l)){if(n[l]==null){n[l]=s[l]}}}}return Rr(u(e),t,r,n)}function Tr(e,t,r){if(Q.config.allowEval){return t()}else{fe(e,"htmx:evalDisallowedError");return r}}function Or(e,t){return Rr(e,"hx-vars",true,t)}function qr(e,t){return Rr(e,"hx-vals",false,t)}function Hr(e){return le(Or(e),qr(e))}function Lr(t,r,n){if(n!==null){try{t.setRequestHeader(r,n)}catch(e){t.setRequestHeader(r,encodeURIComponent(n));t.setRequestHeader(r+"-URI-AutoEncoded","true")}}}function Ar(t){if(t.responseURL&&typeof URL!=="undefined"){try{var e=new URL(t.responseURL);return e.pathname+e.search}catch(e){fe(re().body,"htmx:badResponseUrl",{url:t.responseURL})}}}function O(e,t){return t.test(e.getAllResponseHeaders())}function Nr(e,t,r){e=e.toLowerCase();if(r){if(r instanceof Element||I(r,"String")){return he(e,t,null,null,{targetOverride:g(r),returnPromise:true})}else{return he(e,t,g(r.source),r.event,{handler:r.handler,headers:r.headers,values:r.values,targetOverride:g(r.target),swapOverride:r.swap,select:r.select,returnPromise:true})}}else{return he(e,t,null,null,{returnPromise:true})}}function Ir(e){var t=[];while(e){t.push(e);e=e.parentElement}return t}function kr(e,t,r){var n;var i;if(typeof URL==="function"){i=new URL(t,document.location.href);var a=document.location.origin;n=a===i.origin}else{i=t;n=s(t,document.location.origin)}if(Q.config.selfRequestsOnly){if(!n){return false}}return ce(e,"htmx:validateUrl",le({url:i,sameHost:n},r))}function he(t,r,n,i,a,e){var o=null;var s=null;a=a!=null?a:{};if(a.returnPromise&&typeof Promise!=="undefined"){var l=new Promise(function(e,t){o=e;s=t})}if(n==null){n=re().body}var M=a.handler||Mr;var X=a.select||null;if(!se(n)){ie(o);return l}var u=a.targetOverride||ye(n);if(u==null||u==me){fe(n,"htmx:targetError",{target:te(n,"hx-target")});ie(s);return l}var f=ae(n);var c=f.lastButtonClicked;if(c){var h=ee(c,"formaction");if(h!=null){r=h}var v=ee(c,"formmethod");if(v!=null){if(v.toLowerCase()!=="dialog"){t=v}}}var d=ne(n,"hx-confirm");if(e===undefined){var D=function(e){return he(t,r,n,i,a,!!e)};var U={target:u,elt:n,path:r,verb:t,triggeringEvent:i,etc:a,issueRequest:D,question:d};if(ce(n,"htmx:confirm",U)===false){ie(o);return l}}var g=n;var m=ne(n,"hx-sync");var p=null;var x=false;if(m){var B=m.split(":");var F=B[0].trim();if(F==="this"){g=xe(n,"hx-sync")}else{g=ue(n,F)}m=(B[1]||"drop").trim();f=ae(g);if(m==="drop"&&f.xhr&&f.abortable!==true){ie(o);return l}else if(m==="abort"){if(f.xhr){ie(o);return l}else{x=true}}else if(m==="replace"){ce(g,"htmx:abort")}else if(m.indexOf("queue")===0){var V=m.split(" ");p=(V[1]||"last").trim()}}if(f.xhr){if(f.abortable){ce(g,"htmx:abort")}else{if(p==null){if(i){var y=ae(i);if(y&&y.triggerSpec&&y.triggerSpec.queue){p=y.triggerSpec.queue}}if(p==null){p="last"}}if(f.queuedRequests==null){f.queuedRequests=[]}if(p==="first"&&f.queuedRequests.length===0){f.queuedRequests.push(function(){he(t,r,n,i,a)})}else if(p==="all"){f.queuedRequests.push(function(){he(t,r,n,i,a)})}else if(p==="last"){f.queuedRequests=[];f.queuedRequests.push(function(){he(t,r,n,i,a)})}ie(o);return l}}var b=new XMLHttpRequest;f.xhr=b;f.abortable=x;var w=function(){f.xhr=null;f.abortable=false;if(f.queuedRequests!=null&&f.queuedRequests.length>0){var e=f.queuedRequests.shift();e()}};var j=ne(n,"hx-prompt");if(j){var S=prompt(j);if(S===null||!ce(n,"htmx:prompt",{prompt:S,target:u})){ie(o);w();return l}}if(d&&!e){if(!confirm(d)){ie(o);w();return l}}var E=xr(n,u,S);if(t!=="get"&&!Sr(n)){E["Content-Type"]="application/x-www-form-urlencoded"}if(a.headers){E=le(E,a.headers)}var _=dr(n,t);var C=_.errors;var R=_.values;if(a.values){R=le(R,a.values)}var z=Hr(n);var $=le(R,z);var T=yr($,n);if(Q.config.getCacheBusterParam&&t==="get"){T["org.htmx.cache-buster"]=ee(u,"id")||"true"}if(r==null||r===""){r=re().location.href}var O=Rr(n,"hx-request");var W=ae(n).boosted;var q=Q.config.methodsThatUseUrlParams.indexOf(t)>=0;var H={boosted:W,useUrlParams:q,parameters:T,unfilteredParameters:$,headers:E,target:u,verb:t,errors:C,withCredentials:a.credentials||O.credentials||Q.config.withCredentials,timeout:a.timeout||O.timeout||Q.config.timeout,path:r,triggeringEvent:i};if(!ce(n,"htmx:configRequest",H)){ie(o);w();return l}r=H.path;t=H.verb;E=H.headers;T=H.parameters;C=H.errors;q=H.useUrlParams;if(C&&C.length>0){ce(n,"htmx:validation:halted",H);ie(o);w();return l}var G=r.split("#");var J=G[0];var L=G[1];var A=r;if(q){A=J;var Z=Object.keys(T).length!==0;if(Z){if(A.indexOf("?")<0){A+="?"}else{A+="&"}A+=mr(T);if(L){A+="#"+L}}}if(!kr(n,A,H)){fe(n,"htmx:invalidPath",H);ie(s);return l}b.open(t.toUpperCase(),A,true);b.overrideMimeType("text/html");b.withCredentials=H.withCredentials;b.timeout=H.timeout;if(O.noHeaders){}else{for(var N in E){if(E.hasOwnProperty(N)){var K=E[N];Lr(b,N,K)}}}var I={xhr:b,target:u,requestConfig:H,etc:a,boosted:W,select:X,pathInfo:{requestPath:r,finalRequestPath:A,anchor:L}};b.onload=function(){try{var e=Ir(n);I.pathInfo.responsePath=Ar(b);M(n,I);lr(k,P);ce(n,"htmx:afterRequest",I);ce(n,"htmx:afterOnLoad",I);if(!se(n)){var t=null;while(e.length>0&&t==null){var r=e.shift();if(se(r)){t=r}}if(t){ce(t,"htmx:afterRequest",I);ce(t,"htmx:afterOnLoad",I)}}ie(o);w()}catch(e){fe(n,"htmx:onLoadError",le({error:e},I));throw e}};b.onerror=function(){lr(k,P);fe(n,"htmx:afterRequest",I);fe(n,"htmx:sendError",I);ie(s);w()};b.onabort=function(){lr(k,P);fe(n,"htmx:afterRequest",I);fe(n,"htmx:sendAbort",I);ie(s);w()};b.ontimeout=function(){lr(k,P);fe(n,"htmx:afterRequest",I);fe(n,"htmx:timeout",I);ie(s);w()};if(!ce(n,"htmx:beforeRequest",I)){ie(o);w();return l}var k=or(n);var P=sr(n);oe(["loadstart","loadend","progress","abort"],function(t){oe([b,b.upload],function(e){e.addEventListener(t,function(e){ce(n,"htmx:xhr:"+t,{lengthComputable:e.lengthComputable,loaded:e.loaded,total:e.total})})})});ce(n,"htmx:beforeSend",I);var Y=q?null:Er(b,n,T);b.send(Y);return l}function Pr(e,t){var r=t.xhr;var n=null;var i=null;if(O(r,/HX-Push:/i)){n=r.getResponseHeader("HX-Push");i="push"}else if(O(r,/HX-Push-Url:/i)){n=r.getResponseHeader("HX-Push-Url");i="push"}else if(O(r,/HX-Replace-Url:/i)){n=r.getResponseHeader("HX-Replace-Url");i="replace"}if(n){if(n==="false"){return{}}else{return{type:i,path:n}}}var a=t.pathInfo.finalRequestPath;var o=t.pathInfo.responsePath;var s=ne(e,"hx-push-url");var l=ne(e,"hx-replace-url");var u=ae(e).boosted;var f=null;var c=null;if(s){f="push";c=s}else if(l){f="replace";c=l}else if(u){f="push";c=o||a}if(c){if(c==="false"){return{}}if(c==="true"){c=o||a}if(t.pathInfo.anchor&&c.indexOf("#")===-1){c=c+"#"+t.pathInfo.anchor}return{type:f,path:c}}else{return{}}}function Mr(l,u){var f=u.xhr;var c=u.target;var e=u.etc;var t=u.requestConfig;var h=u.select;if(!ce(l,"htmx:beforeOnLoad",u))return;if(O(f,/HX-Trigger:/i)){_e(f,"HX-Trigger",l)}if(O(f,/HX-Location:/i)){er();var r=f.getResponseHeader("HX-Location");var v;if(r.indexOf("{")===0){v=E(r);r=v["path"];delete v["path"]}Nr("GET",r,v).then(function(){tr(r)});return}var n=O(f,/HX-Refresh:/i)&&"true"===f.getResponseHeader("HX-Refresh");if(O(f,/HX-Redirect:/i)){location.href=f.getResponseHeader("HX-Redirect");n&&location.reload();return}if(n){location.reload();return}if(O(f,/HX-Retarget:/i)){if(f.getResponseHeader("HX-Retarget")==="this"){u.target=l}else{u.target=ue(l,f.getResponseHeader("HX-Retarget"))}}var d=Pr(l,u);var i=f.status>=200&&f.status<400&&f.status!==204;var g=f.response;var a=f.status>=400;var m=Q.config.ignoreTitle;var o=le({shouldSwap:i,serverResponse:g,isError:a,ignoreTitle:m},u);if(!ce(c,"htmx:beforeSwap",o))return;c=o.target;g=o.serverResponse;a=o.isError;m=o.ignoreTitle;u.target=c;u.failed=a;u.successful=!a;if(o.shouldSwap){if(f.status===286){at(l)}R(l,function(e){g=e.transformResponse(g,f,l)});if(d.type){er()}var s=e.swapOverride;if(O(f,/HX-Reswap:/i)){s=f.getResponseHeader("HX-Reswap")}var v=wr(l,s);if(v.hasOwnProperty("ignoreTitle")){m=v.ignoreTitle}c.classList.add(Q.config.swappingClass);var p=null;var x=null;var y=function(){try{var e=document.activeElement;var t={};try{t={elt:e,start:e?e.selectionStart:null,end:e?e.selectionEnd:null}}catch(e){}var r;if(h){r=h}if(O(f,/HX-Reselect:/i)){r=f.getResponseHeader("HX-Reselect")}if(d.type){ce(re().body,"htmx:beforeHistoryUpdate",le({history:d},u));if(d.type==="push"){tr(d.path);ce(re().body,"htmx:pushedIntoHistory",{path:d.path})}else{rr(d.path);ce(re().body,"htmx:replacedInHistory",{path:d.path})}}var n=T(c);je(v.swapStyle,c,l,g,n,r);if(t.elt&&!se(t.elt)&&ee(t.elt,"id")){var i=document.getElementById(ee(t.elt,"id"));var a={preventScroll:v.focusScroll!==undefined?!v.focusScroll:!Q.config.defaultFocusScroll};if(i){if(t.start&&i.setSelectionRange){try{i.setSelectionRange(t.start,t.end)}catch(e){}}i.focus(a)}}c.classList.remove(Q.config.swappingClass);oe(n.elts,function(e){if(e.classList){e.classList.add(Q.config.settlingClass)}ce(e,"htmx:afterSwap",u)});if(O(f,/HX-Trigger-After-Swap:/i)){var o=l;if(!se(l)){o=re().body}_e(f,"HX-Trigger-After-Swap",o)}var s=function(){oe(n.tasks,function(e){e.call()});oe(n.elts,function(e){if(e.classList){e.classList.remove(Q.config.settlingClass)}ce(e,"htmx:afterSettle",u)});if(u.pathInfo.anchor){var e=re().getElementById(u.pathInfo.anchor);if(e){e.scrollIntoView({block:"start",behavior:"auto"})}}if(n.title&&!m){var t=C("title");if(t){t.innerHTML=n.title}else{window.document.title=n.title}}Cr(n.elts,v);if(O(f,/HX-Trigger-After-Settle:/i)){var r=l;if(!se(l)){r=re().body}_e(f,"HX-Trigger-After-Settle",r)}ie(p)};if(v.settleDelay>0){setTimeout(s,v.settleDelay)}else{s()}}catch(e){fe(l,"htmx:swapError",u);ie(x);throw e}};var b=Q.config.globalViewTransitions;if(v.hasOwnProperty("transition")){b=v.transition}if(b&&ce(l,"htmx:beforeTransition",u)&&typeof Promise!=="undefined"&&document.startViewTransition){var w=new Promise(function(e,t){p=e;x=t});var S=y;y=function(){document.startViewTransition(function(){S();return w})}}if(v.swapDelay>0){setTimeout(y,v.swapDelay)}else{y()}}if(a){fe(l,"htmx:responseError",le({error:"Response Status Error Code "+f.status+" from "+u.pathInfo.requestPath},u))}}var Xr={};function Dr(){return{init:function(e){return null},onEvent:function(e,t){return true},transformResponse:function(e,t,r){return e},isInlineSwap:function(e){return false},handleSwap:function(e,t,r,n){return false},encodeParameters:function(e,t,r){return null}}}function Ur(e,t){if(t.init){t.init(r)}Xr[e]=le(Dr(),t)}function Br(e){delete Xr[e]}function Fr(e,r,n){if(e==undefined){return r}if(r==undefined){r=[]}if(n==undefined){n=[]}var t=te(e,"hx-ext");if(t){oe(t.split(","),function(e){e=e.replace(/ /g,"");if(e.slice(0,7)=="ignore:"){n.push(e.slice(7));return}if(n.indexOf(e)<0){var t=Xr[e];if(t&&r.indexOf(t)<0){r.push(t)}}})}return Fr(u(e),r,n)}var Vr=false;re().addEventListener("DOMContentLoaded",function(){Vr=true});function jr(e){if(Vr||re().readyState==="complete"){e()}else{re().addEventListener("DOMContentLoaded",e)}}function _r(){if(Q.config.includeIndicatorStyles!==false){re().head.insertAdjacentHTML("beforeend","<style>                      ."+Q.config.indicatorClass+"{opacity:0}                      ."+Q.config.requestClass+" ."+Q.config.indicatorClass+"{opacity:1; transition: opacity 200ms ease-in;}                      ."+Q.config.requestClass+"."+Q.config.indicatorClass+"{opacity:1; transition: opacity 200ms ease-in;}                    </style>")}}function zr(){var e=re().querySelector('meta[name="htmx-config"]');if(e){return E(e.content)}else{return null}}function $r(){var e=zr();if(e){Q.config=le(Q.config,e)}}jr(function(){$r();_r();var e=re().body;zt(e);var t=re().querySelectorAll("[hx-trigger='restored'],[data-hx-trigger='restored']");e.addEventListener("htmx:abort",function(e){var t=e.target;var r=ae(t);if(r&&r.xhr){r.xhr.abort()}});const r=window.onpopstate?window.onpopstate.bind(window):null;window.onpopstate=function(e){if(e.state&&e.state.htmx){ar();oe(t,function(e){ce(e,"htmx:restored",{document:re(),triggerEvent:ce})})}else{if(r){r(e)}}};setTimeout(function(){ce(e,"htmx:load",{});e=null},0)});return Q}()});

/***/ }),

/***/ "./node_modules/sortablejs/modular/sortable.esm.js":
/*!*********************************************************!*\
  !*** ./node_modules/sortablejs/modular/sortable.esm.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiDrag: () => (/* binding */ MultiDragPlugin),
/* harmony export */   Sortable: () => (/* binding */ Sortable),
/* harmony export */   Swap: () => (/* binding */ SwapPlugin),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**!
 * Sortable 1.15.2
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }
  return _typeof(obj);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var version = "1.15.2";

function userAgent(pattern) {
  if (typeof window !== 'undefined' && window.navigator) {
    return !! /*@__PURE__*/navigator.userAgent.match(pattern);
  }
}
var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
var Edge = userAgent(/Edge/i);
var FireFox = userAgent(/firefox/i);
var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
var IOS = userAgent(/iP(ad|od|hone)/i);
var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

var captureMode = {
  capture: false,
  passive: false
};
function on(el, event, fn) {
  el.addEventListener(event, fn, !IE11OrLess && captureMode);
}
function off(el, event, fn) {
  el.removeEventListener(event, fn, !IE11OrLess && captureMode);
}
function matches( /**HTMLElement*/el, /**String*/selector) {
  if (!selector) return;
  selector[0] === '>' && (selector = selector.substring(1));
  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (_) {
      return false;
    }
  }
  return false;
}
function getParentOrHost(el) {
  return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
}
function closest( /**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx, includeCTX) {
  if (el) {
    ctx = ctx || document;
    do {
      if (selector != null && (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
        return el;
      }
      if (el === ctx) break;
      /* jshint boss:true */
    } while (el = getParentOrHost(el));
  }
  return null;
}
var R_SPACE = /\s+/g;
function toggleClass(el, name, state) {
  if (el && name) {
    if (el.classList) {
      el.classList[state ? 'add' : 'remove'](name);
    } else {
      var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
      el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
    }
  }
}
function css(el, prop, val) {
  var style = el && el.style;
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, '');
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }
      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style) && prop.indexOf('webkit') === -1) {
        prop = '-webkit-' + prop;
      }
      style[prop] = val + (typeof val === 'string' ? '' : 'px');
    }
  }
}
function matrix(el, selfOnly) {
  var appliedTransforms = '';
  if (typeof el === 'string') {
    appliedTransforms = el;
  } else {
    do {
      var transform = css(el, 'transform');
      if (transform && transform !== 'none') {
        appliedTransforms = transform + ' ' + appliedTransforms;
      }
      /* jshint boss:true */
    } while (!selfOnly && (el = el.parentNode));
  }
  var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  /*jshint -W056 */
  return matrixFn && new matrixFn(appliedTransforms);
}
function find(ctx, tagName, iterator) {
  if (ctx) {
    var list = ctx.getElementsByTagName(tagName),
      i = 0,
      n = list.length;
    if (iterator) {
      for (; i < n; i++) {
        iterator(list[i], i);
      }
    }
    return list;
  }
  return [];
}
function getWindowScrollingElement() {
  var scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    return scrollingElement;
  } else {
    return document.documentElement;
  }
}

/**
 * Returns the "bounding client rect" of given element
 * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
 * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
 * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
 * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
 * @param  {[HTMLElement]} container              The parent the element will be placed in
 * @return {Object}                               The boundingClientRect of el, with specified adjustments
 */
function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
  if (!el.getBoundingClientRect && el !== window) return;
  var elRect, top, left, bottom, right, height, width;
  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect();
    top = elRect.top;
    left = elRect.left;
    bottom = elRect.bottom;
    right = elRect.right;
    height = elRect.height;
    width = elRect.width;
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }
  if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
    // Adjust for translate()
    container = container || el.parentNode;

    // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
    // Not needed on <= IE11
    if (!IE11OrLess) {
      do {
        if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || relativeToNonStaticParent && css(container, 'position') !== 'static')) {
          var containerRect = container.getBoundingClientRect();

          // Set relative to edges of padding box of container
          top -= containerRect.top + parseInt(css(container, 'border-top-width'));
          left -= containerRect.left + parseInt(css(container, 'border-left-width'));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
        /* jshint boss:true */
      } while (container = container.parentNode);
    }
  }
  if (undoScale && el !== window) {
    // Adjust for scale()
    var elMatrix = matrix(container || el),
      scaleX = elMatrix && elMatrix.a,
      scaleY = elMatrix && elMatrix.d;
    if (elMatrix) {
      top /= scaleY;
      left /= scaleX;
      width /= scaleX;
      height /= scaleY;
      bottom = top + height;
      right = left + width;
    }
  }
  return {
    top: top,
    left: left,
    bottom: bottom,
    right: right,
    width: width,
    height: height
  };
}

/**
 * Checks if a side of an element is scrolled past a side of its parents
 * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
 * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
 * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
 * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
 */
function isScrolledPast(el, elSide, parentSide) {
  var parent = getParentAutoScrollElement(el, true),
    elSideVal = getRect(el)[elSide];

  /* jshint boss:true */
  while (parent) {
    var parentSideVal = getRect(parent)[parentSide],
      visible = void 0;
    if (parentSide === 'top' || parentSide === 'left') {
      visible = elSideVal >= parentSideVal;
    } else {
      visible = elSideVal <= parentSideVal;
    }
    if (!visible) return parent;
    if (parent === getWindowScrollingElement()) break;
    parent = getParentAutoScrollElement(parent, false);
  }
  return false;
}

/**
 * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
 * and non-draggable elements
 * @param  {HTMLElement} el       The parent element
 * @param  {Number} childNum      The index of the child
 * @param  {Object} options       Parent Sortable's options
 * @return {HTMLElement}          The child at index childNum, or null if not found
 */
function getChild(el, childNum, options, includeDragEl) {
  var currentChild = 0,
    i = 0,
    children = el.children;
  while (i < children.length) {
    if (children[i].style.display !== 'none' && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
      if (currentChild === childNum) {
        return children[i];
      }
      currentChild++;
    }
    i++;
  }
  return null;
}

/**
 * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
 * @param  {HTMLElement} el       Parent element
 * @param  {selector} selector    Any other elements that should be ignored
 * @return {HTMLElement}          The last child, ignoring ghostEl
 */
function lastChild(el, selector) {
  var last = el.lastElementChild;
  while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
    last = last.previousElementSibling;
  }
  return last || null;
}

/**
 * Returns the index of an element within its parent for a selected set of
 * elements
 * @param  {HTMLElement} el
 * @param  {selector} selector
 * @return {number}
 */
function index(el, selector) {
  var index = 0;
  if (!el || !el.parentNode) {
    return -1;
  }

  /* jshint boss:true */
  while (el = el.previousElementSibling) {
    if (el.nodeName.toUpperCase() !== 'TEMPLATE' && el !== Sortable.clone && (!selector || matches(el, selector))) {
      index++;
    }
  }
  return index;
}

/**
 * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
 * The value is returned in real pixels.
 * @param  {HTMLElement} el
 * @return {Array}             Offsets in the format of [left, top]
 */
function getRelativeScrollOffset(el) {
  var offsetLeft = 0,
    offsetTop = 0,
    winScroller = getWindowScrollingElement();
  if (el) {
    do {
      var elMatrix = matrix(el),
        scaleX = elMatrix.a,
        scaleY = elMatrix.d;
      offsetLeft += el.scrollLeft * scaleX;
      offsetTop += el.scrollTop * scaleY;
    } while (el !== winScroller && (el = el.parentNode));
  }
  return [offsetLeft, offsetTop];
}

/**
 * Returns the index of the object within the given array
 * @param  {Array} arr   Array that may or may not hold the object
 * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
 * @return {Number}      The index of the object in the array, or -1
 */
function indexOfObject(arr, obj) {
  for (var i in arr) {
    if (!arr.hasOwnProperty(i)) continue;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
    }
  }
  return -1;
}
function getParentAutoScrollElement(el, includeSelf) {
  // skip to window
  if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
  var elem = el;
  var gotSelf = false;
  do {
    // we don't need to get elem css if it isn't even overflowing in the first place (performance)
    if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
      var elemCSS = css(elem);
      if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
        if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
        if (gotSelf || includeSelf) return elem;
        gotSelf = true;
      }
    }
    /* jshint boss:true */
  } while (elem = elem.parentNode);
  return getWindowScrollingElement();
}
function extend(dst, src) {
  if (dst && src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dst[key] = src[key];
      }
    }
  }
  return dst;
}
function isRectEqual(rect1, rect2) {
  return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
}
var _throttleTimeout;
function throttle(callback, ms) {
  return function () {
    if (!_throttleTimeout) {
      var args = arguments,
        _this = this;
      if (args.length === 1) {
        callback.call(_this, args[0]);
      } else {
        callback.apply(_this, args);
      }
      _throttleTimeout = setTimeout(function () {
        _throttleTimeout = void 0;
      }, ms);
    }
  };
}
function cancelThrottle() {
  clearTimeout(_throttleTimeout);
  _throttleTimeout = void 0;
}
function scrollBy(el, x, y) {
  el.scrollLeft += x;
  el.scrollTop += y;
}
function clone(el) {
  var Polymer = window.Polymer;
  var $ = window.jQuery || window.Zepto;
  if (Polymer && Polymer.dom) {
    return Polymer.dom(el).cloneNode(true);
  } else if ($) {
    return $(el).clone(true)[0];
  } else {
    return el.cloneNode(true);
  }
}
function setRect(el, rect) {
  css(el, 'position', 'absolute');
  css(el, 'top', rect.top);
  css(el, 'left', rect.left);
  css(el, 'width', rect.width);
  css(el, 'height', rect.height);
}
function unsetRect(el) {
  css(el, 'position', '');
  css(el, 'top', '');
  css(el, 'left', '');
  css(el, 'width', '');
  css(el, 'height', '');
}
function getChildContainingRectFromElement(container, options, ghostEl) {
  var rect = {};
  Array.from(container.children).forEach(function (child) {
    var _rect$left, _rect$top, _rect$right, _rect$bottom;
    if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl) return;
    var childRect = getRect(child);
    rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
    rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
    rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
    rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
  });
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
var expando = 'Sortable' + new Date().getTime();

function AnimationStateManager() {
  var animationStates = [],
    animationCallbackId;
  return {
    captureAnimationState: function captureAnimationState() {
      animationStates = [];
      if (!this.options.animation) return;
      var children = [].slice.call(this.el.children);
      children.forEach(function (child) {
        if (css(child, 'display') === 'none' || child === Sortable.ghost) return;
        animationStates.push({
          target: child,
          rect: getRect(child)
        });
        var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);

        // If animating: compensate for current animation
        if (child.thisAnimationDuration) {
          var childMatrix = matrix(child, true);
          if (childMatrix) {
            fromRect.top -= childMatrix.f;
            fromRect.left -= childMatrix.e;
          }
        }
        child.fromRect = fromRect;
      });
    },
    addAnimationState: function addAnimationState(state) {
      animationStates.push(state);
    },
    removeAnimationState: function removeAnimationState(target) {
      animationStates.splice(indexOfObject(animationStates, {
        target: target
      }), 1);
    },
    animateAll: function animateAll(callback) {
      var _this = this;
      if (!this.options.animation) {
        clearTimeout(animationCallbackId);
        if (typeof callback === 'function') callback();
        return;
      }
      var animating = false,
        animationTime = 0;
      animationStates.forEach(function (state) {
        var time = 0,
          target = state.target,
          fromRect = target.fromRect,
          toRect = getRect(target),
          prevFromRect = target.prevFromRect,
          prevToRect = target.prevToRect,
          animatingRect = state.rect,
          targetMatrix = matrix(target, true);
        if (targetMatrix) {
          // Compensate for current animation
          toRect.top -= targetMatrix.f;
          toRect.left -= targetMatrix.e;
        }
        target.toRect = toRect;
        if (target.thisAnimationDuration) {
          // Could also check if animatingRect is between fromRect and toRect
          if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) &&
          // Make sure animatingRect is on line between toRect & fromRect
          (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
            // If returning to same place as started from animation and on same axis
            time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
          }
        }

        // if fromRect != toRect: animate
        if (!isRectEqual(toRect, fromRect)) {
          target.prevFromRect = fromRect;
          target.prevToRect = toRect;
          if (!time) {
            time = _this.options.animation;
          }
          _this.animate(target, animatingRect, toRect, time);
        }
        if (time) {
          animating = true;
          animationTime = Math.max(animationTime, time);
          clearTimeout(target.animationResetTimer);
          target.animationResetTimer = setTimeout(function () {
            target.animationTime = 0;
            target.prevFromRect = null;
            target.fromRect = null;
            target.prevToRect = null;
            target.thisAnimationDuration = null;
          }, time);
          target.thisAnimationDuration = time;
        }
      });
      clearTimeout(animationCallbackId);
      if (!animating) {
        if (typeof callback === 'function') callback();
      } else {
        animationCallbackId = setTimeout(function () {
          if (typeof callback === 'function') callback();
        }, animationTime);
      }
      animationStates = [];
    },
    animate: function animate(target, currentRect, toRect, duration) {
      if (duration) {
        css(target, 'transition', '');
        css(target, 'transform', '');
        var elMatrix = matrix(this.el),
          scaleX = elMatrix && elMatrix.a,
          scaleY = elMatrix && elMatrix.d,
          translateX = (currentRect.left - toRect.left) / (scaleX || 1),
          translateY = (currentRect.top - toRect.top) / (scaleY || 1);
        target.animatingX = !!translateX;
        target.animatingY = !!translateY;
        css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
        this.forRepaintDummy = repaint(target); // repaint

        css(target, 'transition', 'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''));
        css(target, 'transform', 'translate3d(0,0,0)');
        typeof target.animated === 'number' && clearTimeout(target.animated);
        target.animated = setTimeout(function () {
          css(target, 'transition', '');
          css(target, 'transform', '');
          target.animated = false;
          target.animatingX = false;
          target.animatingY = false;
        }, duration);
      }
    }
  };
}
function repaint(target) {
  return target.offsetWidth;
}
function calculateRealTime(animatingRect, fromRect, toRect, options) {
  return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
}

var plugins = [];
var defaults = {
  initializeByDefault: true
};
var PluginManager = {
  mount: function mount(plugin) {
    // Set default static properties
    for (var option in defaults) {
      if (defaults.hasOwnProperty(option) && !(option in plugin)) {
        plugin[option] = defaults[option];
      }
    }
    plugins.forEach(function (p) {
      if (p.pluginName === plugin.pluginName) {
        throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
      }
    });
    plugins.push(plugin);
  },
  pluginEvent: function pluginEvent(eventName, sortable, evt) {
    var _this = this;
    this.eventCanceled = false;
    evt.cancel = function () {
      _this.eventCanceled = true;
    };
    var eventNameGlobal = eventName + 'Global';
    plugins.forEach(function (plugin) {
      if (!sortable[plugin.pluginName]) return;
      // Fire global events if it exists in this sortable
      if (sortable[plugin.pluginName][eventNameGlobal]) {
        sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
          sortable: sortable
        }, evt));
      }

      // Only fire plugin event if plugin is enabled in this sortable,
      // and plugin has event defined
      if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
        sortable[plugin.pluginName][eventName](_objectSpread2({
          sortable: sortable
        }, evt));
      }
    });
  },
  initializePlugins: function initializePlugins(sortable, el, defaults, options) {
    plugins.forEach(function (plugin) {
      var pluginName = plugin.pluginName;
      if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
      var initialized = new plugin(sortable, el, sortable.options);
      initialized.sortable = sortable;
      initialized.options = sortable.options;
      sortable[pluginName] = initialized;

      // Add default options from plugin
      _extends(defaults, initialized.defaults);
    });
    for (var option in sortable.options) {
      if (!sortable.options.hasOwnProperty(option)) continue;
      var modified = this.modifyOption(sortable, option, sortable.options[option]);
      if (typeof modified !== 'undefined') {
        sortable.options[option] = modified;
      }
    }
  },
  getEventProperties: function getEventProperties(name, sortable) {
    var eventProperties = {};
    plugins.forEach(function (plugin) {
      if (typeof plugin.eventProperties !== 'function') return;
      _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
    });
    return eventProperties;
  },
  modifyOption: function modifyOption(sortable, name, value) {
    var modifiedValue;
    plugins.forEach(function (plugin) {
      // Plugin must exist on the Sortable
      if (!sortable[plugin.pluginName]) return;

      // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin
      if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
        modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
      }
    });
    return modifiedValue;
  }
};

function dispatchEvent(_ref) {
  var sortable = _ref.sortable,
    rootEl = _ref.rootEl,
    name = _ref.name,
    targetEl = _ref.targetEl,
    cloneEl = _ref.cloneEl,
    toEl = _ref.toEl,
    fromEl = _ref.fromEl,
    oldIndex = _ref.oldIndex,
    newIndex = _ref.newIndex,
    oldDraggableIndex = _ref.oldDraggableIndex,
    newDraggableIndex = _ref.newDraggableIndex,
    originalEvent = _ref.originalEvent,
    putSortable = _ref.putSortable,
    extraEventProperties = _ref.extraEventProperties;
  sortable = sortable || rootEl && rootEl[expando];
  if (!sortable) return;
  var evt,
    options = sortable.options,
    onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);
  // Support for new CustomEvent feature
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent(name, {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent('Event');
    evt.initEvent(name, true, true);
  }
  evt.to = toEl || rootEl;
  evt.from = fromEl || rootEl;
  evt.item = targetEl || rootEl;
  evt.clone = cloneEl;
  evt.oldIndex = oldIndex;
  evt.newIndex = newIndex;
  evt.oldDraggableIndex = oldDraggableIndex;
  evt.newDraggableIndex = newDraggableIndex;
  evt.originalEvent = originalEvent;
  evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;
  var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
  for (var option in allEventProperties) {
    evt[option] = allEventProperties[option];
  }
  if (rootEl) {
    rootEl.dispatchEvent(evt);
  }
  if (options[onName]) {
    options[onName].call(sortable, evt);
  }
}

var _excluded = ["evt"];
var pluginEvent = function pluginEvent(eventName, sortable) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
    originalEvent = _ref.evt,
    data = _objectWithoutProperties(_ref, _excluded);
  PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
    dragEl: dragEl,
    parentEl: parentEl,
    ghostEl: ghostEl,
    rootEl: rootEl,
    nextEl: nextEl,
    lastDownEl: lastDownEl,
    cloneEl: cloneEl,
    cloneHidden: cloneHidden,
    dragStarted: moved,
    putSortable: putSortable,
    activeSortable: Sortable.active,
    originalEvent: originalEvent,
    oldIndex: oldIndex,
    oldDraggableIndex: oldDraggableIndex,
    newIndex: newIndex,
    newDraggableIndex: newDraggableIndex,
    hideGhostForTarget: _hideGhostForTarget,
    unhideGhostForTarget: _unhideGhostForTarget,
    cloneNowHidden: function cloneNowHidden() {
      cloneHidden = true;
    },
    cloneNowShown: function cloneNowShown() {
      cloneHidden = false;
    },
    dispatchSortableEvent: function dispatchSortableEvent(name) {
      _dispatchEvent({
        sortable: sortable,
        name: name,
        originalEvent: originalEvent
      });
    }
  }, data));
};
function _dispatchEvent(info) {
  dispatchEvent(_objectSpread2({
    putSortable: putSortable,
    cloneEl: cloneEl,
    targetEl: dragEl,
    rootEl: rootEl,
    oldIndex: oldIndex,
    oldDraggableIndex: oldDraggableIndex,
    newIndex: newIndex,
    newDraggableIndex: newDraggableIndex
  }, info));
}
var dragEl,
  parentEl,
  ghostEl,
  rootEl,
  nextEl,
  lastDownEl,
  cloneEl,
  cloneHidden,
  oldIndex,
  newIndex,
  oldDraggableIndex,
  newDraggableIndex,
  activeGroup,
  putSortable,
  awaitingDragStarted = false,
  ignoreNextClick = false,
  sortables = [],
  tapEvt,
  touchEvt,
  lastDx,
  lastDy,
  tapDistanceLeft,
  tapDistanceTop,
  moved,
  lastTarget,
  lastDirection,
  pastFirstInvertThresh = false,
  isCircumstantialInvert = false,
  targetMoveDistance,
  // For positioning ghost absolutely
  ghostRelativeParent,
  ghostRelativeParentInitialScroll = [],
  // (left, top)

  _silent = false,
  savedInputChecked = [];

/** @const */
var documentExists = typeof document !== 'undefined',
  PositionGhostAbsolutely = IOS,
  CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
  // This will not pass for IE9, because IE9 DnD only works on anchors
  supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div'),
  supportCssPointerEvents = function () {
    if (!documentExists) return;
    // false when <= IE11
    if (IE11OrLess) {
      return false;
    }
    var el = document.createElement('x');
    el.style.cssText = 'pointer-events:auto';
    return el.style.pointerEvents === 'auto';
  }(),
  _detectDirection = function _detectDirection(el, options) {
    var elCSS = css(el),
      elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
      child1 = getChild(el, 0, options),
      child2 = getChild(el, 1, options),
      firstChildCSS = child1 && css(child1),
      secondChildCSS = child2 && css(child2),
      firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width,
      secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
    if (elCSS.display === 'flex') {
      return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
    }
    if (elCSS.display === 'grid') {
      return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
    }
    if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== 'none') {
      var touchingSideChild2 = firstChildCSS["float"] === 'left' ? 'left' : 'right';
      return child2 && (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
    }
    return child1 && (firstChildCSS.display === 'block' || firstChildCSS.display === 'flex' || firstChildCSS.display === 'table' || firstChildCSS.display === 'grid' || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && firstChildWidth + secondChildWidth > elWidth) ? 'vertical' : 'horizontal';
  },
  _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
      dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
      dragElOppLength = vertical ? dragRect.width : dragRect.height,
      targetS1Opp = vertical ? targetRect.left : targetRect.top,
      targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
      targetOppLength = vertical ? targetRect.width : targetRect.height;
    return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
  },
  /**
   * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
   * @param  {Number} x      X position
   * @param  {Number} y      Y position
   * @return {HTMLElement}   Element of the first found nearest Sortable
   */
  _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
    var ret;
    sortables.some(function (sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold || lastChild(sortable)) return;
      var rect = getRect(sortable),
        insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
        insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return ret = sortable;
      }
    });
    return ret;
  },
  _prepareGroup = function _prepareGroup(options) {
    function toFn(value, pull) {
      return function (to, from, dragEl, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          // Default pull value
          // Default pull and put value if same group
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === 'clone') {
          return value;
        } else if (typeof value === 'function') {
          return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return value === true || typeof value === 'string' && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
        }
      };
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup
      };
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  },
  _hideGhostForTarget = function _hideGhostForTarget() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, 'display', 'none');
    }
  },
  _unhideGhostForTarget = function _unhideGhostForTarget() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, 'display', '');
    }
  };

// #1184 fix - Prevent click event on fallback if dragged but item not changed position
if (documentExists && !ChromeForAndroid) {
  document.addEventListener('click', function (evt) {
    if (ignoreNextClick) {
      evt.preventDefault();
      evt.stopPropagation && evt.stopPropagation();
      evt.stopImmediatePropagation && evt.stopImmediatePropagation();
      ignoreNextClick = false;
      return false;
    }
  }, true);
}
var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt;
    var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
    if (nearest) {
      // Create imitation event
      var event = {};
      for (var i in evt) {
        if (evt.hasOwnProperty(i)) {
          event[i] = evt[i];
        }
      }
      event.target = event.rootEl = nearest;
      event.preventDefault = void 0;
      event.stopPropagation = void 0;
      nearest[expando]._onDragOver(event);
    }
  }
};
var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
  if (dragEl) {
    dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
  }
};

/**
 * @class  Sortable
 * @param  {HTMLElement}  el
 * @param  {Object}       [options]
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
  }
  this.el = el; // root element
  this.options = options = _extends({}, options);

  // Export instance
  el[expando] = this;
  var defaults = {
    group: null,
    sort: true,
    disabled: false,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
    swapThreshold: 1,
    // percentage; 0 <= x <= 1
    invertSwap: false,
    // invert always
    invertedSwapThreshold: null,
    // will be set to same as swapThreshold if default
    removeCloneOnHide: true,
    direction: function direction() {
      return _detectDirection(el, this.options);
    },
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    ignore: 'a, img',
    filter: null,
    preventOnFilter: true,
    animation: 0,
    easing: null,
    setData: function setData(dataTransfer, dragEl) {
      dataTransfer.setData('Text', dragEl.textContent);
    },
    dropBubble: false,
    dragoverBubble: false,
    dataIdAttr: 'data-id',
    delay: 0,
    delayOnTouchOnly: false,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: false,
    fallbackClass: 'sortable-fallback',
    fallbackOnBody: false,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window && !Safari,
    emptyInsertThreshold: 5
  };
  PluginManager.initializePlugins(this, el, defaults);

  // Set default options
  for (var name in defaults) {
    !(name in options) && (options[name] = defaults[name]);
  }
  _prepareGroup(options);

  // Bind all private methods
  for (var fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }

  // Setup drag mode
  this.nativeDraggable = options.forceFallback ? false : supportDraggable;
  if (this.nativeDraggable) {
    // Touch start threshold cannot be greater than the native dragstart threshold
    this.options.touchStartThreshold = 1;
  }

  // Bind events
  if (options.supportPointer) {
    on(el, 'pointerdown', this._onTapStart);
  } else {
    on(el, 'mousedown', this._onTapStart);
    on(el, 'touchstart', this._onTapStart);
  }
  if (this.nativeDraggable) {
    on(el, 'dragover', this);
    on(el, 'dragenter', this);
  }
  sortables.push(this.el);

  // Restore sorting
  options.store && options.store.get && this.sort(options.store.get(this) || []);

  // Add animation state manager
  _extends(this, AnimationStateManager());
}
Sortable.prototype = /** @lends Sortable.prototype */{
  constructor: Sortable,
  _isOutsideThisEl: function _isOutsideThisEl(target) {
    if (!this.el.contains(target) && target !== this.el) {
      lastTarget = null;
    }
  },
  _getDirection: function _getDirection(evt, target) {
    return typeof this.options.direction === 'function' ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
  },
  _onTapStart: function _onTapStart( /** Event|TouchEvent */evt) {
    if (!evt.cancelable) return;
    var _this = this,
      el = this.el,
      options = this.options,
      preventOnFilter = options.preventOnFilter,
      type = evt.type,
      touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt,
      target = (touch || evt).target,
      originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target,
      filter = options.filter;
    _saveInputCheckedState(el);

    // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.
    if (dragEl) {
      return;
    }
    if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
      return; // only left button and enabled
    }

    // cancel dnd if original target is content editable
    if (originalTarget.isContentEditable) {
      return;
    }

    // Safari ignores further event handling after mousedown
    if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') {
      return;
    }
    target = closest(target, options.draggable, el, false);
    if (target && target.animated) {
      return;
    }
    if (lastDownEl === target) {
      // Ignoring duplicate `down`
      return;
    }

    // Get the index of the dragged element within its parent
    oldIndex = index(target);
    oldDraggableIndex = index(target, options.draggable);

    // Check filter
    if (typeof filter === 'function') {
      if (filter.call(this, evt, target, this)) {
        _dispatchEvent({
          sortable: _this,
          rootEl: originalTarget,
          name: 'filter',
          targetEl: target,
          toEl: el,
          fromEl: el
        });
        pluginEvent('filter', _this, {
          evt: evt
        });
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return; // cancel dnd
      }
    } else if (filter) {
      filter = filter.split(',').some(function (criteria) {
        criteria = closest(originalTarget, criteria.trim(), el, false);
        if (criteria) {
          _dispatchEvent({
            sortable: _this,
            rootEl: criteria,
            name: 'filter',
            targetEl: target,
            fromEl: el,
            toEl: el
          });
          pluginEvent('filter', _this, {
            evt: evt
          });
          return true;
        }
      });
      if (filter) {
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return; // cancel dnd
      }
    }
    if (options.handle && !closest(originalTarget, options.handle, el, false)) {
      return;
    }

    // Prepare `dragstart`
    this._prepareDragStart(evt, touch, target);
  },
  _prepareDragStart: function _prepareDragStart( /** Event */evt, /** Touch */touch, /** HTMLElement */target) {
    var _this = this,
      el = _this.el,
      options = _this.options,
      ownerDocument = el.ownerDocument,
      dragStartFn;
    if (target && !dragEl && target.parentNode === el) {
      var dragRect = getRect(target);
      rootEl = el;
      dragEl = target;
      parentEl = dragEl.parentNode;
      nextEl = dragEl.nextSibling;
      lastDownEl = target;
      activeGroup = options.group;
      Sortable.dragged = dragEl;
      tapEvt = {
        target: dragEl,
        clientX: (touch || evt).clientX,
        clientY: (touch || evt).clientY
      };
      tapDistanceLeft = tapEvt.clientX - dragRect.left;
      tapDistanceTop = tapEvt.clientY - dragRect.top;
      this._lastX = (touch || evt).clientX;
      this._lastY = (touch || evt).clientY;
      dragEl.style['will-change'] = 'all';
      dragStartFn = function dragStartFn() {
        pluginEvent('delayEnded', _this, {
          evt: evt
        });
        if (Sortable.eventCanceled) {
          _this._onDrop();
          return;
        }
        // Delayed drag has been triggered
        // we can re-enable the events: touchmove/mousemove
        _this._disableDelayedDragEvents();
        if (!FireFox && _this.nativeDraggable) {
          dragEl.draggable = true;
        }

        // Bind the events: dragstart/dragend
        _this._triggerDragStart(evt, touch);

        // Drag start event
        _dispatchEvent({
          sortable: _this,
          name: 'choose',
          originalEvent: evt
        });

        // Chosen item
        toggleClass(dragEl, options.chosenClass, true);
      };

      // Disable "draggable"
      options.ignore.split(',').forEach(function (criteria) {
        find(dragEl, criteria.trim(), _disableDraggable);
      });
      on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
      on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
      on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
      on(ownerDocument, 'mouseup', _this._onDrop);
      on(ownerDocument, 'touchend', _this._onDrop);
      on(ownerDocument, 'touchcancel', _this._onDrop);

      // Make dragEl draggable (must be before delay for FireFox)
      if (FireFox && this.nativeDraggable) {
        this.options.touchStartThreshold = 4;
        dragEl.draggable = true;
      }
      pluginEvent('delayStart', this, {
        evt: evt
      });

      // Delay is impossible for native DnD in Edge or IE
      if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        // If the user moves the pointer or let go the click or touch
        // before the delay has been reached:
        // disable the delayed drag
        on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
        on(ownerDocument, 'touchend', _this._disableDelayedDrag);
        on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
        on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
        on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
        options.supportPointer && on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
        _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
      } else {
        dragStartFn();
      }
    }
  },
  _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler( /** TouchEvent|PointerEvent **/e) {
    var touch = e.touches ? e.touches[0] : e;
    if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
      this._disableDelayedDrag();
    }
  },
  _disableDelayedDrag: function _disableDelayedDrag() {
    dragEl && _disableDraggable(dragEl);
    clearTimeout(this._dragStartTimer);
    this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function _disableDelayedDragEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, 'mouseup', this._disableDelayedDrag);
    off(ownerDocument, 'touchend', this._disableDelayedDrag);
    off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
    off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
    off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
    off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function _triggerDragStart( /** Event */evt, /** Touch */touch) {
    touch = touch || evt.pointerType == 'touch' && evt;
    if (!this.nativeDraggable || touch) {
      if (this.options.supportPointer) {
        on(document, 'pointermove', this._onTouchMove);
      } else if (touch) {
        on(document, 'touchmove', this._onTouchMove);
      } else {
        on(document, 'mousemove', this._onTouchMove);
      }
    } else {
      on(dragEl, 'dragend', this);
      on(rootEl, 'dragstart', this._onDragStart);
    }
    try {
      if (document.selection) {
        // Timeout neccessary for IE9
        _nextTick(function () {
          document.selection.empty();
        });
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (err) {}
  },
  _dragStarted: function _dragStarted(fallback, evt) {
    awaitingDragStarted = false;
    if (rootEl && dragEl) {
      pluginEvent('dragStarted', this, {
        evt: evt
      });
      if (this.nativeDraggable) {
        on(document, 'dragover', _checkOutsideTargetEl);
      }
      var options = this.options;

      // Apply effect
      !fallback && toggleClass(dragEl, options.dragClass, false);
      toggleClass(dragEl, options.ghostClass, true);
      Sortable.active = this;
      fallback && this._appendGhost();

      // Drag start event
      _dispatchEvent({
        sortable: this,
        name: 'start',
        originalEvent: evt
      });
    } else {
      this._nulling();
    }
  },
  _emulateDragOver: function _emulateDragOver() {
    if (touchEvt) {
      this._lastX = touchEvt.clientX;
      this._lastY = touchEvt.clientY;
      _hideGhostForTarget();
      var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
      var parent = target;
      while (target && target.shadowRoot) {
        target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        if (target === parent) break;
        parent = target;
      }
      dragEl.parentNode[expando]._isOutsideThisEl(target);
      if (parent) {
        do {
          if (parent[expando]) {
            var inserted = void 0;
            inserted = parent[expando]._onDragOver({
              clientX: touchEvt.clientX,
              clientY: touchEvt.clientY,
              target: target,
              rootEl: parent
            });
            if (inserted && !this.options.dragoverBubble) {
              break;
            }
          }
          target = parent; // store last element
        }
        /* jshint boss:true */ while (parent = parent.parentNode);
      }
      _unhideGhostForTarget();
    }
  },
  _onTouchMove: function _onTouchMove( /**TouchEvent*/evt) {
    if (tapEvt) {
      var options = this.options,
        fallbackTolerance = options.fallbackTolerance,
        fallbackOffset = options.fallbackOffset,
        touch = evt.touches ? evt.touches[0] : evt,
        ghostMatrix = ghostEl && matrix(ghostEl, true),
        scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
        scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
        relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent),
        dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1),
        dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);

      // only set the status to dragging, when we are actually dragging
      if (!Sortable.active && !awaitingDragStarted) {
        if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
          return;
        }
        this._onDragStart(evt, true);
      }
      if (ghostEl) {
        if (ghostMatrix) {
          ghostMatrix.e += dx - (lastDx || 0);
          ghostMatrix.f += dy - (lastDy || 0);
        } else {
          ghostMatrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: dx,
            f: dy
          };
        }
        var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
        css(ghostEl, 'webkitTransform', cssMatrix);
        css(ghostEl, 'mozTransform', cssMatrix);
        css(ghostEl, 'msTransform', cssMatrix);
        css(ghostEl, 'transform', cssMatrix);
        lastDx = dx;
        lastDy = dy;
        touchEvt = touch;
      }
      evt.cancelable && evt.preventDefault();
    }
  },
  _appendGhost: function _appendGhost() {
    // Bug if using scale(): https://stackoverflow.com/questions/2637058
    // Not being adjusted for
    if (!ghostEl) {
      var container = this.options.fallbackOnBody ? document.body : rootEl,
        rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
        options = this.options;

      // Position absolutely
      if (PositionGhostAbsolutely) {
        // Get relatively positioned parent
        ghostRelativeParent = container;
        while (css(ghostRelativeParent, 'position') === 'static' && css(ghostRelativeParent, 'transform') === 'none' && ghostRelativeParent !== document) {
          ghostRelativeParent = ghostRelativeParent.parentNode;
        }
        if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
          if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
          rect.top += ghostRelativeParent.scrollTop;
          rect.left += ghostRelativeParent.scrollLeft;
        } else {
          ghostRelativeParent = getWindowScrollingElement();
        }
        ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
      }
      ghostEl = dragEl.cloneNode(true);
      toggleClass(ghostEl, options.ghostClass, false);
      toggleClass(ghostEl, options.fallbackClass, true);
      toggleClass(ghostEl, options.dragClass, true);
      css(ghostEl, 'transition', '');
      css(ghostEl, 'transform', '');
      css(ghostEl, 'box-sizing', 'border-box');
      css(ghostEl, 'margin', 0);
      css(ghostEl, 'top', rect.top);
      css(ghostEl, 'left', rect.left);
      css(ghostEl, 'width', rect.width);
      css(ghostEl, 'height', rect.height);
      css(ghostEl, 'opacity', '0.8');
      css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
      css(ghostEl, 'zIndex', '100000');
      css(ghostEl, 'pointerEvents', 'none');
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);

      // Set transform-origin
      css(ghostEl, 'transform-origin', tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + '% ' + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + '%');
    }
  },
  _onDragStart: function _onDragStart( /**Event*/evt, /**boolean*/fallback) {
    var _this = this;
    var dataTransfer = evt.dataTransfer;
    var options = _this.options;
    pluginEvent('dragStart', this, {
      evt: evt
    });
    if (Sortable.eventCanceled) {
      this._onDrop();
      return;
    }
    pluginEvent('setupClone', this);
    if (!Sortable.eventCanceled) {
      cloneEl = clone(dragEl);
      cloneEl.removeAttribute("id");
      cloneEl.draggable = false;
      cloneEl.style['will-change'] = '';
      this._hideClone();
      toggleClass(cloneEl, this.options.chosenClass, false);
      Sortable.clone = cloneEl;
    }

    // #1143: IFrame support workaround
    _this.cloneId = _nextTick(function () {
      pluginEvent('clone', _this);
      if (Sortable.eventCanceled) return;
      if (!_this.options.removeCloneOnHide) {
        rootEl.insertBefore(cloneEl, dragEl);
      }
      _this._hideClone();
      _dispatchEvent({
        sortable: _this,
        name: 'clone'
      });
    });
    !fallback && toggleClass(dragEl, options.dragClass, true);

    // Set proper drop events
    if (fallback) {
      ignoreNextClick = true;
      _this._loopId = setInterval(_this._emulateDragOver, 50);
    } else {
      // Undo what was set in _prepareDragStart before drag started
      off(document, 'mouseup', _this._onDrop);
      off(document, 'touchend', _this._onDrop);
      off(document, 'touchcancel', _this._onDrop);
      if (dataTransfer) {
        dataTransfer.effectAllowed = 'move';
        options.setData && options.setData.call(_this, dataTransfer, dragEl);
      }
      on(document, 'drop', _this);

      // #1276 fix:
      css(dragEl, 'transform', 'translateZ(0)');
    }
    awaitingDragStarted = true;
    _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
    on(document, 'selectstart', _this);
    moved = true;
    if (Safari) {
      css(document.body, 'user-select', 'none');
    }
  },
  // Returns true - if no further action is needed (either inserted or another condition)
  _onDragOver: function _onDragOver( /**Event*/evt) {
    var el = this.el,
      target = evt.target,
      dragRect,
      targetRect,
      revert,
      options = this.options,
      group = options.group,
      activeSortable = Sortable.active,
      isOwner = activeGroup === group,
      canSort = options.sort,
      fromSortable = putSortable || activeSortable,
      vertical,
      _this = this,
      completedFired = false;
    if (_silent) return;
    function dragOverEvent(name, extra) {
      pluginEvent(name, _this, _objectSpread2({
        evt: evt,
        isOwner: isOwner,
        axis: vertical ? 'vertical' : 'horizontal',
        revert: revert,
        dragRect: dragRect,
        targetRect: targetRect,
        canSort: canSort,
        fromSortable: fromSortable,
        target: target,
        completed: completed,
        onMove: function onMove(target, after) {
          return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
        },
        changed: changed
      }, extra));
    }

    // Capture animation state
    function capture() {
      dragOverEvent('dragOverAnimationCapture');
      _this.captureAnimationState();
      if (_this !== fromSortable) {
        fromSortable.captureAnimationState();
      }
    }

    // Return invocation when dragEl is inserted (or completed)
    function completed(insertion) {
      dragOverEvent('dragOverCompleted', {
        insertion: insertion
      });
      if (insertion) {
        // Clones must be hidden before folding animation to capture dragRectAbsolute properly
        if (isOwner) {
          activeSortable._hideClone();
        } else {
          activeSortable._showClone(_this);
        }
        if (_this !== fromSortable) {
          // Set ghost class to new sortable's ghost class
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
          toggleClass(dragEl, options.ghostClass, true);
        }
        if (putSortable !== _this && _this !== Sortable.active) {
          putSortable = _this;
        } else if (_this === Sortable.active && putSortable) {
          putSortable = null;
        }

        // Animation
        if (fromSortable === _this) {
          _this._ignoreWhileAnimating = target;
        }
        _this.animateAll(function () {
          dragOverEvent('dragOverAnimationComplete');
          _this._ignoreWhileAnimating = null;
        });
        if (_this !== fromSortable) {
          fromSortable.animateAll();
          fromSortable._ignoreWhileAnimating = null;
        }
      }

      // Null lastTarget if it is not inside a previously swapped element
      if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
        lastTarget = null;
      }

      // no bubbling and not fallback
      if (!options.dragoverBubble && !evt.rootEl && target !== document) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);

        // Do not detect for empty insert if already inserted
        !insertion && nearestEmptyInsertDetectEvent(evt);
      }
      !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
      return completedFired = true;
    }

    // Call when dragEl has been inserted
    function changed() {
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      _dispatchEvent({
        sortable: _this,
        name: 'change',
        toEl: el,
        newIndex: newIndex,
        newDraggableIndex: newDraggableIndex,
        originalEvent: evt
      });
    }
    if (evt.preventDefault !== void 0) {
      evt.cancelable && evt.preventDefault();
    }
    target = closest(target, options.draggable, el, true);
    dragOverEvent('dragOver');
    if (Sortable.eventCanceled) return completedFired;
    if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
      return completed(false);
    }
    ignoreNextClick = false;
    if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) // Reverting item into the original list
    : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
      vertical = this._getDirection(evt, target) === 'vertical';
      dragRect = getRect(dragEl);
      dragOverEvent('dragOverValid');
      if (Sortable.eventCanceled) return completedFired;
      if (revert) {
        parentEl = rootEl; // actualization
        capture();
        this._hideClone();
        dragOverEvent('revert');
        if (!Sortable.eventCanceled) {
          if (nextEl) {
            rootEl.insertBefore(dragEl, nextEl);
          } else {
            rootEl.appendChild(dragEl);
          }
        }
        return completed(true);
      }
      var elLastChild = lastChild(el, options.draggable);
      if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
        // Insert to end of list

        // If already at end of list: Do not insert
        if (elLastChild === dragEl) {
          return completed(false);
        }

        // if there is a last element, it is the target
        if (elLastChild && el === evt.target) {
          target = elLastChild;
        }
        if (target) {
          targetRect = getRect(target);
        }
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
          capture();
          if (elLastChild && elLastChild.nextSibling) {
            // the last draggable element is not the last node
            el.insertBefore(dragEl, elLastChild.nextSibling);
          } else {
            el.appendChild(dragEl);
          }
          parentEl = el; // actualization

          changed();
          return completed(true);
        }
      } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
        // Insert to start of list
        var firstChild = getChild(el, 0, options, true);
        if (firstChild === dragEl) {
          return completed(false);
        }
        target = firstChild;
        targetRect = getRect(target);
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
          capture();
          el.insertBefore(dragEl, firstChild);
          parentEl = el; // actualization

          changed();
          return completed(true);
        }
      } else if (target.parentNode === el) {
        targetRect = getRect(target);
        var direction = 0,
          targetBeforeFirstSwap,
          differentLevel = dragEl.parentNode !== el,
          differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical),
          side1 = vertical ? 'top' : 'left',
          scrolledPastTop = isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
          scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
        if (lastTarget !== target) {
          targetBeforeFirstSwap = targetRect[side1];
          pastFirstInvertThresh = false;
          isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
        }
        direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
        var sibling;
        if (direction !== 0) {
          // Check if target is beside dragEl in respective direction (ignoring hidden elements)
          var dragIndex = index(dragEl);
          do {
            dragIndex -= direction;
            sibling = parentEl.children[dragIndex];
          } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl));
        }
        // If dragEl is already beside target: Do not insert
        if (direction === 0 || sibling === target) {
          return completed(false);
        }
        lastTarget = target;
        lastDirection = direction;
        var nextSibling = target.nextElementSibling,
          after = false;
        after = direction === 1;
        var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
        if (moveVector !== false) {
          if (moveVector === 1 || moveVector === -1) {
            after = moveVector === 1;
          }
          _silent = true;
          setTimeout(_unsilent, 30);
          capture();
          if (after && !nextSibling) {
            el.appendChild(dragEl);
          } else {
            target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
          }

          // Undo chrome's scroll adjustment (has no effect on other browsers)
          if (scrolledPastTop) {
            scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
          }
          parentEl = dragEl.parentNode; // actualization

          // must be done before animation
          if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
            targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
          }
          changed();
          return completed(true);
        }
      }
      if (el.contains(dragEl)) {
        return completed(false);
      }
    }
    return false;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function _offMoveEvents() {
    off(document, 'mousemove', this._onTouchMove);
    off(document, 'touchmove', this._onTouchMove);
    off(document, 'pointermove', this._onTouchMove);
    off(document, 'dragover', nearestEmptyInsertDetectEvent);
    off(document, 'mousemove', nearestEmptyInsertDetectEvent);
    off(document, 'touchmove', nearestEmptyInsertDetectEvent);
  },
  _offUpEvents: function _offUpEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, 'mouseup', this._onDrop);
    off(ownerDocument, 'touchend', this._onDrop);
    off(ownerDocument, 'pointerup', this._onDrop);
    off(ownerDocument, 'touchcancel', this._onDrop);
    off(document, 'selectstart', this);
  },
  _onDrop: function _onDrop( /**Event*/evt) {
    var el = this.el,
      options = this.options;

    // Get the index of the dragged element within its parent
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    pluginEvent('drop', this, {
      evt: evt
    });
    parentEl = dragEl && dragEl.parentNode;

    // Get again after plugin event
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    if (Sortable.eventCanceled) {
      this._nulling();
      return;
    }
    awaitingDragStarted = false;
    isCircumstantialInvert = false;
    pastFirstInvertThresh = false;
    clearInterval(this._loopId);
    clearTimeout(this._dragStartTimer);
    _cancelNextTick(this.cloneId);
    _cancelNextTick(this._dragStartId);

    // Unbind events
    if (this.nativeDraggable) {
      off(document, 'drop', this);
      off(el, 'dragstart', this._onDragStart);
    }
    this._offMoveEvents();
    this._offUpEvents();
    if (Safari) {
      css(document.body, 'user-select', '');
    }
    css(dragEl, 'transform', '');
    if (evt) {
      if (moved) {
        evt.cancelable && evt.preventDefault();
        !options.dropBubble && evt.stopPropagation();
      }
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
        // Remove clone(s)
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      if (dragEl) {
        if (this.nativeDraggable) {
          off(dragEl, 'dragend', this);
        }
        _disableDraggable(dragEl);
        dragEl.style['will-change'] = '';

        // Remove classes
        // ghostClass is added in dragStarted
        if (moved && !awaitingDragStarted) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
        }
        toggleClass(dragEl, this.options.chosenClass, false);

        // Drag stop event
        _dispatchEvent({
          sortable: this,
          name: 'unchoose',
          toEl: parentEl,
          newIndex: null,
          newDraggableIndex: null,
          originalEvent: evt
        });
        if (rootEl !== parentEl) {
          if (newIndex >= 0) {
            // Add event
            _dispatchEvent({
              rootEl: parentEl,
              name: 'add',
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });

            // Remove event
            _dispatchEvent({
              sortable: this,
              name: 'remove',
              toEl: parentEl,
              originalEvent: evt
            });

            // drag from one list and drop into another
            _dispatchEvent({
              rootEl: parentEl,
              name: 'sort',
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: 'sort',
              toEl: parentEl,
              originalEvent: evt
            });
          }
          putSortable && putSortable.save();
        } else {
          if (newIndex !== oldIndex) {
            if (newIndex >= 0) {
              // drag & drop within the same list
              _dispatchEvent({
                sortable: this,
                name: 'update',
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: 'sort',
                toEl: parentEl,
                originalEvent: evt
              });
            }
          }
        }
        if (Sortable.active) {
          /* jshint eqnull:true */
          if (newIndex == null || newIndex === -1) {
            newIndex = oldIndex;
            newDraggableIndex = oldDraggableIndex;
          }
          _dispatchEvent({
            sortable: this,
            name: 'end',
            toEl: parentEl,
            originalEvent: evt
          });

          // Save sorting
          this.save();
        }
      }
    }
    this._nulling();
  },
  _nulling: function _nulling() {
    pluginEvent('nulling', this);
    rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
    savedInputChecked.forEach(function (el) {
      el.checked = true;
    });
    savedInputChecked.length = lastDx = lastDy = 0;
  },
  handleEvent: function handleEvent( /**Event*/evt) {
    switch (evt.type) {
      case 'drop':
      case 'dragend':
        this._onDrop(evt);
        break;
      case 'dragenter':
      case 'dragover':
        if (dragEl) {
          this._onDragOver(evt);
          _globalDragOver(evt);
        }
        break;
      case 'selectstart':
        evt.preventDefault();
        break;
    }
  },
  /**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
  toArray: function toArray() {
    var order = [],
      el,
      children = this.el.children,
      i = 0,
      n = children.length,
      options = this.options;
    for (; i < n; i++) {
      el = children[i];
      if (closest(el, options.draggable, this.el, false)) {
        order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
      }
    }
    return order;
  },
  /**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
  sort: function sort(order, useAnimation) {
    var items = {},
      rootEl = this.el;
    this.toArray().forEach(function (id, i) {
      var el = rootEl.children[i];
      if (closest(el, this.options.draggable, rootEl, false)) {
        items[id] = el;
      }
    }, this);
    useAnimation && this.captureAnimationState();
    order.forEach(function (id) {
      if (items[id]) {
        rootEl.removeChild(items[id]);
        rootEl.appendChild(items[id]);
      }
    });
    useAnimation && this.animateAll();
  },
  /**
   * Save the current sorting
   */
  save: function save() {
    var store = this.options.store;
    store && store.set && store.set(this);
  },
  /**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
  closest: function closest$1(el, selector) {
    return closest(el, selector || this.options.draggable, this.el, false);
  },
  /**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
  option: function option(name, value) {
    var options = this.options;
    if (value === void 0) {
      return options[name];
    } else {
      var modifiedValue = PluginManager.modifyOption(this, name, value);
      if (typeof modifiedValue !== 'undefined') {
        options[name] = modifiedValue;
      } else {
        options[name] = value;
      }
      if (name === 'group') {
        _prepareGroup(options);
      }
    }
  },
  /**
   * Destroy
   */
  destroy: function destroy() {
    pluginEvent('destroy', this);
    var el = this.el;
    el[expando] = null;
    off(el, 'mousedown', this._onTapStart);
    off(el, 'touchstart', this._onTapStart);
    off(el, 'pointerdown', this._onTapStart);
    if (this.nativeDraggable) {
      off(el, 'dragover', this);
      off(el, 'dragenter', this);
    }
    // Remove draggable attributes
    Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
      el.removeAttribute('draggable');
    });
    this._onDrop();
    this._disableDelayedDragEvents();
    sortables.splice(sortables.indexOf(this.el), 1);
    this.el = el = null;
  },
  _hideClone: function _hideClone() {
    if (!cloneHidden) {
      pluginEvent('hideClone', this);
      if (Sortable.eventCanceled) return;
      css(cloneEl, 'display', 'none');
      if (this.options.removeCloneOnHide && cloneEl.parentNode) {
        cloneEl.parentNode.removeChild(cloneEl);
      }
      cloneHidden = true;
    }
  },
  _showClone: function _showClone(putSortable) {
    if (putSortable.lastPutMode !== 'clone') {
      this._hideClone();
      return;
    }
    if (cloneHidden) {
      pluginEvent('showClone', this);
      if (Sortable.eventCanceled) return;

      // show clone at dragEl or original position
      if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
        rootEl.insertBefore(cloneEl, dragEl);
      } else if (nextEl) {
        rootEl.insertBefore(cloneEl, nextEl);
      } else {
        rootEl.appendChild(cloneEl);
      }
      if (this.options.group.revertClone) {
        this.animate(dragEl, cloneEl);
      }
      css(cloneEl, 'display', '');
      cloneHidden = false;
    }
  }
};
function _globalDragOver( /**Event*/evt) {
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'move';
  }
  evt.cancelable && evt.preventDefault();
}
function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
  var evt,
    sortable = fromEl[expando],
    onMoveFn = sortable.options.onMove,
    retVal;
  // Support for new CustomEvent feature
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent('move', {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent('Event');
    evt.initEvent('move', true, true);
  }
  evt.to = toEl;
  evt.from = fromEl;
  evt.dragged = dragEl;
  evt.draggedRect = dragRect;
  evt.related = targetEl || toEl;
  evt.relatedRect = targetRect || getRect(toEl);
  evt.willInsertAfter = willInsertAfter;
  evt.originalEvent = originalEvent;
  fromEl.dispatchEvent(evt);
  if (onMoveFn) {
    retVal = onMoveFn.call(sortable, evt, originalEvent);
  }
  return retVal;
}
function _disableDraggable(el) {
  el.draggable = false;
}
function _unsilent() {
  _silent = false;
}
function _ghostIsFirst(evt, vertical, sortable) {
  var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
  var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
  var spacer = 10;
  return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
}
function _ghostIsLast(evt, vertical, sortable) {
  var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
  var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
  var spacer = 10;
  return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
}
function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
  var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
    targetLength = vertical ? targetRect.height : targetRect.width,
    targetS1 = vertical ? targetRect.top : targetRect.left,
    targetS2 = vertical ? targetRect.bottom : targetRect.right,
    invert = false;
  if (!invertSwap) {
    // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
    if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
      // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
      // check if past first invert threshold on side opposite of lastDirection
      if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
        // past first invert threshold, do not restrict inverted threshold to dragEl shadow
        pastFirstInvertThresh = true;
      }
      if (!pastFirstInvertThresh) {
        // dragEl shadow (target move distance shadow)
        if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
        : mouseOnAxis > targetS2 - targetMoveDistance) {
          return -lastDirection;
        }
      } else {
        invert = true;
      }
    } else {
      // Regular
      if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
        return _getInsertDirection(target);
      }
    }
  }
  invert = invert || invertSwap;
  if (invert) {
    // Invert of regular
    if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
      return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
    }
  }
  return 0;
}

/**
 * Gets the direction dragEl must be swapped relative to target in order to make it
 * seem that dragEl has been "inserted" into that element's position
 * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
 * @return {Number}                   Direction dragEl must be swapped
 */
function _getInsertDirection(target) {
  if (index(dragEl) < index(target)) {
    return 1;
  } else {
    return -1;
  }
}

/**
 * Generate id
 * @param   {HTMLElement} el
 * @returns {String}
 * @private
 */
function _generateId(el) {
  var str = el.tagName + el.className + el.src + el.href + el.textContent,
    i = str.length,
    sum = 0;
  while (i--) {
    sum += str.charCodeAt(i);
  }
  return sum.toString(36);
}
function _saveInputCheckedState(root) {
  savedInputChecked.length = 0;
  var inputs = root.getElementsByTagName('input');
  var idx = inputs.length;
  while (idx--) {
    var el = inputs[idx];
    el.checked && savedInputChecked.push(el);
  }
}
function _nextTick(fn) {
  return setTimeout(fn, 0);
}
function _cancelNextTick(id) {
  return clearTimeout(id);
}

// Fixed #973:
if (documentExists) {
  on(document, 'touchmove', function (evt) {
    if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
      evt.preventDefault();
    }
  });
}

// Export utils
Sortable.utils = {
  on: on,
  off: off,
  css: css,
  find: find,
  is: function is(el, selector) {
    return !!closest(el, selector, el, false);
  },
  extend: extend,
  throttle: throttle,
  closest: closest,
  toggleClass: toggleClass,
  clone: clone,
  index: index,
  nextTick: _nextTick,
  cancelNextTick: _cancelNextTick,
  detectDirection: _detectDirection,
  getChild: getChild
};

/**
 * Get the Sortable instance of an element
 * @param  {HTMLElement} element The element
 * @return {Sortable|undefined}         The instance of Sortable
 */
Sortable.get = function (element) {
  return element[expando];
};

/**
 * Mount a plugin to Sortable
 * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
 */
Sortable.mount = function () {
  for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
    plugins[_key] = arguments[_key];
  }
  if (plugins[0].constructor === Array) plugins = plugins[0];
  plugins.forEach(function (plugin) {
    if (!plugin.prototype || !plugin.prototype.constructor) {
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
    }
    if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
    PluginManager.mount(plugin);
  });
};

/**
 * Create sortable instance
 * @param {HTMLElement}  el
 * @param {Object}      [options]
 */
Sortable.create = function (el, options) {
  return new Sortable(el, options);
};

// Export
Sortable.version = version;

var autoScrolls = [],
  scrollEl,
  scrollRootEl,
  scrolling = false,
  lastAutoScrollX,
  lastAutoScrollY,
  touchEvt$1,
  pointerElemChangedInterval;
function AutoScrollPlugin() {
  function AutoScroll() {
    this.defaults = {
      scroll: true,
      forceAutoScrollFallback: false,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: true
    };

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }
  }
  AutoScroll.prototype = {
    dragStarted: function dragStarted(_ref) {
      var originalEvent = _ref.originalEvent;
      if (this.sortable.nativeDraggable) {
        on(document, 'dragover', this._handleAutoScroll);
      } else {
        if (this.options.supportPointer) {
          on(document, 'pointermove', this._handleFallbackAutoScroll);
        } else if (originalEvent.touches) {
          on(document, 'touchmove', this._handleFallbackAutoScroll);
        } else {
          on(document, 'mousemove', this._handleFallbackAutoScroll);
        }
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref2) {
      var originalEvent = _ref2.originalEvent;
      // For when bubbling is canceled and using fallback (fallback 'touchmove' always reached)
      if (!this.options.dragOverBubble && !originalEvent.rootEl) {
        this._handleAutoScroll(originalEvent);
      }
    },
    drop: function drop() {
      if (this.sortable.nativeDraggable) {
        off(document, 'dragover', this._handleAutoScroll);
      } else {
        off(document, 'pointermove', this._handleFallbackAutoScroll);
        off(document, 'touchmove', this._handleFallbackAutoScroll);
        off(document, 'mousemove', this._handleFallbackAutoScroll);
      }
      clearPointerElemChangedInterval();
      clearAutoScrolls();
      cancelThrottle();
    },
    nulling: function nulling() {
      touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
      autoScrolls.length = 0;
    },
    _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
      this._handleAutoScroll(evt, true);
    },
    _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
      var _this = this;
      var x = (evt.touches ? evt.touches[0] : evt).clientX,
        y = (evt.touches ? evt.touches[0] : evt).clientY,
        elem = document.elementFromPoint(x, y);
      touchEvt$1 = evt;

      // IE does not seem to have native autoscroll,
      // Edge's autoscroll seems too conditional,
      // MACOS Safari does not have autoscroll,
      // Firefox and Chrome are good
      if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
        autoScroll(evt, this.options, elem, fallback);

        // Listener for pointer element change
        var ogElemScroller = getParentAutoScrollElement(elem, true);
        if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
          pointerElemChangedInterval && clearPointerElemChangedInterval();
          // Detect for pointer elem change, emulating native DnD behaviour
          pointerElemChangedInterval = setInterval(function () {
            var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
            if (newElem !== ogElemScroller) {
              ogElemScroller = newElem;
              clearAutoScrolls();
            }
            autoScroll(evt, _this.options, newElem, fallback);
          }, 10);
          lastAutoScrollX = x;
          lastAutoScrollY = y;
        }
      } else {
        // if DnD is enabled (and browser has good autoscrolling), first autoscroll will already scroll, so get parent autoscroll of first autoscroll
        if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
          clearAutoScrolls();
          return;
        }
        autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
      }
    }
  };
  return _extends(AutoScroll, {
    pluginName: 'scroll',
    initializeByDefault: true
  });
}
function clearAutoScrolls() {
  autoScrolls.forEach(function (autoScroll) {
    clearInterval(autoScroll.pid);
  });
  autoScrolls = [];
}
function clearPointerElemChangedInterval() {
  clearInterval(pointerElemChangedInterval);
}
var autoScroll = throttle(function (evt, options, rootEl, isFallback) {
  // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
  if (!options.scroll) return;
  var x = (evt.touches ? evt.touches[0] : evt).clientX,
    y = (evt.touches ? evt.touches[0] : evt).clientY,
    sens = options.scrollSensitivity,
    speed = options.scrollSpeed,
    winScroller = getWindowScrollingElement();
  var scrollThisInstance = false,
    scrollCustomFn;

  // New scroll root, set scrollEl
  if (scrollRootEl !== rootEl) {
    scrollRootEl = rootEl;
    clearAutoScrolls();
    scrollEl = options.scroll;
    scrollCustomFn = options.scrollFn;
    if (scrollEl === true) {
      scrollEl = getParentAutoScrollElement(rootEl, true);
    }
  }
  var layersOut = 0;
  var currentParent = scrollEl;
  do {
    var el = currentParent,
      rect = getRect(el),
      top = rect.top,
      bottom = rect.bottom,
      left = rect.left,
      right = rect.right,
      width = rect.width,
      height = rect.height,
      canScrollX = void 0,
      canScrollY = void 0,
      scrollWidth = el.scrollWidth,
      scrollHeight = el.scrollHeight,
      elCSS = css(el),
      scrollPosX = el.scrollLeft,
      scrollPosY = el.scrollTop;
    if (el === winScroller) {
      canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll' || elCSS.overflowX === 'visible');
      canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll' || elCSS.overflowY === 'visible');
    } else {
      canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
      canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
    }
    var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
    var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
    if (!autoScrolls[layersOut]) {
      for (var i = 0; i <= layersOut; i++) {
        if (!autoScrolls[i]) {
          autoScrolls[i] = {};
        }
      }
    }
    if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
      autoScrolls[layersOut].el = el;
      autoScrolls[layersOut].vx = vx;
      autoScrolls[layersOut].vy = vy;
      clearInterval(autoScrolls[layersOut].pid);
      if (vx != 0 || vy != 0) {
        scrollThisInstance = true;
        /* jshint loopfunc:true */
        autoScrolls[layersOut].pid = setInterval(function () {
          // emulate drag over during autoscroll (fallback), emulating native DnD behaviour
          if (isFallback && this.layer === 0) {
            Sortable.active._onTouchMove(touchEvt$1); // To move ghost if it is positioned absolutely
          }
          var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
          var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
          if (typeof scrollCustomFn === 'function') {
            if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== 'continue') {
              return;
            }
          }
          scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
        }.bind({
          layer: layersOut
        }), 24);
      }
    }
    layersOut++;
  } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
  scrolling = scrollThisInstance; // in case another function catches scrolling as false in between when it is not
}, 30);

var drop = function drop(_ref) {
  var originalEvent = _ref.originalEvent,
    putSortable = _ref.putSortable,
    dragEl = _ref.dragEl,
    activeSortable = _ref.activeSortable,
    dispatchSortableEvent = _ref.dispatchSortableEvent,
    hideGhostForTarget = _ref.hideGhostForTarget,
    unhideGhostForTarget = _ref.unhideGhostForTarget;
  if (!originalEvent) return;
  var toSortable = putSortable || activeSortable;
  hideGhostForTarget();
  var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  unhideGhostForTarget();
  if (toSortable && !toSortable.el.contains(target)) {
    dispatchSortableEvent('spill');
    this.onSpill({
      dragEl: dragEl,
      putSortable: putSortable
    });
  }
};
function Revert() {}
Revert.prototype = {
  startIndex: null,
  dragStart: function dragStart(_ref2) {
    var oldDraggableIndex = _ref2.oldDraggableIndex;
    this.startIndex = oldDraggableIndex;
  },
  onSpill: function onSpill(_ref3) {
    var dragEl = _ref3.dragEl,
      putSortable = _ref3.putSortable;
    this.sortable.captureAnimationState();
    if (putSortable) {
      putSortable.captureAnimationState();
    }
    var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
    if (nextSibling) {
      this.sortable.el.insertBefore(dragEl, nextSibling);
    } else {
      this.sortable.el.appendChild(dragEl);
    }
    this.sortable.animateAll();
    if (putSortable) {
      putSortable.animateAll();
    }
  },
  drop: drop
};
_extends(Revert, {
  pluginName: 'revertOnSpill'
});
function Remove() {}
Remove.prototype = {
  onSpill: function onSpill(_ref4) {
    var dragEl = _ref4.dragEl,
      putSortable = _ref4.putSortable;
    var parentSortable = putSortable || this.sortable;
    parentSortable.captureAnimationState();
    dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
    parentSortable.animateAll();
  },
  drop: drop
};
_extends(Remove, {
  pluginName: 'removeOnSpill'
});

var lastSwapEl;
function SwapPlugin() {
  function Swap() {
    this.defaults = {
      swapClass: 'sortable-swap-highlight'
    };
  }
  Swap.prototype = {
    dragStart: function dragStart(_ref) {
      var dragEl = _ref.dragEl;
      lastSwapEl = dragEl;
    },
    dragOverValid: function dragOverValid(_ref2) {
      var completed = _ref2.completed,
        target = _ref2.target,
        onMove = _ref2.onMove,
        activeSortable = _ref2.activeSortable,
        changed = _ref2.changed,
        cancel = _ref2.cancel;
      if (!activeSortable.options.swap) return;
      var el = this.sortable.el,
        options = this.options;
      if (target && target !== el) {
        var prevSwapEl = lastSwapEl;
        if (onMove(target) !== false) {
          toggleClass(target, options.swapClass, true);
          lastSwapEl = target;
        } else {
          lastSwapEl = null;
        }
        if (prevSwapEl && prevSwapEl !== lastSwapEl) {
          toggleClass(prevSwapEl, options.swapClass, false);
        }
      }
      changed();
      completed(true);
      cancel();
    },
    drop: function drop(_ref3) {
      var activeSortable = _ref3.activeSortable,
        putSortable = _ref3.putSortable,
        dragEl = _ref3.dragEl;
      var toSortable = putSortable || this.sortable;
      var options = this.options;
      lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
      if (lastSwapEl && (options.swap || putSortable && putSortable.options.swap)) {
        if (dragEl !== lastSwapEl) {
          toSortable.captureAnimationState();
          if (toSortable !== activeSortable) activeSortable.captureAnimationState();
          swapNodes(dragEl, lastSwapEl);
          toSortable.animateAll();
          if (toSortable !== activeSortable) activeSortable.animateAll();
        }
      }
    },
    nulling: function nulling() {
      lastSwapEl = null;
    }
  };
  return _extends(Swap, {
    pluginName: 'swap',
    eventProperties: function eventProperties() {
      return {
        swapItem: lastSwapEl
      };
    }
  });
}
function swapNodes(n1, n2) {
  var p1 = n1.parentNode,
    p2 = n2.parentNode,
    i1,
    i2;
  if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1)) return;
  i1 = index(n1);
  i2 = index(n2);
  if (p1.isEqualNode(p2) && i1 < i2) {
    i2++;
  }
  p1.insertBefore(n2, p1.children[i1]);
  p2.insertBefore(n1, p2.children[i2]);
}

var multiDragElements = [],
  multiDragClones = [],
  lastMultiDragSelect,
  // for selection with modifier key down (SHIFT)
  multiDragSortable,
  initialFolding = false,
  // Initial multi-drag fold when drag started
  folding = false,
  // Folding any other time
  dragStarted = false,
  dragEl$1,
  clonesFromRect,
  clonesHidden;
function MultiDragPlugin() {
  function MultiDrag(sortable) {
    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }
    if (!sortable.options.avoidImplicitDeselect) {
      if (sortable.options.supportPointer) {
        on(document, 'pointerup', this._deselectMultiDrag);
      } else {
        on(document, 'mouseup', this._deselectMultiDrag);
        on(document, 'touchend', this._deselectMultiDrag);
      }
    }
    on(document, 'keydown', this._checkKeyDown);
    on(document, 'keyup', this._checkKeyUp);
    this.defaults = {
      selectedClass: 'sortable-selected',
      multiDragKey: null,
      avoidImplicitDeselect: false,
      setData: function setData(dataTransfer, dragEl) {
        var data = '';
        if (multiDragElements.length && multiDragSortable === sortable) {
          multiDragElements.forEach(function (multiDragElement, i) {
            data += (!i ? '' : ', ') + multiDragElement.textContent;
          });
        } else {
          data = dragEl.textContent;
        }
        dataTransfer.setData('Text', data);
      }
    };
  }
  MultiDrag.prototype = {
    multiDragKeyDown: false,
    isMultiDrag: false,
    delayStartGlobal: function delayStartGlobal(_ref) {
      var dragged = _ref.dragEl;
      dragEl$1 = dragged;
    },
    delayEnded: function delayEnded() {
      this.isMultiDrag = ~multiDragElements.indexOf(dragEl$1);
    },
    setupClone: function setupClone(_ref2) {
      var sortable = _ref2.sortable,
        cancel = _ref2.cancel;
      if (!this.isMultiDrag) return;
      for (var i = 0; i < multiDragElements.length; i++) {
        multiDragClones.push(clone(multiDragElements[i]));
        multiDragClones[i].sortableIndex = multiDragElements[i].sortableIndex;
        multiDragClones[i].draggable = false;
        multiDragClones[i].style['will-change'] = '';
        toggleClass(multiDragClones[i], this.options.selectedClass, false);
        multiDragElements[i] === dragEl$1 && toggleClass(multiDragClones[i], this.options.chosenClass, false);
      }
      sortable._hideClone();
      cancel();
    },
    clone: function clone(_ref3) {
      var sortable = _ref3.sortable,
        rootEl = _ref3.rootEl,
        dispatchSortableEvent = _ref3.dispatchSortableEvent,
        cancel = _ref3.cancel;
      if (!this.isMultiDrag) return;
      if (!this.options.removeCloneOnHide) {
        if (multiDragElements.length && multiDragSortable === sortable) {
          insertMultiDragClones(true, rootEl);
          dispatchSortableEvent('clone');
          cancel();
        }
      }
    },
    showClone: function showClone(_ref4) {
      var cloneNowShown = _ref4.cloneNowShown,
        rootEl = _ref4.rootEl,
        cancel = _ref4.cancel;
      if (!this.isMultiDrag) return;
      insertMultiDragClones(false, rootEl);
      multiDragClones.forEach(function (clone) {
        css(clone, 'display', '');
      });
      cloneNowShown();
      clonesHidden = false;
      cancel();
    },
    hideClone: function hideClone(_ref5) {
      var _this = this;
      var sortable = _ref5.sortable,
        cloneNowHidden = _ref5.cloneNowHidden,
        cancel = _ref5.cancel;
      if (!this.isMultiDrag) return;
      multiDragClones.forEach(function (clone) {
        css(clone, 'display', 'none');
        if (_this.options.removeCloneOnHide && clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      });
      cloneNowHidden();
      clonesHidden = true;
      cancel();
    },
    dragStartGlobal: function dragStartGlobal(_ref6) {
      var sortable = _ref6.sortable;
      if (!this.isMultiDrag && multiDragSortable) {
        multiDragSortable.multiDrag._deselectMultiDrag();
      }
      multiDragElements.forEach(function (multiDragElement) {
        multiDragElement.sortableIndex = index(multiDragElement);
      });

      // Sort multi-drag elements
      multiDragElements = multiDragElements.sort(function (a, b) {
        return a.sortableIndex - b.sortableIndex;
      });
      dragStarted = true;
    },
    dragStarted: function dragStarted(_ref7) {
      var _this2 = this;
      var sortable = _ref7.sortable;
      if (!this.isMultiDrag) return;
      if (this.options.sort) {
        // Capture rects,
        // hide multi drag elements (by positioning them absolute),
        // set multi drag elements rects to dragRect,
        // show multi drag elements,
        // animate to rects,
        // unset rects & remove from DOM

        sortable.captureAnimationState();
        if (this.options.animation) {
          multiDragElements.forEach(function (multiDragElement) {
            if (multiDragElement === dragEl$1) return;
            css(multiDragElement, 'position', 'absolute');
          });
          var dragRect = getRect(dragEl$1, false, true, true);
          multiDragElements.forEach(function (multiDragElement) {
            if (multiDragElement === dragEl$1) return;
            setRect(multiDragElement, dragRect);
          });
          folding = true;
          initialFolding = true;
        }
      }
      sortable.animateAll(function () {
        folding = false;
        initialFolding = false;
        if (_this2.options.animation) {
          multiDragElements.forEach(function (multiDragElement) {
            unsetRect(multiDragElement);
          });
        }

        // Remove all auxiliary multidrag items from el, if sorting enabled
        if (_this2.options.sort) {
          removeMultiDragElements();
        }
      });
    },
    dragOver: function dragOver(_ref8) {
      var target = _ref8.target,
        completed = _ref8.completed,
        cancel = _ref8.cancel;
      if (folding && ~multiDragElements.indexOf(target)) {
        completed(false);
        cancel();
      }
    },
    revert: function revert(_ref9) {
      var fromSortable = _ref9.fromSortable,
        rootEl = _ref9.rootEl,
        sortable = _ref9.sortable,
        dragRect = _ref9.dragRect;
      if (multiDragElements.length > 1) {
        // Setup unfold animation
        multiDragElements.forEach(function (multiDragElement) {
          sortable.addAnimationState({
            target: multiDragElement,
            rect: folding ? getRect(multiDragElement) : dragRect
          });
          unsetRect(multiDragElement);
          multiDragElement.fromRect = dragRect;
          fromSortable.removeAnimationState(multiDragElement);
        });
        folding = false;
        insertMultiDragElements(!this.options.removeCloneOnHide, rootEl);
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref10) {
      var sortable = _ref10.sortable,
        isOwner = _ref10.isOwner,
        insertion = _ref10.insertion,
        activeSortable = _ref10.activeSortable,
        parentEl = _ref10.parentEl,
        putSortable = _ref10.putSortable;
      var options = this.options;
      if (insertion) {
        // Clones must be hidden before folding animation to capture dragRectAbsolute properly
        if (isOwner) {
          activeSortable._hideClone();
        }
        initialFolding = false;
        // If leaving sort:false root, or already folding - Fold to new location
        if (options.animation && multiDragElements.length > 1 && (folding || !isOwner && !activeSortable.options.sort && !putSortable)) {
          // Fold: Set all multi drag elements's rects to dragEl's rect when multi-drag elements are invisible
          var dragRectAbsolute = getRect(dragEl$1, false, true, true);
          multiDragElements.forEach(function (multiDragElement) {
            if (multiDragElement === dragEl$1) return;
            setRect(multiDragElement, dragRectAbsolute);

            // Move element(s) to end of parentEl so that it does not interfere with multi-drag clones insertion if they are inserted
            // while folding, and so that we can capture them again because old sortable will no longer be fromSortable
            parentEl.appendChild(multiDragElement);
          });
          folding = true;
        }

        // Clones must be shown (and check to remove multi drags) after folding when interfering multiDragElements are moved out
        if (!isOwner) {
          // Only remove if not folding (folding will remove them anyways)
          if (!folding) {
            removeMultiDragElements();
          }
          if (multiDragElements.length > 1) {
            var clonesHiddenBefore = clonesHidden;
            activeSortable._showClone(sortable);

            // Unfold animation for clones if showing from hidden
            if (activeSortable.options.animation && !clonesHidden && clonesHiddenBefore) {
              multiDragClones.forEach(function (clone) {
                activeSortable.addAnimationState({
                  target: clone,
                  rect: clonesFromRect
                });
                clone.fromRect = clonesFromRect;
                clone.thisAnimationDuration = null;
              });
            }
          } else {
            activeSortable._showClone(sortable);
          }
        }
      }
    },
    dragOverAnimationCapture: function dragOverAnimationCapture(_ref11) {
      var dragRect = _ref11.dragRect,
        isOwner = _ref11.isOwner,
        activeSortable = _ref11.activeSortable;
      multiDragElements.forEach(function (multiDragElement) {
        multiDragElement.thisAnimationDuration = null;
      });
      if (activeSortable.options.animation && !isOwner && activeSortable.multiDrag.isMultiDrag) {
        clonesFromRect = _extends({}, dragRect);
        var dragMatrix = matrix(dragEl$1, true);
        clonesFromRect.top -= dragMatrix.f;
        clonesFromRect.left -= dragMatrix.e;
      }
    },
    dragOverAnimationComplete: function dragOverAnimationComplete() {
      if (folding) {
        folding = false;
        removeMultiDragElements();
      }
    },
    drop: function drop(_ref12) {
      var evt = _ref12.originalEvent,
        rootEl = _ref12.rootEl,
        parentEl = _ref12.parentEl,
        sortable = _ref12.sortable,
        dispatchSortableEvent = _ref12.dispatchSortableEvent,
        oldIndex = _ref12.oldIndex,
        putSortable = _ref12.putSortable;
      var toSortable = putSortable || this.sortable;
      if (!evt) return;
      var options = this.options,
        children = parentEl.children;

      // Multi-drag selection
      if (!dragStarted) {
        if (options.multiDragKey && !this.multiDragKeyDown) {
          this._deselectMultiDrag();
        }
        toggleClass(dragEl$1, options.selectedClass, !~multiDragElements.indexOf(dragEl$1));
        if (!~multiDragElements.indexOf(dragEl$1)) {
          multiDragElements.push(dragEl$1);
          dispatchEvent({
            sortable: sortable,
            rootEl: rootEl,
            name: 'select',
            targetEl: dragEl$1,
            originalEvent: evt
          });

          // Modifier activated, select from last to dragEl
          if (evt.shiftKey && lastMultiDragSelect && sortable.el.contains(lastMultiDragSelect)) {
            var lastIndex = index(lastMultiDragSelect),
              currentIndex = index(dragEl$1);
            if (~lastIndex && ~currentIndex && lastIndex !== currentIndex) {
              // Must include lastMultiDragSelect (select it), in case modified selection from no selection
              // (but previous selection existed)
              var n, i;
              if (currentIndex > lastIndex) {
                i = lastIndex;
                n = currentIndex;
              } else {
                i = currentIndex;
                n = lastIndex + 1;
              }
              for (; i < n; i++) {
                if (~multiDragElements.indexOf(children[i])) continue;
                toggleClass(children[i], options.selectedClass, true);
                multiDragElements.push(children[i]);
                dispatchEvent({
                  sortable: sortable,
                  rootEl: rootEl,
                  name: 'select',
                  targetEl: children[i],
                  originalEvent: evt
                });
              }
            }
          } else {
            lastMultiDragSelect = dragEl$1;
          }
          multiDragSortable = toSortable;
        } else {
          multiDragElements.splice(multiDragElements.indexOf(dragEl$1), 1);
          lastMultiDragSelect = null;
          dispatchEvent({
            sortable: sortable,
            rootEl: rootEl,
            name: 'deselect',
            targetEl: dragEl$1,
            originalEvent: evt
          });
        }
      }

      // Multi-drag drop
      if (dragStarted && this.isMultiDrag) {
        folding = false;
        // Do not "unfold" after around dragEl if reverted
        if ((parentEl[expando].options.sort || parentEl !== rootEl) && multiDragElements.length > 1) {
          var dragRect = getRect(dragEl$1),
            multiDragIndex = index(dragEl$1, ':not(.' + this.options.selectedClass + ')');
          if (!initialFolding && options.animation) dragEl$1.thisAnimationDuration = null;
          toSortable.captureAnimationState();
          if (!initialFolding) {
            if (options.animation) {
              dragEl$1.fromRect = dragRect;
              multiDragElements.forEach(function (multiDragElement) {
                multiDragElement.thisAnimationDuration = null;
                if (multiDragElement !== dragEl$1) {
                  var rect = folding ? getRect(multiDragElement) : dragRect;
                  multiDragElement.fromRect = rect;

                  // Prepare unfold animation
                  toSortable.addAnimationState({
                    target: multiDragElement,
                    rect: rect
                  });
                }
              });
            }

            // Multi drag elements are not necessarily removed from the DOM on drop, so to reinsert
            // properly they must all be removed
            removeMultiDragElements();
            multiDragElements.forEach(function (multiDragElement) {
              if (children[multiDragIndex]) {
                parentEl.insertBefore(multiDragElement, children[multiDragIndex]);
              } else {
                parentEl.appendChild(multiDragElement);
              }
              multiDragIndex++;
            });

            // If initial folding is done, the elements may have changed position because they are now
            // unfolding around dragEl, even though dragEl may not have his index changed, so update event
            // must be fired here as Sortable will not.
            if (oldIndex === index(dragEl$1)) {
              var update = false;
              multiDragElements.forEach(function (multiDragElement) {
                if (multiDragElement.sortableIndex !== index(multiDragElement)) {
                  update = true;
                  return;
                }
              });
              if (update) {
                dispatchSortableEvent('update');
                dispatchSortableEvent('sort');
              }
            }
          }

          // Must be done after capturing individual rects (scroll bar)
          multiDragElements.forEach(function (multiDragElement) {
            unsetRect(multiDragElement);
          });
          toSortable.animateAll();
        }
        multiDragSortable = toSortable;
      }

      // Remove clones if necessary
      if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
        multiDragClones.forEach(function (clone) {
          clone.parentNode && clone.parentNode.removeChild(clone);
        });
      }
    },
    nullingGlobal: function nullingGlobal() {
      this.isMultiDrag = dragStarted = false;
      multiDragClones.length = 0;
    },
    destroyGlobal: function destroyGlobal() {
      this._deselectMultiDrag();
      off(document, 'pointerup', this._deselectMultiDrag);
      off(document, 'mouseup', this._deselectMultiDrag);
      off(document, 'touchend', this._deselectMultiDrag);
      off(document, 'keydown', this._checkKeyDown);
      off(document, 'keyup', this._checkKeyUp);
    },
    _deselectMultiDrag: function _deselectMultiDrag(evt) {
      if (typeof dragStarted !== "undefined" && dragStarted) return;

      // Only deselect if selection is in this sortable
      if (multiDragSortable !== this.sortable) return;

      // Only deselect if target is not item in this sortable
      if (evt && closest(evt.target, this.options.draggable, this.sortable.el, false)) return;

      // Only deselect if left click
      if (evt && evt.button !== 0) return;
      while (multiDragElements.length) {
        var el = multiDragElements[0];
        toggleClass(el, this.options.selectedClass, false);
        multiDragElements.shift();
        dispatchEvent({
          sortable: this.sortable,
          rootEl: this.sortable.el,
          name: 'deselect',
          targetEl: el,
          originalEvent: evt
        });
      }
    },
    _checkKeyDown: function _checkKeyDown(evt) {
      if (evt.key === this.options.multiDragKey) {
        this.multiDragKeyDown = true;
      }
    },
    _checkKeyUp: function _checkKeyUp(evt) {
      if (evt.key === this.options.multiDragKey) {
        this.multiDragKeyDown = false;
      }
    }
  };
  return _extends(MultiDrag, {
    // Static methods & properties
    pluginName: 'multiDrag',
    utils: {
      /**
       * Selects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be selected
       */
      select: function select(el) {
        var sortable = el.parentNode[expando];
        if (!sortable || !sortable.options.multiDrag || ~multiDragElements.indexOf(el)) return;
        if (multiDragSortable && multiDragSortable !== sortable) {
          multiDragSortable.multiDrag._deselectMultiDrag();
          multiDragSortable = sortable;
        }
        toggleClass(el, sortable.options.selectedClass, true);
        multiDragElements.push(el);
      },
      /**
       * Deselects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be deselected
       */
      deselect: function deselect(el) {
        var sortable = el.parentNode[expando],
          index = multiDragElements.indexOf(el);
        if (!sortable || !sortable.options.multiDrag || !~index) return;
        toggleClass(el, sortable.options.selectedClass, false);
        multiDragElements.splice(index, 1);
      }
    },
    eventProperties: function eventProperties() {
      var _this3 = this;
      var oldIndicies = [],
        newIndicies = [];
      multiDragElements.forEach(function (multiDragElement) {
        oldIndicies.push({
          multiDragElement: multiDragElement,
          index: multiDragElement.sortableIndex
        });

        // multiDragElements will already be sorted if folding
        var newIndex;
        if (folding && multiDragElement !== dragEl$1) {
          newIndex = -1;
        } else if (folding) {
          newIndex = index(multiDragElement, ':not(.' + _this3.options.selectedClass + ')');
        } else {
          newIndex = index(multiDragElement);
        }
        newIndicies.push({
          multiDragElement: multiDragElement,
          index: newIndex
        });
      });
      return {
        items: _toConsumableArray(multiDragElements),
        clones: [].concat(multiDragClones),
        oldIndicies: oldIndicies,
        newIndicies: newIndicies
      };
    },
    optionListeners: {
      multiDragKey: function multiDragKey(key) {
        key = key.toLowerCase();
        if (key === 'ctrl') {
          key = 'Control';
        } else if (key.length > 1) {
          key = key.charAt(0).toUpperCase() + key.substr(1);
        }
        return key;
      }
    }
  });
}
function insertMultiDragElements(clonesInserted, rootEl) {
  multiDragElements.forEach(function (multiDragElement, i) {
    var target = rootEl.children[multiDragElement.sortableIndex + (clonesInserted ? Number(i) : 0)];
    if (target) {
      rootEl.insertBefore(multiDragElement, target);
    } else {
      rootEl.appendChild(multiDragElement);
    }
  });
}

/**
 * Insert multi-drag clones
 * @param  {[Boolean]} elementsInserted  Whether the multi-drag elements are inserted
 * @param  {HTMLElement} rootEl
 */
function insertMultiDragClones(elementsInserted, rootEl) {
  multiDragClones.forEach(function (clone, i) {
    var target = rootEl.children[clone.sortableIndex + (elementsInserted ? Number(i) : 0)];
    if (target) {
      rootEl.insertBefore(clone, target);
    } else {
      rootEl.appendChild(clone);
    }
  });
}
function removeMultiDragElements() {
  multiDragElements.forEach(function (multiDragElement) {
    if (multiDragElement === dragEl$1) return;
    multiDragElement.parentNode && multiDragElement.parentNode.removeChild(multiDragElement);
  });
}

Sortable.mount(new AutoScrollPlugin());
Sortable.mount(Remove, Revert);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Sortable);



/***/ }),

/***/ "./node_modules/@editorjs/editorjs/dist/editorjs.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/@editorjs/editorjs/dist/editorjs.mjs ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Ei)
/* harmony export */ });
var Rt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Pe(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
function Te() {
}
Object.assign(Te, {
  default: Te,
  register: Te,
  revert: function() {
  },
  __esModule: !0
});
Element.prototype.matches || (Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function(s) {
  const e = (this.document || this.ownerDocument).querySelectorAll(s);
  let t = e.length;
  for (; --t >= 0 && e.item(t) !== this; )
    ;
  return t > -1;
});
Element.prototype.closest || (Element.prototype.closest = function(s) {
  let e = this;
  if (!document.documentElement.contains(e))
    return null;
  do {
    if (e.matches(s))
      return e;
    e = e.parentElement || e.parentNode;
  } while (e !== null);
  return null;
});
Element.prototype.prepend || (Element.prototype.prepend = function(e) {
  const t = document.createDocumentFragment();
  Array.isArray(e) || (e = [e]), e.forEach((o) => {
    const i = o instanceof Node;
    t.appendChild(i ? o : document.createTextNode(o));
  }), this.insertBefore(t, this.firstChild);
});
Element.prototype.scrollIntoViewIfNeeded || (Element.prototype.scrollIntoViewIfNeeded = function(s) {
  s = arguments.length === 0 ? !0 : !!s;
  const e = this.parentNode, t = window.getComputedStyle(e, null), o = parseInt(t.getPropertyValue("border-top-width")), i = parseInt(t.getPropertyValue("border-left-width")), n = this.offsetTop - e.offsetTop < e.scrollTop, r = this.offsetTop - e.offsetTop + this.clientHeight - o > e.scrollTop + e.clientHeight, a = this.offsetLeft - e.offsetLeft < e.scrollLeft, l = this.offsetLeft - e.offsetLeft + this.clientWidth - i > e.scrollLeft + e.clientWidth, d = n && !r;
  (n || r) && s && (e.scrollTop = this.offsetTop - e.offsetTop - e.clientHeight / 2 - o + this.clientHeight / 2), (a || l) && s && (e.scrollLeft = this.offsetLeft - e.offsetLeft - e.clientWidth / 2 - i + this.clientWidth / 2), (n || r || a || l) && !s && this.scrollIntoView(d);
});
window.requestIdleCallback = window.requestIdleCallback || function(s) {
  const e = Date.now();
  return setTimeout(function() {
    s({
      didTimeout: !1,
      timeRemaining: function() {
        return Math.max(0, 50 - (Date.now() - e));
      }
    });
  }, 1);
};
window.cancelIdleCallback = window.cancelIdleCallback || function(s) {
  clearTimeout(s);
};
let Dt = (s = 21) => crypto.getRandomValues(new Uint8Array(s)).reduce((e, t) => (t &= 63, t < 36 ? e += t.toString(36) : t < 62 ? e += (t - 26).toString(36).toUpperCase() : t > 62 ? e += "-" : e += "_", e), "");
var at = /* @__PURE__ */ ((s) => (s.VERBOSE = "VERBOSE", s.INFO = "INFO", s.WARN = "WARN", s.ERROR = "ERROR", s))(at || {});
const k = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  DOWN: 40,
  RIGHT: 39,
  DELETE: 46,
  META: 91,
  SLASH: 191
}, Pt = {
  LEFT: 0,
  WHEEL: 1,
  RIGHT: 2,
  BACKWARD: 3,
  FORWARD: 4
};
function me(s, e, t = "log", o, i = "color: inherit") {
  if (!("console" in window) || !window.console[t])
    return;
  const n = ["info", "log", "warn", "error"].includes(t), r = [];
  switch (me.logLevel) {
    case "ERROR":
      if (t !== "error")
        return;
      break;
    case "WARN":
      if (!["error", "warn"].includes(t))
        return;
      break;
    case "INFO":
      if (!n || s)
        return;
      break;
  }
  o && r.push(o);
  const a = "Editor.js 2.29.0", l = `line-height: 1em;
            color: #006FEA;
            display: inline-block;
            font-size: 11px;
            line-height: 1em;
            background-color: #fff;
            padding: 4px 9px;
            border-radius: 30px;
            border: 1px solid rgba(56, 138, 229, 0.16);
            margin: 4px 5px 4px 0;`;
  s && (n ? (r.unshift(l, i), e = `%c${a}%c ${e}`) : e = `( ${a} )${e}`);
  try {
    n ? o ? console[t](`${e} %o`, ...r) : console[t](e, ...r) : console[t](e);
  } catch {
  }
}
me.logLevel = "VERBOSE";
function Ft(s) {
  me.logLevel = s;
}
const T = me.bind(window, !1), Y = me.bind(window, !0);
function oe(s) {
  return Object.prototype.toString.call(s).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
function M(s) {
  return oe(s) === "function" || oe(s) === "asyncfunction";
}
function D(s) {
  return oe(s) === "object";
}
function G(s) {
  return oe(s) === "string";
}
function Ht(s) {
  return oe(s) === "boolean";
}
function Je(s) {
  return oe(s) === "number";
}
function Qe(s) {
  return oe(s) === "undefined";
}
function W(s) {
  return s ? Object.keys(s).length === 0 && s.constructor === Object : !0;
}
function lt(s) {
  return s > 47 && s < 58 || // number keys
  s === 32 || s === 13 || // Space bar & return key(s)
  s === 229 || // processing key input for certain languages — Chinese, Japanese, etc.
  s > 64 && s < 91 || // letter keys
  s > 95 && s < 112 || // Numpad keys
  s > 185 && s < 193 || // ;=,-./` (in order)
  s > 218 && s < 223;
}
async function zt(s, e = () => {
}, t = () => {
}) {
  async function o(i, n, r) {
    try {
      await i.function(i.data), await n(Qe(i.data) ? {} : i.data);
    } catch {
      r(Qe(i.data) ? {} : i.data);
    }
  }
  return s.reduce(async (i, n) => (await i, o(n, e, t)), Promise.resolve());
}
function ct(s) {
  return Array.prototype.slice.call(s);
}
function xe(s, e) {
  return function() {
    const t = this, o = arguments;
    window.setTimeout(() => s.apply(t, o), e);
  };
}
function Ut(s) {
  return s.name.split(".").pop();
}
function jt(s) {
  return /^[-\w]+\/([-+\w]+|\*)$/.test(s);
}
function et(s, e, t) {
  let o;
  return (...i) => {
    const n = this, r = () => {
      o = null, t || s.apply(n, i);
    }, a = t && !o;
    window.clearTimeout(o), o = window.setTimeout(r, e), a && s.apply(n, i);
  };
}
function Ie(s, e, t = void 0) {
  let o, i, n, r = null, a = 0;
  t || (t = {});
  const l = function() {
    a = t.leading === !1 ? 0 : Date.now(), r = null, n = s.apply(o, i), r || (o = i = null);
  };
  return function() {
    const d = Date.now();
    !a && t.leading === !1 && (a = d);
    const u = e - (d - a);
    return o = this, i = arguments, u <= 0 || u > e ? (r && (clearTimeout(r), r = null), a = d, n = s.apply(o, i), r || (o = i = null)) : !r && t.trailing !== !1 && (r = setTimeout(l, u)), n;
  };
}
function $t() {
  const s = {
    win: !1,
    mac: !1,
    x11: !1,
    linux: !1
  }, e = Object.keys(s).find((t) => window.navigator.appVersion.toLowerCase().indexOf(t) !== -1);
  return e && (s[e] = !0), s;
}
function re(s) {
  return s[0].toUpperCase() + s.slice(1);
}
function Me(s, ...e) {
  if (!e.length)
    return s;
  const t = e.shift();
  if (D(s) && D(t))
    for (const o in t)
      D(t[o]) ? (s[o] || Object.assign(s, { [o]: {} }), Me(s[o], t[o])) : Object.assign(s, { [o]: t[o] });
  return Me(s, ...e);
}
function ye(s) {
  const e = $t();
  return s = s.replace(/shift/gi, "⇧").replace(/backspace/gi, "⌫").replace(/enter/gi, "⏎").replace(/up/gi, "↑").replace(/left/gi, "→").replace(/down/gi, "↓").replace(/right/gi, "←").replace(/escape/gi, "⎋").replace(/insert/gi, "Ins").replace(/delete/gi, "␡").replace(/\+/gi, " + "), e.mac ? s = s.replace(/ctrl|cmd/gi, "⌘").replace(/alt/gi, "⌥") : s = s.replace(/cmd/gi, "Ctrl").replace(/windows/gi, "WIN"), s;
}
function Wt(s) {
  try {
    return new URL(s).href;
  } catch {
  }
  return s.substring(0, 2) === "//" ? window.location.protocol + s : window.location.origin + s;
}
function Yt() {
  return Dt(10);
}
function Kt(s) {
  window.open(s, "_blank");
}
function Xt(s = "") {
  return `${s}${Math.floor(Math.random() * 1e8).toString(16)}`;
}
function Le(s, e, t) {
  const o = `«${e}» is deprecated and will be removed in the next major release. Please use the «${t}» instead.`;
  s && Y(o, "warn");
}
function le(s, e, t) {
  const o = t.value ? "value" : "get", i = t[o], n = `#${e}Cache`;
  if (t[o] = function(...r) {
    return this[n] === void 0 && (this[n] = i.apply(this, ...r)), this[n];
  }, o === "get" && t.set) {
    const r = t.set;
    t.set = function(a) {
      delete s[n], r.apply(this, a);
    };
  }
  return t;
}
const dt = 650;
function te() {
  return window.matchMedia(`(max-width: ${dt}px)`).matches;
}
const tt = typeof window < "u" && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
function Vt(s, e) {
  const t = Array.isArray(s) || D(s), o = Array.isArray(e) || D(e);
  return t || o ? JSON.stringify(s) === JSON.stringify(e) : s === e;
}
class c {
  /**
   * Check if passed tag has no closed tag
   *
   * @param {HTMLElement} tag - element to check
   * @returns {boolean}
   */
  static isSingleTag(e) {
    return e.tagName && [
      "AREA",
      "BASE",
      "BR",
      "COL",
      "COMMAND",
      "EMBED",
      "HR",
      "IMG",
      "INPUT",
      "KEYGEN",
      "LINK",
      "META",
      "PARAM",
      "SOURCE",
      "TRACK",
      "WBR"
    ].includes(e.tagName);
  }
  /**
   * Check if element is BR or WBR
   *
   * @param {HTMLElement} element - element to check
   * @returns {boolean}
   */
  static isLineBreakTag(e) {
    return e && e.tagName && [
      "BR",
      "WBR"
    ].includes(e.tagName);
  }
  /**
   * Helper for making Elements with class name and attributes
   *
   * @param  {string} tagName - new Element tag name
   * @param  {string[]|string} [classNames] - list or name of CSS class name(s)
   * @param  {object} [attributes] - any attributes
   * @returns {HTMLElement}
   */
  static make(e, t = null, o = {}) {
    const i = document.createElement(e);
    Array.isArray(t) ? i.classList.add(...t) : t && i.classList.add(t);
    for (const n in o)
      Object.prototype.hasOwnProperty.call(o, n) && (i[n] = o[n]);
    return i;
  }
  /**
   * Creates Text Node with the passed content
   *
   * @param {string} content - text content
   * @returns {Text}
   */
  static text(e) {
    return document.createTextNode(e);
  }
  /**
   * Append one or several elements to the parent
   *
   * @param  {Element|DocumentFragment} parent - where to append
   * @param  {Element|Element[]|DocumentFragment|Text|Text[]} elements - element or elements list
   */
  static append(e, t) {
    Array.isArray(t) ? t.forEach((o) => e.appendChild(o)) : e.appendChild(t);
  }
  /**
   * Append element or a couple to the beginning of the parent elements
   *
   * @param {Element} parent - where to append
   * @param {Element|Element[]} elements - element or elements list
   */
  static prepend(e, t) {
    Array.isArray(t) ? (t = t.reverse(), t.forEach((o) => e.prepend(o))) : e.prepend(t);
  }
  /**
   * Swap two elements in parent
   *
   * @param {HTMLElement} el1 - from
   * @param {HTMLElement} el2 - to
   * @deprecated
   */
  static swap(e, t) {
    const o = document.createElement("div"), i = e.parentNode;
    i.insertBefore(o, e), i.insertBefore(e, t), i.insertBefore(t, o), i.removeChild(o);
  }
  /**
   * Selector Decorator
   *
   * Returns first match
   *
   * @param {Element} el - element we searching inside. Default - DOM Document
   * @param {string} selector - searching string
   * @returns {Element}
   */
  static find(e = document, t) {
    return e.querySelector(t);
  }
  /**
   * Get Element by Id
   *
   * @param {string} id - id to find
   * @returns {HTMLElement | null}
   */
  static get(e) {
    return document.getElementById(e);
  }
  /**
   * Selector Decorator.
   *
   * Returns all matches
   *
   * @param {Element|Document} el - element we searching inside. Default - DOM Document
   * @param {string} selector - searching string
   * @returns {NodeList}
   */
  static findAll(e = document, t) {
    return e.querySelectorAll(t);
  }
  /**
   * Returns CSS selector for all text inputs
   */
  static get allInputsSelector() {
    return "[contenteditable=true], textarea, input:not([type]), " + ["text", "password", "email", "number", "search", "tel", "url"].map((t) => `input[type="${t}"]`).join(", ");
  }
  /**
   * Find all contenteditable, textarea and editable input elements passed holder contains
   *
   * @param holder - element where to find inputs
   */
  static findAllInputs(e) {
    return ct(e.querySelectorAll(c.allInputsSelector)).reduce((t, o) => c.isNativeInput(o) || c.containsOnlyInlineElements(o) ? [...t, o] : [...t, ...c.getDeepestBlockElements(o)], []);
  }
  /**
   * Search for deepest node which is Leaf.
   * Leaf is the vertex that doesn't have any child nodes
   *
   * @description Method recursively goes throw the all Node until it finds the Leaf
   * @param {Node} node - root Node. From this vertex we start Deep-first search
   *                      {@link https://en.wikipedia.org/wiki/Depth-first_search}
   * @param {boolean} [atLast] - find last text node
   * @returns {Node} - it can be text Node or Element Node, so that caret will able to work with it
   */
  static getDeepestNode(e, t = !1) {
    const o = t ? "lastChild" : "firstChild", i = t ? "previousSibling" : "nextSibling";
    if (e && e.nodeType === Node.ELEMENT_NODE && e[o]) {
      let n = e[o];
      if (c.isSingleTag(n) && !c.isNativeInput(n) && !c.isLineBreakTag(n))
        if (n[i])
          n = n[i];
        else if (n.parentNode[i])
          n = n.parentNode[i];
        else
          return n.parentNode;
      return this.getDeepestNode(n, t);
    }
    return e;
  }
  /**
   * Check if object is DOM node
   *
   * @param {*} node - object to check
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isElement(e) {
    return Je(e) ? !1 : e && e.nodeType && e.nodeType === Node.ELEMENT_NODE;
  }
  /**
   * Check if object is DocumentFragment node
   *
   * @param {object} node - object to check
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isFragment(e) {
    return Je(e) ? !1 : e && e.nodeType && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
  }
  /**
   * Check if passed element is contenteditable
   *
   * @param {HTMLElement} element - html element to check
   * @returns {boolean}
   */
  static isContentEditable(e) {
    return e.contentEditable === "true";
  }
  /**
   * Checks target if it is native input
   *
   * @param {*} target - HTML element or string
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isNativeInput(e) {
    const t = [
      "INPUT",
      "TEXTAREA"
    ];
    return e && e.tagName ? t.includes(e.tagName) : !1;
  }
  /**
   * Checks if we can set caret
   *
   * @param {HTMLElement} target - target to check
   * @returns {boolean}
   */
  static canSetCaret(e) {
    let t = !0;
    if (c.isNativeInput(e))
      switch (e.type) {
        case "file":
        case "checkbox":
        case "radio":
        case "hidden":
        case "submit":
        case "button":
        case "image":
        case "reset":
          t = !1;
          break;
      }
    else
      t = c.isContentEditable(e);
    return t;
  }
  /**
   * Checks node if it is empty
   *
   * @description Method checks simple Node without any childs for emptiness
   * If you have Node with 2 or more children id depth, you better use {@link Dom#isEmpty} method
   * @param {Node} node - node to check
   * @param {string} [ignoreChars] - char or substring to treat as empty
   * @returns {boolean} true if it is empty
   */
  static isNodeEmpty(e, t) {
    let o;
    return this.isSingleTag(e) && !this.isLineBreakTag(e) ? !1 : (this.isElement(e) && this.isNativeInput(e) ? o = e.value : o = e.textContent.replace("​", ""), t && (o = o.replace(new RegExp(t, "g"), "")), o.trim().length === 0);
  }
  /**
   * checks node if it is doesn't have any child nodes
   *
   * @param {Node} node - node to check
   * @returns {boolean}
   */
  static isLeaf(e) {
    return e ? e.childNodes.length === 0 : !1;
  }
  /**
   * breadth-first search (BFS)
   * {@link https://en.wikipedia.org/wiki/Breadth-first_search}
   *
   * @description Pushes to stack all DOM leafs and checks for emptiness
   * @param {Node} node - node to check
   * @param {string} [ignoreChars] - char or substring to treat as empty
   * @returns {boolean}
   */
  static isEmpty(e, t) {
    e.normalize();
    const o = [e];
    for (; o.length > 0; )
      if (e = o.shift(), !!e) {
        if (this.isLeaf(e) && !this.isNodeEmpty(e, t))
          return !1;
        e.childNodes && o.push(...Array.from(e.childNodes));
      }
    return !0;
  }
  /**
   * Check if string contains html elements
   *
   * @param {string} str - string to check
   * @returns {boolean}
   */
  static isHTMLString(e) {
    const t = c.make("div");
    return t.innerHTML = e, t.childElementCount > 0;
  }
  /**
   * Return length of node`s text content
   *
   * @param {Node} node - node with content
   * @returns {number}
   */
  static getContentLength(e) {
    return c.isNativeInput(e) ? e.value.length : e.nodeType === Node.TEXT_NODE ? e.length : e.textContent.length;
  }
  /**
   * Return array of names of block html elements
   *
   * @returns {string[]}
   */
  static get blockElements() {
    return [
      "address",
      "article",
      "aside",
      "blockquote",
      "canvas",
      "div",
      "dl",
      "dt",
      "fieldset",
      "figcaption",
      "figure",
      "footer",
      "form",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "header",
      "hgroup",
      "hr",
      "li",
      "main",
      "nav",
      "noscript",
      "ol",
      "output",
      "p",
      "pre",
      "ruby",
      "section",
      "table",
      "tbody",
      "thead",
      "tr",
      "tfoot",
      "ul",
      "video"
    ];
  }
  /**
   * Check if passed content includes only inline elements
   *
   * @param {string|HTMLElement} data - element or html string
   * @returns {boolean}
   */
  static containsOnlyInlineElements(e) {
    let t;
    G(e) ? (t = document.createElement("div"), t.innerHTML = e) : t = e;
    const o = (i) => !c.blockElements.includes(i.tagName.toLowerCase()) && Array.from(i.children).every(o);
    return Array.from(t.children).every(o);
  }
  /**
   * Find and return all block elements in the passed parent (including subtree)
   *
   * @param {HTMLElement} parent - root element
   * @returns {HTMLElement[]}
   */
  static getDeepestBlockElements(e) {
    return c.containsOnlyInlineElements(e) ? [e] : Array.from(e.children).reduce((t, o) => [...t, ...c.getDeepestBlockElements(o)], []);
  }
  /**
   * Helper for get holder from {string} or return HTMLElement
   *
   * @param {string | HTMLElement} element - holder's id or holder's HTML Element
   * @returns {HTMLElement}
   */
  static getHolder(e) {
    return G(e) ? document.getElementById(e) : e;
  }
  /**
   * Returns true if element is anchor (is A tag)
   *
   * @param {Element} element - element to check
   * @returns {boolean}
   */
  static isAnchor(e) {
    return e.tagName.toLowerCase() === "a";
  }
  /**
   * Return element's offset related to the document
   *
   * @todo handle case when editor initialized in scrollable popup
   * @param el - element to compute offset
   */
  static offset(e) {
    const t = e.getBoundingClientRect(), o = window.pageXOffset || document.documentElement.scrollLeft, i = window.pageYOffset || document.documentElement.scrollTop, n = t.top + i, r = t.left + o;
    return {
      top: n,
      left: r,
      bottom: n + t.height,
      right: r + t.width
    };
  }
}
const qt = {
  blockTunes: {
    toggler: {
      "Click to tune": "",
      "or drag to move": ""
    }
  },
  inlineToolbar: {
    converter: {
      "Convert to": ""
    }
  },
  toolbar: {
    toolbox: {
      Add: ""
    }
  },
  popover: {
    Filter: "",
    "Nothing found": ""
  }
}, Zt = {
  Text: "",
  Link: "",
  Bold: "",
  Italic: ""
}, Gt = {
  link: {
    "Add a link": ""
  },
  stub: {
    "The block can not be displayed correctly.": ""
  }
}, Jt = {
  delete: {
    Delete: "",
    "Click to delete": ""
  },
  moveUp: {
    "Move up": ""
  },
  moveDown: {
    "Move down": ""
  }
}, ht = {
  ui: qt,
  toolNames: Zt,
  tools: Gt,
  blockTunes: Jt
}, ie = class {
  /**
   * Type-safe translation for internal UI texts:
   * Perform translation of the string by namespace and a key
   *
   * @example I18n.ui(I18nInternalNS.ui.blockTunes.toggler, 'Click to tune')
   * @param internalNamespace - path to translated string in dictionary
   * @param dictKey - dictionary key. Better to use default locale original text
   */
  static ui(s, e) {
    return ie._t(s, e);
  }
  /**
   * Translate for external strings that is not presented in default dictionary.
   * For example, for user-specified tool names
   *
   * @param namespace - path to translated string in dictionary
   * @param dictKey - dictionary key. Better to use default locale original text
   */
  static t(s, e) {
    return ie._t(s, e);
  }
  /**
   * Adjust module for using external dictionary
   *
   * @param dictionary - new messages list to override default
   */
  static setDictionary(s) {
    ie.currentDictionary = s;
  }
  /**
   * Perform translation both for internal and external namespaces
   * If there is no translation found, returns passed key as a translated message
   *
   * @param namespace - path to translated string in dictionary
   * @param dictKey - dictionary key. Better to use default locale original text
   */
  static _t(s, e) {
    const t = ie.getNamespace(s);
    return !t || !t[e] ? e : t[e];
  }
  /**
   * Find messages section by namespace path
   *
   * @param namespace - path to section
   */
  static getNamespace(s) {
    return s.split(".").reduce((t, o) => !t || !Object.keys(t).length ? {} : t[o], ie.currentDictionary);
  }
};
let z = ie;
z.currentDictionary = ht;
class ut extends Error {
}
class Ee {
  constructor() {
    this.subscribers = {};
  }
  /**
   * Subscribe any event on callback
   *
   * @param eventName - event name
   * @param callback - subscriber
   */
  on(e, t) {
    e in this.subscribers || (this.subscribers[e] = []), this.subscribers[e].push(t);
  }
  /**
   * Subscribe any event on callback. Callback will be called once and be removed from subscribers array after call.
   *
   * @param eventName - event name
   * @param callback - subscriber
   */
  once(e, t) {
    e in this.subscribers || (this.subscribers[e] = []);
    const o = (i) => {
      const n = t(i), r = this.subscribers[e].indexOf(o);
      return r !== -1 && this.subscribers[e].splice(r, 1), n;
    };
    this.subscribers[e].push(o);
  }
  /**
   * Emit callbacks with passed data
   *
   * @param eventName - event name
   * @param data - subscribers get this data when they were fired
   */
  emit(e, t) {
    W(this.subscribers) || !this.subscribers[e] || this.subscribers[e].reduce((o, i) => {
      const n = i(o);
      return n !== void 0 ? n : o;
    }, t);
  }
  /**
   * Unsubscribe callback from event
   *
   * @param eventName - event name
   * @param callback - event handler
   */
  off(e, t) {
    if (this.subscribers[e] === void 0) {
      console.warn(`EventDispatcher .off(): there is no subscribers for event "${e.toString()}". Probably, .off() called before .on()`);
      return;
    }
    for (let o = 0; o < this.subscribers[e].length; o++)
      if (this.subscribers[e][o] === t) {
        delete this.subscribers[e][o];
        break;
      }
  }
  /**
   * Destroyer
   * clears subscribers list
   */
  destroy() {
    this.subscribers = {};
  }
}
function ee(s) {
  Object.setPrototypeOf(this, {
    /**
     * Block id
     *
     * @returns {string}
     */
    get id() {
      return s.id;
    },
    /**
     * Tool name
     *
     * @returns {string}
     */
    get name() {
      return s.name;
    },
    /**
     * Tool config passed on Editor's initialization
     *
     * @returns {ToolConfig}
     */
    get config() {
      return s.config;
    },
    /**
     * .ce-block element, that wraps plugin contents
     *
     * @returns {HTMLElement}
     */
    get holder() {
      return s.holder;
    },
    /**
     * True if Block content is empty
     *
     * @returns {boolean}
     */
    get isEmpty() {
      return s.isEmpty;
    },
    /**
     * True if Block is selected with Cross-Block selection
     *
     * @returns {boolean}
     */
    get selected() {
      return s.selected;
    },
    /**
     * Set Block's stretch state
     *
     * @param {boolean} state — state to set
     */
    set stretched(t) {
      s.stretched = t;
    },
    /**
     * True if Block is stretched
     *
     * @returns {boolean}
     */
    get stretched() {
      return s.stretched;
    },
    /**
     * True if Block has inputs to be focused
     */
    get focusable() {
      return s.focusable;
    },
    /**
     * Call Tool method with errors handler under-the-hood
     *
     * @param {string} methodName - method to call
     * @param {object} param - object with parameters
     * @returns {unknown}
     */
    call(t, o) {
      return s.call(t, o);
    },
    /**
     * Save Block content
     *
     * @returns {Promise<void|SavedData>}
     */
    save() {
      return s.save();
    },
    /**
     * Validate Block data
     *
     * @param {BlockToolData} data - data to validate
     * @returns {Promise<boolean>}
     */
    validate(t) {
      return s.validate(t);
    },
    /**
     * Allows to say Editor that Block was changed. Used to manually trigger Editor's 'onChange' callback
     * Can be useful for block changes invisible for editor core.
     */
    dispatchChange() {
      s.dispatchChange();
    }
  });
}
class Fe {
  constructor() {
    this.allListeners = [];
  }
  /**
   * Assigns event listener on element and returns unique identifier
   *
   * @param {EventTarget} element - DOM element that needs to be listened
   * @param {string} eventType - event type
   * @param {Function} handler - method that will be fired on event
   * @param {boolean|AddEventListenerOptions} options - useCapture or {capture, passive, once}
   */
  on(e, t, o, i = !1) {
    const n = Xt("l"), r = {
      id: n,
      element: e,
      eventType: t,
      handler: o,
      options: i
    };
    if (!this.findOne(e, t, o))
      return this.allListeners.push(r), e.addEventListener(t, o, i), n;
  }
  /**
   * Removes event listener from element
   *
   * @param {EventTarget} element - DOM element that we removing listener
   * @param {string} eventType - event type
   * @param {Function} handler - remove handler, if element listens several handlers on the same event type
   * @param {boolean|AddEventListenerOptions} options - useCapture or {capture, passive, once}
   */
  off(e, t, o, i) {
    const n = this.findAll(e, t, o);
    n.forEach((r, a) => {
      const l = this.allListeners.indexOf(n[a]);
      l > -1 && (this.allListeners.splice(l, 1), r.element.removeEventListener(r.eventType, r.handler, r.options));
    });
  }
  /**
   * Removes listener by id
   *
   * @param {string} id - listener identifier
   */
  offById(e) {
    const t = this.findById(e);
    t && t.element.removeEventListener(t.eventType, t.handler, t.options);
  }
  /**
   * Finds and returns first listener by passed params
   *
   * @param {EventTarget} element - event target
   * @param {string} [eventType] - event type
   * @param {Function} [handler] - event handler
   * @returns {ListenerData|null}
   */
  findOne(e, t, o) {
    const i = this.findAll(e, t, o);
    return i.length > 0 ? i[0] : null;
  }
  /**
   * Return all stored listeners by passed params
   *
   * @param {EventTarget} element - event target
   * @param {string} eventType - event type
   * @param {Function} handler - event handler
   * @returns {ListenerData[]}
   */
  findAll(e, t, o) {
    let i;
    const n = e ? this.findByEventTarget(e) : [];
    return e && t && o ? i = n.filter((r) => r.eventType === t && r.handler === o) : e && t ? i = n.filter((r) => r.eventType === t) : i = n, i;
  }
  /**
   * Removes all listeners
   */
  removeAll() {
    this.allListeners.map((e) => {
      e.element.removeEventListener(e.eventType, e.handler, e.options);
    }), this.allListeners = [];
  }
  /**
   * Module cleanup on destruction
   */
  destroy() {
    this.removeAll();
  }
  /**
   * Search method: looks for listener by passed element
   *
   * @param {EventTarget} element - searching element
   * @returns {Array} listeners that found on element
   */
  findByEventTarget(e) {
    return this.allListeners.filter((t) => {
      if (t.element === e)
        return t;
    });
  }
  /**
   * Search method: looks for listener by passed event type
   *
   * @param {string} eventType - event type
   * @returns {ListenerData[]} listeners that found on element
   */
  findByType(e) {
    return this.allListeners.filter((t) => {
      if (t.eventType === e)
        return t;
    });
  }
  /**
   * Search method: looks for listener by passed handler
   *
   * @param {Function} handler - event handler
   * @returns {ListenerData[]} listeners that found on element
   */
  findByHandler(e) {
    return this.allListeners.filter((t) => {
      if (t.handler === e)
        return t;
    });
  }
  /**
   * Returns listener data found by id
   *
   * @param {string} id - listener identifier
   * @returns {ListenerData}
   */
  findById(e) {
    return this.allListeners.find((t) => t.id === e);
  }
}
class y {
  /**
   * @class
   * @param options - Module options
   * @param options.config - Module config
   * @param options.eventsDispatcher - Common event bus
   */
  constructor({ config: e, eventsDispatcher: t }) {
    if (this.nodes = {}, this.listeners = new Fe(), this.readOnlyMutableListeners = {
      /**
       * Assigns event listener on DOM element and pushes into special array that might be removed
       *
       * @param {EventTarget} element - DOM Element
       * @param {string} eventType - Event name
       * @param {Function} handler - Event handler
       * @param {boolean|AddEventListenerOptions} options - Listening options
       */
      on: (o, i, n, r = !1) => {
        this.mutableListenerIds.push(
          this.listeners.on(o, i, n, r)
        );
      },
      /**
       * Clears all mutable listeners
       */
      clearAll: () => {
        for (const o of this.mutableListenerIds)
          this.listeners.offById(o);
        this.mutableListenerIds = [];
      }
    }, this.mutableListenerIds = [], new.target === y)
      throw new TypeError("Constructors for abstract class Module are not allowed.");
    this.config = e, this.eventsDispatcher = t;
  }
  /**
   * Editor modules setter
   *
   * @param {EditorModules} Editor - Editor's Modules
   */
  set state(e) {
    this.Editor = e;
  }
  /**
   * Remove memorized nodes
   */
  removeAllNodes() {
    for (const e in this.nodes) {
      const t = this.nodes[e];
      t instanceof HTMLElement && t.remove();
    }
  }
  /**
   * Returns true if current direction is RTL (Right-To-Left)
   */
  get isRtl() {
    return this.config.i18n.direction === "rtl";
  }
}
class b {
  constructor() {
    this.instance = null, this.selection = null, this.savedSelectionRange = null, this.isFakeBackgroundEnabled = !1, this.commandBackground = "backColor", this.commandRemoveFormat = "removeFormat";
  }
  /**
   * Editor styles
   *
   * @returns {{editorWrapper: string, editorZone: string}}
   */
  static get CSS() {
    return {
      editorWrapper: "codex-editor",
      editorZone: "codex-editor__redactor"
    };
  }
  /**
   * Returns selected anchor
   * {@link https://developer.mozilla.org/ru/docs/Web/API/Selection/anchorNode}
   *
   * @returns {Node|null}
   */
  static get anchorNode() {
    const e = window.getSelection();
    return e ? e.anchorNode : null;
  }
  /**
   * Returns selected anchor element
   *
   * @returns {Element|null}
   */
  static get anchorElement() {
    const e = window.getSelection();
    if (!e)
      return null;
    const t = e.anchorNode;
    return t ? c.isElement(t) ? t : t.parentElement : null;
  }
  /**
   * Returns selection offset according to the anchor node
   * {@link https://developer.mozilla.org/ru/docs/Web/API/Selection/anchorOffset}
   *
   * @returns {number|null}
   */
  static get anchorOffset() {
    const e = window.getSelection();
    return e ? e.anchorOffset : null;
  }
  /**
   * Is current selection range collapsed
   *
   * @returns {boolean|null}
   */
  static get isCollapsed() {
    const e = window.getSelection();
    return e ? e.isCollapsed : null;
  }
  /**
   * Check current selection if it is at Editor's zone
   *
   * @returns {boolean}
   */
  static get isAtEditor() {
    return this.isSelectionAtEditor(b.get());
  }
  /**
   * Check if passed selection is at Editor's zone
   *
   * @param selection - Selection object to check
   */
  static isSelectionAtEditor(e) {
    if (!e)
      return !1;
    let t = e.anchorNode || e.focusNode;
    t && t.nodeType === Node.TEXT_NODE && (t = t.parentNode);
    let o = null;
    return t && t instanceof Element && (o = t.closest(`.${b.CSS.editorZone}`)), o ? o.nodeType === Node.ELEMENT_NODE : !1;
  }
  /**
   * Check if passed range at Editor zone
   *
   * @param range - range to check
   */
  static isRangeAtEditor(e) {
    if (!e)
      return;
    let t = e.startContainer;
    t && t.nodeType === Node.TEXT_NODE && (t = t.parentNode);
    let o = null;
    return t && t instanceof Element && (o = t.closest(`.${b.CSS.editorZone}`)), o ? o.nodeType === Node.ELEMENT_NODE : !1;
  }
  /**
   * Methods return boolean that true if selection exists on the page
   */
  static get isSelectionExists() {
    return !!b.get().anchorNode;
  }
  /**
   * Return first range
   *
   * @returns {Range|null}
   */
  static get range() {
    return this.getRangeFromSelection(this.get());
  }
  /**
   * Returns range from passed Selection object
   *
   * @param selection - Selection object to get Range from
   */
  static getRangeFromSelection(e) {
    return e && e.rangeCount ? e.getRangeAt(0) : null;
  }
  /**
   * Calculates position and size of selected text
   *
   * @returns {DOMRect | ClientRect}
   */
  static get rect() {
    let e = document.selection, t, o = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    if (e && e.type !== "Control")
      return e = e, t = e.createRange(), o.x = t.boundingLeft, o.y = t.boundingTop, o.width = t.boundingWidth, o.height = t.boundingHeight, o;
    if (!window.getSelection)
      return T("Method window.getSelection is not supported", "warn"), o;
    if (e = window.getSelection(), e.rangeCount === null || isNaN(e.rangeCount))
      return T("Method SelectionUtils.rangeCount is not supported", "warn"), o;
    if (e.rangeCount === 0)
      return o;
    if (t = e.getRangeAt(0).cloneRange(), t.getBoundingClientRect && (o = t.getBoundingClientRect()), o.x === 0 && o.y === 0) {
      const i = document.createElement("span");
      if (i.getBoundingClientRect) {
        i.appendChild(document.createTextNode("​")), t.insertNode(i), o = i.getBoundingClientRect();
        const n = i.parentNode;
        n.removeChild(i), n.normalize();
      }
    }
    return o;
  }
  /**
   * Returns selected text as String
   *
   * @returns {string}
   */
  static get text() {
    return window.getSelection ? window.getSelection().toString() : "";
  }
  /**
   * Returns window SelectionUtils
   * {@link https://developer.mozilla.org/ru/docs/Web/API/Window/getSelection}
   *
   * @returns {Selection}
   */
  static get() {
    return window.getSelection();
  }
  /**
   * Set focus to contenteditable or native input element
   *
   * @param element - element where to set focus
   * @param offset - offset of cursor
   */
  static setCursor(e, t = 0) {
    const o = document.createRange(), i = window.getSelection();
    return c.isNativeInput(e) ? c.canSetCaret(e) ? (e.focus(), e.selectionStart = e.selectionEnd = t, e.getBoundingClientRect()) : void 0 : (o.setStart(e, t), o.setEnd(e, t), i.removeAllRanges(), i.addRange(o), o.getBoundingClientRect());
  }
  /**
   * Check if current range exists and belongs to container
   *
   * @param container - where range should be
   */
  static isRangeInsideContainer(e) {
    const t = b.range;
    return t === null ? !1 : e.contains(t.startContainer);
  }
  /**
   * Adds fake cursor to the current range
   */
  static addFakeCursor() {
    const e = b.range;
    if (e === null)
      return;
    const t = c.make("span", "codex-editor__fake-cursor");
    t.dataset.mutationFree = "true", e.collapse(), e.insertNode(t);
  }
  /**
   * Check if passed element contains a fake cursor
   *
   * @param el - where to check
   */
  static isFakeCursorInsideContainer(e) {
    return c.find(e, ".codex-editor__fake-cursor") !== null;
  }
  /**
   * Removes fake cursor from a container
   *
   * @param container - container to look for
   */
  static removeFakeCursor(e = document.body) {
    const t = c.find(e, ".codex-editor__fake-cursor");
    t && t.remove();
  }
  /**
   * Removes fake background
   */
  removeFakeBackground() {
    this.isFakeBackgroundEnabled && (this.isFakeBackgroundEnabled = !1, document.execCommand(this.commandRemoveFormat));
  }
  /**
   * Sets fake background
   */
  setFakeBackground() {
    document.execCommand(this.commandBackground, !1, "#a8d6ff"), this.isFakeBackgroundEnabled = !0;
  }
  /**
   * Save SelectionUtils's range
   */
  save() {
    this.savedSelectionRange = b.range;
  }
  /**
   * Restore saved SelectionUtils's range
   */
  restore() {
    if (!this.savedSelectionRange)
      return;
    const e = window.getSelection();
    e.removeAllRanges(), e.addRange(this.savedSelectionRange);
  }
  /**
   * Clears saved selection
   */
  clearSaved() {
    this.savedSelectionRange = null;
  }
  /**
   * Collapse current selection
   */
  collapseToEnd() {
    const e = window.getSelection(), t = document.createRange();
    t.selectNodeContents(e.focusNode), t.collapse(!1), e.removeAllRanges(), e.addRange(t);
  }
  /**
   * Looks ahead to find passed tag from current selection
   *
   * @param  {string} tagName       - tag to found
   * @param  {string} [className]   - tag's class name
   * @param  {number} [searchDepth] - count of tags that can be included. For better performance.
   * @returns {HTMLElement|null}
   */
  findParentTag(e, t, o = 10) {
    const i = window.getSelection();
    let n = null;
    return !i || !i.anchorNode || !i.focusNode ? null : ([
      /** the Node in which the selection begins */
      i.anchorNode,
      /** the Node in which the selection ends */
      i.focusNode
    ].forEach((a) => {
      let l = o;
      for (; l > 0 && a.parentNode && !(a.tagName === e && (n = a, t && a.classList && !a.classList.contains(t) && (n = null), n)); )
        a = a.parentNode, l--;
    }), n);
  }
  /**
   * Expands selection range to the passed parent node
   *
   * @param {HTMLElement} element - element which contents should be selected
   */
  expandToTag(e) {
    const t = window.getSelection();
    t.removeAllRanges();
    const o = document.createRange();
    o.selectNodeContents(e), t.addRange(o);
  }
}
function Qt(s, e) {
  const { type: t, target: o, addedNodes: i, removedNodes: n } = s;
  if (o === e)
    return !0;
  if (["characterData", "attributes"].includes(t)) {
    const l = o.nodeType === Node.TEXT_NODE ? o.parentNode : o;
    return e.contains(l);
  }
  const r = Array.from(i).some((l) => e.contains(l)), a = Array.from(n).some((l) => e.contains(l));
  return r || a;
}
const Ae = "redactor dom changed", pt = "block changed", ft = "fake cursor is about to be toggled", gt = "fake cursor have been set";
function ot(s, e) {
  return s.mergeable && s.name === e.name;
}
function eo(s, e) {
  const t = e == null ? void 0 : e.export;
  return M(t) ? t(s) : G(t) ? s[t] : (t !== void 0 && T("Conversion «export» property must be a string or function. String means key of saved data object to export. Function should export processed string to export."), "");
}
function to(s, e) {
  const t = e == null ? void 0 : e.import;
  return M(t) ? t(s) : G(t) ? {
    [t]: s
  } : (t !== void 0 && T("Conversion «import» property must be a string or function. String means key of tool data to import. Function accepts a imported string and return composed tool data."), {});
}
var X = /* @__PURE__ */ ((s) => (s.APPEND_CALLBACK = "appendCallback", s.RENDERED = "rendered", s.MOVED = "moved", s.UPDATED = "updated", s.REMOVED = "removed", s.ON_PASTE = "onPaste", s))(X || {});
class R extends Ee {
  /**
   * @param options - block constructor options
   * @param [options.id] - block's id. Will be generated if omitted.
   * @param options.data - Tool's initial data
   * @param options.tool — block's tool
   * @param options.api - Editor API module for pass it to the Block Tunes
   * @param options.readOnly - Read-Only flag
   * @param [eventBus] - Editor common event bus. Allows to subscribe on some Editor events. Could be omitted when "virtual" Block is created. See BlocksAPI@composeBlockData.
   */
  constructor({
    id: e = Yt(),
    data: t,
    tool: o,
    api: i,
    readOnly: n,
    tunesData: r
  }, a) {
    super(), this.cachedInputs = [], this.toolRenderedElement = null, this.tunesInstances = /* @__PURE__ */ new Map(), this.defaultTunesInstances = /* @__PURE__ */ new Map(), this.unavailableTunesData = {}, this.inputIndex = 0, this.editorEventBus = null, this.handleFocus = () => {
      this.dropInputsCache(), this.updateCurrentInput();
    }, this.didMutated = (l = void 0) => {
      const d = l === void 0, u = l instanceof InputEvent;
      !d && !u && this.detectToolRootChange(l);
      let h;
      d || u ? h = !0 : h = !(l.length > 0 && l.every((x) => {
        const { addedNodes: p, removedNodes: m, target: L } = x;
        return [
          ...Array.from(p),
          ...Array.from(m),
          L
        ].some((S) => (c.isElement(S) || (S = S.parentElement), S && S.closest('[data-mutation-free="true"]') !== null));
      })), h && (this.dropInputsCache(), this.updateCurrentInput(), this.call(
        "updated"
        /* UPDATED */
      ), this.emit("didMutated", this));
    }, this.name = o.name, this.id = e, this.settings = o.settings, this.config = o.settings.config || {}, this.api = i, this.editorEventBus = a || null, this.blockAPI = new ee(this), this.tool = o, this.toolInstance = o.create(t, this.blockAPI, n), this.tunes = o.tunes, this.composeTunes(r), this.holder = this.compose(), window.requestIdleCallback(() => {
      this.watchBlockMutations(), this.addInputEvents();
    });
  }
  /**
   * CSS classes for the Block
   *
   * @returns {{wrapper: string, content: string}}
   */
  static get CSS() {
    return {
      wrapper: "ce-block",
      wrapperStretched: "ce-block--stretched",
      content: "ce-block__content",
      selected: "ce-block--selected",
      dropTarget: "ce-block--drop-target"
    };
  }
  /**
   * Find and return all editable elements (contenteditable and native inputs) in the Tool HTML
   *
   * @returns {HTMLElement[]}
   */
  get inputs() {
    if (this.cachedInputs.length !== 0)
      return this.cachedInputs;
    const e = c.findAllInputs(this.holder);
    return this.inputIndex > e.length - 1 && (this.inputIndex = e.length - 1), this.cachedInputs = e, e;
  }
  /**
   * Return current Tool`s input
   *
   * @returns {HTMLElement}
   */
  get currentInput() {
    return this.inputs[this.inputIndex];
  }
  /**
   * Set input index to the passed element
   *
   * @param {HTMLElement | Node} element - HTML Element to set as current input
   */
  set currentInput(e) {
    const t = this.inputs.findIndex((o) => o === e || o.contains(e));
    t !== -1 && (this.inputIndex = t);
  }
  /**
   * Return first Tool`s input
   *
   * @returns {HTMLElement}
   */
  get firstInput() {
    return this.inputs[0];
  }
  /**
   * Return first Tool`s input
   *
   * @returns {HTMLElement}
   */
  get lastInput() {
    const e = this.inputs;
    return e[e.length - 1];
  }
  /**
   * Return next Tool`s input or undefined if it doesn't exist
   *
   * @returns {HTMLElement}
   */
  get nextInput() {
    return this.inputs[this.inputIndex + 1];
  }
  /**
   * Return previous Tool`s input or undefined if it doesn't exist
   *
   * @returns {HTMLElement}
   */
  get previousInput() {
    return this.inputs[this.inputIndex - 1];
  }
  /**
   * Get Block's JSON data
   *
   * @returns {object}
   */
  get data() {
    return this.save().then((e) => e && !W(e.data) ? e.data : {});
  }
  /**
   * Returns tool's sanitizer config
   *
   * @returns {object}
   */
  get sanitize() {
    return this.tool.sanitizeConfig;
  }
  /**
   * is block mergeable
   * We plugin have merge function then we call it mergeable
   *
   * @returns {boolean}
   */
  get mergeable() {
    return M(this.toolInstance.merge);
  }
  /**
   * If Block contains inputs, it is focusable
   */
  get focusable() {
    return this.inputs.length !== 0;
  }
  /**
   * Check block for emptiness
   *
   * @returns {boolean}
   */
  get isEmpty() {
    const e = c.isEmpty(this.pluginsContent, "/"), t = !this.hasMedia;
    return e && t;
  }
  /**
   * Check if block has a media content such as images, iframe and other
   *
   * @returns {boolean}
   */
  get hasMedia() {
    const e = [
      "img",
      "iframe",
      "video",
      "audio",
      "source",
      "input",
      "textarea",
      "twitterwidget"
    ];
    return !!this.holder.querySelector(e.join(","));
  }
  /**
   * Set selected state
   * We don't need to mark Block as Selected when it is empty
   *
   * @param {boolean} state - 'true' to select, 'false' to remove selection
   */
  set selected(e) {
    var i, n;
    this.holder.classList.toggle(R.CSS.selected, e);
    const t = e === !0 && b.isRangeInsideContainer(this.holder), o = e === !1 && b.isFakeCursorInsideContainer(this.holder);
    (t || o) && ((i = this.editorEventBus) == null || i.emit(ft, { state: e }), t ? b.addFakeCursor() : b.removeFakeCursor(this.holder), (n = this.editorEventBus) == null || n.emit(gt, { state: e }));
  }
  /**
   * Returns True if it is Selected
   *
   * @returns {boolean}
   */
  get selected() {
    return this.holder.classList.contains(R.CSS.selected);
  }
  /**
   * Set stretched state
   *
   * @param {boolean} state - 'true' to enable, 'false' to disable stretched state
   */
  set stretched(e) {
    this.holder.classList.toggle(R.CSS.wrapperStretched, e);
  }
  /**
   * Return Block's stretched state
   *
   * @returns {boolean}
   */
  get stretched() {
    return this.holder.classList.contains(R.CSS.wrapperStretched);
  }
  /**
   * Toggle drop target state
   *
   * @param {boolean} state - 'true' if block is drop target, false otherwise
   */
  set dropTarget(e) {
    this.holder.classList.toggle(R.CSS.dropTarget, e);
  }
  /**
   * Returns Plugins content
   *
   * @returns {HTMLElement}
   */
  get pluginsContent() {
    return this.toolRenderedElement;
  }
  /**
   * Calls Tool's method
   *
   * Method checks tool property {MethodName}. Fires method with passes params If it is instance of Function
   *
   * @param {string} methodName - method to call
   * @param {object} params - method argument
   */
  call(e, t) {
    if (M(this.toolInstance[e])) {
      e === "appendCallback" && T(
        "`appendCallback` hook is deprecated and will be removed in the next major release. Use `rendered` hook instead",
        "warn"
      );
      try {
        this.toolInstance[e].call(this.toolInstance, t);
      } catch (o) {
        T(`Error during '${e}' call: ${o.message}`, "error");
      }
    }
  }
  /**
   * Call plugins merge method
   *
   * @param {BlockToolData} data - data to merge
   */
  async mergeWith(e) {
    await this.toolInstance.merge(e);
  }
  /**
   * Extracts data from Block
   * Groups Tool's save processing time
   *
   * @returns {object}
   */
  async save() {
    const e = await this.toolInstance.save(this.pluginsContent), t = this.unavailableTunesData;
    [
      ...this.tunesInstances.entries(),
      ...this.defaultTunesInstances.entries()
    ].forEach(([n, r]) => {
      if (M(r.save))
        try {
          t[n] = r.save();
        } catch (a) {
          T(`Tune ${r.constructor.name} save method throws an Error %o`, "warn", a);
        }
    });
    const o = window.performance.now();
    let i;
    return Promise.resolve(e).then((n) => (i = window.performance.now(), {
      id: this.id,
      tool: this.name,
      data: n,
      tunes: t,
      time: i - o
    })).catch((n) => {
      T(`Saving process for ${this.name} tool failed due to the ${n}`, "log", "red");
    });
  }
  /**
   * Uses Tool's validation method to check the correctness of output data
   * Tool's validation method is optional
   *
   * @description Method returns true|false whether data passed the validation or not
   * @param {BlockToolData} data - data to validate
   * @returns {Promise<boolean>} valid
   */
  async validate(e) {
    let t = !0;
    return this.toolInstance.validate instanceof Function && (t = await this.toolInstance.validate(e)), t;
  }
  /**
   * Returns data to render in tunes menu.
   * Splits block tunes settings into 2 groups: popover items and custom html.
   */
  getTunes() {
    const e = document.createElement("div"), t = [], o = typeof this.toolInstance.renderSettings == "function" ? this.toolInstance.renderSettings() : [], i = [
      ...this.tunesInstances.values(),
      ...this.defaultTunesInstances.values()
    ].map((n) => n.render());
    return [o, i].flat().forEach((n) => {
      c.isElement(n) ? e.appendChild(n) : Array.isArray(n) ? t.push(...n) : t.push(n);
    }), [t, e];
  }
  /**
   * Update current input index with selection anchor node
   */
  updateCurrentInput() {
    this.currentInput = c.isNativeInput(document.activeElement) || !b.anchorNode ? document.activeElement : b.anchorNode;
  }
  /**
   * Allows to say Editor that Block was changed. Used to manually trigger Editor's 'onChange' callback
   * Can be useful for block changes invisible for editor core.
   */
  dispatchChange() {
    this.didMutated();
  }
  /**
   * Call Tool instance destroy method
   */
  destroy() {
    this.unwatchBlockMutations(), this.removeInputEvents(), super.destroy(), M(this.toolInstance.destroy) && this.toolInstance.destroy();
  }
  /**
   * Tool could specify several entries to be displayed at the Toolbox (for example, "Heading 1", "Heading 2", "Heading 3")
   * This method returns the entry that is related to the Block (depended on the Block data)
   */
  async getActiveToolboxEntry() {
    const e = this.tool.toolbox;
    if (e.length === 1)
      return Promise.resolve(this.tool.toolbox[0]);
    const t = await this.data;
    return e.find((i) => Object.entries(i.data).some(([n, r]) => t[n] && Vt(t[n], r)));
  }
  /**
   * Exports Block data as string using conversion config
   */
  async exportDataAsString() {
    const e = await this.data;
    return eo(e, this.tool.conversionConfig);
  }
  /**
   * Make default Block wrappers and put Tool`s content there
   *
   * @returns {HTMLDivElement}
   */
  compose() {
    const e = c.make("div", R.CSS.wrapper), t = c.make("div", R.CSS.content), o = this.toolInstance.render();
    e.dataset.id = this.id, this.toolRenderedElement = o, t.appendChild(this.toolRenderedElement);
    let i = t;
    return [...this.tunesInstances.values(), ...this.defaultTunesInstances.values()].forEach((n) => {
      if (M(n.wrap))
        try {
          i = n.wrap(i);
        } catch (r) {
          T(`Tune ${n.constructor.name} wrap method throws an Error %o`, "warn", r);
        }
    }), e.appendChild(i), e;
  }
  /**
   * Instantiate Block Tunes
   *
   * @param tunesData - current Block tunes data
   * @private
   */
  composeTunes(e) {
    Array.from(this.tunes.values()).forEach((t) => {
      (t.isInternal ? this.defaultTunesInstances : this.tunesInstances).set(t.name, t.create(e[t.name], this.blockAPI));
    }), Object.entries(e).forEach(([t, o]) => {
      this.tunesInstances.has(t) || (this.unavailableTunesData[t] = o);
    });
  }
  /**
   * Adds focus event listeners to all inputs and contenteditable
   */
  addInputEvents() {
    this.inputs.forEach((e) => {
      e.addEventListener("focus", this.handleFocus), c.isNativeInput(e) && e.addEventListener("input", this.didMutated);
    });
  }
  /**
   * removes focus event listeners from all inputs and contenteditable
   */
  removeInputEvents() {
    this.inputs.forEach((e) => {
      e.removeEventListener("focus", this.handleFocus), c.isNativeInput(e) && e.removeEventListener("input", this.didMutated);
    });
  }
  /**
   * Listen common editor Dom Changed event and detect mutations related to the  Block
   */
  watchBlockMutations() {
    var e;
    this.redactorDomChangedCallback = (t) => {
      const { mutations: o } = t;
      o.some((n) => Qt(n, this.toolRenderedElement)) && this.didMutated(o);
    }, (e = this.editorEventBus) == null || e.on(Ae, this.redactorDomChangedCallback);
  }
  /**
   * Remove redactor dom change event listener
   */
  unwatchBlockMutations() {
    var e;
    (e = this.editorEventBus) == null || e.off(Ae, this.redactorDomChangedCallback);
  }
  /**
   * Sometimes Tool can replace own main element, for example H2 -> H4 or UL -> OL
   * We need to detect such changes and update a link to tools main element with the new one
   *
   * @param mutations - records of block content mutations
   */
  detectToolRootChange(e) {
    e.forEach((t) => {
      if (Array.from(t.removedNodes).includes(this.toolRenderedElement)) {
        const i = t.addedNodes[t.addedNodes.length - 1];
        this.toolRenderedElement = i;
      }
    });
  }
  /**
   * Clears inputs cached value
   */
  dropInputsCache() {
    this.cachedInputs = [];
  }
}
class oo extends y {
  constructor() {
    super(...arguments), this.insert = (e = this.config.defaultBlock, t = {}, o = {}, i, n, r, a) => {
      const l = this.Editor.BlockManager.insert({
        id: a,
        tool: e,
        data: t,
        index: i,
        needToFocus: n,
        replace: r
      });
      return new ee(l);
    }, this.composeBlockData = async (e) => {
      const t = this.Editor.Tools.blockTools.get(e);
      return new R({
        tool: t,
        api: this.Editor.API,
        readOnly: !0,
        data: {},
        tunesData: {}
      }).data;
    }, this.update = async (e, t) => {
      const { BlockManager: o } = this.Editor, i = o.getBlockById(e);
      if (i === void 0)
        throw new Error(`Block with id "${e}" not found`);
      const n = await o.update(i, t);
      return new ee(n);
    }, this.convert = (e, t, o) => {
      var h, f;
      const { BlockManager: i, Tools: n } = this.Editor, r = i.getBlockById(e);
      if (!r)
        throw new Error(`Block with id "${e}" not found`);
      const a = n.blockTools.get(r.name), l = n.blockTools.get(t);
      if (!l)
        throw new Error(`Block Tool with type "${t}" not found`);
      const d = ((h = a == null ? void 0 : a.conversionConfig) == null ? void 0 : h.export) !== void 0, u = ((f = l.conversionConfig) == null ? void 0 : f.import) !== void 0;
      if (d && u)
        i.convert(r, t, o);
      else {
        const x = [
          d ? !1 : re(r.name),
          u ? !1 : re(t)
        ].filter(Boolean).join(" and ");
        throw new Error(`Conversion from "${r.name}" to "${t}" is not possible. ${x} tool(s) should provide a "conversionConfig"`);
      }
    }, this.insertMany = (e, t = this.Editor.BlockManager.blocks.length - 1) => {
      this.validateIndex(t);
      const o = e.map(({ id: i, type: n, data: r }) => this.Editor.BlockManager.composeBlock({
        id: i,
        tool: n || this.config.defaultBlock,
        data: r
      }));
      return this.Editor.BlockManager.insertMany(o, t), o.map((i) => new ee(i));
    };
  }
  /**
   * Available methods
   *
   * @returns {Blocks}
   */
  get methods() {
    return {
      clear: () => this.clear(),
      render: (e) => this.render(e),
      renderFromHTML: (e) => this.renderFromHTML(e),
      delete: (e) => this.delete(e),
      swap: (e, t) => this.swap(e, t),
      move: (e, t) => this.move(e, t),
      getBlockByIndex: (e) => this.getBlockByIndex(e),
      getById: (e) => this.getById(e),
      getCurrentBlockIndex: () => this.getCurrentBlockIndex(),
      getBlockIndex: (e) => this.getBlockIndex(e),
      getBlocksCount: () => this.getBlocksCount(),
      stretchBlock: (e, t = !0) => this.stretchBlock(e, t),
      insertNewBlock: () => this.insertNewBlock(),
      insert: this.insert,
      insertMany: this.insertMany,
      update: this.update,
      composeBlockData: this.composeBlockData,
      convert: this.convert
    };
  }
  /**
   * Returns Blocks count
   *
   * @returns {number}
   */
  getBlocksCount() {
    return this.Editor.BlockManager.blocks.length;
  }
  /**
   * Returns current block index
   *
   * @returns {number}
   */
  getCurrentBlockIndex() {
    return this.Editor.BlockManager.currentBlockIndex;
  }
  /**
   * Returns the index of Block by id;
   *
   * @param id - block id
   */
  getBlockIndex(e) {
    const t = this.Editor.BlockManager.getBlockById(e);
    if (!t) {
      Y("There is no block with id `" + e + "`", "warn");
      return;
    }
    return this.Editor.BlockManager.getBlockIndex(t);
  }
  /**
   * Returns BlockAPI object by Block index
   *
   * @param {number} index - index to get
   */
  getBlockByIndex(e) {
    const t = this.Editor.BlockManager.getBlockByIndex(e);
    if (t === void 0) {
      Y("There is no block at index `" + e + "`", "warn");
      return;
    }
    return new ee(t);
  }
  /**
   * Returns BlockAPI object by Block id
   *
   * @param id - id of block to get
   */
  getById(e) {
    const t = this.Editor.BlockManager.getBlockById(e);
    return t === void 0 ? (Y("There is no block with id `" + e + "`", "warn"), null) : new ee(t);
  }
  /**
   * Call Block Manager method that swap Blocks
   *
   * @param {number} fromIndex - position of first Block
   * @param {number} toIndex - position of second Block
   * @deprecated — use 'move' instead
   */
  swap(e, t) {
    T(
      "`blocks.swap()` method is deprecated and will be removed in the next major release. Use `block.move()` method instead",
      "info"
    ), this.Editor.BlockManager.swap(e, t);
  }
  /**
   * Move block from one index to another
   *
   * @param {number} toIndex - index to move to
   * @param {number} fromIndex - index to move from
   */
  move(e, t) {
    this.Editor.BlockManager.move(e, t);
  }
  /**
   * Deletes Block
   *
   * @param {number} blockIndex - index of Block to delete
   */
  delete(e = this.Editor.BlockManager.currentBlockIndex) {
    try {
      const t = this.Editor.BlockManager.getBlockByIndex(e);
      this.Editor.BlockManager.removeBlock(t);
    } catch (t) {
      Y(t, "warn");
      return;
    }
    this.Editor.BlockManager.blocks.length === 0 && this.Editor.BlockManager.insert(), this.Editor.BlockManager.currentBlock && this.Editor.Caret.setToBlock(this.Editor.BlockManager.currentBlock, this.Editor.Caret.positions.END), this.Editor.Toolbar.close();
  }
  /**
   * Clear Editor's area
   */
  async clear() {
    await this.Editor.BlockManager.clear(!0), this.Editor.InlineToolbar.close();
  }
  /**
   * Fills Editor with Blocks data
   *
   * @param {OutputData} data — Saved Editor data
   */
  async render(e) {
    if (e === void 0 || e.blocks === void 0)
      throw new Error("Incorrect data passed to the render() method");
    this.Editor.ModificationsObserver.disable(), await this.Editor.BlockManager.clear(), await this.Editor.Renderer.render(e.blocks), this.Editor.ModificationsObserver.enable();
  }
  /**
   * Render passed HTML string
   *
   * @param {string} data - HTML string to render
   * @returns {Promise<void>}
   */
  renderFromHTML(e) {
    return this.Editor.BlockManager.clear(), this.Editor.Paste.processText(e, !0);
  }
  /**
   * Stretch Block's content
   *
   * @param {number} index - index of Block to stretch
   * @param {boolean} status - true to enable, false to disable
   * @deprecated Use BlockAPI interface to stretch Blocks
   */
  stretchBlock(e, t = !0) {
    Le(
      !0,
      "blocks.stretchBlock()",
      "BlockAPI"
    );
    const o = this.Editor.BlockManager.getBlockByIndex(e);
    o && (o.stretched = t);
  }
  /**
   * Insert new Block
   * After set caret to this Block
   *
   * @todo remove in 3.0.0
   * @deprecated with insert() method
   */
  insertNewBlock() {
    T("Method blocks.insertNewBlock() is deprecated and it will be removed in the next major release. Use blocks.insert() instead.", "warn"), this.insert();
  }
  /**
   * Validated block index and throws an error if it's invalid
   *
   * @param index - index to validate
   */
  validateIndex(e) {
    if (typeof e != "number")
      throw new Error("Index should be a number");
    if (e < 0)
      throw new Error("Index should be greater than or equal to 0");
    if (e === null)
      throw new Error("Index should be greater than or equal to 0");
  }
}
class io extends y {
  constructor() {
    super(...arguments), this.setToFirstBlock = (e = this.Editor.Caret.positions.DEFAULT, t = 0) => this.Editor.BlockManager.firstBlock ? (this.Editor.Caret.setToBlock(this.Editor.BlockManager.firstBlock, e, t), !0) : !1, this.setToLastBlock = (e = this.Editor.Caret.positions.DEFAULT, t = 0) => this.Editor.BlockManager.lastBlock ? (this.Editor.Caret.setToBlock(this.Editor.BlockManager.lastBlock, e, t), !0) : !1, this.setToPreviousBlock = (e = this.Editor.Caret.positions.DEFAULT, t = 0) => this.Editor.BlockManager.previousBlock ? (this.Editor.Caret.setToBlock(this.Editor.BlockManager.previousBlock, e, t), !0) : !1, this.setToNextBlock = (e = this.Editor.Caret.positions.DEFAULT, t = 0) => this.Editor.BlockManager.nextBlock ? (this.Editor.Caret.setToBlock(this.Editor.BlockManager.nextBlock, e, t), !0) : !1, this.setToBlock = (e, t = this.Editor.Caret.positions.DEFAULT, o = 0) => this.Editor.BlockManager.blocks[e] ? (this.Editor.Caret.setToBlock(this.Editor.BlockManager.blocks[e], t, o), !0) : !1, this.focus = (e = !1) => e ? this.setToLastBlock(this.Editor.Caret.positions.END) : this.setToFirstBlock(this.Editor.Caret.positions.START);
  }
  /**
   * Available methods
   *
   * @returns {Caret}
   */
  get methods() {
    return {
      setToFirstBlock: this.setToFirstBlock,
      setToLastBlock: this.setToLastBlock,
      setToPreviousBlock: this.setToPreviousBlock,
      setToNextBlock: this.setToNextBlock,
      setToBlock: this.setToBlock,
      focus: this.focus
    };
  }
}
class no extends y {
  /**
   * Available methods
   *
   * @returns {Events}
   */
  get methods() {
    return {
      emit: (e, t) => this.emit(e, t),
      off: (e, t) => this.off(e, t),
      on: (e, t) => this.on(e, t)
    };
  }
  /**
   * Subscribe on Events
   *
   * @param {string} eventName - event name to subscribe
   * @param {Function} callback - event handler
   */
  on(e, t) {
    this.eventsDispatcher.on(e, t);
  }
  /**
   * Emit event with data
   *
   * @param {string} eventName - event to emit
   * @param {object} data - event's data
   */
  emit(e, t) {
    this.eventsDispatcher.emit(e, t);
  }
  /**
   * Unsubscribe from Event
   *
   * @param {string} eventName - event to unsubscribe
   * @param {Function} callback - event handler
   */
  off(e, t) {
    this.eventsDispatcher.off(e, t);
  }
}
class He extends y {
  /**
   * Return namespace section for tool or block tune
   *
   * @param tool - tool object
   */
  static getNamespace(e) {
    return e.isTune() ? `blockTunes.${e.name}` : `tools.${e.name}`;
  }
  /**
   * Return I18n API methods with global dictionary access
   */
  get methods() {
    return {
      t: () => {
        Y("I18n.t() method can be accessed only from Tools", "warn");
      }
    };
  }
  /**
   * Return I18n API methods with tool namespaced dictionary
   *
   * @param tool - Tool object
   */
  getMethodsForTool(e) {
    return Object.assign(
      this.methods,
      {
        t: (t) => z.t(He.getNamespace(e), t)
      }
    );
  }
}
class so extends y {
  /**
   * Editor.js Core API modules
   */
  get methods() {
    return {
      blocks: this.Editor.BlocksAPI.methods,
      caret: this.Editor.CaretAPI.methods,
      events: this.Editor.EventsAPI.methods,
      listeners: this.Editor.ListenersAPI.methods,
      notifier: this.Editor.NotifierAPI.methods,
      sanitizer: this.Editor.SanitizerAPI.methods,
      saver: this.Editor.SaverAPI.methods,
      selection: this.Editor.SelectionAPI.methods,
      styles: this.Editor.StylesAPI.classes,
      toolbar: this.Editor.ToolbarAPI.methods,
      inlineToolbar: this.Editor.InlineToolbarAPI.methods,
      tooltip: this.Editor.TooltipAPI.methods,
      i18n: this.Editor.I18nAPI.methods,
      readOnly: this.Editor.ReadOnlyAPI.methods,
      ui: this.Editor.UiAPI.methods
    };
  }
  /**
   * Returns Editor.js Core API methods for passed tool
   *
   * @param tool - tool object
   */
  getMethodsForTool(e) {
    return Object.assign(
      this.methods,
      {
        i18n: this.Editor.I18nAPI.getMethodsForTool(e)
      }
    );
  }
}
class ro extends y {
  /**
   * Available methods
   *
   * @returns {InlineToolbar}
   */
  get methods() {
    return {
      close: () => this.close(),
      open: () => this.open()
    };
  }
  /**
   * Open Inline Toolbar
   */
  open() {
    this.Editor.InlineToolbar.tryToShow();
  }
  /**
   * Close Inline Toolbar
   */
  close() {
    this.Editor.InlineToolbar.close();
  }
}
class ao extends y {
  /**
   * Available methods
   *
   * @returns {Listeners}
   */
  get methods() {
    return {
      on: (e, t, o, i) => this.on(e, t, o, i),
      off: (e, t, o, i) => this.off(e, t, o, i),
      offById: (e) => this.offById(e)
    };
  }
  /**
   * Ads a DOM event listener. Return it's id.
   *
   * @param {HTMLElement} element - Element to set handler to
   * @param {string} eventType - event type
   * @param {() => void} handler - event handler
   * @param {boolean} useCapture - capture event or not
   */
  on(e, t, o, i) {
    return this.listeners.on(e, t, o, i);
  }
  /**
   * Removes DOM listener from element
   *
   * @param {Element} element - Element to remove handler from
   * @param eventType - event type
   * @param handler - event handler
   * @param {boolean} useCapture - capture event or not
   */
  off(e, t, o, i) {
    this.listeners.off(e, t, o, i);
  }
  /**
   * Removes DOM listener by the listener id
   *
   * @param id - id of the listener to remove
   */
  offById(e) {
    this.listeners.offById(e);
  }
}
var _e = {}, lo = {
  get exports() {
    return _e;
  },
  set exports(s) {
    _e = s;
  }
};
(function(s, e) {
  (function(t, o) {
    s.exports = o();
  })(window, function() {
    return function(t) {
      var o = {};
      function i(n) {
        if (o[n])
          return o[n].exports;
        var r = o[n] = { i: n, l: !1, exports: {} };
        return t[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports;
      }
      return i.m = t, i.c = o, i.d = function(n, r, a) {
        i.o(n, r) || Object.defineProperty(n, r, { enumerable: !0, get: a });
      }, i.r = function(n) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n, "__esModule", { value: !0 });
      }, i.t = function(n, r) {
        if (1 & r && (n = i(n)), 8 & r || 4 & r && typeof n == "object" && n && n.__esModule)
          return n;
        var a = /* @__PURE__ */ Object.create(null);
        if (i.r(a), Object.defineProperty(a, "default", { enumerable: !0, value: n }), 2 & r && typeof n != "string")
          for (var l in n)
            i.d(a, l, function(d) {
              return n[d];
            }.bind(null, l));
        return a;
      }, i.n = function(n) {
        var r = n && n.__esModule ? function() {
          return n.default;
        } : function() {
          return n;
        };
        return i.d(r, "a", r), r;
      }, i.o = function(n, r) {
        return Object.prototype.hasOwnProperty.call(n, r);
      }, i.p = "/", i(i.s = 0);
    }([function(t, o, i) {
      i(1), /*!
       * Codex JavaScript Notification module
       * https://github.com/codex-team/js-notifier
       */
      t.exports = function() {
        var n = i(6), r = "cdx-notify--bounce-in", a = null;
        return { show: function(l) {
          if (l.message) {
            (function() {
              if (a)
                return !0;
              a = n.getWrapper(), document.body.appendChild(a);
            })();
            var d = null, u = l.time || 8e3;
            switch (l.type) {
              case "confirm":
                d = n.confirm(l);
                break;
              case "prompt":
                d = n.prompt(l);
                break;
              default:
                d = n.alert(l), window.setTimeout(function() {
                  d.remove();
                }, u);
            }
            a.appendChild(d), d.classList.add(r);
          }
        } };
      }();
    }, function(t, o, i) {
      var n = i(2);
      typeof n == "string" && (n = [[t.i, n, ""]]);
      var r = { hmr: !0, transform: void 0, insertInto: void 0 };
      i(4)(n, r), n.locals && (t.exports = n.locals);
    }, function(t, o, i) {
      (t.exports = i(3)(!1)).push([t.i, `.cdx-notify--error{background:#fffbfb!important}.cdx-notify--error::before{background:#fb5d5d!important}.cdx-notify__input{max-width:130px;padding:5px 10px;background:#f7f7f7;border:0;border-radius:3px;font-size:13px;color:#656b7c;outline:0}.cdx-notify__input:-ms-input-placeholder{color:#656b7c}.cdx-notify__input::placeholder{color:#656b7c}.cdx-notify__input:focus:-ms-input-placeholder{color:rgba(101,107,124,.3)}.cdx-notify__input:focus::placeholder{color:rgba(101,107,124,.3)}.cdx-notify__button{border:none;border-radius:3px;font-size:13px;padding:5px 10px;cursor:pointer}.cdx-notify__button:last-child{margin-left:10px}.cdx-notify__button--cancel{background:#f2f5f7;box-shadow:0 2px 1px 0 rgba(16,19,29,0);color:#656b7c}.cdx-notify__button--cancel:hover{background:#eee}.cdx-notify__button--confirm{background:#34c992;box-shadow:0 1px 1px 0 rgba(18,49,35,.05);color:#fff}.cdx-notify__button--confirm:hover{background:#33b082}.cdx-notify__btns-wrapper{display:-ms-flexbox;display:flex;-ms-flex-flow:row nowrap;flex-flow:row nowrap;margin-top:5px}.cdx-notify__cross{position:absolute;top:5px;right:5px;width:10px;height:10px;padding:5px;opacity:.54;cursor:pointer}.cdx-notify__cross::after,.cdx-notify__cross::before{content:'';position:absolute;left:9px;top:5px;height:12px;width:2px;background:#575d67}.cdx-notify__cross::before{transform:rotate(-45deg)}.cdx-notify__cross::after{transform:rotate(45deg)}.cdx-notify__cross:hover{opacity:1}.cdx-notifies{position:fixed;z-index:2;bottom:20px;left:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif}.cdx-notify{position:relative;width:220px;margin-top:15px;padding:13px 16px;background:#fff;box-shadow:0 11px 17px 0 rgba(23,32,61,.13);border-radius:5px;font-size:14px;line-height:1.4em;word-wrap:break-word}.cdx-notify::before{content:'';position:absolute;display:block;top:0;left:0;width:3px;height:calc(100% - 6px);margin:3px;border-radius:5px;background:0 0}@keyframes bounceIn{0%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.05)}70%{transform:scale(.9)}100%{transform:scale(1)}}.cdx-notify--bounce-in{animation-name:bounceIn;animation-duration:.6s;animation-iteration-count:1}.cdx-notify--success{background:#fafffe!important}.cdx-notify--success::before{background:#41ffb1!important}`, ""]);
    }, function(t, o) {
      t.exports = function(i) {
        var n = [];
        return n.toString = function() {
          return this.map(function(r) {
            var a = function(l, d) {
              var u = l[1] || "", h = l[3];
              if (!h)
                return u;
              if (d && typeof btoa == "function") {
                var f = (p = h, "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(p)))) + " */"), x = h.sources.map(function(m) {
                  return "/*# sourceURL=" + h.sourceRoot + m + " */";
                });
                return [u].concat(x).concat([f]).join(`
`);
              }
              var p;
              return [u].join(`
`);
            }(r, i);
            return r[2] ? "@media " + r[2] + "{" + a + "}" : a;
          }).join("");
        }, n.i = function(r, a) {
          typeof r == "string" && (r = [[null, r, ""]]);
          for (var l = {}, d = 0; d < this.length; d++) {
            var u = this[d][0];
            typeof u == "number" && (l[u] = !0);
          }
          for (d = 0; d < r.length; d++) {
            var h = r[d];
            typeof h[0] == "number" && l[h[0]] || (a && !h[2] ? h[2] = a : a && (h[2] = "(" + h[2] + ") and (" + a + ")"), n.push(h));
          }
        }, n;
      };
    }, function(t, o, i) {
      var n, r, a = {}, l = (n = function() {
        return window && document && document.all && !window.atob;
      }, function() {
        return r === void 0 && (r = n.apply(this, arguments)), r;
      }), d = function(v) {
        var g = {};
        return function(w) {
          if (typeof w == "function")
            return w();
          if (g[w] === void 0) {
            var E = function(I) {
              return document.querySelector(I);
            }.call(this, w);
            if (window.HTMLIFrameElement && E instanceof window.HTMLIFrameElement)
              try {
                E = E.contentDocument.head;
              } catch {
                E = null;
              }
            g[w] = E;
          }
          return g[w];
        };
      }(), u = null, h = 0, f = [], x = i(5);
      function p(v, g) {
        for (var w = 0; w < v.length; w++) {
          var E = v[w], I = a[E.id];
          if (I) {
            I.refs++;
            for (var C = 0; C < I.parts.length; C++)
              I.parts[C](E.parts[C]);
            for (; C < E.parts.length; C++)
              I.parts.push(H(E.parts[C], g));
          } else {
            var O = [];
            for (C = 0; C < E.parts.length; C++)
              O.push(H(E.parts[C], g));
            a[E.id] = { id: E.id, refs: 1, parts: O };
          }
        }
      }
      function m(v, g) {
        for (var w = [], E = {}, I = 0; I < v.length; I++) {
          var C = v[I], O = g.base ? C[0] + g.base : C[0], B = { css: C[1], media: C[2], sourceMap: C[3] };
          E[O] ? E[O].parts.push(B) : w.push(E[O] = { id: O, parts: [B] });
        }
        return w;
      }
      function L(v, g) {
        var w = d(v.insertInto);
        if (!w)
          throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
        var E = f[f.length - 1];
        if (v.insertAt === "top")
          E ? E.nextSibling ? w.insertBefore(g, E.nextSibling) : w.appendChild(g) : w.insertBefore(g, w.firstChild), f.push(g);
        else if (v.insertAt === "bottom")
          w.appendChild(g);
        else {
          if (typeof v.insertAt != "object" || !v.insertAt.before)
            throw new Error(`[Style Loader]

 Invalid value for parameter 'insertAt' ('options.insertAt') found.
 Must be 'top', 'bottom', or Object.
 (https://github.com/webpack-contrib/style-loader#insertat)
`);
          var I = d(v.insertInto + " " + v.insertAt.before);
          w.insertBefore(g, I);
        }
      }
      function A(v) {
        if (v.parentNode === null)
          return !1;
        v.parentNode.removeChild(v);
        var g = f.indexOf(v);
        g >= 0 && f.splice(g, 1);
      }
      function S(v) {
        var g = document.createElement("style");
        return v.attrs.type === void 0 && (v.attrs.type = "text/css"), Z(g, v.attrs), L(v, g), g;
      }
      function Z(v, g) {
        Object.keys(g).forEach(function(w) {
          v.setAttribute(w, g[w]);
        });
      }
      function H(v, g) {
        var w, E, I, C;
        if (g.transform && v.css) {
          if (!(C = g.transform(v.css)))
            return function() {
            };
          v.css = C;
        }
        if (g.singleton) {
          var O = h++;
          w = u || (u = S(g)), E = ce.bind(null, w, O, !1), I = ce.bind(null, w, O, !0);
        } else
          v.sourceMap && typeof URL == "function" && typeof URL.createObjectURL == "function" && typeof URL.revokeObjectURL == "function" && typeof Blob == "function" && typeof btoa == "function" ? (w = function(B) {
            var j = document.createElement("link");
            return B.attrs.type === void 0 && (B.attrs.type = "text/css"), B.attrs.rel = "stylesheet", Z(j, B.attrs), L(B, j), j;
          }(g), E = function(B, j, de) {
            var Q = de.css, Ce = de.sourceMap, Ot = j.convertToAbsoluteUrls === void 0 && Ce;
            (j.convertToAbsoluteUrls || Ot) && (Q = x(Q)), Ce && (Q += `
/*# sourceMappingURL=data:application/json;base64,` + btoa(unescape(encodeURIComponent(JSON.stringify(Ce)))) + " */");
            var Nt = new Blob([Q], { type: "text/css" }), Ge = B.href;
            B.href = URL.createObjectURL(Nt), Ge && URL.revokeObjectURL(Ge);
          }.bind(null, w, g), I = function() {
            A(w), w.href && URL.revokeObjectURL(w.href);
          }) : (w = S(g), E = function(B, j) {
            var de = j.css, Q = j.media;
            if (Q && B.setAttribute("media", Q), B.styleSheet)
              B.styleSheet.cssText = de;
            else {
              for (; B.firstChild; )
                B.removeChild(B.firstChild);
              B.appendChild(document.createTextNode(de));
            }
          }.bind(null, w), I = function() {
            A(w);
          });
        return E(v), function(B) {
          if (B) {
            if (B.css === v.css && B.media === v.media && B.sourceMap === v.sourceMap)
              return;
            E(v = B);
          } else
            I();
        };
      }
      t.exports = function(v, g) {
        if (typeof DEBUG < "u" && DEBUG && typeof document != "object")
          throw new Error("The style-loader cannot be used in a non-browser environment");
        (g = g || {}).attrs = typeof g.attrs == "object" ? g.attrs : {}, g.singleton || typeof g.singleton == "boolean" || (g.singleton = l()), g.insertInto || (g.insertInto = "head"), g.insertAt || (g.insertAt = "bottom");
        var w = m(v, g);
        return p(w, g), function(E) {
          for (var I = [], C = 0; C < w.length; C++) {
            var O = w[C];
            (B = a[O.id]).refs--, I.push(B);
          }
          for (E && p(m(E, g), g), C = 0; C < I.length; C++) {
            var B;
            if ((B = I[C]).refs === 0) {
              for (var j = 0; j < B.parts.length; j++)
                B.parts[j]();
              delete a[B.id];
            }
          }
        };
      };
      var U, J = (U = [], function(v, g) {
        return U[v] = g, U.filter(Boolean).join(`
`);
      });
      function ce(v, g, w, E) {
        var I = w ? "" : E.css;
        if (v.styleSheet)
          v.styleSheet.cssText = J(g, I);
        else {
          var C = document.createTextNode(I), O = v.childNodes;
          O[g] && v.removeChild(O[g]), O.length ? v.insertBefore(C, O[g]) : v.appendChild(C);
        }
      }
    }, function(t, o) {
      t.exports = function(i) {
        var n = typeof window < "u" && window.location;
        if (!n)
          throw new Error("fixUrls requires window.location");
        if (!i || typeof i != "string")
          return i;
        var r = n.protocol + "//" + n.host, a = r + n.pathname.replace(/\/[^\/]*$/, "/");
        return i.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(l, d) {
          var u, h = d.trim().replace(/^"(.*)"$/, function(f, x) {
            return x;
          }).replace(/^'(.*)'$/, function(f, x) {
            return x;
          });
          return /^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(h) ? l : (u = h.indexOf("//") === 0 ? h : h.indexOf("/") === 0 ? r + h : a + h.replace(/^\.\//, ""), "url(" + JSON.stringify(u) + ")");
        });
      };
    }, function(t, o, i) {
      var n, r, a, l, d, u, h, f, x;
      t.exports = (n = "cdx-notifies", r = "cdx-notify", a = "cdx-notify__cross", l = "cdx-notify__button--confirm", d = "cdx-notify__button--cancel", u = "cdx-notify__input", h = "cdx-notify__button", f = "cdx-notify__btns-wrapper", { alert: x = function(p) {
        var m = document.createElement("DIV"), L = document.createElement("DIV"), A = p.message, S = p.style;
        return m.classList.add(r), S && m.classList.add(r + "--" + S), m.innerHTML = A, L.classList.add(a), L.addEventListener("click", m.remove.bind(m)), m.appendChild(L), m;
      }, confirm: function(p) {
        var m = x(p), L = document.createElement("div"), A = document.createElement("button"), S = document.createElement("button"), Z = m.querySelector("." + a), H = p.cancelHandler, U = p.okHandler;
        return L.classList.add(f), A.innerHTML = p.okText || "Confirm", S.innerHTML = p.cancelText || "Cancel", A.classList.add(h), S.classList.add(h), A.classList.add(l), S.classList.add(d), H && typeof H == "function" && (S.addEventListener("click", H), Z.addEventListener("click", H)), U && typeof U == "function" && A.addEventListener("click", U), A.addEventListener("click", m.remove.bind(m)), S.addEventListener("click", m.remove.bind(m)), L.appendChild(A), L.appendChild(S), m.appendChild(L), m;
      }, prompt: function(p) {
        var m = x(p), L = document.createElement("div"), A = document.createElement("button"), S = document.createElement("input"), Z = m.querySelector("." + a), H = p.cancelHandler, U = p.okHandler;
        return L.classList.add(f), A.innerHTML = p.okText || "Ok", A.classList.add(h), A.classList.add(l), S.classList.add(u), p.placeholder && S.setAttribute("placeholder", p.placeholder), p.default && (S.value = p.default), p.inputType && (S.type = p.inputType), H && typeof H == "function" && Z.addEventListener("click", H), U && typeof U == "function" && A.addEventListener("click", function() {
          U(S.value);
        }), A.addEventListener("click", m.remove.bind(m)), L.appendChild(S), L.appendChild(A), m.appendChild(L), m;
      }, getWrapper: function() {
        var p = document.createElement("DIV");
        return p.classList.add(n), p;
      } });
    }]);
  });
})(lo);
const co = /* @__PURE__ */ Pe(_e);
class ho {
  /**
   * Show web notification
   *
   * @param {NotifierOptions | ConfirmNotifierOptions | PromptNotifierOptions} options - notification options
   */
  show(e) {
    co.show(e);
  }
}
class uo extends y {
  /**
   * @param moduleConfiguration - Module Configuration
   * @param moduleConfiguration.config - Editor's config
   * @param moduleConfiguration.eventsDispatcher - Editor's event dispatcher
   */
  constructor({ config: e, eventsDispatcher: t }) {
    super({
      config: e,
      eventsDispatcher: t
    }), this.notifier = new ho();
  }
  /**
   * Available methods
   */
  get methods() {
    return {
      show: (e) => this.show(e)
    };
  }
  /**
   * Show notification
   *
   * @param {NotifierOptions} options - message option
   */
  show(e) {
    return this.notifier.show(e);
  }
}
class po extends y {
  /**
   * Available methods
   */
  get methods() {
    const e = () => this.isEnabled;
    return {
      toggle: (t) => this.toggle(t),
      get isEnabled() {
        return e();
      }
    };
  }
  /**
   * Set or toggle read-only state
   *
   * @param {boolean|undefined} state - set or toggle state
   * @returns {boolean} current value
   */
  toggle(e) {
    return this.Editor.ReadOnly.toggle(e);
  }
  /**
   * Returns current read-only state
   */
  get isEnabled() {
    return this.Editor.ReadOnly.isEnabled;
  }
}
var Oe = {}, fo = {
  get exports() {
    return Oe;
  },
  set exports(s) {
    Oe = s;
  }
};
(function(s, e) {
  (function(t, o) {
    s.exports = o();
  })(Rt, function() {
    function t(h) {
      var f = h.tags, x = Object.keys(f), p = x.map(function(m) {
        return typeof f[m];
      }).every(function(m) {
        return m === "object" || m === "boolean" || m === "function";
      });
      if (!p)
        throw new Error("The configuration was invalid");
      this.config = h;
    }
    var o = ["P", "LI", "TD", "TH", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "PRE"];
    function i(h) {
      return o.indexOf(h.nodeName) !== -1;
    }
    var n = ["A", "B", "STRONG", "I", "EM", "SUB", "SUP", "U", "STRIKE"];
    function r(h) {
      return n.indexOf(h.nodeName) !== -1;
    }
    t.prototype.clean = function(h) {
      const f = document.implementation.createHTMLDocument(), x = f.createElement("div");
      return x.innerHTML = h, this._sanitize(f, x), x.innerHTML;
    }, t.prototype._sanitize = function(h, f) {
      var x = a(h, f), p = x.firstChild();
      if (p)
        do {
          if (p.nodeType === Node.TEXT_NODE)
            if (p.data.trim() === "" && (p.previousElementSibling && i(p.previousElementSibling) || p.nextElementSibling && i(p.nextElementSibling))) {
              f.removeChild(p), this._sanitize(h, f);
              break;
            } else
              continue;
          if (p.nodeType === Node.COMMENT_NODE) {
            f.removeChild(p), this._sanitize(h, f);
            break;
          }
          var m = r(p), L;
          m && (L = Array.prototype.some.call(p.childNodes, i));
          var A = !!f.parentNode, S = i(f) && i(p) && A, Z = p.nodeName.toLowerCase(), H = l(this.config, Z, p), U = m && L;
          if (U || d(p, H) || !this.config.keepNestedBlockElements && S) {
            if (!(p.nodeName === "SCRIPT" || p.nodeName === "STYLE"))
              for (; p.childNodes.length > 0; )
                f.insertBefore(p.childNodes[0], p);
            f.removeChild(p), this._sanitize(h, f);
            break;
          }
          for (var J = 0; J < p.attributes.length; J += 1) {
            var ce = p.attributes[J];
            u(ce, H, p) && (p.removeAttribute(ce.name), J = J - 1);
          }
          this._sanitize(h, p);
        } while (p = x.nextSibling());
    };
    function a(h, f) {
      return h.createTreeWalker(
        f,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT,
        null,
        !1
      );
    }
    function l(h, f, x) {
      return typeof h.tags[f] == "function" ? h.tags[f](x) : h.tags[f];
    }
    function d(h, f) {
      return typeof f > "u" ? !0 : typeof f == "boolean" ? !f : !1;
    }
    function u(h, f, x) {
      var p = h.name.toLowerCase();
      return f === !0 ? !1 : typeof f[p] == "function" ? !f[p](h.value, x) : typeof f[p] > "u" || f[p] === !1 ? !0 : typeof f[p] == "string" ? f[p] !== h.value : !1;
    }
    return t;
  });
})(fo);
const go = Oe;
function bt(s, e) {
  return s.map((t) => {
    const o = M(e) ? e(t.tool) : e;
    return W(o) || (t.data = ze(t.data, o)), t;
  });
}
function V(s, e = {}) {
  const t = {
    tags: e
  };
  return new go(t).clean(s);
}
function ze(s, e) {
  return Array.isArray(s) ? bo(s, e) : D(s) ? mo(s, e) : G(s) ? ko(s, e) : s;
}
function bo(s, e) {
  return s.map((t) => ze(t, e));
}
function mo(s, e) {
  const t = {};
  for (const o in s) {
    if (!Object.prototype.hasOwnProperty.call(s, o))
      continue;
    const i = s[o], n = vo(e[o]) ? e[o] : e;
    t[o] = ze(i, n);
  }
  return t;
}
function ko(s, e) {
  return D(e) ? V(s, e) : e === !1 ? V(s, {}) : s;
}
function vo(s) {
  return D(s) || Ht(s) || M(s);
}
class xo extends y {
  /**
   * Available methods
   *
   * @returns {SanitizerConfig}
   */
  get methods() {
    return {
      clean: (e, t) => this.clean(e, t)
    };
  }
  /**
   * Perform sanitizing of a string
   *
   * @param {string} taintString - what to sanitize
   * @param {SanitizerConfig} config - sanitizer config
   * @returns {string}
   */
  clean(e, t) {
    return V(e, t);
  }
}
class wo extends y {
  /**
   * Available methods
   *
   * @returns {Saver}
   */
  get methods() {
    return {
      save: () => this.save()
    };
  }
  /**
   * Return Editor's data
   *
   * @returns {OutputData}
   */
  save() {
    const e = "Editor's content can not be saved in read-only mode";
    return this.Editor.ReadOnly.isEnabled ? (Y(e, "warn"), Promise.reject(new Error(e))) : this.Editor.Saver.save();
  }
}
class yo extends y {
  /**
   * Available methods
   *
   * @returns {SelectionAPIInterface}
   */
  get methods() {
    return {
      findParentTag: (e, t) => this.findParentTag(e, t),
      expandToTag: (e) => this.expandToTag(e)
    };
  }
  /**
   * Looks ahead from selection and find passed tag with class name
   *
   * @param {string} tagName - tag to find
   * @param {string} className - tag's class name
   * @returns {HTMLElement|null}
   */
  findParentTag(e, t) {
    return new b().findParentTag(e, t);
  }
  /**
   * Expand selection to passed tag
   *
   * @param {HTMLElement} node - tag that should contain selection
   */
  expandToTag(e) {
    new b().expandToTag(e);
  }
}
class Eo extends y {
  /**
   * Exported classes
   */
  get classes() {
    return {
      /**
       * Base Block styles
       */
      block: "cdx-block",
      /**
       * Inline Tools styles
       */
      inlineToolButton: "ce-inline-tool",
      inlineToolButtonActive: "ce-inline-tool--active",
      /**
       * UI elements
       */
      input: "cdx-input",
      loader: "cdx-loader",
      button: "cdx-button",
      /**
       * Settings styles
       */
      settingsButton: "cdx-settings-button",
      settingsButtonActive: "cdx-settings-button--active"
    };
  }
}
class Bo extends y {
  /**
   * Available methods
   *
   * @returns {Toolbar}
   */
  get methods() {
    return {
      close: () => this.close(),
      open: () => this.open(),
      toggleBlockSettings: (e) => this.toggleBlockSettings(e),
      toggleToolbox: (e) => this.toggleToolbox(e)
    };
  }
  /**
   * Open toolbar
   */
  open() {
    this.Editor.Toolbar.moveAndOpen();
  }
  /**
   * Close toolbar and all included elements
   */
  close() {
    this.Editor.Toolbar.close();
  }
  /**
   * Toggles Block Setting of the current block
   *
   * @param {boolean} openingState —  opening state of Block Setting
   */
  toggleBlockSettings(e) {
    if (this.Editor.BlockManager.currentBlockIndex === -1) {
      Y("Could't toggle the Toolbar because there is no block selected ", "warn");
      return;
    }
    e ?? !this.Editor.BlockSettings.opened ? (this.Editor.Toolbar.moveAndOpen(), this.Editor.BlockSettings.open()) : this.Editor.BlockSettings.close();
  }
  /**
   * Open toolbox
   *
   * @param {boolean} openingState - Opening state of toolbox
   */
  toggleToolbox(e) {
    if (this.Editor.BlockManager.currentBlockIndex === -1) {
      Y("Could't toggle the Toolbox because there is no block selected ", "warn");
      return;
    }
    e ?? !this.Editor.Toolbar.toolbox.opened ? (this.Editor.Toolbar.moveAndOpen(), this.Editor.Toolbar.toolbox.open()) : this.Editor.Toolbar.toolbox.close();
  }
}
var Ne = {}, Co = {
  get exports() {
    return Ne;
  },
  set exports(s) {
    Ne = s;
  }
};
/*!
 * CodeX.Tooltips
 *
 * @version 1.0.5
 *
 * @licence MIT
 * @author CodeX <https://codex.so>
 *
 *
 */
(function(s, e) {
  (function(t, o) {
    s.exports = o();
  })(window, function() {
    return function(t) {
      var o = {};
      function i(n) {
        if (o[n])
          return o[n].exports;
        var r = o[n] = { i: n, l: !1, exports: {} };
        return t[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports;
      }
      return i.m = t, i.c = o, i.d = function(n, r, a) {
        i.o(n, r) || Object.defineProperty(n, r, { enumerable: !0, get: a });
      }, i.r = function(n) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n, "__esModule", { value: !0 });
      }, i.t = function(n, r) {
        if (1 & r && (n = i(n)), 8 & r || 4 & r && typeof n == "object" && n && n.__esModule)
          return n;
        var a = /* @__PURE__ */ Object.create(null);
        if (i.r(a), Object.defineProperty(a, "default", { enumerable: !0, value: n }), 2 & r && typeof n != "string")
          for (var l in n)
            i.d(a, l, function(d) {
              return n[d];
            }.bind(null, l));
        return a;
      }, i.n = function(n) {
        var r = n && n.__esModule ? function() {
          return n.default;
        } : function() {
          return n;
        };
        return i.d(r, "a", r), r;
      }, i.o = function(n, r) {
        return Object.prototype.hasOwnProperty.call(n, r);
      }, i.p = "", i(i.s = 0);
    }([function(t, o, i) {
      t.exports = i(1);
    }, function(t, o, i) {
      i.r(o), i.d(o, "default", function() {
        return n;
      });
      class n {
        constructor() {
          this.nodes = { wrapper: null, content: null }, this.showed = !1, this.offsetTop = 10, this.offsetLeft = 10, this.offsetRight = 10, this.hidingDelay = 0, this.handleWindowScroll = () => {
            this.showed && this.hide(!0);
          }, this.loadStyles(), this.prepare(), window.addEventListener("scroll", this.handleWindowScroll, { passive: !0 });
        }
        get CSS() {
          return { tooltip: "ct", tooltipContent: "ct__content", tooltipShown: "ct--shown", placement: { left: "ct--left", bottom: "ct--bottom", right: "ct--right", top: "ct--top" } };
        }
        show(a, l, d) {
          this.nodes.wrapper || this.prepare(), this.hidingTimeout && clearTimeout(this.hidingTimeout);
          const u = Object.assign({ placement: "bottom", marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, delay: 70, hidingDelay: 0 }, d);
          if (u.hidingDelay && (this.hidingDelay = u.hidingDelay), this.nodes.content.innerHTML = "", typeof l == "string")
            this.nodes.content.appendChild(document.createTextNode(l));
          else {
            if (!(l instanceof Node))
              throw Error("[CodeX Tooltip] Wrong type of «content» passed. It should be an instance of Node or String. But " + typeof l + " given.");
            this.nodes.content.appendChild(l);
          }
          switch (this.nodes.wrapper.classList.remove(...Object.values(this.CSS.placement)), u.placement) {
            case "top":
              this.placeTop(a, u);
              break;
            case "left":
              this.placeLeft(a, u);
              break;
            case "right":
              this.placeRight(a, u);
              break;
            case "bottom":
            default:
              this.placeBottom(a, u);
          }
          u && u.delay ? this.showingTimeout = setTimeout(() => {
            this.nodes.wrapper.classList.add(this.CSS.tooltipShown), this.showed = !0;
          }, u.delay) : (this.nodes.wrapper.classList.add(this.CSS.tooltipShown), this.showed = !0);
        }
        hide(a = !1) {
          if (this.hidingDelay && !a)
            return this.hidingTimeout && clearTimeout(this.hidingTimeout), void (this.hidingTimeout = setTimeout(() => {
              this.hide(!0);
            }, this.hidingDelay));
          this.nodes.wrapper.classList.remove(this.CSS.tooltipShown), this.showed = !1, this.showingTimeout && clearTimeout(this.showingTimeout);
        }
        onHover(a, l, d) {
          a.addEventListener("mouseenter", () => {
            this.show(a, l, d);
          }), a.addEventListener("mouseleave", () => {
            this.hide();
          });
        }
        destroy() {
          this.nodes.wrapper.remove(), window.removeEventListener("scroll", this.handleWindowScroll);
        }
        prepare() {
          this.nodes.wrapper = this.make("div", this.CSS.tooltip), this.nodes.content = this.make("div", this.CSS.tooltipContent), this.append(this.nodes.wrapper, this.nodes.content), this.append(document.body, this.nodes.wrapper);
        }
        loadStyles() {
          const a = "codex-tooltips-style";
          if (document.getElementById(a))
            return;
          const l = i(2), d = this.make("style", null, { textContent: l.toString(), id: a });
          this.prepend(document.head, d);
        }
        placeBottom(a, l) {
          const d = a.getBoundingClientRect(), u = d.left + a.clientWidth / 2 - this.nodes.wrapper.offsetWidth / 2, h = d.bottom + window.pageYOffset + this.offsetTop + l.marginTop;
          this.applyPlacement("bottom", u, h);
        }
        placeTop(a, l) {
          const d = a.getBoundingClientRect(), u = d.left + a.clientWidth / 2 - this.nodes.wrapper.offsetWidth / 2, h = d.top + window.pageYOffset - this.nodes.wrapper.clientHeight - this.offsetTop;
          this.applyPlacement("top", u, h);
        }
        placeLeft(a, l) {
          const d = a.getBoundingClientRect(), u = d.left - this.nodes.wrapper.offsetWidth - this.offsetLeft - l.marginLeft, h = d.top + window.pageYOffset + a.clientHeight / 2 - this.nodes.wrapper.offsetHeight / 2;
          this.applyPlacement("left", u, h);
        }
        placeRight(a, l) {
          const d = a.getBoundingClientRect(), u = d.right + this.offsetRight + l.marginRight, h = d.top + window.pageYOffset + a.clientHeight / 2 - this.nodes.wrapper.offsetHeight / 2;
          this.applyPlacement("right", u, h);
        }
        applyPlacement(a, l, d) {
          this.nodes.wrapper.classList.add(this.CSS.placement[a]), this.nodes.wrapper.style.left = l + "px", this.nodes.wrapper.style.top = d + "px";
        }
        make(a, l = null, d = {}) {
          const u = document.createElement(a);
          Array.isArray(l) ? u.classList.add(...l) : l && u.classList.add(l);
          for (const h in d)
            d.hasOwnProperty(h) && (u[h] = d[h]);
          return u;
        }
        append(a, l) {
          Array.isArray(l) ? l.forEach((d) => a.appendChild(d)) : a.appendChild(l);
        }
        prepend(a, l) {
          Array.isArray(l) ? (l = l.reverse()).forEach((d) => a.prepend(d)) : a.prepend(l);
        }
      }
    }, function(t, o) {
      t.exports = `.ct{z-index:999;opacity:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;-webkit-transition:opacity 50ms ease-in,-webkit-transform 70ms cubic-bezier(.215,.61,.355,1);transition:opacity 50ms ease-in,-webkit-transform 70ms cubic-bezier(.215,.61,.355,1);transition:opacity 50ms ease-in,transform 70ms cubic-bezier(.215,.61,.355,1);transition:opacity 50ms ease-in,transform 70ms cubic-bezier(.215,.61,.355,1),-webkit-transform 70ms cubic-bezier(.215,.61,.355,1);will-change:opacity,top,left;-webkit-box-shadow:0 8px 12px 0 rgba(29,32,43,.17),0 4px 5px -3px rgba(5,6,12,.49);box-shadow:0 8px 12px 0 rgba(29,32,43,.17),0 4px 5px -3px rgba(5,6,12,.49);border-radius:9px}.ct,.ct:before{position:absolute;top:0;left:0}.ct:before{content:"";bottom:0;right:0;background-color:#1d202b;z-index:-1;border-radius:4px}@supports(-webkit-mask-box-image:url("")){.ct:before{border-radius:0;-webkit-mask-box-image:url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M10.71 0h2.58c3.02 0 4.64.42 6.1 1.2a8.18 8.18 0 013.4 3.4C23.6 6.07 24 7.7 24 10.71v2.58c0 3.02-.42 4.64-1.2 6.1a8.18 8.18 0 01-3.4 3.4c-1.47.8-3.1 1.21-6.11 1.21H10.7c-3.02 0-4.64-.42-6.1-1.2a8.18 8.18 0 01-3.4-3.4C.4 17.93 0 16.3 0 13.29V10.7c0-3.02.42-4.64 1.2-6.1a8.18 8.18 0 013.4-3.4C6.07.4 7.7 0 10.71 0z"/></svg>') 48% 41% 37.9% 53.3%}}@media (--mobile){.ct{display:none}}.ct__content{padding:6px 10px;color:#cdd1e0;font-size:12px;text-align:center;letter-spacing:.02em;line-height:1em}.ct:after{content:"";width:8px;height:8px;position:absolute;background-color:#1d202b;z-index:-1}.ct--bottom{-webkit-transform:translateY(5px);transform:translateY(5px)}.ct--bottom:after{top:-3px;left:50%;-webkit-transform:translateX(-50%) rotate(-45deg);transform:translateX(-50%) rotate(-45deg)}.ct--top{-webkit-transform:translateY(-5px);transform:translateY(-5px)}.ct--top:after{top:auto;bottom:-3px;left:50%;-webkit-transform:translateX(-50%) rotate(-45deg);transform:translateX(-50%) rotate(-45deg)}.ct--left{-webkit-transform:translateX(-5px);transform:translateX(-5px)}.ct--left:after{top:50%;left:auto;right:0;-webkit-transform:translate(41.6%,-50%) rotate(-45deg);transform:translate(41.6%,-50%) rotate(-45deg)}.ct--right{-webkit-transform:translateX(5px);transform:translateX(5px)}.ct--right:after{top:50%;left:0;-webkit-transform:translate(-41.6%,-50%) rotate(-45deg);transform:translate(-41.6%,-50%) rotate(-45deg)}.ct--shown{opacity:1;-webkit-transform:none;transform:none}`;
    }]).default;
  });
})(Co);
const To = /* @__PURE__ */ Pe(Ne);
let F = null;
function Ue() {
  F || (F = new To());
}
function So(s, e, t) {
  Ue(), F == null || F.show(s, e, t);
}
function Re(s = !1) {
  Ue(), F == null || F.hide(s);
}
function ge(s, e, t) {
  Ue(), F == null || F.onHover(s, e, t);
}
function Io() {
  F == null || F.destroy(), F = null;
}
class Mo extends y {
  /**
   * @class
   * @param moduleConfiguration - Module Configuration
   * @param moduleConfiguration.config - Editor's config
   * @param moduleConfiguration.eventsDispatcher - Editor's event dispatcher
   */
  constructor({ config: e, eventsDispatcher: t }) {
    super({
      config: e,
      eventsDispatcher: t
    });
  }
  /**
   * Available methods
   */
  get methods() {
    return {
      show: (e, t, o) => this.show(e, t, o),
      hide: () => this.hide(),
      onHover: (e, t, o) => this.onHover(e, t, o)
    };
  }
  /**
   * Method show tooltip on element with passed HTML content
   *
   * @param {HTMLElement} element - element on which tooltip should be shown
   * @param {TooltipContent} content - tooltip content
   * @param {TooltipOptions} options - tooltip options
   */
  show(e, t, o) {
    So(e, t, o);
  }
  /**
   * Method hides tooltip on HTML page
   */
  hide() {
    Re();
  }
  /**
   * Decorator for showing Tooltip by mouseenter/mouseleave
   *
   * @param {HTMLElement} element - element on which tooltip should be shown
   * @param {TooltipContent} content - tooltip content
   * @param {TooltipOptions} options - tooltip options
   */
  onHover(e, t, o) {
    ge(e, t, o);
  }
}
class Lo extends y {
  /**
   * Available methods / getters
   */
  get methods() {
    return {
      nodes: this.editorNodes
      /**
       * There can be added some UI methods, like toggleThinMode() etc
       */
    };
  }
  /**
   * Exported classes
   */
  get editorNodes() {
    return {
      /**
       * Top-level editor instance wrapper
       */
      wrapper: this.Editor.UI.nodes.wrapper,
      /**
       * Element that holds all the Blocks
       */
      redactor: this.Editor.UI.nodes.redactor
    };
  }
}
function mt(s, e) {
  const t = {};
  return Object.entries(s).forEach(([o, i]) => {
    if (D(i)) {
      const n = e ? `${e}.${o}` : o;
      Object.values(i).every((a) => G(a)) ? t[o] = n : t[o] = mt(i, n);
      return;
    }
    t[o] = i;
  }), t;
}
const K = mt(ht);
function Ao(s, e) {
  const t = {};
  return Object.keys(s).forEach((o) => {
    const i = e[o];
    i !== void 0 ? t[i] = s[o] : t[o] = s[o];
  }), t;
}
const _o = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 12L9 7.1C9 7.04477 9.04477 7 9.1 7H10.4C11.5 7 14 7.1 14 9.5C14 9.5 14 12 11 12M9 12V16.8C9 16.9105 9.08954 17 9.2 17H12.5C14 17 15 16 15 14.5C15 11.7046 11 12 11 12M9 12H11"/></svg>', kt = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M7 10L11.8586 14.8586C11.9367 14.9367 12.0633 14.9367 12.1414 14.8586L17 10"/></svg>', Oo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M7 15L11.8586 10.1414C11.9367 10.0633 12.0633 10.0633 12.1414 10.1414L17 15"/></svg>', No = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 8L12 12M12 12L16 16M12 12L16 8M12 12L8 16"/></svg>', Ro = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/></svg>', Do = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M13.34 10C12.4223 12.7337 11 17 11 17"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M14.21 7H14.2"/></svg>', it = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M7.69998 12.6L7.67896 12.62C6.53993 13.7048 6.52012 15.5155 7.63516 16.625V16.625C8.72293 17.7073 10.4799 17.7102 11.5712 16.6314L13.0263 15.193C14.0703 14.1609 14.2141 12.525 13.3662 11.3266L13.22 11.12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16.22 11.12L16.3564 10.9805C17.2895 10.0265 17.3478 8.5207 16.4914 7.49733V7.49733C15.5691 6.39509 13.9269 6.25143 12.8271 7.17675L11.3901 8.38588C10.0935 9.47674 9.95706 11.4241 11.0888 12.6852L11.12 12.72"/></svg>', Po = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2.6" d="M9.40999 7.29999H9.4"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2.6" d="M14.6 7.29999H14.59"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2.6" d="M9.30999 12H9.3"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2.6" d="M14.6 12H14.59"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2.6" d="M9.40999 16.7H9.4"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2.6" d="M14.6 16.7H14.59"/></svg>', Fo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 7V12M12 17V12M17 12H12M12 12H7"/></svg>', Ho = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" stroke-width="2"/><line x1="15.4142" x2="19" y1="15" y2="18.5858" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>', zo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M15.7795 11.5C15.7795 11.5 16.053 11.1962 16.5497 10.6722C17.4442 9.72856 17.4701 8.2475 16.5781 7.30145V7.30145C15.6482 6.31522 14.0873 6.29227 13.1288 7.25073L11.8796 8.49999"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8.24517 12.3883C8.24517 12.3883 7.97171 12.6922 7.47504 13.2161C6.58051 14.1598 6.55467 15.6408 7.44666 16.5869V16.5869C8.37653 17.5731 9.93744 17.5961 10.8959 16.6376L12.1452 15.3883"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M17.7802 15.1032L16.597 14.9422C16.0109 14.8624 15.4841 15.3059 15.4627 15.8969L15.4199 17.0818"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6.39064 9.03238L7.58432 9.06668C8.17551 9.08366 8.6522 8.58665 8.61056 7.99669L8.5271 6.81397"/><line x1="12.1142" x2="11.7" y1="12.2" y2="11.7858" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>', Uo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" stroke="currentColor" stroke-width="2" rx="4"/><line x1="12" x2="12" y1="9" y2="12" stroke="currentColor" stroke-linecap="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 15.02V15.01"/></svg>';
class _ {
  /**
   * Constructs popover item instance
   *
   * @param params - popover item construction params
   */
  constructor(e) {
    this.nodes = {
      root: null,
      icon: null
    }, this.confirmationState = null, this.removeSpecialFocusBehavior = () => {
      this.nodes.root.classList.remove(_.CSS.noFocus);
    }, this.removeSpecialHoverBehavior = () => {
      this.nodes.root.classList.remove(_.CSS.noHover);
    }, this.onErrorAnimationEnd = () => {
      this.nodes.icon.classList.remove(_.CSS.wobbleAnimation), this.nodes.icon.removeEventListener("animationend", this.onErrorAnimationEnd);
    }, this.params = e, this.nodes.root = this.make(e);
  }
  /**
   * True if item is disabled and hence not clickable
   */
  get isDisabled() {
    return this.params.isDisabled;
  }
  /**
   * Exposes popover item toggle parameter
   */
  get toggle() {
    return this.params.toggle;
  }
  /**
   * Item title
   */
  get title() {
    return this.params.title;
  }
  /**
   * True if popover should close once item is activated
   */
  get closeOnActivate() {
    return this.params.closeOnActivate;
  }
  /**
   * True if confirmation state is enabled for popover item
   */
  get isConfirmationStateEnabled() {
    return this.confirmationState !== null;
  }
  /**
   * True if item is focused in keyboard navigation process
   */
  get isFocused() {
    return this.nodes.root.classList.contains(_.CSS.focused);
  }
  /**
   * Popover item CSS classes
   */
  static get CSS() {
    return {
      container: "ce-popover-item",
      title: "ce-popover-item__title",
      secondaryTitle: "ce-popover-item__secondary-title",
      icon: "ce-popover-item__icon",
      active: "ce-popover-item--active",
      disabled: "ce-popover-item--disabled",
      focused: "ce-popover-item--focused",
      hidden: "ce-popover-item--hidden",
      confirmationState: "ce-popover-item--confirmation",
      noHover: "ce-popover-item--no-hover",
      noFocus: "ce-popover-item--no-focus",
      wobbleAnimation: "wobble"
    };
  }
  /**
   * Returns popover item root element
   */
  getElement() {
    return this.nodes.root;
  }
  /**
   * Called on popover item click
   */
  handleClick() {
    if (this.isConfirmationStateEnabled) {
      this.activateOrEnableConfirmationMode(this.confirmationState);
      return;
    }
    this.activateOrEnableConfirmationMode(this.params);
  }
  /**
   * Toggles item active state
   *
   * @param isActive - true if item should strictly should become active
   */
  toggleActive(e) {
    this.nodes.root.classList.toggle(_.CSS.active, e);
  }
  /**
   * Toggles item hidden state
   *
   * @param isHidden - true if item should be hidden
   */
  toggleHidden(e) {
    this.nodes.root.classList.toggle(_.CSS.hidden, e);
  }
  /**
   * Resets popover item to its original state
   */
  reset() {
    this.isConfirmationStateEnabled && this.disableConfirmationMode();
  }
  /**
   * Method called once item becomes focused during keyboard navigation
   */
  onFocus() {
    this.disableSpecialHoverAndFocusBehavior();
  }
  /**
   * Constructs HTML element corresponding to popover item params
   *
   * @param params - item construction params
   */
  make(e) {
    const t = c.make("div", _.CSS.container);
    return e.name && (t.dataset.itemName = e.name), this.nodes.icon = c.make("div", _.CSS.icon, {
      innerHTML: e.icon || Ro
    }), t.appendChild(this.nodes.icon), t.appendChild(c.make("div", _.CSS.title, {
      innerHTML: e.title || ""
    })), e.secondaryLabel && t.appendChild(c.make("div", _.CSS.secondaryTitle, {
      textContent: e.secondaryLabel
    })), e.isActive && t.classList.add(_.CSS.active), e.isDisabled && t.classList.add(_.CSS.disabled), t;
  }
  /**
   * Activates confirmation mode for the item.
   *
   * @param newState - new popover item params that should be applied
   */
  enableConfirmationMode(e) {
    const t = {
      ...this.params,
      ...e,
      confirmation: e.confirmation
    }, o = this.make(t);
    this.nodes.root.innerHTML = o.innerHTML, this.nodes.root.classList.add(_.CSS.confirmationState), this.confirmationState = e, this.enableSpecialHoverAndFocusBehavior();
  }
  /**
   * Returns item to its original state
   */
  disableConfirmationMode() {
    const e = this.make(this.params);
    this.nodes.root.innerHTML = e.innerHTML, this.nodes.root.classList.remove(_.CSS.confirmationState), this.confirmationState = null, this.disableSpecialHoverAndFocusBehavior();
  }
  /**
   * Enables special focus and hover behavior for item in confirmation state.
   * This is needed to prevent item from being highlighted as hovered/focused just after click.
   */
  enableSpecialHoverAndFocusBehavior() {
    this.nodes.root.classList.add(_.CSS.noHover), this.nodes.root.classList.add(_.CSS.noFocus), this.nodes.root.addEventListener("mouseleave", this.removeSpecialHoverBehavior, { once: !0 });
  }
  /**
   * Disables special focus and hover behavior
   */
  disableSpecialHoverAndFocusBehavior() {
    this.removeSpecialFocusBehavior(), this.removeSpecialHoverBehavior(), this.nodes.root.removeEventListener("mouseleave", this.removeSpecialHoverBehavior);
  }
  /**
   * Executes item's onActivate callback if the item has no confirmation configured
   *
   * @param item - item to activate or bring to confirmation mode
   */
  activateOrEnableConfirmationMode(e) {
    if (e.confirmation === void 0)
      try {
        e.onActivate(e), this.disableConfirmationMode();
      } catch {
        this.animateError();
      }
    else
      this.enableConfirmationMode(e.confirmation);
  }
  /**
   * Animates item which symbolizes that error occured while executing 'onActivate()' callback
   */
  animateError() {
    this.nodes.icon.classList.contains(_.CSS.wobbleAnimation) || (this.nodes.icon.classList.add(_.CSS.wobbleAnimation), this.nodes.icon.addEventListener("animationend", this.onErrorAnimationEnd));
  }
}
const he = class {
  /**
   * @param {HTMLElement[]} nodeList — the list of iterable HTML-items
   * @param {string} focusedCssClass - user-provided CSS-class that will be set in flipping process
   */
  constructor(s, e) {
    this.cursor = -1, this.items = [], this.items = s || [], this.focusedCssClass = e;
  }
  /**
   * Returns Focused button Node
   *
   * @returns {HTMLElement}
   */
  get currentItem() {
    return this.cursor === -1 ? null : this.items[this.cursor];
  }
  /**
   * Sets cursor to specified position
   *
   * @param cursorPosition - new cursor position
   */
  setCursor(s) {
    s < this.items.length && s >= -1 && (this.dropCursor(), this.cursor = s, this.items[this.cursor].classList.add(this.focusedCssClass));
  }
  /**
   * Sets items. Can be used when iterable items changed dynamically
   *
   * @param {HTMLElement[]} nodeList - nodes to iterate
   */
  setItems(s) {
    this.items = s;
  }
  /**
   * Sets cursor next to the current
   */
  next() {
    this.cursor = this.leafNodesAndReturnIndex(he.directions.RIGHT);
  }
  /**
   * Sets cursor before current
   */
  previous() {
    this.cursor = this.leafNodesAndReturnIndex(he.directions.LEFT);
  }
  /**
   * Sets cursor to the default position and removes CSS-class from previously focused item
   */
  dropCursor() {
    this.cursor !== -1 && (this.items[this.cursor].classList.remove(this.focusedCssClass), this.cursor = -1);
  }
  /**
   * Leafs nodes inside the target list from active element
   *
   * @param {string} direction - leaf direction. Can be 'left' or 'right'
   * @returns {number} index of focused node
   */
  leafNodesAndReturnIndex(s) {
    if (this.items.length === 0)
      return this.cursor;
    let e = this.cursor;
    return e === -1 ? e = s === he.directions.RIGHT ? -1 : 0 : this.items[e].classList.remove(this.focusedCssClass), s === he.directions.RIGHT ? e = (e + 1) % this.items.length : e = (this.items.length + e - 1) % this.items.length, c.canSetCaret(this.items[e]) && xe(() => b.setCursor(this.items[e]), 50)(), this.items[e].classList.add(this.focusedCssClass), e;
  }
};
let ne = he;
ne.directions = {
  RIGHT: "right",
  LEFT: "left"
};
class q {
  /**
   * @param {FlipperOptions} options - different constructing settings
   */
  constructor(e) {
    this.iterator = null, this.activated = !1, this.flipCallbacks = [], this.onKeyDown = (t) => {
      if (this.isEventReadyForHandling(t))
        switch (q.usedKeys.includes(t.keyCode) && t.preventDefault(), t.keyCode) {
          case k.TAB:
            this.handleTabPress(t);
            break;
          case k.LEFT:
          case k.UP:
            this.flipLeft();
            break;
          case k.RIGHT:
          case k.DOWN:
            this.flipRight();
            break;
          case k.ENTER:
            this.handleEnterPress(t);
            break;
        }
    }, this.iterator = new ne(e.items, e.focusedItemClass), this.activateCallback = e.activateCallback, this.allowedKeys = e.allowedKeys || q.usedKeys;
  }
  /**
   * True if flipper is currently activated
   */
  get isActivated() {
    return this.activated;
  }
  /**
   * Array of keys (codes) that is handled by Flipper
   * Used to:
   *  - preventDefault only for this keys, not all keydowns (@see constructor)
   *  - to skip external behaviours only for these keys, when filler is activated (@see BlockEvents@arrowRightAndDown)
   */
  static get usedKeys() {
    return [
      k.TAB,
      k.LEFT,
      k.RIGHT,
      k.ENTER,
      k.UP,
      k.DOWN
    ];
  }
  /**
   * Active tab/arrows handling by flipper
   *
   * @param items - Some modules (like, InlineToolbar, BlockSettings) might refresh buttons dynamically
   * @param cursorPosition - index of the item that should be focused once flipper is activated
   */
  activate(e, t) {
    this.activated = !0, e && this.iterator.setItems(e), t !== void 0 && this.iterator.setCursor(t), document.addEventListener("keydown", this.onKeyDown, !0);
  }
  /**
   * Disable tab/arrows handling by flipper
   */
  deactivate() {
    this.activated = !1, this.dropCursor(), document.removeEventListener("keydown", this.onKeyDown);
  }
  /**
   * Focus first item
   */
  focusFirst() {
    this.dropCursor(), this.flipRight();
  }
  /**
   * Focuses previous flipper iterator item
   */
  flipLeft() {
    this.iterator.previous(), this.flipCallback();
  }
  /**
   * Focuses next flipper iterator item
   */
  flipRight() {
    this.iterator.next(), this.flipCallback();
  }
  /**
   * Return true if some button is focused
   */
  hasFocus() {
    return !!this.iterator.currentItem;
  }
  /**
   * Registeres function that should be executed on each navigation action
   *
   * @param cb - function to execute
   */
  onFlip(e) {
    this.flipCallbacks.push(e);
  }
  /**
   * Unregisteres function that is executed on each navigation action
   *
   * @param cb - function to stop executing
   */
  removeOnFlip(e) {
    this.flipCallbacks = this.flipCallbacks.filter((t) => t !== e);
  }
  /**
   * Drops flipper's iterator cursor
   *
   * @see DomIterator#dropCursor
   */
  dropCursor() {
    this.iterator.dropCursor();
  }
  /**
   * This function is fired before handling flipper keycodes
   * The result of this function defines if it is need to be handled or not
   *
   * @param {KeyboardEvent} event - keydown keyboard event
   * @returns {boolean}
   */
  isEventReadyForHandling(e) {
    return this.activated && this.allowedKeys.includes(e.keyCode);
  }
  /**
   * When flipper is activated tab press will leaf the items
   *
   * @param {KeyboardEvent} event - tab keydown event
   */
  handleTabPress(e) {
    switch (e.shiftKey ? ne.directions.LEFT : ne.directions.RIGHT) {
      case ne.directions.RIGHT:
        this.flipRight();
        break;
      case ne.directions.LEFT:
        this.flipLeft();
        break;
    }
  }
  /**
   * Enter press will click current item if flipper is activated
   *
   * @param {KeyboardEvent} event - enter keydown event
   */
  handleEnterPress(e) {
    this.activated && (this.iterator.currentItem && (e.stopPropagation(), e.preventDefault(), this.iterator.currentItem.click()), M(this.activateCallback) && this.activateCallback(this.iterator.currentItem));
  }
  /**
   * Fired after flipping in any direction
   */
  flipCallback() {
    this.iterator.currentItem && this.iterator.currentItem.scrollIntoViewIfNeeded(), this.flipCallbacks.forEach((e) => e());
  }
}
class pe {
  /**
   * Styles
   */
  static get CSS() {
    return {
      wrapper: "cdx-search-field",
      icon: "cdx-search-field__icon",
      input: "cdx-search-field__input"
    };
  }
  /**
   * @param options - available config
   * @param options.items - searchable items list
   * @param options.onSearch - search callback
   * @param options.placeholder - input placeholder
   */
  constructor({ items: e, onSearch: t, placeholder: o }) {
    this.listeners = new Fe(), this.items = e, this.onSearch = t, this.render(o);
  }
  /**
   * Returns search field element
   */
  getElement() {
    return this.wrapper;
  }
  /**
   * Sets focus to the input
   */
  focus() {
    this.input.focus();
  }
  /**
   * Clears search query and results
   */
  clear() {
    this.input.value = "", this.searchQuery = "", this.onSearch("", this.foundItems);
  }
  /**
   * Clears memory
   */
  destroy() {
    this.listeners.removeAll();
  }
  /**
   * Creates the search field
   *
   * @param placeholder - input placeholder
   */
  render(e) {
    this.wrapper = c.make("div", pe.CSS.wrapper);
    const t = c.make("div", pe.CSS.icon, {
      innerHTML: Ho
    });
    this.input = c.make("input", pe.CSS.input, {
      placeholder: e,
      /**
       * Used to prevent focusing on the input by Tab key
       * (Popover in the Toolbar lays below the blocks,
       * so Tab in the last block will focus this hidden input if this property is not set)
       */
      tabIndex: -1
    }), this.wrapper.appendChild(t), this.wrapper.appendChild(this.input), this.listeners.on(this.input, "input", () => {
      this.searchQuery = this.input.value, this.onSearch(this.searchQuery, this.foundItems);
    });
  }
  /**
   * Returns list of found items for the current search query
   */
  get foundItems() {
    return this.items.filter((e) => this.checkItem(e));
  }
  /**
   * Contains logic for checking whether passed item conforms the search query
   *
   * @param item - item to be checked
   */
  checkItem(e) {
    var i;
    const t = ((i = e.title) == null ? void 0 : i.toLowerCase()) || "", o = this.searchQuery.toLowerCase();
    return t.includes(o);
  }
}
const ue = class {
  /**
   * Locks body element scroll
   */
  lock() {
    tt ? this.lockHard() : document.body.classList.add(ue.CSS.scrollLocked);
  }
  /**
   * Unlocks body element scroll
   */
  unlock() {
    tt ? this.unlockHard() : document.body.classList.remove(ue.CSS.scrollLocked);
  }
  /**
   * Locks scroll in a hard way (via setting fixed position to body element)
   */
  lockHard() {
    this.scrollPosition = window.pageYOffset, document.documentElement.style.setProperty(
      "--window-scroll-offset",
      `${this.scrollPosition}px`
    ), document.body.classList.add(ue.CSS.scrollLockedHard);
  }
  /**
   * Unlocks hard scroll lock
   */
  unlockHard() {
    document.body.classList.remove(ue.CSS.scrollLockedHard), this.scrollPosition !== null && window.scrollTo(0, this.scrollPosition), this.scrollPosition = null;
  }
};
let vt = ue;
vt.CSS = {
  scrollLocked: "ce-scroll-locked",
  scrollLockedHard: "ce-scroll-locked--hard"
};
var jo = Object.defineProperty, $o = Object.getOwnPropertyDescriptor, Wo = (s, e, t, o) => {
  for (var i = o > 1 ? void 0 : o ? $o(e, t) : e, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (i = (o ? r(e, t, i) : r(i)) || i);
  return o && i && jo(e, t, i), i;
}, be = /* @__PURE__ */ ((s) => (s.Close = "close", s))(be || {});
const N = class extends Ee {
  /**
   * Constructs the instance
   *
   * @param params - popover construction params
   */
  constructor(s) {
    super(), this.scopeElement = document.body, this.listeners = new Fe(), this.scrollLocker = new vt(), this.nodes = {
      wrapper: null,
      popover: null,
      nothingFoundMessage: null,
      customContent: null,
      items: null,
      overlay: null
    }, this.messages = {
      nothingFound: "Nothing found",
      search: "Search"
    }, this.onFlip = () => {
      this.items.find((t) => t.isFocused).onFocus();
    }, this.items = s.items.map((e) => new _(e)), s.scopeElement !== void 0 && (this.scopeElement = s.scopeElement), s.messages && (this.messages = {
      ...this.messages,
      ...s.messages
    }), s.customContentFlippableItems && (this.customContentFlippableItems = s.customContentFlippableItems), this.make(), s.customContent && this.addCustomContent(s.customContent), s.searchable && this.addSearch(), this.initializeFlipper();
  }
  /**
   * Popover CSS classes
   */
  static get CSS() {
    return {
      popover: "ce-popover",
      popoverOpenTop: "ce-popover--open-top",
      popoverOpened: "ce-popover--opened",
      search: "ce-popover__search",
      nothingFoundMessage: "ce-popover__nothing-found-message",
      nothingFoundMessageDisplayed: "ce-popover__nothing-found-message--displayed",
      customContent: "ce-popover__custom-content",
      customContentHidden: "ce-popover__custom-content--hidden",
      items: "ce-popover__items",
      overlay: "ce-popover__overlay",
      overlayHidden: "ce-popover__overlay--hidden"
    };
  }
  /**
   * Returns HTML element corresponding to the popover
   */
  getElement() {
    return this.nodes.wrapper;
  }
  /**
   * Returns true if some item inside popover is focused
   */
  hasFocus() {
    return this.flipper.hasFocus();
  }
  /**
   * Open popover
   */
  show() {
    this.shouldOpenBottom || (this.nodes.popover.style.setProperty("--popover-height", this.height + "px"), this.nodes.popover.classList.add(N.CSS.popoverOpenTop)), this.nodes.overlay.classList.remove(N.CSS.overlayHidden), this.nodes.popover.classList.add(N.CSS.popoverOpened), this.flipper.activate(this.flippableElements), this.search !== void 0 && requestAnimationFrame(() => {
      var s;
      (s = this.search) == null || s.focus();
    }), te() && this.scrollLocker.lock();
  }
  /**
   * Closes popover
   */
  hide() {
    this.nodes.popover.classList.remove(N.CSS.popoverOpened), this.nodes.popover.classList.remove(N.CSS.popoverOpenTop), this.nodes.overlay.classList.add(N.CSS.overlayHidden), this.flipper.deactivate(), this.items.forEach((s) => s.reset()), this.search !== void 0 && this.search.clear(), te() && this.scrollLocker.unlock(), this.emit(
      "close"
      /* Close */
    );
  }
  /**
   * Clears memory
   */
  destroy() {
    this.flipper.deactivate(), this.listeners.removeAll(), te() && this.scrollLocker.unlock();
  }
  /**
   * Constructs HTML element corresponding to popover
   */
  make() {
    this.nodes.popover = c.make("div", [N.CSS.popover]), this.nodes.nothingFoundMessage = c.make("div", [N.CSS.nothingFoundMessage], {
      textContent: this.messages.nothingFound
    }), this.nodes.popover.appendChild(this.nodes.nothingFoundMessage), this.nodes.items = c.make("div", [N.CSS.items]), this.items.forEach((s) => {
      this.nodes.items.appendChild(s.getElement());
    }), this.nodes.popover.appendChild(this.nodes.items), this.listeners.on(this.nodes.popover, "click", (s) => {
      const e = this.getTargetItem(s);
      e !== void 0 && this.handleItemClick(e);
    }), this.nodes.wrapper = c.make("div"), this.nodes.overlay = c.make("div", [N.CSS.overlay, N.CSS.overlayHidden]), this.listeners.on(this.nodes.overlay, "click", () => {
      this.hide();
    }), this.nodes.wrapper.appendChild(this.nodes.overlay), this.nodes.wrapper.appendChild(this.nodes.popover);
  }
  /**
   * Adds search to the popover
   */
  addSearch() {
    this.search = new pe({
      items: this.items,
      placeholder: this.messages.search,
      onSearch: (e, t) => {
        this.items.forEach((i) => {
          const n = !t.includes(i);
          i.toggleHidden(n);
        }), this.toggleNothingFoundMessage(t.length === 0), this.toggleCustomContent(e !== "");
        const o = e === "" ? this.flippableElements : t.map((i) => i.getElement());
        this.flipper.isActivated && (this.flipper.deactivate(), this.flipper.activate(o));
      }
    });
    const s = this.search.getElement();
    s.classList.add(N.CSS.search), this.nodes.popover.insertBefore(s, this.nodes.popover.firstChild);
  }
  /**
   * Adds custom html content to the popover
   *
   * @param content - html content to append
   */
  addCustomContent(s) {
    this.nodes.customContent = s, this.nodes.customContent.classList.add(N.CSS.customContent), this.nodes.popover.insertBefore(s, this.nodes.popover.firstChild);
  }
  /**
   * Retrieves popover item that is the target of the specified event
   *
   * @param event - event to retrieve popover item from
   */
  getTargetItem(s) {
    return this.items.find((e) => s.composedPath().includes(e.getElement()));
  }
  /**
   * Handles item clicks
   *
   * @param item - item to handle click of
   */
  handleItemClick(s) {
    s.isDisabled || (this.items.filter((e) => e !== s).forEach((e) => e.reset()), s.handleClick(), this.toggleItemActivenessIfNeeded(s), s.closeOnActivate && this.hide());
  }
  /**
   * Creates Flipper instance which allows to navigate between popover items via keyboard
   */
  initializeFlipper() {
    this.flipper = new q({
      items: this.flippableElements,
      focusedItemClass: _.CSS.focused,
      allowedKeys: [
        k.TAB,
        k.UP,
        k.DOWN,
        k.ENTER
      ]
    }), this.flipper.onFlip(this.onFlip);
  }
  /**
   * Returns list of elements available for keyboard navigation.
   * Contains both usual popover items elements and custom html content.
   */
  get flippableElements() {
    const s = this.items.map((t) => t.getElement());
    return (this.customContentFlippableItems || []).concat(s);
  }
  get height() {
    let s = 0;
    if (this.nodes.popover === null)
      return s;
    const e = this.nodes.popover.cloneNode(!0);
    return e.style.visibility = "hidden", e.style.position = "absolute", e.style.top = "-1000px", e.classList.add(N.CSS.popoverOpened), document.body.appendChild(e), s = e.offsetHeight, e.remove(), s;
  }
  /**
   * Checks if popover should be opened bottom.
   * It should happen when there is enough space below or not enough space above
   */
  get shouldOpenBottom() {
    const s = this.nodes.popover.getBoundingClientRect(), e = this.scopeElement.getBoundingClientRect(), t = this.height, o = s.top + t, i = s.top - t, n = Math.min(window.innerHeight, e.bottom);
    return i < e.top || o <= n;
  }
  /**
   * Toggles nothing found message visibility
   *
   * @param isDisplayed - true if the message should be displayed
   */
  toggleNothingFoundMessage(s) {
    this.nodes.nothingFoundMessage.classList.toggle(N.CSS.nothingFoundMessageDisplayed, s);
  }
  /**
   * Toggles custom content visibility
   *
   * @param isDisplayed - true if custom content should be displayed
   */
  toggleCustomContent(s) {
    var e;
    (e = this.nodes.customContent) == null || e.classList.toggle(N.CSS.customContentHidden, s);
  }
  /**
   * - Toggles item active state, if clicked popover item has property 'toggle' set to true.
   *
   * - Performs radiobutton-like behavior if the item has property 'toggle' set to string key.
   * (All the other items with the same key get inactive, and the item gets active)
   *
   * @param clickedItem - popover item that was clicked
   */
  toggleItemActivenessIfNeeded(s) {
    if (s.toggle === !0 && s.toggleActive(), typeof s.toggle == "string") {
      const e = this.items.filter((t) => t.toggle === s.toggle);
      if (e.length === 1) {
        s.toggleActive();
        return;
      }
      e.forEach((t) => {
        t.toggleActive(t === s);
      });
    }
  }
};
let je = N;
Wo([
  le
], je.prototype, "height", 1);
class Yo extends y {
  constructor() {
    super(...arguments), this.opened = !1, this.selection = new b(), this.onPopoverClose = () => {
      this.close();
    };
  }
  /**
   * Module Events
   *
   * @returns {{opened: string, closed: string}}
   */
  get events() {
    return {
      opened: "block-settings-opened",
      closed: "block-settings-closed"
    };
  }
  /**
   * Block Settings CSS
   */
  get CSS() {
    return {
      settings: "ce-settings"
    };
  }
  /**
   * Getter for inner popover's flipper instance
   *
   * @todo remove once BlockSettings becomes standalone non-module class
   */
  get flipper() {
    var e;
    return (e = this.popover) == null ? void 0 : e.flipper;
  }
  /**
   * Panel with block settings with 2 sections:
   *  - Tool's Settings
   *  - Default Settings [Move, Remove, etc]
   */
  make() {
    this.nodes.wrapper = c.make("div", [this.CSS.settings]);
  }
  /**
   * Destroys module
   */
  destroy() {
    this.removeAllNodes();
  }
  /**
   * Open Block Settings pane
   *
   * @param targetBlock - near which Block we should open BlockSettings
   */
  open(e = this.Editor.BlockManager.currentBlock) {
    this.opened = !0, this.selection.save(), this.Editor.BlockSelection.selectBlock(e), this.Editor.BlockSelection.clearCache();
    const [t, o] = e.getTunes();
    this.eventsDispatcher.emit(this.events.opened), this.popover = new je({
      searchable: !0,
      items: t.map((i) => this.resolveTuneAliases(i)),
      customContent: o,
      customContentFlippableItems: this.getControls(o),
      scopeElement: this.Editor.API.methods.ui.nodes.redactor,
      messages: {
        nothingFound: z.ui(K.ui.popover, "Nothing found"),
        search: z.ui(K.ui.popover, "Filter")
      }
    }), this.popover.on(be.Close, this.onPopoverClose), this.nodes.wrapper.append(this.popover.getElement()), this.popover.show();
  }
  /**
   * Returns root block settings element
   */
  getElement() {
    return this.nodes.wrapper;
  }
  /**
   * Close Block Settings pane
   */
  close() {
    this.opened && (this.opened = !1, b.isAtEditor || this.selection.restore(), this.selection.clearSaved(), !this.Editor.CrossBlockSelection.isCrossBlockSelectionStarted && this.Editor.BlockManager.currentBlock && this.Editor.BlockSelection.unselectBlock(this.Editor.BlockManager.currentBlock), this.eventsDispatcher.emit(this.events.closed), this.popover && (this.popover.off(be.Close, this.onPopoverClose), this.popover.destroy(), this.popover.getElement().remove(), this.popover = null));
  }
  /**
   * Returns list of buttons and inputs inside specified container
   *
   * @param container - container to query controls inside of
   */
  getControls(e) {
    const { StylesAPI: t } = this.Editor, o = e.querySelectorAll(
      `.${t.classes.settingsButton}, ${c.allInputsSelector}`
    );
    return Array.from(o);
  }
  /**
   * Resolves aliases in tunes menu items
   *
   * @param item - item with resolved aliases
   */
  resolveTuneAliases(e) {
    const t = Ao(e, { label: "title" });
    return e.confirmation && (t.confirmation = this.resolveTuneAliases(e.confirmation)), t;
  }
}
class $ extends y {
  constructor() {
    super(...arguments), this.opened = !1, this.tools = [], this.flipper = null, this.togglingCallback = null;
  }
  /**
   * CSS getter
   */
  static get CSS() {
    return {
      conversionToolbarWrapper: "ce-conversion-toolbar",
      conversionToolbarShowed: "ce-conversion-toolbar--showed",
      conversionToolbarTools: "ce-conversion-toolbar__tools",
      conversionToolbarLabel: "ce-conversion-toolbar__label",
      conversionTool: "ce-conversion-tool",
      conversionToolHidden: "ce-conversion-tool--hidden",
      conversionToolIcon: "ce-conversion-tool__icon",
      conversionToolSecondaryLabel: "ce-conversion-tool__secondary-label",
      conversionToolFocused: "ce-conversion-tool--focused",
      conversionToolActive: "ce-conversion-tool--active"
    };
  }
  /**
   * Create UI of Conversion Toolbar
   */
  make() {
    this.nodes.wrapper = c.make("div", [
      $.CSS.conversionToolbarWrapper,
      ...this.isRtl ? [this.Editor.UI.CSS.editorRtlFix] : []
    ]), this.nodes.tools = c.make("div", $.CSS.conversionToolbarTools);
    const e = c.make("div", $.CSS.conversionToolbarLabel, {
      textContent: z.ui(K.ui.inlineToolbar.converter, "Convert to")
    });
    return this.addTools(), this.enableFlipper(), c.append(this.nodes.wrapper, e), c.append(this.nodes.wrapper, this.nodes.tools), this.nodes.wrapper;
  }
  /**
   * Deactivates flipper and removes all nodes
   */
  destroy() {
    this.flipper && (this.flipper.deactivate(), this.flipper = null), this.removeAllNodes();
  }
  /**
   * Toggle conversion dropdown visibility
   *
   * @param {Function} [togglingCallback] — callback that will accept opening state
   */
  toggle(e) {
    this.opened ? this.close() : this.open(), M(e) && (this.togglingCallback = e);
  }
  /**
   * Shows Conversion Toolbar
   */
  open() {
    this.filterTools(), this.opened = !0, this.nodes.wrapper.classList.add($.CSS.conversionToolbarShowed), window.requestAnimationFrame(() => {
      this.flipper.activate(this.tools.map((e) => e.button).filter((e) => !e.classList.contains($.CSS.conversionToolHidden))), this.flipper.focusFirst(), M(this.togglingCallback) && this.togglingCallback(!0);
    });
  }
  /**
   * Closes Conversion Toolbar
   */
  close() {
    this.opened = !1, this.flipper.deactivate(), this.nodes.wrapper.classList.remove($.CSS.conversionToolbarShowed), M(this.togglingCallback) && this.togglingCallback(!1);
  }
  /**
   * Returns true if it has more than one tool available for convert in
   */
  hasTools() {
    return this.tools.length === 1 ? this.tools[0].name !== this.config.defaultBlock : !0;
  }
  /**
   * Replaces one Block with another
   * For that Tools must provide import/export methods
   *
   * @param {string} replacingToolName - name of Tool which replaces current
   * @param blockDataOverrides - If this conversion fired by the one of multiple Toolbox items, extend converted data with this item's "data" overrides
   */
  async replaceWithBlock(e, t) {
    const { BlockManager: o, BlockSelection: i, InlineToolbar: n, Caret: r } = this.Editor;
    o.convert(this.Editor.BlockManager.currentBlock, e, t), i.clearSelection(), this.close(), n.close(), window.requestAnimationFrame(() => {
      r.setToBlock(this.Editor.BlockManager.currentBlock, r.positions.END);
    });
  }
  /**
   * Iterates existing Tools and inserts to the ConversionToolbar
   * if tools have ability to import
   */
  addTools() {
    const e = this.Editor.Tools.blockTools;
    Array.from(e.entries()).forEach(([t, o]) => {
      var n;
      const i = o.conversionConfig;
      !i || !i.import || (n = o.toolbox) == null || n.forEach(
        (r) => this.addToolIfValid(t, r)
      );
    });
  }
  /**
   * Inserts a tool to the ConversionToolbar if the tool's toolbox config is valid
   *
   * @param name - tool's name
   * @param toolboxSettings - tool's single toolbox setting
   */
  addToolIfValid(e, t) {
    W(t) || !t.icon || this.addTool(e, t);
  }
  /**
   * Add tool to the Conversion Toolbar
   *
   * @param toolName - name of Tool to add
   * @param toolboxItem - tool's toolbox item data
   */
  addTool(e, t) {
    var r;
    const o = c.make("div", [$.CSS.conversionTool]), i = c.make("div", [$.CSS.conversionToolIcon]);
    o.dataset.tool = e, i.innerHTML = t.icon, c.append(o, i), c.append(o, c.text(z.t(K.toolNames, t.title || re(e))));
    const n = (r = this.Editor.Tools.blockTools.get(e)) == null ? void 0 : r.shortcut;
    if (n) {
      const a = c.make("span", $.CSS.conversionToolSecondaryLabel, {
        innerText: ye(n)
      });
      c.append(o, a);
    }
    c.append(this.nodes.tools, o), this.tools.push({
      name: e,
      button: o,
      toolboxItem: t
    }), this.listeners.on(o, "click", async () => {
      await this.replaceWithBlock(e, t.data);
    });
  }
  /**
   * Hide current Tool and show others
   */
  async filterTools() {
    const { currentBlock: e } = this.Editor.BlockManager, t = await e.getActiveToolboxEntry();
    function o(i, n) {
      return i.icon === n.icon && i.title === n.title;
    }
    this.tools.forEach((i) => {
      let n = !1;
      if (t) {
        const r = o(t, i.toolboxItem);
        n = i.button.dataset.tool === e.name && r;
      }
      i.button.hidden = n, i.button.classList.toggle($.CSS.conversionToolHidden, n);
    });
  }
  /**
   * Prepare Flipper to be able to leaf tools by arrows/tab
   */
  enableFlipper() {
    this.flipper = new q({
      focusedItemClass: $.CSS.conversionToolFocused
    });
  }
}
var De = {}, Ko = {
  get exports() {
    return De;
  },
  set exports(s) {
    De = s;
  }
};
/*!
 * Library for handling keyboard shortcuts
 * @copyright CodeX (https://codex.so)
 * @license MIT
 * @author CodeX (https://codex.so)
 * @version 1.2.0
 */
(function(s, e) {
  (function(t, o) {
    s.exports = o();
  })(window, function() {
    return function(t) {
      var o = {};
      function i(n) {
        if (o[n])
          return o[n].exports;
        var r = o[n] = { i: n, l: !1, exports: {} };
        return t[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports;
      }
      return i.m = t, i.c = o, i.d = function(n, r, a) {
        i.o(n, r) || Object.defineProperty(n, r, { enumerable: !0, get: a });
      }, i.r = function(n) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n, "__esModule", { value: !0 });
      }, i.t = function(n, r) {
        if (1 & r && (n = i(n)), 8 & r || 4 & r && typeof n == "object" && n && n.__esModule)
          return n;
        var a = /* @__PURE__ */ Object.create(null);
        if (i.r(a), Object.defineProperty(a, "default", { enumerable: !0, value: n }), 2 & r && typeof n != "string")
          for (var l in n)
            i.d(a, l, function(d) {
              return n[d];
            }.bind(null, l));
        return a;
      }, i.n = function(n) {
        var r = n && n.__esModule ? function() {
          return n.default;
        } : function() {
          return n;
        };
        return i.d(r, "a", r), r;
      }, i.o = function(n, r) {
        return Object.prototype.hasOwnProperty.call(n, r);
      }, i.p = "", i(i.s = 0);
    }([function(t, o, i) {
      function n(l, d) {
        for (var u = 0; u < d.length; u++) {
          var h = d[u];
          h.enumerable = h.enumerable || !1, h.configurable = !0, "value" in h && (h.writable = !0), Object.defineProperty(l, h.key, h);
        }
      }
      function r(l, d, u) {
        return d && n(l.prototype, d), u && n(l, u), l;
      }
      i.r(o);
      var a = function() {
        function l(d) {
          var u = this;
          (function(h, f) {
            if (!(h instanceof f))
              throw new TypeError("Cannot call a class as a function");
          })(this, l), this.commands = {}, this.keys = {}, this.name = d.name, this.parseShortcutName(d.name), this.element = d.on, this.callback = d.callback, this.executeShortcut = function(h) {
            u.execute(h);
          }, this.element.addEventListener("keydown", this.executeShortcut, !1);
        }
        return r(l, null, [{ key: "supportedCommands", get: function() {
          return { SHIFT: ["SHIFT"], CMD: ["CMD", "CONTROL", "COMMAND", "WINDOWS", "CTRL"], ALT: ["ALT", "OPTION"] };
        } }, { key: "keyCodes", get: function() {
          return { 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, BACKSPACE: 8, ENTER: 13, ESCAPE: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46, ".": 190 };
        } }]), r(l, [{ key: "parseShortcutName", value: function(d) {
          d = d.split("+");
          for (var u = 0; u < d.length; u++) {
            d[u] = d[u].toUpperCase();
            var h = !1;
            for (var f in l.supportedCommands)
              if (l.supportedCommands[f].includes(d[u])) {
                h = this.commands[f] = !0;
                break;
              }
            h || (this.keys[d[u]] = !0);
          }
          for (var x in l.supportedCommands)
            this.commands[x] || (this.commands[x] = !1);
        } }, { key: "execute", value: function(d) {
          var u, h = { CMD: d.ctrlKey || d.metaKey, SHIFT: d.shiftKey, ALT: d.altKey }, f = !0;
          for (u in this.commands)
            this.commands[u] !== h[u] && (f = !1);
          var x, p = !0;
          for (x in this.keys)
            p = p && d.keyCode === l.keyCodes[x];
          f && p && this.callback(d);
        } }, { key: "remove", value: function() {
          this.element.removeEventListener("keydown", this.executeShortcut);
        } }]), l;
      }();
      o.default = a;
    }]).default;
  });
})(Ko);
const Xo = /* @__PURE__ */ Pe(De);
class Vo {
  constructor() {
    this.registeredShortcuts = /* @__PURE__ */ new Map();
  }
  /**
   * Register shortcut
   *
   * @param shortcut - shortcut options
   */
  add(e) {
    if (this.findShortcut(e.on, e.name))
      throw Error(
        `Shortcut ${e.name} is already registered for ${e.on}. Please remove it before add a new handler.`
      );
    const o = new Xo({
      name: e.name,
      on: e.on,
      callback: e.handler
    }), i = this.registeredShortcuts.get(e.on) || [];
    this.registeredShortcuts.set(e.on, [...i, o]);
  }
  /**
   * Remove shortcut
   *
   * @param element - Element shortcut is set for
   * @param name - shortcut name
   */
  remove(e, t) {
    const o = this.findShortcut(e, t);
    if (!o)
      return;
    o.remove();
    const i = this.registeredShortcuts.get(e);
    this.registeredShortcuts.set(e, i.filter((n) => n !== o));
  }
  /**
   * Get Shortcut instance if exist
   *
   * @param element - Element shorcut is set for
   * @param shortcut - shortcut name
   * @returns {number} index - shortcut index if exist
   */
  findShortcut(e, t) {
    return (this.registeredShortcuts.get(e) || []).find(({ name: i }) => i === t);
  }
}
const ae = new Vo();
var qo = Object.defineProperty, Zo = Object.getOwnPropertyDescriptor, xt = (s, e, t, o) => {
  for (var i = o > 1 ? void 0 : o ? Zo(e, t) : e, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (i = (o ? r(e, t, i) : r(i)) || i);
  return o && i && qo(e, t, i), i;
}, ke = /* @__PURE__ */ ((s) => (s.Opened = "toolbox-opened", s.Closed = "toolbox-closed", s.BlockAdded = "toolbox-block-added", s))(ke || {});
const wt = class extends Ee {
  /**
   * Toolbox constructor
   *
   * @param options - available parameters
   * @param options.api - Editor API methods
   * @param options.tools - Tools available to check whether some of them should be displayed at the Toolbox or not
   */
  constructor({ api: s, tools: e, i18nLabels: t }) {
    super(), this.opened = !1, this.nodes = {
      toolbox: null
    }, this.onPopoverClose = () => {
      this.opened = !1, this.emit(
        "toolbox-closed"
        /* Closed */
      );
    }, this.api = s, this.tools = e, this.i18nLabels = t;
  }
  /**
   * Returns True if Toolbox is Empty and nothing to show
   *
   * @returns {boolean}
   */
  get isEmpty() {
    return this.toolsToBeDisplayed.length === 0;
  }
  /**
   * CSS styles
   *
   * @returns {Object<string, string>}
   */
  static get CSS() {
    return {
      toolbox: "ce-toolbox"
    };
  }
  /**
   * Makes the Toolbox
   */
  make() {
    return this.popover = new je({
      scopeElement: this.api.ui.nodes.redactor,
      searchable: !0,
      messages: {
        nothingFound: this.i18nLabels.nothingFound,
        search: this.i18nLabels.filter
      },
      items: this.toolboxItemsToBeDisplayed
    }), this.popover.on(be.Close, this.onPopoverClose), this.enableShortcuts(), this.nodes.toolbox = this.popover.getElement(), this.nodes.toolbox.classList.add(wt.CSS.toolbox), this.nodes.toolbox;
  }
  /**
   * Returns true if the Toolbox has the Flipper activated and the Flipper has selected button
   */
  hasFocus() {
    var s;
    return (s = this.popover) == null ? void 0 : s.hasFocus();
  }
  /**
   * Destroy Module
   */
  destroy() {
    var s;
    super.destroy(), this.nodes && this.nodes.toolbox && (this.nodes.toolbox.remove(), this.nodes.toolbox = null), this.removeAllShortcuts(), (s = this.popover) == null || s.off(be.Close, this.onPopoverClose);
  }
  /**
   * Toolbox Tool's button click handler
   *
   * @param toolName - tool type to be activated
   * @param blockDataOverrides - Block data predefined by the activated Toolbox item
   */
  toolButtonActivated(s, e) {
    this.insertNewBlock(s, e);
  }
  /**
   * Open Toolbox with Tools
   */
  open() {
    var s;
    this.isEmpty || ((s = this.popover) == null || s.show(), this.opened = !0, this.emit(
      "toolbox-opened"
      /* Opened */
    ));
  }
  /**
   * Close Toolbox
   */
  close() {
    var s;
    (s = this.popover) == null || s.hide(), this.opened = !1, this.emit(
      "toolbox-closed"
      /* Closed */
    );
  }
  /**
   * Close Toolbox
   */
  toggle() {
    this.opened ? this.close() : this.open();
  }
  get toolsToBeDisplayed() {
    const s = [];
    return this.tools.forEach((e) => {
      e.toolbox && s.push(e);
    }), s;
  }
  get toolboxItemsToBeDisplayed() {
    const s = (e, t) => ({
      icon: e.icon,
      title: z.t(K.toolNames, e.title || re(t.name)),
      name: t.name,
      onActivate: () => {
        this.toolButtonActivated(t.name, e.data);
      },
      secondaryLabel: t.shortcut ? ye(t.shortcut) : ""
    });
    return this.toolsToBeDisplayed.reduce((e, t) => (Array.isArray(t.toolbox) ? t.toolbox.forEach((o) => {
      e.push(s(o, t));
    }) : t.toolbox !== void 0 && e.push(s(t.toolbox, t)), e), []);
  }
  /**
   * Iterate all tools and enable theirs shortcuts if specified
   */
  enableShortcuts() {
    this.toolsToBeDisplayed.forEach((s) => {
      const e = s.shortcut;
      e && this.enableShortcutForTool(s.name, e);
    });
  }
  /**
   * Enable shortcut Block Tool implemented shortcut
   *
   * @param {string} toolName - Tool name
   * @param {string} shortcut - shortcut according to the ShortcutData Module format
   */
  enableShortcutForTool(s, e) {
    ae.add({
      name: e,
      on: this.api.ui.nodes.redactor,
      handler: (t) => {
        t.preventDefault();
        const o = this.api.blocks.getCurrentBlockIndex(), i = this.api.blocks.getBlockByIndex(o);
        if (i)
          try {
            this.api.blocks.convert(i.id, s), window.requestAnimationFrame(() => {
              this.api.caret.setToBlock(o, "end");
            });
            return;
          } catch {
          }
        this.insertNewBlock(s);
      }
    });
  }
  /**
   * Removes all added shortcuts
   * Fired when the Read-Only mode is activated
   */
  removeAllShortcuts() {
    this.toolsToBeDisplayed.forEach((s) => {
      const e = s.shortcut;
      e && ae.remove(this.api.ui.nodes.redactor, e);
    });
  }
  /**
   * Inserts new block
   * Can be called when button clicked on Toolbox or by ShortcutData
   *
   * @param {string} toolName - Tool name
   * @param blockDataOverrides - predefined Block data
   */
  async insertNewBlock(s, e) {
    const t = this.api.blocks.getCurrentBlockIndex(), o = this.api.blocks.getBlockByIndex(t);
    if (!o)
      return;
    const i = o.isEmpty ? t : t + 1;
    let n;
    if (e) {
      const a = await this.api.blocks.composeBlockData(s);
      n = Object.assign(a, e);
    }
    const r = this.api.blocks.insert(
      s,
      n,
      void 0,
      i,
      void 0,
      o.isEmpty
    );
    r.call(X.APPEND_CALLBACK), this.api.caret.setToBlock(i), this.emit("toolbox-block-added", {
      block: r
    }), this.api.toolbar.close();
  }
};
let $e = wt;
xt([
  le
], $e.prototype, "toolsToBeDisplayed", 1);
xt([
  le
], $e.prototype, "toolboxItemsToBeDisplayed", 1);
const yt = "block hovered";
class Go extends y {
  /**
   * @class
   * @param moduleConfiguration - Module Configuration
   * @param moduleConfiguration.config - Editor's config
   * @param moduleConfiguration.eventsDispatcher - Editor's event dispatcher
   */
  constructor({ config: e, eventsDispatcher: t }) {
    super({
      config: e,
      eventsDispatcher: t
    }), this.toolboxInstance = null;
  }
  /**
   * CSS styles
   *
   * @returns {object}
   */
  get CSS() {
    return {
      toolbar: "ce-toolbar",
      content: "ce-toolbar__content",
      actions: "ce-toolbar__actions",
      actionsOpened: "ce-toolbar__actions--opened",
      toolbarOpened: "ce-toolbar--opened",
      openedToolboxHolderModifier: "codex-editor--toolbox-opened",
      plusButton: "ce-toolbar__plus",
      plusButtonShortcut: "ce-toolbar__plus-shortcut",
      settingsToggler: "ce-toolbar__settings-btn",
      settingsTogglerHidden: "ce-toolbar__settings-btn--hidden"
    };
  }
  /**
   * Returns the Toolbar opening state
   *
   * @returns {boolean}
   */
  get opened() {
    return this.nodes.wrapper.classList.contains(this.CSS.toolbarOpened);
  }
  /**
   * Public interface for accessing the Toolbox
   */
  get toolbox() {
    var e;
    return {
      opened: (e = this.toolboxInstance) == null ? void 0 : e.opened,
      close: () => {
        var t;
        (t = this.toolboxInstance) == null || t.close();
      },
      open: () => {
        if (this.toolboxInstance === null) {
          T("toolbox.open() called before initialization is finished", "warn");
          return;
        }
        this.Editor.BlockManager.currentBlock = this.hoveredBlock, this.toolboxInstance.open();
      },
      toggle: () => {
        if (this.toolboxInstance === null) {
          T("toolbox.toggle() called before initialization is finished", "warn");
          return;
        }
        this.toolboxInstance.toggle();
      },
      hasFocus: () => {
        var t;
        return (t = this.toolboxInstance) == null ? void 0 : t.hasFocus();
      }
    };
  }
  /**
   * Block actions appearance manipulations
   */
  get blockActions() {
    return {
      hide: () => {
        this.nodes.actions.classList.remove(this.CSS.actionsOpened);
      },
      show: () => {
        this.nodes.actions.classList.add(this.CSS.actionsOpened);
      }
    };
  }
  /**
   * Methods for working with Block Tunes toggler
   */
  get blockTunesToggler() {
    return {
      hide: () => this.nodes.settingsToggler.classList.add(this.CSS.settingsTogglerHidden),
      show: () => this.nodes.settingsToggler.classList.remove(this.CSS.settingsTogglerHidden)
    };
  }
  /**
   * Toggles read-only mode
   *
   * @param {boolean} readOnlyEnabled - read-only mode
   */
  toggleReadOnly(e) {
    e ? (this.destroy(), this.Editor.BlockSettings.destroy(), this.disableModuleBindings()) : window.requestIdleCallback(() => {
      this.drawUI(), this.enableModuleBindings();
    }, { timeout: 2e3 });
  }
  /**
   * Move Toolbar to the passed (or current) Block
   *
   * @param block - block to move Toolbar near it
   */
  moveAndOpen(e = this.Editor.BlockManager.currentBlock) {
    if (this.toolboxInstance === null) {
      T("Can't open Toolbar since Editor initialization is not finished yet", "warn");
      return;
    }
    if (this.toolboxInstance.opened && this.toolboxInstance.close(), this.Editor.BlockSettings.opened && this.Editor.BlockSettings.close(), !e)
      return;
    this.hoveredBlock = e;
    const t = e.holder, { isMobile: o } = this.Editor.UI, i = e.pluginsContent, n = window.getComputedStyle(i), r = parseInt(n.paddingTop, 10), a = t.offsetHeight;
    let l;
    o ? l = t.offsetTop + a : l = t.offsetTop + r, this.nodes.wrapper.style.top = `${Math.floor(l)}px`, this.Editor.BlockManager.blocks.length === 1 && e.isEmpty ? this.blockTunesToggler.hide() : this.blockTunesToggler.show(), this.open();
  }
  /**
   * Close the Toolbar
   */
  close() {
    var e, t;
    this.Editor.ReadOnly.isEnabled || ((e = this.nodes.wrapper) == null || e.classList.remove(this.CSS.toolbarOpened), this.blockActions.hide(), (t = this.toolboxInstance) == null || t.close(), this.Editor.BlockSettings.close(), this.reset());
  }
  /**
   * Reset the Toolbar position to prevent DOM height growth, for example after blocks deletion
   */
  reset() {
    this.nodes.wrapper.style.top = "unset";
  }
  /**
   * Open Toolbar with Plus Button and Actions
   *
   * @param {boolean} withBlockActions - by default, Toolbar opens with Block Actions.
   *                                     This flag allows to open Toolbar without Actions.
   */
  open(e = !0) {
    this.nodes.wrapper.classList.add(this.CSS.toolbarOpened), e ? this.blockActions.show() : this.blockActions.hide();
  }
  /**
   * Draws Toolbar elements
   */
  make() {
    this.nodes.wrapper = c.make("div", this.CSS.toolbar), ["content", "actions"].forEach((i) => {
      this.nodes[i] = c.make("div", this.CSS[i]);
    }), c.append(this.nodes.wrapper, this.nodes.content), c.append(this.nodes.content, this.nodes.actions), this.nodes.plusButton = c.make("div", this.CSS.plusButton, {
      innerHTML: Fo
    }), c.append(this.nodes.actions, this.nodes.plusButton), this.readOnlyMutableListeners.on(this.nodes.plusButton, "click", () => {
      Re(!0), this.plusButtonClicked();
    }, !1);
    const e = c.make("div");
    e.appendChild(document.createTextNode(z.ui(K.ui.toolbar.toolbox, "Add"))), e.appendChild(c.make("div", this.CSS.plusButtonShortcut, {
      textContent: "/"
    })), ge(this.nodes.plusButton, e, {
      hidingDelay: 400
    }), this.nodes.settingsToggler = c.make("span", this.CSS.settingsToggler, {
      innerHTML: Po
    }), c.append(this.nodes.actions, this.nodes.settingsToggler);
    const t = c.make("div"), o = c.text(z.ui(K.ui.blockTunes.toggler, "Click to tune"));
    t.appendChild(o), t.appendChild(c.make("div", this.CSS.plusButtonShortcut, {
      textContent: ye("CMD + /")
    })), ge(this.nodes.settingsToggler, t, {
      hidingDelay: 400
    }), c.append(this.nodes.actions, this.makeToolbox()), c.append(this.nodes.actions, this.Editor.BlockSettings.getElement()), c.append(this.Editor.UI.nodes.wrapper, this.nodes.wrapper);
  }
  /**
   * Creates the Toolbox instance and return it's rendered element
   */
  makeToolbox() {
    return this.toolboxInstance = new $e({
      api: this.Editor.API.methods,
      tools: this.Editor.Tools.blockTools,
      i18nLabels: {
        filter: z.ui(K.ui.popover, "Filter"),
        nothingFound: z.ui(K.ui.popover, "Nothing found")
      }
    }), this.toolboxInstance.on(ke.Opened, () => {
      this.Editor.UI.nodes.wrapper.classList.add(this.CSS.openedToolboxHolderModifier);
    }), this.toolboxInstance.on(ke.Closed, () => {
      this.Editor.UI.nodes.wrapper.classList.remove(this.CSS.openedToolboxHolderModifier);
    }), this.toolboxInstance.on(ke.BlockAdded, ({ block: e }) => {
      const { BlockManager: t, Caret: o } = this.Editor, i = t.getBlockById(e.id);
      i.inputs.length === 0 && (i === t.lastBlock ? (t.insertAtEnd(), o.setToBlock(t.lastBlock)) : o.setToBlock(t.nextBlock));
    }), this.toolboxInstance.make();
  }
  /**
   * Handler for Plus Button
   */
  plusButtonClicked() {
    var e;
    this.Editor.BlockManager.currentBlock = this.hoveredBlock, (e = this.toolboxInstance) == null || e.toggle();
  }
  /**
   * Enable bindings
   */
  enableModuleBindings() {
    this.readOnlyMutableListeners.on(this.nodes.settingsToggler, "mousedown", (e) => {
      var t;
      e.stopPropagation(), this.settingsTogglerClicked(), (t = this.toolboxInstance) != null && t.opened && this.toolboxInstance.close(), Re(!0);
    }, !0), te() || this.eventsDispatcher.on(yt, (e) => {
      var t;
      this.Editor.BlockSettings.opened || (t = this.toolboxInstance) != null && t.opened || this.moveAndOpen(e.block);
    });
  }
  /**
   * Disable bindings
   */
  disableModuleBindings() {
    this.readOnlyMutableListeners.clearAll();
  }
  /**
   * Clicks on the Block Settings toggler
   */
  settingsTogglerClicked() {
    this.Editor.BlockManager.currentBlock = this.hoveredBlock, this.Editor.BlockSettings.opened ? this.Editor.BlockSettings.close() : this.Editor.BlockSettings.open(this.hoveredBlock);
  }
  /**
   * Draws Toolbar UI
   *
   * Toolbar contains BlockSettings and Toolbox.
   * That's why at first we draw its components and then Toolbar itself
   *
   * Steps:
   *  - Make Toolbar dependent components like BlockSettings, Toolbox and so on
   *  - Make itself and append dependent nodes to itself
   *
   */
  drawUI() {
    this.Editor.BlockSettings.make(), this.make();
  }
  /**
   * Removes all created and saved HTMLElements
   * It is used in Read-Only mode
   */
  destroy() {
    this.removeAllNodes(), this.toolboxInstance && this.toolboxInstance.destroy();
  }
}
var Be = /* @__PURE__ */ ((s) => (s[s.Block = 0] = "Block", s[s.Inline = 1] = "Inline", s[s.Tune = 2] = "Tune", s))(Be || {}), ve = /* @__PURE__ */ ((s) => (s.Shortcut = "shortcut", s.Toolbox = "toolbox", s.EnabledInlineTools = "inlineToolbar", s.EnabledBlockTunes = "tunes", s.Config = "config", s))(ve || {}), Et = /* @__PURE__ */ ((s) => (s.Shortcut = "shortcut", s.SanitizeConfig = "sanitize", s))(Et || {}), se = /* @__PURE__ */ ((s) => (s.IsEnabledLineBreaks = "enableLineBreaks", s.Toolbox = "toolbox", s.ConversionConfig = "conversionConfig", s.IsReadOnlySupported = "isReadOnlySupported", s.PasteConfig = "pasteConfig", s))(se || {}), We = /* @__PURE__ */ ((s) => (s.IsInline = "isInline", s.Title = "title", s))(We || {}), Bt = /* @__PURE__ */ ((s) => (s.IsTune = "isTune", s))(Bt || {});
class Ye {
  /**
   * @class
   * @param {ConstructorOptions} options - Constructor options
   */
  constructor({
    name: e,
    constructable: t,
    config: o,
    api: i,
    isDefault: n,
    isInternal: r = !1,
    defaultPlaceholder: a
  }) {
    this.api = i, this.name = e, this.constructable = t, this.config = o, this.isDefault = n, this.isInternal = r, this.defaultPlaceholder = a;
  }
  /**
   * Returns Tool user configuration
   */
  get settings() {
    const e = this.config.config || {};
    return this.isDefault && !("placeholder" in e) && this.defaultPlaceholder && (e.placeholder = this.defaultPlaceholder), e;
  }
  /**
   * Calls Tool's reset method
   */
  reset() {
    if (M(this.constructable.reset))
      return this.constructable.reset();
  }
  /**
   * Calls Tool's prepare method
   */
  prepare() {
    if (M(this.constructable.prepare))
      return this.constructable.prepare({
        toolName: this.name,
        config: this.settings
      });
  }
  /**
   * Returns shortcut for Tool (internal or specified by user)
   */
  get shortcut() {
    const e = this.constructable.shortcut;
    return this.config.shortcut || e;
  }
  /**
   * Returns Tool's sanitizer configuration
   */
  get sanitizeConfig() {
    return this.constructable.sanitize || {};
  }
  /**
   * Returns true if Tools is inline
   */
  isInline() {
    return this.type === 1;
  }
  /**
   * Returns true if Tools is block
   */
  isBlock() {
    return this.type === 0;
  }
  /**
   * Returns true if Tools is tune
   */
  isTune() {
    return this.type === 2;
  }
}
class Jo extends y {
  /**
   * @class
   * @param moduleConfiguration - Module Configuration
   * @param moduleConfiguration.config - Editor's config
   * @param moduleConfiguration.eventsDispatcher - Editor's event dispatcher
   */
  constructor({ config: e, eventsDispatcher: t }) {
    super({
      config: e,
      eventsDispatcher: t
    }), this.CSS = {
      inlineToolbar: "ce-inline-toolbar",
      inlineToolbarShowed: "ce-inline-toolbar--showed",
      inlineToolbarLeftOriented: "ce-inline-toolbar--left-oriented",
      inlineToolbarRightOriented: "ce-inline-toolbar--right-oriented",
      inlineToolbarShortcut: "ce-inline-toolbar__shortcut",
      buttonsWrapper: "ce-inline-toolbar__buttons",
      actionsWrapper: "ce-inline-toolbar__actions",
      inlineToolButton: "ce-inline-tool",
      inputField: "cdx-input",
      focusedButton: "ce-inline-tool--focused",
      conversionToggler: "ce-inline-toolbar__dropdown",
      conversionTogglerArrow: "ce-inline-toolbar__dropdown-arrow",
      conversionTogglerHidden: "ce-inline-toolbar__dropdown--hidden",
      conversionTogglerContent: "ce-inline-toolbar__dropdown-content",
      togglerAndButtonsWrapper: "ce-inline-toolbar__toggler-and-button-wrapper"
    }, this.opened = !1, this.toolbarVerticalMargin = te() ? 20 : 6, this.buttonsList = null, this.width = 0, this.flipper = null;
  }
  /**
   * Toggles read-only mode
   *
   * @param {boolean} readOnlyEnabled - read-only mode
   */
  toggleReadOnly(e) {
    e ? (this.destroy(), this.Editor.ConversionToolbar.destroy()) : window.requestIdleCallback(() => {
      this.make();
    }, { timeout: 2e3 });
  }
  /**
   *  Moving / appearance
   *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  /**
   * Shows Inline Toolbar if something is selected
   *
   * @param [needToClose] - pass true to close toolbar if it is not allowed.
   *                                  Avoid to use it just for closing IT, better call .close() clearly.
   * @param [needToShowConversionToolbar] - pass false to not to show Conversion Toolbar
   */
  async tryToShow(e = !1, t = !0) {
    e && this.close(), this.allowedToShow() && (await this.addToolsFiltered(t), this.move(), this.open(t), this.Editor.Toolbar.close());
  }
  /**
   * Hides Inline Toolbar
   */
  close() {
    this.opened && (this.Editor.ReadOnly.isEnabled || (this.nodes.wrapper.classList.remove(this.CSS.inlineToolbarShowed), Array.from(this.toolsInstances.entries()).forEach(([e, t]) => {
      const o = this.getToolShortcut(e);
      o && ae.remove(this.Editor.UI.nodes.redactor, o), M(t.clear) && t.clear();
    }), this.reset(), this.opened = !1, this.flipper.deactivate(), this.Editor.ConversionToolbar.close()));
  }
  /**
   * Check if node is contained by Inline Toolbar
   *
   * @param {Node} node — node to check
   */
  containsNode(e) {
    return this.nodes.wrapper === void 0 ? !1 : this.nodes.wrapper.contains(e);
  }
  /**
   * Removes UI and its components
   */
  destroy() {
    this.flipper && (this.flipper.deactivate(), this.flipper = null), this.removeAllNodes();
  }
  /**
   * Making DOM
   */
  make() {
    this.nodes.wrapper = c.make("div", [
      this.CSS.inlineToolbar,
      ...this.isRtl ? [this.Editor.UI.CSS.editorRtlFix] : []
    ]), this.nodes.togglerAndButtonsWrapper = c.make("div", this.CSS.togglerAndButtonsWrapper), this.nodes.buttons = c.make("div", this.CSS.buttonsWrapper), this.nodes.actions = c.make("div", this.CSS.actionsWrapper), this.listeners.on(this.nodes.wrapper, "mousedown", (e) => {
      e.target.closest(`.${this.CSS.actionsWrapper}`) || e.preventDefault();
    }), c.append(this.nodes.wrapper, [this.nodes.togglerAndButtonsWrapper, this.nodes.actions]), c.append(this.Editor.UI.nodes.wrapper, this.nodes.wrapper), this.addConversionToggler(), c.append(this.nodes.togglerAndButtonsWrapper, this.nodes.buttons), this.prepareConversionToolbar(), window.requestAnimationFrame(() => {
      this.recalculateWidth();
    }), this.enableFlipper();
  }
  /**
   * Shows Inline Toolbar
   */
  open() {
    if (this.opened)
      return;
    this.nodes.wrapper.classList.add(this.CSS.inlineToolbarShowed), this.buttonsList = this.nodes.buttons.querySelectorAll(`.${this.CSS.inlineToolButton}`), this.opened = !0;
    let e = Array.from(this.buttonsList);
    e.unshift(this.nodes.conversionToggler), e = e.filter((t) => !t.hidden), this.flipper.activate(e);
  }
  /**
   * Move Toolbar to the selected text
   */
  move() {
    const e = b.rect, t = this.Editor.UI.nodes.wrapper.getBoundingClientRect(), o = {
      x: e.x - t.x,
      y: e.y + e.height - // + window.scrollY
      t.top + this.toolbarVerticalMargin
    };
    o.x + this.width + t.x > this.Editor.UI.contentRect.right && (o.x = this.Editor.UI.contentRect.right - this.width - t.x), this.nodes.wrapper.style.left = Math.floor(o.x) + "px", this.nodes.wrapper.style.top = Math.floor(o.y) + "px";
  }
  /**
   * Clear orientation classes and reset position
   */
  reset() {
    this.nodes.wrapper.classList.remove(
      this.CSS.inlineToolbarLeftOriented,
      this.CSS.inlineToolbarRightOriented
    ), this.nodes.wrapper.style.left = "0", this.nodes.wrapper.style.top = "0";
  }
  /**
   * Need to show Inline Toolbar or not
   */
  allowedToShow() {
    const e = ["IMG", "INPUT"], t = b.get(), o = b.text;
    if (!t || !t.anchorNode || t.isCollapsed || o.length < 1)
      return !1;
    const i = c.isElement(t.anchorNode) ? t.anchorNode : t.anchorNode.parentElement;
    if (t && e.includes(i.tagName) || i.closest('[contenteditable="true"]') === null)
      return !1;
    const r = this.Editor.BlockManager.getBlock(t.anchorNode);
    return r ? r.tool.inlineTools.size !== 0 : !1;
  }
  /**
   * Recalculate inline toolbar width
   */
  recalculateWidth() {
    this.width = this.nodes.wrapper.offsetWidth;
  }
  /**
   * Create a toggler for Conversion Dropdown
   * and prepend it to the buttons list
   */
  addConversionToggler() {
    this.nodes.conversionToggler = c.make("div", this.CSS.conversionToggler), this.nodes.conversionTogglerContent = c.make("div", this.CSS.conversionTogglerContent);
    const e = c.make("div", this.CSS.conversionTogglerArrow, {
      innerHTML: kt
    });
    this.nodes.conversionToggler.appendChild(this.nodes.conversionTogglerContent), this.nodes.conversionToggler.appendChild(e), this.nodes.togglerAndButtonsWrapper.appendChild(this.nodes.conversionToggler), this.listeners.on(this.nodes.conversionToggler, "click", () => {
      this.Editor.ConversionToolbar.toggle((t) => {
        !t && this.opened ? this.flipper.activate() : this.opened && this.flipper.deactivate();
      });
    }), te() === !1 && ge(this.nodes.conversionToggler, z.ui(K.ui.inlineToolbar.converter, "Convert to"), {
      placement: "top",
      hidingDelay: 100
    });
  }
  /**
   * Changes Conversion Dropdown content for current block's Tool
   */
  async setConversionTogglerContent() {
    const { BlockManager: e } = this.Editor, { currentBlock: t } = e, o = t.name, i = t.tool.conversionConfig, n = i && i.export;
    this.nodes.conversionToggler.hidden = !n, this.nodes.conversionToggler.classList.toggle(this.CSS.conversionTogglerHidden, !n);
    const r = await t.getActiveToolboxEntry() || {};
    this.nodes.conversionTogglerContent.innerHTML = r.icon || r.title || re(o);
  }
  /**
   * Makes the Conversion Dropdown
   */
  prepareConversionToolbar() {
    const e = this.Editor.ConversionToolbar.make();
    c.append(this.nodes.wrapper, e);
  }
  /**
   *  Working with Tools
   *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  /**
   * Append only allowed Tools
   *
   * @param {boolean} needToShowConversionToolbar - pass false to not to show Conversion Toolbar (e.g. for Footnotes-like tools)
   */
  async addToolsFiltered(e = !0) {
    const t = b.get(), o = this.Editor.BlockManager.getBlock(t.anchorNode);
    this.nodes.buttons.innerHTML = "", this.nodes.actions.innerHTML = "", this.toolsInstances = /* @__PURE__ */ new Map(), Array.from(o.tool.inlineTools.values()).forEach((i) => {
      this.addTool(i);
    }), e && this.Editor.ConversionToolbar.hasTools() ? await this.setConversionTogglerContent() : this.nodes.conversionToggler.hidden = !0, this.recalculateWidth();
  }
  /**
   * Add tool button and activate clicks
   *
   * @param {InlineTool} tool - InlineTool object
   */
  addTool(e) {
    const t = e.create(), o = t.render();
    if (!o) {
      T("Render method must return an instance of Node", "warn", e.name);
      return;
    }
    if (o.dataset.tool = e.name, this.nodes.buttons.appendChild(o), this.toolsInstances.set(e.name, t), M(t.renderActions)) {
      const a = t.renderActions();
      this.nodes.actions.appendChild(a);
    }
    this.listeners.on(o, "click", (a) => {
      this.toolClicked(t), a.preventDefault();
    });
    const i = this.getToolShortcut(e.name);
    if (i)
      try {
        this.enableShortcuts(t, i);
      } catch {
      }
    const n = c.make("div"), r = z.t(
      K.toolNames,
      e.title || re(e.name)
    );
    n.appendChild(c.text(r)), i && n.appendChild(c.make("div", this.CSS.inlineToolbarShortcut, {
      textContent: ye(i)
    })), te() === !1 && ge(o, n, {
      placement: "top",
      hidingDelay: 100
    }), t.checkState(b.get());
  }
  /**
   * Get shortcut name for tool
   *
   * @param toolName — Tool name
   */
  getToolShortcut(e) {
    const { Tools: t } = this.Editor, o = t.inlineTools.get(e), i = t.internal.inlineTools;
    return Array.from(i.keys()).includes(e) ? this.inlineTools[e][Et.Shortcut] : o.shortcut;
  }
  /**
   * Enable Tool shortcut with Editor Shortcuts Module
   *
   * @param {InlineTool} tool - Tool instance
   * @param {string} shortcut - shortcut according to the ShortcutData Module format
   */
  enableShortcuts(e, t) {
    ae.add({
      name: t,
      handler: (o) => {
        const { currentBlock: i } = this.Editor.BlockManager;
        i && i.tool.enabledInlineTools && (o.preventDefault(), this.toolClicked(e));
      },
      on: this.Editor.UI.nodes.redactor
    });
  }
  /**
   * Inline Tool button clicks
   *
   * @param {InlineTool} tool - Tool's instance
   */
  toolClicked(e) {
    const t = b.range;
    e.surround(t), this.checkToolsState(), e.renderActions !== void 0 && this.flipper.deactivate();
  }
  /**
   * Check Tools` state by selection
   */
  checkToolsState() {
    this.toolsInstances.forEach((e) => {
      e.checkState(b.get());
    });
  }
  /**
   * Get inline tools tools
   * Tools that has isInline is true
   */
  get inlineTools() {
    const e = {};
    return Array.from(this.Editor.Tools.inlineTools.entries()).forEach(([t, o]) => {
      e[t] = o.create();
    }), e;
  }
  /**
   * Allow to leaf buttons by arrows / tab
   * Buttons will be filled on opening
   */
  enableFlipper() {
    this.flipper = new q({
      focusedItemClass: this.CSS.focusedButton,
      allowedKeys: [
        k.ENTER,
        k.TAB
      ]
    });
  }
}
class Qo extends y {
  /**
   * All keydowns on Block
   *
   * @param {KeyboardEvent} event - keydown
   */
  keydown(e) {
    switch (this.beforeKeydownProcessing(e), e.keyCode) {
      case k.BACKSPACE:
        this.backspace(e);
        break;
      case k.DELETE:
        this.delete(e);
        break;
      case k.ENTER:
        this.enter(e);
        break;
      case k.DOWN:
      case k.RIGHT:
        this.arrowRightAndDown(e);
        break;
      case k.UP:
      case k.LEFT:
        this.arrowLeftAndUp(e);
        break;
      case k.TAB:
        this.tabPressed(e);
        break;
      case k.SLASH:
        e.ctrlKey || e.metaKey ? this.commandSlashPressed() : this.slashPressed();
        break;
    }
  }
  /**
   * Fires on keydown before event processing
   *
   * @param {KeyboardEvent} event - keydown
   */
  beforeKeydownProcessing(e) {
    this.needToolbarClosing(e) && lt(e.keyCode) && (this.Editor.Toolbar.close(), this.Editor.ConversionToolbar.close(), e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || this.Editor.BlockSelection.clearSelection(e));
  }
  /**
   * Key up on Block:
   * - shows Inline Toolbar if something selected
   * - shows conversion toolbar with 85% of block selection
   *
   * @param {KeyboardEvent} event - keyup event
   */
  keyup(e) {
    e.shiftKey || this.Editor.UI.checkEmptiness();
  }
  /**
   * Add drop target styles
   *
   * @param {DragEvent} event - drag over event
   */
  dragOver(e) {
    const t = this.Editor.BlockManager.getBlockByChildNode(e.target);
    t.dropTarget = !0;
  }
  /**
   * Remove drop target style
   *
   * @param {DragEvent} event - drag leave event
   */
  dragLeave(e) {
    const t = this.Editor.BlockManager.getBlockByChildNode(e.target);
    t.dropTarget = !1;
  }
  /**
   * Copying selected blocks
   * Before putting to the clipboard we sanitize all blocks and then copy to the clipboard
   *
   * @param {ClipboardEvent} event - clipboard event
   */
  handleCommandC(e) {
    const { BlockSelection: t } = this.Editor;
    t.anyBlockSelected && t.copySelectedBlocks(e);
  }
  /**
   * Copy and Delete selected Blocks
   *
   * @param {ClipboardEvent} event - clipboard event
   */
  handleCommandX(e) {
    const { BlockSelection: t, BlockManager: o, Caret: i } = this.Editor;
    t.anyBlockSelected && t.copySelectedBlocks(e).then(() => {
      const n = o.removeSelectedBlocks(), r = o.insertDefaultBlockAtIndex(n, !0);
      i.setToBlock(r, i.positions.START), t.clearSelection(e);
    });
  }
  /**
   * Tab pressed inside a Block.
   *
   * @param {KeyboardEvent} event - keydown
   */
  tabPressed(e) {
    const { InlineToolbar: t, ConversionToolbar: o, Caret: i } = this.Editor;
    if (o.opened || t.opened)
      return;
    (e.shiftKey ? i.navigatePrevious(!0) : i.navigateNext(!0)) && e.preventDefault();
  }
  /**
   * '/' + 'command' keydown inside a Block
   */
  commandSlashPressed() {
    this.Editor.BlockSelection.selectedBlocks.length > 1 || this.activateBlockSettings();
  }
  /**
   * '/' keydown inside a Block
   */
  slashPressed() {
    this.Editor.BlockManager.currentBlock.isEmpty && this.activateToolbox();
  }
  /**
   * ENTER pressed on block
   *
   * @param {KeyboardEvent} event - keydown
   */
  enter(e) {
    const { BlockManager: t, UI: o } = this.Editor;
    if (t.currentBlock.tool.isLineBreaksEnabled || o.someToolbarOpened && o.someFlipperButtonFocused || e.shiftKey)
      return;
    let n = this.Editor.BlockManager.currentBlock;
    this.Editor.Caret.isAtStart && !this.Editor.BlockManager.currentBlock.hasMedia ? this.Editor.BlockManager.insertDefaultBlockAtIndex(this.Editor.BlockManager.currentBlockIndex) : this.Editor.Caret.isAtEnd ? n = this.Editor.BlockManager.insertDefaultBlockAtIndex(this.Editor.BlockManager.currentBlockIndex + 1) : n = this.Editor.BlockManager.split(), this.Editor.Caret.setToBlock(n), this.Editor.Toolbar.moveAndOpen(n), e.preventDefault();
  }
  /**
   * Handle backspace keydown on Block
   *
   * @param {KeyboardEvent} event - keydown
   */
  backspace(e) {
    const { BlockManager: t, Caret: o } = this.Editor, { currentBlock: i, previousBlock: n } = t;
    if (!b.isCollapsed || !o.isAtStart)
      return;
    if (e.preventDefault(), this.Editor.Toolbar.close(), !(i.currentInput === i.firstInput)) {
      o.navigatePrevious();
      return;
    }
    if (n === null)
      return;
    if (n.isEmpty) {
      t.removeBlock(n);
      return;
    }
    if (i.isEmpty) {
      t.removeBlock(i);
      const l = t.currentBlock;
      o.setToBlock(l, o.positions.END);
      return;
    }
    ot(i, n) ? this.mergeBlocks(n, i) : o.setToBlock(n, o.positions.END);
  }
  /**
   * Handles delete keydown on Block
   * Removes char after the caret.
   * If caret is at the end of the block, merge next block with current
   *
   * @param {KeyboardEvent} event - keydown
   */
  delete(e) {
    const { BlockManager: t, Caret: o } = this.Editor, { currentBlock: i, nextBlock: n } = t;
    if (!b.isCollapsed || !o.isAtEnd)
      return;
    if (e.preventDefault(), this.Editor.Toolbar.close(), !(i.currentInput === i.lastInput)) {
      o.navigateNext();
      return;
    }
    if (n === null)
      return;
    if (n.isEmpty) {
      t.removeBlock(n);
      return;
    }
    if (i.isEmpty) {
      t.removeBlock(i), o.setToBlock(n, o.positions.START);
      return;
    }
    ot(i, n) ? this.mergeBlocks(i, n) : o.setToBlock(n, o.positions.START);
  }
  /**
   * Merge passed Blocks
   *
   * @param targetBlock - to which Block we want to merge
   * @param blockToMerge - what Block we want to merge
   */
  mergeBlocks(e, t) {
    const { BlockManager: o, Caret: i, Toolbar: n } = this.Editor;
    i.createShadow(e.pluginsContent), o.mergeBlocks(e, t).then(() => {
      window.requestAnimationFrame(() => {
        i.restoreCaret(e.pluginsContent), e.pluginsContent.normalize(), n.close();
      });
    });
  }
  /**
   * Handle right and down keyboard keys
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  arrowRightAndDown(e) {
    const t = q.usedKeys.includes(e.keyCode) && (!e.shiftKey || e.keyCode === k.TAB);
    if (this.Editor.UI.someToolbarOpened && t)
      return;
    this.Editor.Toolbar.close();
    const o = this.Editor.Caret.isAtEnd || this.Editor.BlockSelection.anyBlockSelected;
    if (e.shiftKey && e.keyCode === k.DOWN && o) {
      this.Editor.CrossBlockSelection.toggleBlockSelectedState();
      return;
    }
    if (e.keyCode === k.DOWN || e.keyCode === k.RIGHT && !this.isRtl ? this.Editor.Caret.navigateNext() : this.Editor.Caret.navigatePrevious()) {
      e.preventDefault();
      return;
    }
    xe(() => {
      this.Editor.BlockManager.currentBlock && this.Editor.BlockManager.currentBlock.updateCurrentInput();
    }, 20)(), this.Editor.BlockSelection.clearSelection(e);
  }
  /**
   * Handle left and up keyboard keys
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  arrowLeftAndUp(e) {
    if (this.Editor.UI.someToolbarOpened) {
      if (q.usedKeys.includes(e.keyCode) && (!e.shiftKey || e.keyCode === k.TAB))
        return;
      this.Editor.UI.closeAllToolbars();
    }
    this.Editor.Toolbar.close();
    const t = this.Editor.Caret.isAtStart || this.Editor.BlockSelection.anyBlockSelected;
    if (e.shiftKey && e.keyCode === k.UP && t) {
      this.Editor.CrossBlockSelection.toggleBlockSelectedState(!1);
      return;
    }
    if (e.keyCode === k.UP || e.keyCode === k.LEFT && !this.isRtl ? this.Editor.Caret.navigatePrevious() : this.Editor.Caret.navigateNext()) {
      e.preventDefault();
      return;
    }
    xe(() => {
      this.Editor.BlockManager.currentBlock && this.Editor.BlockManager.currentBlock.updateCurrentInput();
    }, 20)(), this.Editor.BlockSelection.clearSelection(e);
  }
  /**
   * Cases when we need to close Toolbar
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  needToolbarClosing(e) {
    const t = e.keyCode === k.ENTER && this.Editor.Toolbar.toolbox.opened, o = e.keyCode === k.ENTER && this.Editor.BlockSettings.opened, i = e.keyCode === k.ENTER && this.Editor.InlineToolbar.opened, n = e.keyCode === k.ENTER && this.Editor.ConversionToolbar.opened, r = e.keyCode === k.TAB;
    return !(e.shiftKey || r || t || o || i || n);
  }
  /**
   * If Toolbox is not open, then just open it and show plus button
   */
  activateToolbox() {
    this.Editor.Toolbar.opened || this.Editor.Toolbar.moveAndOpen(), this.Editor.Toolbar.toolbox.open();
  }
  /**
   * Open Toolbar and show BlockSettings before flipping Tools
   */
  activateBlockSettings() {
    this.Editor.Toolbar.opened || this.Editor.Toolbar.moveAndOpen(), this.Editor.BlockSettings.opened || this.Editor.BlockSettings.open();
  }
}
class Se {
  /**
   * @class
   * @param {HTMLElement} workingArea — editor`s working node
   */
  constructor(e) {
    this.blocks = [], this.workingArea = e;
  }
  /**
   * Get length of Block instances array
   *
   * @returns {number}
   */
  get length() {
    return this.blocks.length;
  }
  /**
   * Get Block instances array
   *
   * @returns {Block[]}
   */
  get array() {
    return this.blocks;
  }
  /**
   * Get blocks html elements array
   *
   * @returns {HTMLElement[]}
   */
  get nodes() {
    return ct(this.workingArea.children);
  }
  /**
   * Proxy trap to implement array-like setter
   *
   * @example
   * blocks[0] = new Block(...)
   * @param {Blocks} instance — Blocks instance
   * @param {PropertyKey} property — block index or any Blocks class property key to set
   * @param {Block} value — value to set
   * @returns {boolean}
   */
  static set(e, t, o) {
    return isNaN(Number(t)) ? (Reflect.set(e, t, o), !0) : (e.insert(+t, o), !0);
  }
  /**
   * Proxy trap to implement array-like getter
   *
   * @param {Blocks} instance — Blocks instance
   * @param {PropertyKey} property — Blocks class property key
   * @returns {Block|*}
   */
  static get(e, t) {
    return isNaN(Number(t)) ? Reflect.get(e, t) : e.get(+t);
  }
  /**
   * Push new Block to the blocks array and append it to working area
   *
   * @param {Block} block - Block to add
   */
  push(e) {
    this.blocks.push(e), this.insertToDOM(e);
  }
  /**
   * Swaps blocks with indexes first and second
   *
   * @param {number} first - first block index
   * @param {number} second - second block index
   * @deprecated — use 'move' instead
   */
  swap(e, t) {
    const o = this.blocks[t];
    c.swap(this.blocks[e].holder, o.holder), this.blocks[t] = this.blocks[e], this.blocks[e] = o;
  }
  /**
   * Move a block from one to another index
   *
   * @param {number} toIndex - new index of the block
   * @param {number} fromIndex - block to move
   */
  move(e, t) {
    const o = this.blocks.splice(t, 1)[0], i = e - 1, n = Math.max(0, i), r = this.blocks[n];
    e > 0 ? this.insertToDOM(o, "afterend", r) : this.insertToDOM(o, "beforebegin", r), this.blocks.splice(e, 0, o);
    const a = this.composeBlockEvent("move", {
      fromIndex: t,
      toIndex: e
    });
    o.call(X.MOVED, a);
  }
  /**
   * Insert new Block at passed index
   *
   * @param {number} index — index to insert Block
   * @param {Block} block — Block to insert
   * @param {boolean} replace — it true, replace block on given index
   */
  insert(e, t, o = !1) {
    if (!this.length) {
      this.push(t);
      return;
    }
    e > this.length && (e = this.length), o && (this.blocks[e].holder.remove(), this.blocks[e].call(X.REMOVED));
    const i = o ? 1 : 0;
    if (this.blocks.splice(e, i, t), e > 0) {
      const n = this.blocks[e - 1];
      this.insertToDOM(t, "afterend", n);
    } else {
      const n = this.blocks[e + 1];
      n ? this.insertToDOM(t, "beforebegin", n) : this.insertToDOM(t);
    }
  }
  /**
   * Replaces block under passed index with passed block
   *
   * @param index - index of existed block
   * @param block - new block
   */
  replace(e, t) {
    if (this.blocks[e] === void 0)
      throw Error("Incorrect index");
    this.blocks[e].holder.replaceWith(t.holder), this.blocks[e] = t;
  }
  /**
   * Inserts several blocks at once
   *
   * @param blocks - blocks to insert
   * @param index - index to insert blocks at
   */
  insertMany(e, t) {
    const o = new DocumentFragment();
    for (const i of e)
      o.appendChild(i.holder);
    if (this.length > 0) {
      if (t > 0) {
        const i = Math.min(t - 1, this.length - 1);
        this.blocks[i].holder.after(o);
      } else
        t === 0 && this.workingArea.prepend(o);
      this.blocks.splice(t, 0, ...e);
    } else
      this.blocks.push(...e), this.workingArea.appendChild(o);
    e.forEach((i) => i.call(X.RENDERED));
  }
  /**
   * Remove block
   *
   * @param {number} index - index of Block to remove
   */
  remove(e) {
    isNaN(e) && (e = this.length - 1), this.blocks[e].holder.remove(), this.blocks[e].call(X.REMOVED), this.blocks.splice(e, 1);
  }
  /**
   * Remove all blocks
   */
  removeAll() {
    this.workingArea.innerHTML = "", this.blocks.forEach((e) => e.call(X.REMOVED)), this.blocks.length = 0;
  }
  /**
   * Insert Block after passed target
   *
   * @todo decide if this method is necessary
   * @param {Block} targetBlock — target after which Block should be inserted
   * @param {Block} newBlock — Block to insert
   */
  insertAfter(e, t) {
    const o = this.blocks.indexOf(e);
    this.insert(o + 1, t);
  }
  /**
   * Get Block by index
   *
   * @param {number} index — Block index
   * @returns {Block}
   */
  get(e) {
    return this.blocks[e];
  }
  /**
   * Return index of passed Block
   *
   * @param {Block} block - Block to find
   * @returns {number}
   */
  indexOf(e) {
    return this.blocks.indexOf(e);
  }
  /**
   * Insert new Block into DOM
   *
   * @param {Block} block - Block to insert
   * @param {InsertPosition} position — insert position (if set, will use insertAdjacentElement)
   * @param {Block} target — Block related to position
   */
  insertToDOM(e, t, o) {
    t ? o.holder.insertAdjacentElement(t, e.holder) : this.workingArea.appendChild(e.holder), e.call(X.RENDERED);
  }
  /**
   * Composes Block event with passed type and details
   *
   * @param {string} type - event type
   * @param {object} detail - event detail
   */
  composeBlockEvent(e, t) {
    return new CustomEvent(e, {
      detail: t
    });
  }
}
const nt = "block-removed", st = "block-added", ei = "block-moved", rt = "block-changed";
class ti {
  constructor() {
    this.completed = Promise.resolve();
  }
  /**
   * Add new promise to queue
   *
   * @param operation - promise should be added to queue
   */
  add(e) {
    return new Promise((t, o) => {
      this.completed = this.completed.then(e).then(t).catch(o);
    });
  }
}
class oi extends y {
  constructor() {
    super(...arguments), this._currentBlockIndex = -1, this._blocks = null;
  }
  /**
   * Returns current Block index
   *
   * @returns {number}
   */
  get currentBlockIndex() {
    return this._currentBlockIndex;
  }
  /**
   * Set current Block index and fire Block lifecycle callbacks
   *
   * @param {number} newIndex - index of Block to set as current
   */
  set currentBlockIndex(e) {
    this._currentBlockIndex = e;
  }
  /**
   * returns first Block
   *
   * @returns {Block}
   */
  get firstBlock() {
    return this._blocks[0];
  }
  /**
   * returns last Block
   *
   * @returns {Block}
   */
  get lastBlock() {
    return this._blocks[this._blocks.length - 1];
  }
  /**
   * Get current Block instance
   *
   * @returns {Block}
   */
  get currentBlock() {
    return this._blocks[this.currentBlockIndex];
  }
  /**
   * Set passed Block as a current
   *
   * @param block - block to set as a current
   */
  set currentBlock(e) {
    this.currentBlockIndex = this.getBlockIndex(e);
  }
  /**
   * Returns next Block instance
   *
   * @returns {Block|null}
   */
  get nextBlock() {
    return this.currentBlockIndex === this._blocks.length - 1 ? null : this._blocks[this.currentBlockIndex + 1];
  }
  /**
   * Return first Block with inputs after current Block
   *
   * @returns {Block | undefined}
   */
  get nextContentfulBlock() {
    return this.blocks.slice(this.currentBlockIndex + 1).find((t) => !!t.inputs.length);
  }
  /**
   * Return first Block with inputs before current Block
   *
   * @returns {Block | undefined}
   */
  get previousContentfulBlock() {
    return this.blocks.slice(0, this.currentBlockIndex).reverse().find((t) => !!t.inputs.length);
  }
  /**
   * Returns previous Block instance
   *
   * @returns {Block|null}
   */
  get previousBlock() {
    return this.currentBlockIndex === 0 ? null : this._blocks[this.currentBlockIndex - 1];
  }
  /**
   * Get array of Block instances
   *
   * @returns {Block[]} {@link Blocks#array}
   */
  get blocks() {
    return this._blocks.array;
  }
  /**
   * Check if each Block is empty
   *
   * @returns {boolean}
   */
  get isEditorEmpty() {
    return this.blocks.every((e) => e.isEmpty);
  }
  /**
   * Should be called after Editor.UI preparation
   * Define this._blocks property
   */
  prepare() {
    const e = new Se(this.Editor.UI.nodes.redactor);
    this._blocks = new Proxy(e, {
      set: Se.set,
      get: Se.get
    }), this.listeners.on(
      document,
      "copy",
      (t) => this.Editor.BlockEvents.handleCommandC(t)
    );
  }
  /**
   * Toggle read-only state
   *
   * If readOnly is true:
   *  - Unbind event handlers from created Blocks
   *
   * if readOnly is false:
   *  - Bind event handlers to all existing Blocks
   *
   * @param {boolean} readOnlyEnabled - "read only" state
   */
  toggleReadOnly(e) {
    e ? this.disableModuleBindings() : this.enableModuleBindings();
  }
  /**
   * Creates Block instance by tool name
   *
   * @param {object} options - block creation options
   * @param {string} options.tool - tools passed in editor config {@link EditorConfig#tools}
   * @param {string} [options.id] - unique id for this block
   * @param {BlockToolData} [options.data] - constructor params
   * @returns {Block}
   */
  composeBlock({
    tool: e,
    data: t = {},
    id: o = void 0,
    tunes: i = {}
  }) {
    const n = this.Editor.ReadOnly.isEnabled, r = this.Editor.Tools.blockTools.get(e), a = new R({
      id: o,
      data: t,
      tool: r,
      api: this.Editor.API,
      readOnly: n,
      tunesData: i
    }, this.eventsDispatcher);
    return n || window.requestIdleCallback(() => {
      this.bindBlockEvents(a);
    }, { timeout: 2e3 }), a;
  }
  /**
   * Insert new block into _blocks
   *
   * @param {object} options - insert options
   * @param {string} [options.id] - block's unique id
   * @param {string} [options.tool] - plugin name, by default method inserts the default block type
   * @param {object} [options.data] - plugin data
   * @param {number} [options.index] - index where to insert new Block
   * @param {boolean} [options.needToFocus] - flag shows if needed to update current Block index
   * @param {boolean} [options.replace] - flag shows if block by passed index should be replaced with inserted one
   * @returns {Block}
   */
  insert({
    id: e = void 0,
    tool: t = this.config.defaultBlock,
    data: o = {},
    index: i,
    needToFocus: n = !0,
    replace: r = !1,
    tunes: a = {}
  } = {}) {
    let l = i;
    l === void 0 && (l = this.currentBlockIndex + (r ? 0 : 1));
    const d = this.composeBlock({
      id: e,
      tool: t,
      data: o,
      tunes: a
    });
    return r && this.blockDidMutated(nt, this.getBlockByIndex(l), {
      index: l
    }), this._blocks.insert(l, d, r), this.blockDidMutated(st, d, {
      index: l
    }), n ? this.currentBlockIndex = l : l <= this.currentBlockIndex && this.currentBlockIndex++, d;
  }
  /**
   * Inserts several blocks at once
   *
   * @param blocks - blocks to insert
   * @param index - index where to insert
   */
  insertMany(e, t = 0) {
    this._blocks.insertMany(e, t);
  }
  /**
   * Update Block data.
   *
   * Currently we don't have an 'update' method in the Tools API, so we just create a new block with the same id and type
   * Should not trigger 'block-removed' or 'block-added' events
   *
   * @param block - block to update
   * @param data - new data
   */
  async update(e, t) {
    const o = await e.data, i = this.composeBlock({
      id: e.id,
      tool: e.name,
      data: Object.assign({}, o, t),
      tunes: e.tunes
    }), n = this.getBlockIndex(e);
    return this._blocks.replace(n, i), this.blockDidMutated(rt, i, {
      index: n
    }), i;
  }
  /**
   * Replace passed Block with the new one with specified Tool and data
   *
   * @param block - block to replace
   * @param newTool - new Tool name
   * @param data - new Tool data
   */
  replace(e, t, o) {
    const i = this.getBlockIndex(e);
    this.insert({
      tool: t,
      data: o,
      index: i,
      replace: !0
    });
  }
  /**
   * Insert pasted content. Call onPaste callback after insert.
   *
   * @param {string} toolName - name of Tool to insert
   * @param {PasteEvent} pasteEvent - pasted data
   * @param {boolean} replace - should replace current block
   */
  paste(e, t, o = !1) {
    const i = this.insert({
      tool: e,
      replace: o
    });
    try {
      window.requestIdleCallback(() => {
        i.call(X.ON_PASTE, t);
      });
    } catch (n) {
      T(`${e}: onPaste callback call is failed`, "error", n);
    }
    return i;
  }
  /**
   * Insert new default block at passed index
   *
   * @param {number} index - index where Block should be inserted
   * @param {boolean} needToFocus - if true, updates current Block index
   *
   * TODO: Remove method and use insert() with index instead (?)
   * @returns {Block} inserted Block
   */
  insertDefaultBlockAtIndex(e, t = !1) {
    const o = this.composeBlock({ tool: this.config.defaultBlock });
    return this._blocks[e] = o, this.blockDidMutated(st, o, {
      index: e
    }), t ? this.currentBlockIndex = e : e <= this.currentBlockIndex && this.currentBlockIndex++, o;
  }
  /**
   * Always inserts at the end
   *
   * @returns {Block}
   */
  insertAtEnd() {
    return this.currentBlockIndex = this.blocks.length - 1, this.insert();
  }
  /**
   * Merge two blocks
   *
   * @param {Block} targetBlock - previous block will be append to this block
   * @param {Block} blockToMerge - block that will be merged with target block
   * @returns {Promise} - the sequence that can be continued
   */
  async mergeBlocks(e, t) {
    const o = await t.data;
    W(o) || await e.mergeWith(o), this.removeBlock(t), this.currentBlockIndex = this._blocks.indexOf(e);
  }
  /**
   * Remove passed Block
   *
   * @param block - Block to remove
   * @param addLastBlock - if true, adds new default block at the end. @todo remove this logic and use event-bus instead
   */
  removeBlock(e, t = !0) {
    return new Promise((o) => {
      const i = this._blocks.indexOf(e);
      if (!this.validateIndex(i))
        throw new Error("Can't find a Block to remove");
      e.destroy(), this._blocks.remove(i), this.blockDidMutated(nt, e, {
        index: i
      }), this.currentBlockIndex >= i && this.currentBlockIndex--, this.blocks.length ? i === 0 && (this.currentBlockIndex = 0) : (this.currentBlockIndex = -1, t && this.insert()), o();
    });
  }
  /**
   * Remove only selected Blocks
   * and returns first Block index where started removing...
   *
   * @returns {number|undefined}
   */
  removeSelectedBlocks() {
    let e;
    for (let t = this.blocks.length - 1; t >= 0; t--)
      this.blocks[t].selected && (this.removeBlock(this.blocks[t]), e = t);
    return e;
  }
  /**
   * Attention!
   * After removing insert the new default typed Block and focus on it
   * Removes all blocks
   */
  removeAllBlocks() {
    for (let e = this.blocks.length - 1; e >= 0; e--)
      this._blocks.remove(e);
    this.currentBlockIndex = -1, this.insert(), this.currentBlock.firstInput.focus();
  }
  /**
   * Split current Block
   * 1. Extract content from Caret position to the Block`s end
   * 2. Insert a new Block below current one with extracted content
   *
   * @returns {Block}
   */
  split() {
    const e = this.Editor.Caret.extractFragmentFromCaretPosition(), t = c.make("div");
    t.appendChild(e);
    const o = {
      text: c.isEmpty(t) ? "" : t.innerHTML
    };
    return this.insert({ data: o });
  }
  /**
   * Returns Block by passed index
   *
   * @param {number} index - index to get. -1 to get last
   * @returns {Block}
   */
  getBlockByIndex(e) {
    return e === -1 && (e = this._blocks.length - 1), this._blocks[e];
  }
  /**
   * Returns an index for passed Block
   *
   * @param block - block to find index
   */
  getBlockIndex(e) {
    return this._blocks.indexOf(e);
  }
  /**
   * Returns the Block by passed id
   *
   * @param id - id of block to get
   * @returns {Block}
   */
  getBlockById(e) {
    return this._blocks.array.find((t) => t.id === e);
  }
  /**
   * Get Block instance by html element
   *
   * @param {Node} element - html element to get Block by
   */
  getBlock(e) {
    c.isElement(e) || (e = e.parentNode);
    const t = this._blocks.nodes, o = e.closest(`.${R.CSS.wrapper}`), i = t.indexOf(o);
    if (i >= 0)
      return this._blocks[i];
  }
  /**
   * 1) Find first-level Block from passed child Node
   * 2) Mark it as current
   *
   * @param {Node} childNode - look ahead from this node.
   * @returns {Block | undefined} can return undefined in case when the passed child note is not a part of the current editor instance
   */
  setCurrentBlockByChildNode(e) {
    c.isElement(e) || (e = e.parentNode);
    const t = e.closest(`.${R.CSS.wrapper}`);
    if (!t)
      return;
    const o = t.closest(`.${this.Editor.UI.CSS.editorWrapper}`);
    if (o != null && o.isEqualNode(this.Editor.UI.nodes.wrapper))
      return this.currentBlockIndex = this._blocks.nodes.indexOf(t), this.currentBlock.updateCurrentInput(), this.currentBlock;
  }
  /**
   * Return block which contents passed node
   *
   * @param {Node} childNode - node to get Block by
   * @returns {Block}
   */
  getBlockByChildNode(e) {
    if (!e || !(e instanceof Node))
      return;
    c.isElement(e) || (e = e.parentNode);
    const t = e.closest(`.${R.CSS.wrapper}`);
    return this.blocks.find((o) => o.holder === t);
  }
  /**
   * Swap Blocks Position
   *
   * @param {number} fromIndex - index of first block
   * @param {number} toIndex - index of second block
   * @deprecated — use 'move' instead
   */
  swap(e, t) {
    this._blocks.swap(e, t), this.currentBlockIndex = t;
  }
  /**
   * Move a block to a new index
   *
   * @param {number} toIndex - index where to move Block
   * @param {number} fromIndex - index of Block to move
   */
  move(e, t = this.currentBlockIndex) {
    if (isNaN(e) || isNaN(t)) {
      T("Warning during 'move' call: incorrect indices provided.", "warn");
      return;
    }
    if (!this.validateIndex(e) || !this.validateIndex(t)) {
      T("Warning during 'move' call: indices cannot be lower than 0 or greater than the amount of blocks.", "warn");
      return;
    }
    this._blocks.move(e, t), this.currentBlockIndex = e, this.blockDidMutated(ei, this.currentBlock, {
      fromIndex: t,
      toIndex: e
    });
  }
  /**
   * Converts passed Block to the new Tool
   * Uses Conversion Config
   *
   * @param blockToConvert - Block that should be converted
   * @param targetToolName - name of the Tool to convert to
   * @param blockDataOverrides - optional new Block data overrides
   */
  async convert(e, t, o) {
    if (!await e.save())
      throw new Error("Could not convert Block. Failed to extract original Block data.");
    const n = this.Editor.Tools.blockTools.get(t);
    if (!n)
      throw new Error(`Could not convert Block. Tool «${t}» not found.`);
    const r = await e.exportDataAsString(), a = V(
      r,
      n.sanitizeConfig
    );
    let l = to(a, n.conversionConfig);
    o && (l = Object.assign(l, o)), this.replace(e, n.name, l);
  }
  /**
   * Sets current Block Index -1 which means unknown
   * and clear highlights
   */
  dropPointer() {
    this.currentBlockIndex = -1;
  }
  /**
   * Clears Editor
   *
   * @param {boolean} needToAddDefaultBlock - 1) in internal calls (for example, in api.blocks.render)
   *                                             we don't need to add an empty default block
   *                                        2) in api.blocks.clear we should add empty block
   */
  async clear(e = !1) {
    const t = new ti();
    this.blocks.forEach((o) => {
      t.add(async () => {
        await this.removeBlock(o, !1);
      });
    }), await t.completed, this.dropPointer(), e && this.insert(), this.Editor.UI.checkEmptiness();
  }
  /**
   * Cleans up all the block tools' resources
   * This is called when editor is destroyed
   */
  async destroy() {
    await Promise.all(this.blocks.map((e) => e.destroy()));
  }
  /**
   * Bind Block events
   *
   * @param {Block} block - Block to which event should be bound
   */
  bindBlockEvents(e) {
    const { BlockEvents: t } = this.Editor;
    this.readOnlyMutableListeners.on(e.holder, "keydown", (o) => {
      t.keydown(o);
    }), this.readOnlyMutableListeners.on(e.holder, "keyup", (o) => {
      t.keyup(o);
    }), this.readOnlyMutableListeners.on(e.holder, "dragover", (o) => {
      t.dragOver(o);
    }), this.readOnlyMutableListeners.on(e.holder, "dragleave", (o) => {
      t.dragLeave(o);
    }), e.on("didMutated", (o) => this.blockDidMutated(rt, o, {
      index: this.getBlockIndex(o)
    }));
  }
  /**
   * Disable mutable handlers and bindings
   */
  disableModuleBindings() {
    this.readOnlyMutableListeners.clearAll();
  }
  /**
   * Enables all module handlers and bindings for all Blocks
   */
  enableModuleBindings() {
    this.readOnlyMutableListeners.on(
      document,
      "cut",
      (e) => this.Editor.BlockEvents.handleCommandX(e)
    ), this.blocks.forEach((e) => {
      this.bindBlockEvents(e);
    });
  }
  /**
   * Validates that the given index is not lower than 0 or higher than the amount of blocks
   *
   * @param {number} index - index of blocks array to validate
   * @returns {boolean}
   */
  validateIndex(e) {
    return !(e < 0 || e >= this._blocks.length);
  }
  /**
   * Block mutation callback
   *
   * @param mutationType - what happened with block
   * @param block - mutated block
   * @param detailData - additional data to pass with change event
   */
  blockDidMutated(e, t, o) {
    const i = new CustomEvent(e, {
      detail: {
        target: new ee(t),
        ...o
      }
    });
    return this.eventsDispatcher.emit(pt, {
      event: i
    }), t;
  }
}
class ii extends y {
  constructor() {
    super(...arguments), this.anyBlockSelectedCache = null, this.needToSelectAll = !1, this.nativeInputSelected = !1, this.readyToBlockSelection = !1;
  }
  /**
   * Sanitizer Config
   *
   * @returns {SanitizerConfig}
   */
  get sanitizerConfig() {
    return {
      p: {},
      h1: {},
      h2: {},
      h3: {},
      h4: {},
      h5: {},
      h6: {},
      ol: {},
      ul: {},
      li: {},
      br: !0,
      img: {
        src: !0,
        width: !0,
        height: !0
      },
      a: {
        href: !0
      },
      b: {},
      i: {},
      u: {}
    };
  }
  /**
   * Flag that identifies all Blocks selection
   *
   * @returns {boolean}
   */
  get allBlocksSelected() {
    const { BlockManager: e } = this.Editor;
    return e.blocks.every((t) => t.selected === !0);
  }
  /**
   * Set selected all blocks
   *
   * @param {boolean} state - state to set
   */
  set allBlocksSelected(e) {
    const { BlockManager: t } = this.Editor;
    t.blocks.forEach((o) => {
      o.selected = e;
    }), this.clearCache();
  }
  /**
   * Flag that identifies any Block selection
   *
   * @returns {boolean}
   */
  get anyBlockSelected() {
    const { BlockManager: e } = this.Editor;
    return this.anyBlockSelectedCache === null && (this.anyBlockSelectedCache = e.blocks.some((t) => t.selected === !0)), this.anyBlockSelectedCache;
  }
  /**
   * Return selected Blocks array
   *
   * @returns {Block[]}
   */
  get selectedBlocks() {
    return this.Editor.BlockManager.blocks.filter((e) => e.selected);
  }
  /**
   * Module Preparation
   * Registers Shortcuts CMD+A and CMD+C
   * to select all and copy them
   */
  prepare() {
    this.selection = new b(), ae.add({
      name: "CMD+A",
      handler: (e) => {
        const { BlockManager: t, ReadOnly: o } = this.Editor;
        if (o.isEnabled) {
          e.preventDefault(), this.selectAllBlocks();
          return;
        }
        t.currentBlock && this.handleCommandA(e);
      },
      on: this.Editor.UI.nodes.redactor
    });
  }
  /**
   * Toggle read-only state
   *
   *  - Remove all ranges
   *  - Unselect all Blocks
   */
  toggleReadOnly() {
    b.get().removeAllRanges(), this.allBlocksSelected = !1;
  }
  /**
   * Remove selection of Block
   *
   * @param {number?} index - Block index according to the BlockManager's indexes
   */
  unSelectBlockByIndex(e) {
    const { BlockManager: t } = this.Editor;
    let o;
    isNaN(e) ? o = t.currentBlock : o = t.getBlockByIndex(e), o.selected = !1, this.clearCache();
  }
  /**
   * Clear selection from Blocks
   *
   * @param {Event} reason - event caused clear of selection
   * @param {boolean} restoreSelection - if true, restore saved selection
   */
  clearSelection(e, t = !1) {
    const { BlockManager: o, Caret: i, RectangleSelection: n } = this.Editor;
    this.needToSelectAll = !1, this.nativeInputSelected = !1, this.readyToBlockSelection = !1;
    const r = e && e instanceof KeyboardEvent, a = r && lt(e.keyCode);
    if (this.anyBlockSelected && r && a && !b.isSelectionExists) {
      const l = o.removeSelectedBlocks();
      o.insertDefaultBlockAtIndex(l, !0), i.setToBlock(o.currentBlock), xe(() => {
        const d = e.key;
        i.insertContentAtCaretPosition(d.length > 1 ? "" : d);
      }, 20)();
    }
    if (this.Editor.CrossBlockSelection.clear(e), !this.anyBlockSelected || n.isRectActivated()) {
      this.Editor.RectangleSelection.clearSelection();
      return;
    }
    t && this.selection.restore(), this.allBlocksSelected = !1;
  }
  /**
   * Reduce each Block and copy its content
   *
   * @param {ClipboardEvent} e - copy/cut event
   * @returns {Promise<void>}
   */
  copySelectedBlocks(e) {
    e.preventDefault();
    const t = c.make("div");
    this.selectedBlocks.forEach((n) => {
      const r = V(n.holder.innerHTML, this.sanitizerConfig), a = c.make("p");
      a.innerHTML = r, t.appendChild(a);
    });
    const o = Array.from(t.childNodes).map((n) => n.textContent).join(`

`), i = t.innerHTML;
    return e.clipboardData.setData("text/plain", o), e.clipboardData.setData("text/html", i), Promise.all(this.selectedBlocks.map((n) => n.save())).then((n) => {
      try {
        e.clipboardData.setData(this.Editor.Paste.MIME_TYPE, JSON.stringify(n));
      } catch {
      }
    });
  }
  /**
   * Select Block by its index
   *
   * @param {number?} index - Block index according to the BlockManager's indexes
   */
  selectBlockByIndex(e) {
    const { BlockManager: t } = this.Editor, o = t.getBlockByIndex(e);
    o !== void 0 && this.selectBlock(o);
  }
  /**
   * Select passed Block
   *
   * @param {Block} block - Block to select
   */
  selectBlock(e) {
    this.selection.save(), b.get().removeAllRanges(), e.selected = !0, this.clearCache(), this.Editor.InlineToolbar.close();
  }
  /**
   * Remove selection from passed Block
   *
   * @param {Block} block - Block to unselect
   */
  unselectBlock(e) {
    e.selected = !1, this.clearCache();
  }
  /**
   * Clear anyBlockSelected cache
   */
  clearCache() {
    this.anyBlockSelectedCache = null;
  }
  /**
   * Module destruction
   * De-registers Shortcut CMD+A
   */
  destroy() {
    ae.remove(this.Editor.UI.nodes.redactor, "CMD+A");
  }
  /**
   * First CMD+A selects all input content by native behaviour,
   * next CMD+A keypress selects all blocks
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  handleCommandA(e) {
    if (this.Editor.RectangleSelection.clearSelection(), c.isNativeInput(e.target) && !this.readyToBlockSelection) {
      this.readyToBlockSelection = !0;
      return;
    }
    const t = this.Editor.BlockManager.getBlock(e.target), o = t.inputs;
    if (o.length > 1 && !this.readyToBlockSelection) {
      this.readyToBlockSelection = !0;
      return;
    }
    if (o.length === 1 && !this.needToSelectAll) {
      this.needToSelectAll = !0;
      return;
    }
    this.needToSelectAll ? (e.preventDefault(), this.selectAllBlocks(), this.needToSelectAll = !1, this.readyToBlockSelection = !1, this.Editor.ConversionToolbar.close()) : this.readyToBlockSelection && (e.preventDefault(), this.selectBlock(t), this.needToSelectAll = !0);
  }
  /**
   * Select All Blocks
   * Each Block has selected setter that makes Block copyable
   */
  selectAllBlocks() {
    this.selection.save(), b.get().removeAllRanges(), this.allBlocksSelected = !0, this.Editor.InlineToolbar.close();
  }
}
class we extends y {
  /**
   * Allowed caret positions in input
   *
   * @static
   * @returns {{START: string, END: string, DEFAULT: string}}
   */
  get positions() {
    return {
      START: "start",
      END: "end",
      DEFAULT: "default"
    };
  }
  /**
   * Elements styles that can be useful for Caret Module
   */
  static get CSS() {
    return {
      shadowCaret: "cdx-shadow-caret"
    };
  }
  /**
   * Get's deepest first node and checks if offset is zero
   *
   * @returns {boolean}
   */
  get isAtStart() {
    const { currentBlock: e } = this.Editor.BlockManager;
    if (!e.focusable)
      return !0;
    const t = b.get(), o = c.getDeepestNode(e.currentInput);
    let i = t.focusNode;
    if (c.isNativeInput(o))
      return o.selectionEnd === 0;
    if (!t.anchorNode)
      return !1;
    let n = i.textContent.search(/\S/);
    n === -1 && (n = 0);
    let r = t.focusOffset;
    return i.nodeType !== Node.TEXT_NODE && i.childNodes.length && (i.childNodes[r] ? (i = i.childNodes[r], r = 0) : (i = i.childNodes[r - 1], r = i.textContent.length)), (c.isLineBreakTag(o) || c.isEmpty(o)) && this.getHigherLevelSiblings(i, "left").every((d) => {
      const u = c.isLineBreakTag(d), h = d.children.length === 1 && c.isLineBreakTag(d.children[0]), f = u || h;
      return c.isEmpty(d) && !f;
    }) && r === n ? !0 : o === null || i === o && r <= n;
  }
  /**
   * Get's deepest last node and checks if offset is last node text length
   *
   * @returns {boolean}
   */
  get isAtEnd() {
    const { currentBlock: e } = this.Editor.BlockManager;
    if (!e.focusable)
      return !0;
    const t = b.get();
    let o = t.focusNode;
    const i = c.getDeepestNode(e.currentInput, !0);
    if (c.isNativeInput(i))
      return i.selectionEnd === i.value.length;
    if (!t.focusNode)
      return !1;
    let n = t.focusOffset;
    if (o.nodeType !== Node.TEXT_NODE && o.childNodes.length && (o.childNodes[n - 1] ? (o = o.childNodes[n - 1], n = o.textContent.length) : (o = o.childNodes[0], n = 0)), c.isLineBreakTag(i) || c.isEmpty(i)) {
      const a = this.getHigherLevelSiblings(o, "right");
      if (a.every((d, u) => u === a.length - 1 && c.isLineBreakTag(d) || c.isEmpty(d) && !c.isLineBreakTag(d)) && n === o.textContent.length)
        return !0;
    }
    const r = i.textContent.replace(/\s+$/, "");
    return o === i && n >= r.length;
  }
  /**
   * Method gets Block instance and puts caret to the text node with offset
   * There two ways that method applies caret position:
   *   - first found text node: sets at the beginning, but you can pass an offset
   *   - last found text node: sets at the end of the node. Also, you can customize the behaviour
   *
   * @param {Block} block - Block class
   * @param {string} position - position where to set caret.
   *                            If default - leave default behaviour and apply offset if it's passed
   * @param {number} offset - caret offset regarding to the text node
   */
  setToBlock(e, t = this.positions.DEFAULT, o = 0) {
    var d;
    const { BlockManager: i, BlockSelection: n } = this.Editor;
    if (n.clearSelection(), !e.focusable) {
      (d = window.getSelection()) == null || d.removeAllRanges(), n.selectBlock(e), i.currentBlock = e;
      return;
    }
    let r;
    switch (t) {
      case this.positions.START:
        r = e.firstInput;
        break;
      case this.positions.END:
        r = e.lastInput;
        break;
      default:
        r = e.currentInput;
    }
    if (!r)
      return;
    const a = c.getDeepestNode(r, t === this.positions.END), l = c.getContentLength(a);
    switch (!0) {
      case t === this.positions.START:
        o = 0;
        break;
      case t === this.positions.END:
      case o > l:
        o = l;
        break;
    }
    this.set(a, o), i.setCurrentBlockByChildNode(e.holder), i.currentBlock.currentInput = r;
  }
  /**
   * Set caret to the current input of current Block.
   *
   * @param {HTMLElement} input - input where caret should be set
   * @param {string} position - position of the caret.
   *                            If default - leave default behaviour and apply offset if it's passed
   * @param {number} offset - caret offset regarding to the text node
   */
  setToInput(e, t = this.positions.DEFAULT, o = 0) {
    const { currentBlock: i } = this.Editor.BlockManager, n = c.getDeepestNode(e);
    switch (t) {
      case this.positions.START:
        this.set(n, 0);
        break;
      case this.positions.END:
        this.set(n, c.getContentLength(n));
        break;
      default:
        o && this.set(n, o);
    }
    i.currentInput = e;
  }
  /**
   * Creates Document Range and sets caret to the element with offset
   *
   * @param {HTMLElement} element - target node.
   * @param {number} offset - offset
   */
  set(e, t = 0) {
    const { top: i, bottom: n } = b.setCursor(e, t), { innerHeight: r } = window;
    i < 0 ? window.scrollBy(0, i - 30) : n > r && window.scrollBy(0, n - r + 30);
  }
  /**
   * Set Caret to the last Block
   * If last block is not empty, append another empty block
   */
  setToTheLastBlock() {
    const e = this.Editor.BlockManager.lastBlock;
    if (e)
      if (e.tool.isDefault && e.isEmpty)
        this.setToBlock(e);
      else {
        const t = this.Editor.BlockManager.insertAtEnd();
        this.setToBlock(t);
      }
  }
  /**
   * Extract content fragment of current Block from Caret position to the end of the Block
   */
  extractFragmentFromCaretPosition() {
    const e = b.get();
    if (e.rangeCount) {
      const t = e.getRangeAt(0), o = this.Editor.BlockManager.currentBlock.currentInput;
      if (t.deleteContents(), o)
        if (c.isNativeInput(o)) {
          const i = o, n = document.createDocumentFragment(), r = i.value.substring(0, i.selectionStart), a = i.value.substring(i.selectionStart);
          return n.textContent = a, i.value = r, n;
        } else {
          const i = t.cloneRange();
          return i.selectNodeContents(o), i.setStart(t.endContainer, t.endOffset), i.extractContents();
        }
    }
  }
  /**
   * Set's caret to the next Block or Tool`s input
   * Before moving caret, we should check if caret position is at the end of Plugins node
   * Using {@link Dom#getDeepestNode} to get a last node and match with current selection
   *
   * @param {boolean} force - pass true to skip check for caret position
   */
  navigateNext(e = !1) {
    const { BlockManager: t } = this.Editor, { currentBlock: o, nextBlock: i } = t, { nextInput: n } = o, r = this.isAtEnd;
    let a = i;
    const l = e || r;
    if (n && l)
      return this.setToInput(n, this.positions.START), !0;
    if (a === null) {
      if (o.tool.isDefault || !l)
        return !1;
      a = t.insertAtEnd();
    }
    return l ? (this.setToBlock(a, this.positions.START), !0) : !1;
  }
  /**
   * Set's caret to the previous Tool`s input or Block
   * Before moving caret, we should check if caret position is start of the Plugins node
   * Using {@link Dom#getDeepestNode} to get a last node and match with current selection
   *
   * @param {boolean} force - pass true to skip check for caret position
   */
  navigatePrevious(e = !1) {
    const { currentBlock: t, previousBlock: o } = this.Editor.BlockManager;
    if (!t)
      return !1;
    const { previousInput: i } = t, n = e || this.isAtStart;
    return i && n ? (this.setToInput(i, this.positions.END), !0) : o !== null && n ? (this.setToBlock(o, this.positions.END), !0) : !1;
  }
  /**
   * Inserts shadow element after passed element where caret can be placed
   *
   * @param {Element} element - element after which shadow caret should be inserted
   */
  createShadow(e) {
    const t = document.createElement("span");
    t.classList.add(we.CSS.shadowCaret), e.insertAdjacentElement("beforeend", t);
  }
  /**
   * Restores caret position
   *
   * @param {HTMLElement} element - element where caret should be restored
   */
  restoreCaret(e) {
    const t = e.querySelector(`.${we.CSS.shadowCaret}`);
    if (!t)
      return;
    new b().expandToTag(t);
    const i = document.createRange();
    i.selectNode(t), i.extractContents();
  }
  /**
   * Inserts passed content at caret position
   *
   * @param {string} content - content to insert
   */
  insertContentAtCaretPosition(e) {
    const t = document.createDocumentFragment(), o = document.createElement("div"), i = b.get(), n = b.range;
    o.innerHTML = e, Array.from(o.childNodes).forEach((d) => t.appendChild(d)), t.childNodes.length === 0 && t.appendChild(new Text());
    const r = t.lastChild;
    n.deleteContents(), n.insertNode(t);
    const a = document.createRange(), l = r.nodeType === Node.TEXT_NODE ? r : r.firstChild;
    l !== null && l.textContent !== null && a.setStart(l, l.textContent.length), i.removeAllRanges(), i.addRange(a);
  }
  /**
   * Get all first-level (first child of [contenteditable]) siblings from passed node
   * Then you can check it for emptiness
   *
   * @example
   * <div contenteditable>
   * <p></p>                            |
   * <p></p>                            | left first-level siblings
   * <p></p>                            |
   * <blockquote><a><b>adaddad</b><a><blockquote>       <-- passed node for example <b>
   * <p></p>                            |
   * <p></p>                            | right first-level siblings
   * <p></p>                            |
   * </div>
   * @param {HTMLElement} from - element from which siblings should be searched
   * @param {'left' | 'right'} direction - direction of search
   * @returns {HTMLElement[]}
   */
  getHigherLevelSiblings(e, t) {
    let o = e;
    const i = [];
    for (; o.parentNode && o.parentNode.contentEditable !== "true"; )
      o = o.parentNode;
    const n = t === "left" ? "previousSibling" : "nextSibling";
    for (; o[n]; )
      o = o[n], i.push(o);
    return i;
  }
}
class ni extends y {
  constructor() {
    super(...arguments), this.onMouseUp = () => {
      this.listeners.off(document, "mouseover", this.onMouseOver), this.listeners.off(document, "mouseup", this.onMouseUp);
    }, this.onMouseOver = (e) => {
      const { BlockManager: t, BlockSelection: o } = this.Editor;
      if (e.relatedTarget === null && e.target === null)
        return;
      const i = t.getBlockByChildNode(e.relatedTarget) || this.lastSelectedBlock, n = t.getBlockByChildNode(e.target);
      if (!(!i || !n) && n !== i) {
        if (i === this.firstSelectedBlock) {
          b.get().removeAllRanges(), i.selected = !0, n.selected = !0, o.clearCache();
          return;
        }
        if (n === this.firstSelectedBlock) {
          i.selected = !1, n.selected = !1, o.clearCache();
          return;
        }
        this.Editor.InlineToolbar.close(), this.toggleBlocksSelectedState(i, n), this.lastSelectedBlock = n;
      }
    };
  }
  /**
   * Module preparation
   *
   * @returns {Promise}
   */
  async prepare() {
    this.listeners.on(document, "mousedown", (e) => {
      this.enableCrossBlockSelection(e);
    });
  }
  /**
   * Sets up listeners
   *
   * @param {MouseEvent} event - mouse down event
   */
  watchSelection(e) {
    if (e.button !== Pt.LEFT)
      return;
    const { BlockManager: t } = this.Editor;
    this.firstSelectedBlock = t.getBlock(e.target), this.lastSelectedBlock = this.firstSelectedBlock, this.listeners.on(document, "mouseover", this.onMouseOver), this.listeners.on(document, "mouseup", this.onMouseUp);
  }
  /**
   * return boolean is cross block selection started
   */
  get isCrossBlockSelectionStarted() {
    return !!this.firstSelectedBlock && !!this.lastSelectedBlock;
  }
  /**
   * Change selection state of the next Block
   * Used for CBS via Shift + arrow keys
   *
   * @param {boolean} next - if true, toggle next block. Previous otherwise
   */
  toggleBlockSelectedState(e = !0) {
    const { BlockManager: t, BlockSelection: o } = this.Editor;
    this.lastSelectedBlock || (this.lastSelectedBlock = this.firstSelectedBlock = t.currentBlock), this.firstSelectedBlock === this.lastSelectedBlock && (this.firstSelectedBlock.selected = !0, o.clearCache(), b.get().removeAllRanges());
    const i = t.blocks.indexOf(this.lastSelectedBlock) + (e ? 1 : -1), n = t.blocks[i];
    n && (this.lastSelectedBlock.selected !== n.selected ? (n.selected = !0, o.clearCache()) : (this.lastSelectedBlock.selected = !1, o.clearCache()), this.lastSelectedBlock = n, this.Editor.InlineToolbar.close(), n.holder.scrollIntoView({
      block: "nearest"
    }));
  }
  /**
   * Clear saved state
   *
   * @param {Event} reason - event caused clear of selection
   */
  clear(e) {
    const { BlockManager: t, BlockSelection: o, Caret: i } = this.Editor, n = t.blocks.indexOf(this.firstSelectedBlock), r = t.blocks.indexOf(this.lastSelectedBlock);
    if (o.anyBlockSelected && n > -1 && r > -1 && e && e instanceof KeyboardEvent)
      switch (e.keyCode) {
        case k.DOWN:
        case k.RIGHT:
          i.setToBlock(t.blocks[Math.max(n, r)], i.positions.END);
          break;
        case k.UP:
        case k.LEFT:
          i.setToBlock(t.blocks[Math.min(n, r)], i.positions.START);
          break;
        default:
          i.setToBlock(t.blocks[Math.max(n, r)], i.positions.END);
      }
    this.firstSelectedBlock = this.lastSelectedBlock = null;
  }
  /**
   * Enables Cross Block Selection
   *
   * @param {MouseEvent} event - mouse down event
   */
  enableCrossBlockSelection(e) {
    const { UI: t } = this.Editor;
    b.isCollapsed || this.Editor.BlockSelection.clearSelection(e), t.nodes.redactor.contains(e.target) ? this.watchSelection(e) : this.Editor.BlockSelection.clearSelection(e);
  }
  /**
   * Change blocks selection state between passed two blocks.
   *
   * @param {Block} firstBlock - first block in range
   * @param {Block} lastBlock - last block in range
   */
  toggleBlocksSelectedState(e, t) {
    const { BlockManager: o, BlockSelection: i } = this.Editor, n = o.blocks.indexOf(e), r = o.blocks.indexOf(t), a = e.selected !== t.selected;
    for (let l = Math.min(n, r); l <= Math.max(n, r); l++) {
      const d = o.blocks[l];
      d !== this.firstSelectedBlock && d !== (a ? e : t) && (o.blocks[l].selected = !o.blocks[l].selected, i.clearCache());
    }
  }
}
class si extends y {
  constructor() {
    super(...arguments), this.isStartedAtEditor = !1;
  }
  /**
   * Toggle read-only state
   *
   * if state is true:
   *  - disable all drag-n-drop event handlers
   *
   * if state is false:
   *  - restore drag-n-drop event handlers
   *
   * @param {boolean} readOnlyEnabled - "read only" state
   */
  toggleReadOnly(e) {
    e ? this.disableModuleBindings() : this.enableModuleBindings();
  }
  /**
   * Add drag events listeners to editor zone
   */
  enableModuleBindings() {
    const { UI: e } = this.Editor;
    this.readOnlyMutableListeners.on(e.nodes.holder, "drop", async (t) => {
      await this.processDrop(t);
    }, !0), this.readOnlyMutableListeners.on(e.nodes.holder, "dragstart", () => {
      this.processDragStart();
    }), this.readOnlyMutableListeners.on(e.nodes.holder, "dragover", (t) => {
      this.processDragOver(t);
    }, !0);
  }
  /**
   * Unbind drag-n-drop event handlers
   */
  disableModuleBindings() {
    this.readOnlyMutableListeners.clearAll();
  }
  /**
   * Handle drop event
   *
   * @param {DragEvent} dropEvent - drop event
   */
  async processDrop(e) {
    const {
      BlockManager: t,
      Caret: o,
      Paste: i
    } = this.Editor;
    e.preventDefault(), t.blocks.forEach((r) => {
      r.dropTarget = !1;
    }), b.isAtEditor && !b.isCollapsed && this.isStartedAtEditor && document.execCommand("delete"), this.isStartedAtEditor = !1;
    const n = t.setCurrentBlockByChildNode(e.target);
    if (n)
      this.Editor.Caret.setToBlock(n, o.positions.END);
    else {
      const r = t.setCurrentBlockByChildNode(t.lastBlock.holder);
      this.Editor.Caret.setToBlock(r, o.positions.END);
    }
    await i.processDataTransfer(e.dataTransfer, !0);
  }
  /**
   * Handle drag start event
   */
  processDragStart() {
    b.isAtEditor && !b.isCollapsed && (this.isStartedAtEditor = !0), this.Editor.InlineToolbar.close();
  }
  /**
   * @param {DragEvent} dragEvent - drag event
   */
  processDragOver(e) {
    e.preventDefault();
  }
}
class ri extends y {
  /**
   * Prepare the module
   *
   * @param options - options used by the modification observer module
   * @param options.config - Editor configuration object
   * @param options.eventsDispatcher - common Editor event bus
   */
  constructor({ config: e, eventsDispatcher: t }) {
    super({
      config: e,
      eventsDispatcher: t
    }), this.disabled = !1, this.batchingTimeout = null, this.batchingOnChangeQueue = /* @__PURE__ */ new Map(), this.batchTime = 400, this.mutationObserver = new MutationObserver((o) => {
      this.redactorChanged(o);
    }), this.eventsDispatcher.on(pt, (o) => {
      this.particularBlockChanged(o.event);
    }), this.eventsDispatcher.on(ft, () => {
      this.disable();
    }), this.eventsDispatcher.on(gt, () => {
      this.enable();
    });
  }
  /**
   * Enables onChange event
   */
  enable() {
    this.mutationObserver.observe(
      this.Editor.UI.nodes.redactor,
      {
        childList: !0,
        subtree: !0,
        characterData: !0,
        attributes: !0
      }
    ), this.disabled = !1;
  }
  /**
   * Disables onChange event
   */
  disable() {
    this.mutationObserver.disconnect(), this.disabled = !0;
  }
  /**
   * Call onChange event passed to Editor.js configuration
   *
   * @param event - some of our custom change events
   */
  particularBlockChanged(e) {
    this.disabled || !M(this.config.onChange) || (this.batchingOnChangeQueue.set(`block:${e.detail.target.id}:event:${e.type}`, e), this.batchingTimeout && clearTimeout(this.batchingTimeout), this.batchingTimeout = setTimeout(() => {
      let t;
      this.batchingOnChangeQueue.size === 1 ? t = this.batchingOnChangeQueue.values().next().value : t = Array.from(this.batchingOnChangeQueue.values()), this.config.onChange && this.config.onChange(this.Editor.API.methods, t), this.batchingOnChangeQueue.clear();
    }, this.batchTime));
  }
  /**
   * Fired on every blocks wrapper dom change
   *
   * @param mutations - mutations happened
   */
  redactorChanged(e) {
    this.eventsDispatcher.emit(Ae, {
      mutations: e
    });
  }
}
const Ct = class extends y {
  constructor() {
    super(...arguments), this.MIME_TYPE = "application/x-editor-js", this.toolsTags = {}, this.tagsByTool = {}, this.toolsPatterns = [], this.toolsFiles = {}, this.exceptionList = [], this.processTool = (s) => {
      try {
        const e = s.create({}, {}, !1);
        if (s.pasteConfig === !1) {
          this.exceptionList.push(s.name);
          return;
        }
        if (!M(e.onPaste))
          return;
        this.getTagsConfig(s), this.getFilesConfig(s), this.getPatternsConfig(s);
      } catch (e) {
        T(
          `Paste handling for «${s.name}» Tool hasn't been set up because of the error`,
          "warn",
          e
        );
      }
    }, this.handlePasteEvent = async (s) => {
      const { BlockManager: e, Toolbar: t } = this.Editor, o = e.setCurrentBlockByChildNode(s.target);
      !o || this.isNativeBehaviour(s.target) && !s.clipboardData.types.includes("Files") || o && this.exceptionList.includes(o.name) || (s.preventDefault(), this.processDataTransfer(s.clipboardData), t.close());
    };
  }
  /**
   * Set onPaste callback and collect tools` paste configurations
   */
  async prepare() {
    this.processTools();
  }
  /**
   * Set read-only state
   *
   * @param {boolean} readOnlyEnabled - read only flag value
   */
  toggleReadOnly(s) {
    s ? this.unsetCallback() : this.setCallback();
  }
  /**
   * Handle pasted or dropped data transfer object
   *
   * @param {DataTransfer} dataTransfer - pasted or dropped data transfer object
   * @param {boolean} isDragNDrop - true if data transfer comes from drag'n'drop events
   */
  async processDataTransfer(s, e = !1) {
    const { Tools: t } = this.Editor, o = s.types;
    if ((o.includes ? o.includes("Files") : o.contains("Files")) && !W(this.toolsFiles)) {
      await this.processFiles(s.files);
      return;
    }
    const n = s.getData(this.MIME_TYPE), r = s.getData("text/plain");
    let a = s.getData("text/html");
    if (n)
      try {
        this.insertEditorJSData(JSON.parse(n));
        return;
      } catch {
      }
    e && r.trim() && a.trim() && (a = "<p>" + (a.trim() ? a : r) + "</p>");
    const l = Object.keys(this.toolsTags).reduce((h, f) => (h[f.toLowerCase()] = this.toolsTags[f].sanitizationConfig ?? {}, h), {}), d = Object.assign({}, l, t.getAllInlineToolsSanitizeConfig(), { br: {} }), u = V(a, d);
    !u.trim() || u.trim() === r || !c.isHTMLString(u) ? await this.processText(r) : await this.processText(u, !0);
  }
  /**
   * Process pasted text and divide them into Blocks
   *
   * @param {string} data - text to process. Can be HTML or plain.
   * @param {boolean} isHTML - if passed string is HTML, this parameter should be true
   */
  async processText(s, e = !1) {
    const { Caret: t, BlockManager: o } = this.Editor, i = e ? this.processHTML(s) : this.processPlain(s);
    if (!i.length)
      return;
    if (i.length === 1) {
      i[0].isBlock ? this.processSingleBlock(i.pop()) : this.processInlinePaste(i.pop());
      return;
    }
    const r = o.currentBlock && o.currentBlock.tool.isDefault && o.currentBlock.isEmpty;
    i.map(
      async (a, l) => this.insertBlock(a, l === 0 && r)
    ), o.currentBlock && t.setToBlock(o.currentBlock, t.positions.END);
  }
  /**
   * Set onPaste callback handler
   */
  setCallback() {
    this.listeners.on(this.Editor.UI.nodes.holder, "paste", this.handlePasteEvent);
  }
  /**
   * Unset onPaste callback handler
   */
  unsetCallback() {
    this.listeners.off(this.Editor.UI.nodes.holder, "paste", this.handlePasteEvent);
  }
  /**
   * Get and process tool`s paste configs
   */
  processTools() {
    const s = this.Editor.Tools.blockTools;
    Array.from(s.values()).forEach(this.processTool);
  }
  /**
   * Get tags name list from either tag name or sanitization config.
   *
   * @param {string | object} tagOrSanitizeConfig - tag name or sanitize config object.
   * @returns {string[]} array of tags.
   */
  collectTagNames(s) {
    return G(s) ? [s] : D(s) ? Object.keys(s) : [];
  }
  /**
   * Get tags to substitute by Tool
   *
   * @param tool - BlockTool object
   */
  getTagsConfig(s) {
    if (s.pasteConfig === !1)
      return;
    const e = s.pasteConfig.tags || [], t = [];
    e.forEach((o) => {
      const i = this.collectTagNames(o);
      t.push(...i), i.forEach((n) => {
        if (Object.prototype.hasOwnProperty.call(this.toolsTags, n)) {
          T(
            `Paste handler for «${s.name}» Tool on «${n}» tag is skipped because it is already used by «${this.toolsTags[n].tool.name}» Tool.`,
            "warn"
          );
          return;
        }
        const r = D(o) ? o[n] : null;
        this.toolsTags[n.toUpperCase()] = {
          tool: s,
          sanitizationConfig: r
        };
      });
    }), this.tagsByTool[s.name] = t.map((o) => o.toUpperCase());
  }
  /**
   * Get files` types and extensions to substitute by Tool
   *
   * @param tool - BlockTool object
   */
  getFilesConfig(s) {
    if (s.pasteConfig === !1)
      return;
    const { files: e = {} } = s.pasteConfig;
    let { extensions: t, mimeTypes: o } = e;
    !t && !o || (t && !Array.isArray(t) && (T(`«extensions» property of the onDrop config for «${s.name}» Tool should be an array`), t = []), o && !Array.isArray(o) && (T(`«mimeTypes» property of the onDrop config for «${s.name}» Tool should be an array`), o = []), o && (o = o.filter((i) => jt(i) ? !0 : (T(`MIME type value «${i}» for the «${s.name}» Tool is not a valid MIME type`, "warn"), !1))), this.toolsFiles[s.name] = {
      extensions: t || [],
      mimeTypes: o || []
    });
  }
  /**
   * Get RegExp patterns to substitute by Tool
   *
   * @param tool - BlockTool object
   */
  getPatternsConfig(s) {
    s.pasteConfig === !1 || !s.pasteConfig.patterns || W(s.pasteConfig.patterns) || Object.entries(s.pasteConfig.patterns).forEach(([e, t]) => {
      t instanceof RegExp || T(
        `Pattern ${t} for «${s.name}» Tool is skipped because it should be a Regexp instance.`,
        "warn"
      ), this.toolsPatterns.push({
        key: e,
        pattern: t,
        tool: s
      });
    });
  }
  /**
   * Check if browser behavior suits better
   *
   * @param {EventTarget} element - element where content has been pasted
   * @returns {boolean}
   */
  isNativeBehaviour(s) {
    return c.isNativeInput(s);
  }
  /**
   * Get files from data transfer object and insert related Tools
   *
   * @param {FileList} items - pasted or dropped items
   */
  async processFiles(s) {
    const { BlockManager: e } = this.Editor;
    let t;
    t = await Promise.all(
      Array.from(s).map((n) => this.processFile(n))
    ), t = t.filter((n) => !!n);
    const i = e.currentBlock.tool.isDefault && e.currentBlock.isEmpty;
    t.forEach(
      (n, r) => {
        e.paste(n.type, n.event, r === 0 && i);
      }
    );
  }
  /**
   * Get information about file and find Tool to handle it
   *
   * @param {File} file - file to process
   */
  async processFile(s) {
    const e = Ut(s), t = Object.entries(this.toolsFiles).find(([n, { mimeTypes: r, extensions: a }]) => {
      const [l, d] = s.type.split("/"), u = a.find((f) => f.toLowerCase() === e.toLowerCase()), h = r.find((f) => {
        const [x, p] = f.split("/");
        return x === l && (p === d || p === "*");
      });
      return !!u || !!h;
    });
    if (!t)
      return;
    const [o] = t;
    return {
      event: this.composePasteEvent("file", {
        file: s
      }),
      type: o
    };
  }
  /**
   * Split HTML string to blocks and return it as array of Block data
   *
   * @param {string} innerHTML - html string to process
   * @returns {PasteData[]}
   */
  processHTML(s) {
    const { Tools: e } = this.Editor, t = c.make("DIV");
    return t.innerHTML = s, this.getNodes(t).map((i) => {
      let n, r = e.defaultTool, a = !1;
      switch (i.nodeType) {
        case Node.DOCUMENT_FRAGMENT_NODE:
          n = c.make("div"), n.appendChild(i);
          break;
        case Node.ELEMENT_NODE:
          n = i, a = !0, this.toolsTags[n.tagName] && (r = this.toolsTags[n.tagName].tool);
          break;
      }
      const { tags: l } = r.pasteConfig || { tags: [] }, d = l.reduce((f, x) => (this.collectTagNames(x).forEach((m) => {
        const L = D(x) ? x[m] : null;
        f[m.toLowerCase()] = L || {};
      }), f), {}), u = Object.assign({}, d, r.baseSanitizeConfig);
      if (n.tagName.toLowerCase() === "table") {
        const f = V(n.outerHTML, u);
        n = c.make("div", void 0, {
          innerHTML: f
        }).firstChild;
      } else
        n.innerHTML = V(n.innerHTML, u);
      const h = this.composePasteEvent("tag", {
        data: n
      });
      return {
        content: n,
        isBlock: a,
        tool: r.name,
        event: h
      };
    }).filter((i) => {
      const n = c.isEmpty(i.content), r = c.isSingleTag(i.content);
      return !n || r;
    });
  }
  /**
   * Split plain text by new line symbols and return it as array of Block data
   *
   * @param {string} plain - string to process
   * @returns {PasteData[]}
   */
  processPlain(s) {
    const { defaultBlock: e } = this.config;
    if (!s)
      return [];
    const t = e;
    return s.split(/\r?\n/).filter((o) => o.trim()).map((o) => {
      const i = c.make("div");
      i.textContent = o;
      const n = this.composePasteEvent("tag", {
        data: i
      });
      return {
        content: i,
        tool: t,
        isBlock: !1,
        event: n
      };
    });
  }
  /**
   * Process paste of single Block tool content
   *
   * @param {PasteData} dataToInsert - data of Block to insert
   */
  async processSingleBlock(s) {
    const { Caret: e, BlockManager: t } = this.Editor, { currentBlock: o } = t;
    if (!o || s.tool !== o.name || !c.containsOnlyInlineElements(s.content.innerHTML)) {
      this.insertBlock(s, (o == null ? void 0 : o.tool.isDefault) && o.isEmpty);
      return;
    }
    e.insertContentAtCaretPosition(s.content.innerHTML);
  }
  /**
   * Process paste to single Block:
   * 1. Find patterns` matches
   * 2. Insert new block if it is not the same type as current one
   * 3. Just insert text if there is no substitutions
   *
   * @param {PasteData} dataToInsert - data of Block to insert
   */
  async processInlinePaste(s) {
    const { BlockManager: e, Caret: t } = this.Editor, { content: o } = s;
    if (e.currentBlock && e.currentBlock.tool.isDefault && o.textContent.length < Ct.PATTERN_PROCESSING_MAX_LENGTH) {
      const n = await this.processPattern(o.textContent);
      if (n) {
        const r = e.currentBlock && e.currentBlock.tool.isDefault && e.currentBlock.isEmpty, a = e.paste(n.tool, n.event, r);
        t.setToBlock(a, t.positions.END);
        return;
      }
    }
    if (e.currentBlock && e.currentBlock.currentInput) {
      const n = e.currentBlock.tool.baseSanitizeConfig;
      document.execCommand(
        "insertHTML",
        !1,
        V(o.innerHTML, n)
      );
    } else
      this.insertBlock(s);
  }
  /**
   * Get patterns` matches
   *
   * @param {string} text - text to process
   * @returns {Promise<{event: PasteEvent, tool: string}>}
   */
  async processPattern(s) {
    const e = this.toolsPatterns.find((o) => {
      const i = o.pattern.exec(s);
      return i ? s === i.shift() : !1;
    });
    return e ? {
      event: this.composePasteEvent("pattern", {
        key: e.key,
        data: s
      }),
      tool: e.tool.name
    } : void 0;
  }
  /**
   * Insert pasted Block content to Editor
   *
   * @param {PasteData} data - data to insert
   * @param {boolean} canReplaceCurrentBlock - if true and is current Block is empty, will replace current Block
   * @returns {void}
   */
  insertBlock(s, e = !1) {
    const { BlockManager: t, Caret: o } = this.Editor, { currentBlock: i } = t;
    let n;
    if (e && i && i.isEmpty) {
      n = t.paste(s.tool, s.event, !0), o.setToBlock(n, o.positions.END);
      return;
    }
    n = t.paste(s.tool, s.event), o.setToBlock(n, o.positions.END);
  }
  /**
   * Insert data passed as application/x-editor-js JSON
   *
   * @param {Array} blocks — Blocks' data to insert
   * @returns {void}
   */
  insertEditorJSData(s) {
    const { BlockManager: e, Caret: t, Tools: o } = this.Editor;
    bt(
      s,
      (n) => o.blockTools.get(n).sanitizeConfig
    ).forEach(({ tool: n, data: r }, a) => {
      let l = !1;
      a === 0 && (l = e.currentBlock && e.currentBlock.tool.isDefault && e.currentBlock.isEmpty);
      const d = e.insert({
        tool: n,
        data: r,
        replace: l
      });
      t.setToBlock(d, t.positions.END);
    });
  }
  /**
   * Fetch nodes from Element node
   *
   * @param {Node} node - current node
   * @param {Node[]} nodes - processed nodes
   * @param {Node} destNode - destination node
   */
  processElementNode(s, e, t) {
    const o = Object.keys(this.toolsTags), i = s, { tool: n } = this.toolsTags[i.tagName] || {}, r = this.tagsByTool[n == null ? void 0 : n.name] || [], a = o.includes(i.tagName), l = c.blockElements.includes(i.tagName.toLowerCase()), d = Array.from(i.children).some(
      ({ tagName: h }) => o.includes(h) && !r.includes(h)
    ), u = Array.from(i.children).some(
      ({ tagName: h }) => c.blockElements.includes(h.toLowerCase())
    );
    if (!l && !a && !d)
      return t.appendChild(i), [...e, t];
    if (a && !d || l && !u && !d)
      return [...e, t, i];
  }
  /**
   * Recursively divide HTML string to two types of nodes:
   * 1. Block element
   * 2. Document Fragments contained text and markup tags like a, b, i etc.
   *
   * @param {Node} wrapper - wrapper of paster HTML content
   * @returns {Node[]}
   */
  getNodes(s) {
    const e = Array.from(s.childNodes);
    let t;
    const o = (i, n) => {
      if (c.isEmpty(n) && !c.isSingleTag(n))
        return i;
      const r = i[i.length - 1];
      let a = new DocumentFragment();
      switch (r && c.isFragment(r) && (a = i.pop()), n.nodeType) {
        case Node.ELEMENT_NODE:
          if (t = this.processElementNode(n, i, a), t)
            return t;
          break;
        case Node.TEXT_NODE:
          return a.appendChild(n), [...i, a];
        default:
          return [...i, a];
      }
      return [...i, ...Array.from(n.childNodes).reduce(o, [])];
    };
    return e.reduce(o, []);
  }
  /**
   * Compose paste event with passed type and detail
   *
   * @param {string} type - event type
   * @param {PasteEventDetail} detail - event detail
   */
  composePasteEvent(s, e) {
    return new CustomEvent(s, {
      detail: e
    });
  }
};
let Tt = Ct;
Tt.PATTERN_PROCESSING_MAX_LENGTH = 450;
class ai extends y {
  constructor() {
    super(...arguments), this.toolsDontSupportReadOnly = [], this.readOnlyEnabled = !1;
  }
  /**
   * Returns state of read only mode
   */
  get isEnabled() {
    return this.readOnlyEnabled;
  }
  /**
   * Set initial state
   */
  async prepare() {
    const { Tools: e } = this.Editor, { blockTools: t } = e, o = [];
    Array.from(t.entries()).forEach(([i, n]) => {
      n.isReadOnlySupported || o.push(i);
    }), this.toolsDontSupportReadOnly = o, this.config.readOnly && o.length > 0 && this.throwCriticalError(), this.toggle(this.config.readOnly);
  }
  /**
   * Set read-only mode or toggle current state
   * Call all Modules `toggleReadOnly` method and re-render Editor
   *
   * @param {boolean} state - (optional) read-only state or toggle
   */
  async toggle(e = !this.readOnlyEnabled) {
    e && this.toolsDontSupportReadOnly.length > 0 && this.throwCriticalError();
    const t = this.readOnlyEnabled;
    this.readOnlyEnabled = e;
    for (const i in this.Editor)
      this.Editor[i].toggleReadOnly && this.Editor[i].toggleReadOnly(e);
    if (t === e)
      return this.readOnlyEnabled;
    const o = await this.Editor.Saver.save();
    return await this.Editor.BlockManager.clear(), await this.Editor.Renderer.render(o.blocks), this.readOnlyEnabled;
  }
  /**
   * Throws an error about tools which don't support read-only mode
   */
  throwCriticalError() {
    throw new ut(
      `To enable read-only mode all connected tools should support it. Tools ${this.toolsDontSupportReadOnly.join(", ")} don't support read-only mode.`
    );
  }
}
class fe extends y {
  constructor() {
    super(...arguments), this.isRectSelectionActivated = !1, this.SCROLL_SPEED = 3, this.HEIGHT_OF_SCROLL_ZONE = 40, this.BOTTOM_SCROLL_ZONE = 1, this.TOP_SCROLL_ZONE = 2, this.MAIN_MOUSE_BUTTON = 0, this.mousedown = !1, this.isScrolling = !1, this.inScrollZone = null, this.startX = 0, this.startY = 0, this.mouseX = 0, this.mouseY = 0, this.stackOfSelected = [], this.listenerIds = [];
  }
  /**
   * CSS classes for the Block
   *
   * @returns {{wrapper: string, content: string}}
   */
  static get CSS() {
    return {
      overlay: "codex-editor-overlay",
      overlayContainer: "codex-editor-overlay__container",
      rect: "codex-editor-overlay__rectangle",
      topScrollZone: "codex-editor-overlay__scroll-zone--top",
      bottomScrollZone: "codex-editor-overlay__scroll-zone--bottom"
    };
  }
  /**
   * Module Preparation
   * Creating rect and hang handlers
   */
  prepare() {
    this.enableModuleBindings();
  }
  /**
   * Init rect params
   *
   * @param {number} pageX - X coord of mouse
   * @param {number} pageY - Y coord of mouse
   */
  startSelection(e, t) {
    const o = document.elementFromPoint(e - window.pageXOffset, t - window.pageYOffset);
    o.closest(`.${this.Editor.Toolbar.CSS.toolbar}`) || (this.Editor.BlockSelection.allBlocksSelected = !1, this.clearSelection(), this.stackOfSelected = []);
    const n = [
      `.${R.CSS.content}`,
      `.${this.Editor.Toolbar.CSS.toolbar}`,
      `.${this.Editor.InlineToolbar.CSS.inlineToolbar}`
    ], r = o.closest("." + this.Editor.UI.CSS.editorWrapper), a = n.some((l) => !!o.closest(l));
    !r || a || (this.mousedown = !0, this.startX = e, this.startY = t);
  }
  /**
   * Clear all params to end selection
   */
  endSelection() {
    this.mousedown = !1, this.startX = 0, this.startY = 0, this.overlayRectangle.style.display = "none";
  }
  /**
   * is RectSelection Activated
   */
  isRectActivated() {
    return this.isRectSelectionActivated;
  }
  /**
   * Mark that selection is end
   */
  clearSelection() {
    this.isRectSelectionActivated = !1;
  }
  /**
   * Sets Module necessary event handlers
   */
  enableModuleBindings() {
    const { container: e } = this.genHTML();
    this.listeners.on(e, "mousedown", (t) => {
      this.processMouseDown(t);
    }, !1), this.listeners.on(document.body, "mousemove", Ie((t) => {
      this.processMouseMove(t);
    }, 10), {
      passive: !0
    }), this.listeners.on(document.body, "mouseleave", () => {
      this.processMouseLeave();
    }), this.listeners.on(window, "scroll", Ie((t) => {
      this.processScroll(t);
    }, 10), {
      passive: !0
    }), this.listeners.on(document.body, "mouseup", () => {
      this.processMouseUp();
    }, !1);
  }
  /**
   * Handle mouse down events
   *
   * @param {MouseEvent} mouseEvent - mouse event payload
   */
  processMouseDown(e) {
    if (e.button !== this.MAIN_MOUSE_BUTTON)
      return;
    e.target.closest(c.allInputsSelector) !== null || this.startSelection(e.pageX, e.pageY);
  }
  /**
   * Handle mouse move events
   *
   * @param {MouseEvent} mouseEvent - mouse event payload
   */
  processMouseMove(e) {
    this.changingRectangle(e), this.scrollByZones(e.clientY);
  }
  /**
   * Handle mouse leave
   */
  processMouseLeave() {
    this.clearSelection(), this.endSelection();
  }
  /**
   * @param {MouseEvent} mouseEvent - mouse event payload
   */
  processScroll(e) {
    this.changingRectangle(e);
  }
  /**
   * Handle mouse up
   */
  processMouseUp() {
    this.clearSelection(), this.endSelection();
  }
  /**
   * Scroll If mouse in scroll zone
   *
   * @param {number} clientY - Y coord of mouse
   */
  scrollByZones(e) {
    if (this.inScrollZone = null, e <= this.HEIGHT_OF_SCROLL_ZONE && (this.inScrollZone = this.TOP_SCROLL_ZONE), document.documentElement.clientHeight - e <= this.HEIGHT_OF_SCROLL_ZONE && (this.inScrollZone = this.BOTTOM_SCROLL_ZONE), !this.inScrollZone) {
      this.isScrolling = !1;
      return;
    }
    this.isScrolling || (this.scrollVertical(this.inScrollZone === this.TOP_SCROLL_ZONE ? -this.SCROLL_SPEED : this.SCROLL_SPEED), this.isScrolling = !0);
  }
  /**
   * Generates required HTML elements
   *
   * @returns {Object<string, Element>}
   */
  genHTML() {
    const { UI: e } = this.Editor, t = e.nodes.holder.querySelector("." + e.CSS.editorWrapper), o = c.make("div", fe.CSS.overlay, {}), i = c.make("div", fe.CSS.overlayContainer, {}), n = c.make("div", fe.CSS.rect, {});
    return i.appendChild(n), o.appendChild(i), t.appendChild(o), this.overlayRectangle = n, {
      container: t,
      overlay: o
    };
  }
  /**
   * Activates scrolling if blockSelection is active and mouse is in scroll zone
   *
   * @param {number} speed - speed of scrolling
   */
  scrollVertical(e) {
    if (!(this.inScrollZone && this.mousedown))
      return;
    const t = window.pageYOffset;
    window.scrollBy(0, e), this.mouseY += window.pageYOffset - t, setTimeout(() => {
      this.scrollVertical(e);
    }, 0);
  }
  /**
   * Handles the change in the rectangle and its effect
   *
   * @param {MouseEvent} event - mouse event
   */
  changingRectangle(e) {
    if (!this.mousedown)
      return;
    e.pageY !== void 0 && (this.mouseX = e.pageX, this.mouseY = e.pageY);
    const { rightPos: t, leftPos: o, index: i } = this.genInfoForMouseSelection(), n = this.startX > t && this.mouseX > t, r = this.startX < o && this.mouseX < o;
    this.rectCrossesBlocks = !(n || r), this.isRectSelectionActivated || (this.rectCrossesBlocks = !1, this.isRectSelectionActivated = !0, this.shrinkRectangleToPoint(), this.overlayRectangle.style.display = "block"), this.updateRectangleSize(), this.Editor.Toolbar.close(), i !== void 0 && (this.trySelectNextBlock(i), this.inverseSelection(), b.get().removeAllRanges());
  }
  /**
   * Shrink rect to singular point
   */
  shrinkRectangleToPoint() {
    this.overlayRectangle.style.left = `${this.startX - window.pageXOffset}px`, this.overlayRectangle.style.top = `${this.startY - window.pageYOffset}px`, this.overlayRectangle.style.bottom = `calc(100% - ${this.startY - window.pageYOffset}px`, this.overlayRectangle.style.right = `calc(100% - ${this.startX - window.pageXOffset}px`;
  }
  /**
   * Select or unselect all of blocks in array if rect is out or in selectable area
   */
  inverseSelection() {
    const t = this.Editor.BlockManager.getBlockByIndex(this.stackOfSelected[0]).selected;
    if (this.rectCrossesBlocks && !t)
      for (const o of this.stackOfSelected)
        this.Editor.BlockSelection.selectBlockByIndex(o);
    if (!this.rectCrossesBlocks && t)
      for (const o of this.stackOfSelected)
        this.Editor.BlockSelection.unSelectBlockByIndex(o);
  }
  /**
   * Updates size of rectangle
   */
  updateRectangleSize() {
    this.mouseY >= this.startY ? (this.overlayRectangle.style.top = `${this.startY - window.pageYOffset}px`, this.overlayRectangle.style.bottom = `calc(100% - ${this.mouseY - window.pageYOffset}px`) : (this.overlayRectangle.style.bottom = `calc(100% - ${this.startY - window.pageYOffset}px`, this.overlayRectangle.style.top = `${this.mouseY - window.pageYOffset}px`), this.mouseX >= this.startX ? (this.overlayRectangle.style.left = `${this.startX - window.pageXOffset}px`, this.overlayRectangle.style.right = `calc(100% - ${this.mouseX - window.pageXOffset}px`) : (this.overlayRectangle.style.right = `calc(100% - ${this.startX - window.pageXOffset}px`, this.overlayRectangle.style.left = `${this.mouseX - window.pageXOffset}px`);
  }
  /**
   * Collects information needed to determine the behavior of the rectangle
   *
   * @returns {object} index - index next Block, leftPos - start of left border of Block, rightPos - right border
   */
  genInfoForMouseSelection() {
    const t = document.body.offsetWidth / 2, o = this.mouseY - window.pageYOffset, i = document.elementFromPoint(t, o), n = this.Editor.BlockManager.getBlockByChildNode(i);
    let r;
    n !== void 0 && (r = this.Editor.BlockManager.blocks.findIndex((h) => h.holder === n.holder));
    const a = this.Editor.BlockManager.lastBlock.holder.querySelector("." + R.CSS.content), l = Number.parseInt(window.getComputedStyle(a).width, 10) / 2, d = t - l, u = t + l;
    return {
      index: r,
      leftPos: d,
      rightPos: u
    };
  }
  /**
   * Select block with index index
   *
   * @param index - index of block in redactor
   */
  addBlockInSelection(e) {
    this.rectCrossesBlocks && this.Editor.BlockSelection.selectBlockByIndex(e), this.stackOfSelected.push(e);
  }
  /**
   * Adds a block to the selection and determines which blocks should be selected
   *
   * @param {object} index - index of new block in the reactor
   */
  trySelectNextBlock(e) {
    const t = this.stackOfSelected[this.stackOfSelected.length - 1] === e, o = this.stackOfSelected.length, i = 1, n = -1, r = 0;
    if (t)
      return;
    const a = this.stackOfSelected[o - 1] - this.stackOfSelected[o - 2] > 0;
    let l = r;
    o > 1 && (l = a ? i : n);
    const d = e > this.stackOfSelected[o - 1] && l === i, u = e < this.stackOfSelected[o - 1] && l === n, f = !(d || u || l === r);
    if (!f && (e > this.stackOfSelected[o - 1] || this.stackOfSelected[o - 1] === void 0)) {
      let m = this.stackOfSelected[o - 1] + 1 || e;
      for (m; m <= e; m++)
        this.addBlockInSelection(m);
      return;
    }
    if (!f && e < this.stackOfSelected[o - 1]) {
      for (let m = this.stackOfSelected[o - 1] - 1; m >= e; m--)
        this.addBlockInSelection(m);
      return;
    }
    if (!f)
      return;
    let x = o - 1, p;
    for (e > this.stackOfSelected[o - 1] ? p = () => e > this.stackOfSelected[x] : p = () => e < this.stackOfSelected[x]; p(); )
      this.rectCrossesBlocks && this.Editor.BlockSelection.unSelectBlockByIndex(this.stackOfSelected[x]), this.stackOfSelected.pop(), x--;
  }
}
class li extends y {
  /**
   * Renders passed blocks as one batch
   *
   * @param blocksData - blocks to render
   */
  async render(e) {
    return new Promise((t) => {
      const { Tools: o, BlockManager: i } = this.Editor;
      if (e.length === 0)
        i.insert();
      else {
        const n = e.map(({ type: r, data: a, tunes: l, id: d }) => {
          o.available.has(r) === !1 && (Y(`Tool «${r}» is not found. Check 'tools' property at the Editor.js config.`, "warn"), a = this.composeStubDataForTool(r, a, d), r = o.stubTool);
          let u;
          try {
            u = i.composeBlock({
              id: d,
              tool: r,
              data: a,
              tunes: l
            });
          } catch (h) {
            T(`Block «${r}» skipped because of plugins error`, "error", {
              data: a,
              error: h
            }), a = this.composeStubDataForTool(r, a, d), r = o.stubTool, u = i.composeBlock({
              id: d,
              tool: r,
              data: a,
              tunes: l
            });
          }
          return u;
        });
        i.insertMany(n);
      }
      window.requestIdleCallback(() => {
        t();
      }, { timeout: 2e3 });
    });
  }
  /**
   * Create data for the Stub Tool that will be used instead of unavailable tool
   *
   * @param tool - unavailable tool name to stub
   * @param data - data of unavailable block
   * @param [id] - id of unavailable block
   */
  composeStubDataForTool(e, t, o) {
    const { Tools: i } = this.Editor;
    let n = e;
    if (i.unavailable.has(e)) {
      const r = i.unavailable.get(e).toolbox;
      r !== void 0 && r[0].title !== void 0 && (n = r[0].title);
    }
    return {
      savedData: {
        id: o,
        type: e,
        data: t
      },
      title: n
    };
  }
}
class ci extends y {
  /**
   * Composes new chain of Promises to fire them alternatelly
   *
   * @returns {OutputData}
   */
  async save() {
    const { BlockManager: e, Tools: t } = this.Editor, o = e.blocks, i = [];
    try {
      o.forEach((a) => {
        i.push(this.getSavedData(a));
      });
      const n = await Promise.all(i), r = await bt(n, (a) => t.blockTools.get(a).sanitizeConfig);
      return this.makeOutput(r);
    } catch (n) {
      Y("Saving failed due to the Error %o", "error", n);
    }
  }
  /**
   * Saves and validates
   *
   * @param {Block} block - Editor's Tool
   * @returns {ValidatedData} - Tool's validated data
   */
  async getSavedData(e) {
    const t = await e.save(), o = t && await e.validate(t.data);
    return {
      ...t,
      isValid: o
    };
  }
  /**
   * Creates output object with saved data, time and version of editor
   *
   * @param {ValidatedData} allExtractedData - data extracted from Blocks
   * @returns {OutputData}
   */
  makeOutput(e) {
    const t = [];
    return e.forEach(({ id: o, tool: i, data: n, tunes: r, isValid: a }) => {
      if (!a) {
        T(`Block «${i}» skipped because saved data is invalid`);
        return;
      }
      if (i === this.Editor.Tools.stubTool) {
        t.push(n);
        return;
      }
      const l = {
        id: o,
        type: i,
        data: n,
        ...!W(r) && {
          tunes: r
        }
      };
      t.push(l);
    }), {
      time: +/* @__PURE__ */ new Date(),
      blocks: t,
      version: "2.29.0"
    };
  }
}
(function() {
  try {
    if (typeof document < "u") {
      var s = document.createElement("style");
      s.appendChild(document.createTextNode(".ce-paragraph{line-height:1.6em;outline:none}.ce-paragraph[data-placeholder]:empty:before{content:attr(data-placeholder);color:#707684;font-weight:400;opacity:0}.codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty:before{opacity:1}.codex-editor--toolbox-opened .ce-block:first-child .ce-paragraph[data-placeholder]:empty:before,.codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty:focus:before{opacity:0}.ce-paragraph p:first-of-type{margin-top:0}.ce-paragraph p:last-of-type{margin-bottom:0}")), document.head.appendChild(s);
    }
  } catch (e) {
    console.error("vite-plugin-css-injected-by-js", e);
  }
})();
const di = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 9V7.2C8 7.08954 8.08954 7 8.2 7L12 7M16 9V7.2C16 7.08954 15.9105 7 15.8 7L12 7M12 7L12 17M12 17H10M12 17H14"/></svg>';
/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */
class Ke {
  /**
   * Default placeholder for Paragraph Tool
   *
   * @returns {string}
   * @class
   */
  static get DEFAULT_PLACEHOLDER() {
    return "";
  }
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {object} params - constructor params
   * @param {ParagraphData} params.data - previously saved data
   * @param {ParagraphConfig} params.config - user config for Tool
   * @param {object} params.api - editor.js api
   * @param {boolean} readOnly - read only mode flag
   */
  constructor({ data: e, config: t, api: o, readOnly: i }) {
    this.api = o, this.readOnly = i, this._CSS = {
      block: this.api.styles.block,
      wrapper: "ce-paragraph"
    }, this.readOnly || (this.onKeyUp = this.onKeyUp.bind(this)), this._placeholder = t.placeholder ? t.placeholder : Ke.DEFAULT_PLACEHOLDER, this._data = {}, this._element = null, this._preserveBlank = t.preserveBlank !== void 0 ? t.preserveBlank : !1, this.data = e;
  }
  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  onKeyUp(e) {
    if (e.code !== "Backspace" && e.code !== "Delete")
      return;
    const { textContent: t } = this._element;
    t === "" && (this._element.innerHTML = "");
  }
  /**
   * Create Tool's view
   *
   * @returns {HTMLElement}
   * @private
   */
  drawView() {
    const e = document.createElement("DIV");
    return e.classList.add(this._CSS.wrapper, this._CSS.block), e.contentEditable = !1, e.dataset.placeholder = this.api.i18n.t(this._placeholder), this._data.text && (e.innerHTML = this._data.text), this.readOnly || (e.contentEditable = !0, e.addEventListener("keyup", this.onKeyUp)), e;
  }
  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render() {
    return this._element = this.drawView(), this._element;
  }
  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param {ParagraphData} data
   * @public
   */
  merge(e) {
    const t = {
      text: this.data.text + e.text
    };
    this.data = t;
  }
  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param {ParagraphData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(e) {
    return !(e.text.trim() === "" && !this._preserveBlank);
  }
  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLDivElement} toolsContent - Paragraph tools rendered view
   * @returns {ParagraphData} - saved data
   * @public
   */
  save(e) {
    return {
      text: e.innerHTML
    };
  }
  /**
   * On paste callback fired from Editor.
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(e) {
    const t = {
      text: e.detail.data.innerHTML
    };
    this.data = t;
  }
  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   */
  static get conversionConfig() {
    return {
      export: "text",
      // to convert Paragraph to other block, use 'text' property of saved data
      import: "text"
      // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }
  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: !0
      }
    };
  }
  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return !0;
  }
  /**
   * Get current Tools`s data
   *
   * @returns {ParagraphData} Current data
   * @private
   */
  get data() {
    if (this._element !== null) {
      const e = this._element.innerHTML;
      this._data.text = e;
    }
    return this._data;
  }
  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {ParagraphData} data — data to set
   * @private
   */
  set data(e) {
    this._data = e || {}, this._element !== null && this.hydrate();
  }
  /**
   * Fill tool's view with data
   */
  hydrate() {
    window.requestAnimationFrame(() => {
      this._element.innerHTML = this._data.text || "";
    });
  }
  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   *
   * @returns {{tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: ["P"]
    };
  }
  /**
   * Icon and title for displaying at the Toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: di,
      title: "Text"
    };
  }
}
class Xe {
  constructor() {
    this.commandName = "bold", this.CSS = {
      button: "ce-inline-tool",
      buttonActive: "ce-inline-tool--active",
      buttonModifier: "ce-inline-tool--bold"
    }, this.nodes = {
      button: void 0
    };
  }
  /**
   * Sanitizer Rule
   * Leave <b> tags
   *
   * @returns {object}
   */
  static get sanitize() {
    return {
      b: {}
    };
  }
  /**
   * Create button for Inline Toolbar
   */
  render() {
    return this.nodes.button = document.createElement("button"), this.nodes.button.type = "button", this.nodes.button.classList.add(this.CSS.button, this.CSS.buttonModifier), this.nodes.button.innerHTML = _o, this.nodes.button;
  }
  /**
   * Wrap range with <b> tag
   */
  surround() {
    document.execCommand(this.commandName);
  }
  /**
   * Check selection and set activated state to button if there are <b> tag
   *
   * @returns {boolean}
   */
  checkState() {
    const e = document.queryCommandState(this.commandName);
    return this.nodes.button.classList.toggle(this.CSS.buttonActive, e), e;
  }
  /**
   * Set a shortcut
   *
   * @returns {boolean}
   */
  get shortcut() {
    return "CMD+B";
  }
}
Xe.isInline = !0;
Xe.title = "Bold";
class Ve {
  constructor() {
    this.commandName = "italic", this.CSS = {
      button: "ce-inline-tool",
      buttonActive: "ce-inline-tool--active",
      buttonModifier: "ce-inline-tool--italic"
    }, this.nodes = {
      button: null
    };
  }
  /**
   * Sanitizer Rule
   * Leave <i> tags
   *
   * @returns {object}
   */
  static get sanitize() {
    return {
      i: {}
    };
  }
  /**
   * Create button for Inline Toolbar
   */
  render() {
    return this.nodes.button = document.createElement("button"), this.nodes.button.type = "button", this.nodes.button.classList.add(this.CSS.button, this.CSS.buttonModifier), this.nodes.button.innerHTML = Do, this.nodes.button;
  }
  /**
   * Wrap range with <i> tag
   */
  surround() {
    document.execCommand(this.commandName);
  }
  /**
   * Check selection and set activated state to button if there are <i> tag
   */
  checkState() {
    const e = document.queryCommandState(this.commandName);
    return this.nodes.button.classList.toggle(this.CSS.buttonActive, e), e;
  }
  /**
   * Set a shortcut
   */
  get shortcut() {
    return "CMD+I";
  }
}
Ve.isInline = !0;
Ve.title = "Italic";
class qe {
  /**
   * @param api - Editor.js API
   */
  constructor({ api: e }) {
    this.commandLink = "createLink", this.commandUnlink = "unlink", this.ENTER_KEY = 13, this.CSS = {
      button: "ce-inline-tool",
      buttonActive: "ce-inline-tool--active",
      buttonModifier: "ce-inline-tool--link",
      buttonUnlink: "ce-inline-tool--unlink",
      input: "ce-inline-tool-input",
      inputShowed: "ce-inline-tool-input--showed"
    }, this.nodes = {
      button: null,
      input: null
    }, this.inputOpened = !1, this.toolbar = e.toolbar, this.inlineToolbar = e.inlineToolbar, this.notifier = e.notifier, this.i18n = e.i18n, this.selection = new b();
  }
  /**
   * Sanitizer Rule
   * Leave <a> tags
   *
   * @returns {object}
   */
  static get sanitize() {
    return {
      a: {
        href: !0,
        target: "_blank",
        rel: "nofollow"
      }
    };
  }
  /**
   * Create button for Inline Toolbar
   */
  render() {
    return this.nodes.button = document.createElement("button"), this.nodes.button.type = "button", this.nodes.button.classList.add(this.CSS.button, this.CSS.buttonModifier), this.nodes.button.innerHTML = it, this.nodes.button;
  }
  /**
   * Input for the link
   */
  renderActions() {
    return this.nodes.input = document.createElement("input"), this.nodes.input.placeholder = this.i18n.t("Add a link"), this.nodes.input.classList.add(this.CSS.input), this.nodes.input.addEventListener("keydown", (e) => {
      e.keyCode === this.ENTER_KEY && this.enterPressed(e);
    }), this.nodes.input;
  }
  /**
   * Handle clicks on the Inline Toolbar icon
   *
   * @param {Range} range - range to wrap with link
   */
  surround(e) {
    if (e) {
      this.inputOpened ? (this.selection.restore(), this.selection.removeFakeBackground()) : (this.selection.setFakeBackground(), this.selection.save());
      const t = this.selection.findParentTag("A");
      if (t) {
        this.selection.expandToTag(t), this.unlink(), this.closeActions(), this.checkState(), this.toolbar.close();
        return;
      }
    }
    this.toggleActions();
  }
  /**
   * Check selection and set activated state to button if there are <a> tag
   */
  checkState() {
    const e = this.selection.findParentTag("A");
    if (e) {
      this.nodes.button.innerHTML = zo, this.nodes.button.classList.add(this.CSS.buttonUnlink), this.nodes.button.classList.add(this.CSS.buttonActive), this.openActions();
      const t = e.getAttribute("href");
      this.nodes.input.value = t !== "null" ? t : "", this.selection.save();
    } else
      this.nodes.button.innerHTML = it, this.nodes.button.classList.remove(this.CSS.buttonUnlink), this.nodes.button.classList.remove(this.CSS.buttonActive);
    return !!e;
  }
  /**
   * Function called with Inline Toolbar closing
   */
  clear() {
    this.closeActions();
  }
  /**
   * Set a shortcut
   */
  get shortcut() {
    return "CMD+K";
  }
  /**
   * Show/close link input
   */
  toggleActions() {
    this.inputOpened ? this.closeActions(!1) : this.openActions(!0);
  }
  /**
   * @param {boolean} needFocus - on link creation we need to focus input. On editing - nope.
   */
  openActions(e = !1) {
    this.nodes.input.classList.add(this.CSS.inputShowed), e && this.nodes.input.focus(), this.inputOpened = !0;
  }
  /**
   * Close input
   *
   * @param {boolean} clearSavedSelection — we don't need to clear saved selection
   *                                        on toggle-clicks on the icon of opened Toolbar
   */
  closeActions(e = !0) {
    if (this.selection.isFakeBackgroundEnabled) {
      const t = new b();
      t.save(), this.selection.restore(), this.selection.removeFakeBackground(), t.restore();
    }
    this.nodes.input.classList.remove(this.CSS.inputShowed), this.nodes.input.value = "", e && this.selection.clearSaved(), this.inputOpened = !1;
  }
  /**
   * Enter pressed on input
   *
   * @param {KeyboardEvent} event - enter keydown event
   */
  enterPressed(e) {
    let t = this.nodes.input.value || "";
    if (!t.trim()) {
      this.selection.restore(), this.unlink(), e.preventDefault(), this.closeActions();
      return;
    }
    if (!this.validateURL(t)) {
      this.notifier.show({
        message: "Pasted link is not valid.",
        style: "error"
      }), T("Incorrect Link pasted", "warn", t);
      return;
    }
    t = this.prepareLink(t), this.selection.restore(), this.selection.removeFakeBackground(), this.insertLink(t), e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation(), this.selection.collapseToEnd(), this.inlineToolbar.close();
  }
  /**
   * Detects if passed string is URL
   *
   * @param {string} str - string to validate
   * @returns {boolean}
   */
  validateURL(e) {
    return !/\s/.test(e);
  }
  /**
   * Process link before injection
   * - sanitize
   * - add protocol for links like 'google.com'
   *
   * @param {string} link - raw user input
   */
  prepareLink(e) {
    return e = e.trim(), e = this.addProtocol(e), e;
  }
  /**
   * Add 'http' protocol to the links like 'vc.ru', 'google.com'
   *
   * @param {string} link - string to process
   */
  addProtocol(e) {
    if (/^(\w+):(\/\/)?/.test(e))
      return e;
    const t = /^\/[^/\s]/.test(e), o = e.substring(0, 1) === "#", i = /^\/\/[^/\s]/.test(e);
    return !t && !o && !i && (e = "http://" + e), e;
  }
  /**
   * Inserts <a> tag with "href"
   *
   * @param {string} link - "href" value
   */
  insertLink(e) {
    const t = this.selection.findParentTag("A");
    t && this.selection.expandToTag(t), document.execCommand(this.commandLink, !1, e);
  }
  /**
   * Removes <a> tag
   */
  unlink() {
    document.execCommand(this.commandUnlink);
  }
}
qe.isInline = !0;
qe.title = "Link";
class St {
  /**
   * @param options - constructor options
   * @param options.data - stub tool data
   * @param options.api - Editor.js API
   */
  constructor({ data: e, api: t }) {
    this.CSS = {
      wrapper: "ce-stub",
      info: "ce-stub__info",
      title: "ce-stub__title",
      subtitle: "ce-stub__subtitle"
    }, this.api = t, this.title = e.title || this.api.i18n.t("Error"), this.subtitle = this.api.i18n.t("The block can not be displayed correctly."), this.savedData = e.savedData, this.wrapper = this.make();
  }
  /**
   * Returns stub holder
   *
   * @returns {HTMLElement}
   */
  render() {
    return this.wrapper;
  }
  /**
   * Return original Tool data
   *
   * @returns {BlockToolData}
   */
  save() {
    return this.savedData;
  }
  /**
   * Create Tool html markup
   *
   * @returns {HTMLElement}
   */
  make() {
    const e = c.make("div", this.CSS.wrapper), t = Uo, o = c.make("div", this.CSS.info), i = c.make("div", this.CSS.title, {
      textContent: this.title
    }), n = c.make("div", this.CSS.subtitle, {
      textContent: this.subtitle
    });
    return e.innerHTML = t, o.appendChild(i), o.appendChild(n), e.appendChild(o), e;
  }
}
St.isReadOnlySupported = !0;
class hi extends Ye {
  constructor() {
    super(...arguments), this.type = Be.Inline;
  }
  /**
   * Returns title for Inline Tool if specified by user
   */
  get title() {
    return this.constructable[We.Title];
  }
  /**
   * Constructs new InlineTool instance from constructable
   */
  create() {
    return new this.constructable({
      api: this.api.getMethodsForTool(this),
      config: this.settings
    });
  }
}
class ui extends Ye {
  constructor() {
    super(...arguments), this.type = Be.Tune;
  }
  /**
   * Constructs new BlockTune instance from constructable
   *
   * @param data - Tune data
   * @param block - Block API object
   */
  create(e, t) {
    return new this.constructable({
      api: this.api.getMethodsForTool(this),
      config: this.settings,
      block: t,
      data: e
    });
  }
}
class P extends Map {
  /**
   * Returns Block Tools collection
   */
  get blockTools() {
    const e = Array.from(this.entries()).filter(([, t]) => t.isBlock());
    return new P(e);
  }
  /**
   * Returns Inline Tools collection
   */
  get inlineTools() {
    const e = Array.from(this.entries()).filter(([, t]) => t.isInline());
    return new P(e);
  }
  /**
   * Returns Block Tunes collection
   */
  get blockTunes() {
    const e = Array.from(this.entries()).filter(([, t]) => t.isTune());
    return new P(e);
  }
  /**
   * Returns internal Tools collection
   */
  get internalTools() {
    const e = Array.from(this.entries()).filter(([, t]) => t.isInternal);
    return new P(e);
  }
  /**
   * Returns Tools collection provided by user
   */
  get externalTools() {
    const e = Array.from(this.entries()).filter(([, t]) => !t.isInternal);
    return new P(e);
  }
}
var pi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, It = (s, e, t, o) => {
  for (var i = o > 1 ? void 0 : o ? fi(e, t) : e, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (i = (o ? r(e, t, i) : r(i)) || i);
  return o && i && pi(e, t, i), i;
};
class Ze extends Ye {
  constructor() {
    super(...arguments), this.type = Be.Block, this.inlineTools = new P(), this.tunes = new P();
  }
  /**
   * Creates new Tool instance
   *
   * @param data - Tool data
   * @param block - BlockAPI for current Block
   * @param readOnly - True if Editor is in read-only mode
   */
  create(e, t, o) {
    return new this.constructable({
      data: e,
      block: t,
      readOnly: o,
      api: this.api.getMethodsForTool(this),
      config: this.settings
    });
  }
  /**
   * Returns true if read-only mode is supported by Tool
   */
  get isReadOnlySupported() {
    return this.constructable[se.IsReadOnlySupported] === !0;
  }
  /**
   * Returns true if Tool supports linebreaks
   */
  get isLineBreaksEnabled() {
    return this.constructable[se.IsEnabledLineBreaks];
  }
  /**
   * Returns Tool toolbox configuration (internal or user-specified).
   *
   * Merges internal and user-defined toolbox configs based on the following rules:
   *
   * - If both internal and user-defined toolbox configs are arrays their items are merged.
   * Length of the second one is kept.
   *
   * - If both are objects their properties are merged.
   *
   * - If one is an object and another is an array than internal config is replaced with user-defined
   * config. This is made to allow user to override default tool's toolbox representation (single/multiple entries)
   */
  get toolbox() {
    const e = this.constructable[se.Toolbox], t = this.config[ve.Toolbox];
    if (!W(e) && t !== !1)
      return t ? Array.isArray(e) ? Array.isArray(t) ? t.map((o, i) => {
        const n = e[i];
        return n ? {
          ...n,
          ...o
        } : o;
      }) : [t] : Array.isArray(t) ? t : [
        {
          ...e,
          ...t
        }
      ] : Array.isArray(e) ? e : [e];
  }
  /**
   * Returns Tool conversion configuration
   */
  get conversionConfig() {
    return this.constructable[se.ConversionConfig];
  }
  /**
   * Returns enabled inline tools for Tool
   */
  get enabledInlineTools() {
    return this.config[ve.EnabledInlineTools] || !1;
  }
  /**
   * Returns enabled tunes for Tool
   */
  get enabledBlockTunes() {
    return this.config[ve.EnabledBlockTunes];
  }
  /**
   * Returns Tool paste configuration
   */
  get pasteConfig() {
    return this.constructable[se.PasteConfig] ?? {};
  }
  get sanitizeConfig() {
    const e = super.sanitizeConfig, t = this.baseSanitizeConfig;
    if (W(e))
      return t;
    const o = {};
    for (const i in e)
      if (Object.prototype.hasOwnProperty.call(e, i)) {
        const n = e[i];
        D(n) ? o[i] = Object.assign({}, t, n) : o[i] = n;
      }
    return o;
  }
  get baseSanitizeConfig() {
    const e = {};
    return Array.from(this.inlineTools.values()).forEach((t) => Object.assign(e, t.sanitizeConfig)), Array.from(this.tunes.values()).forEach((t) => Object.assign(e, t.sanitizeConfig)), e;
  }
}
It([
  le
], Ze.prototype, "sanitizeConfig", 1);
It([
  le
], Ze.prototype, "baseSanitizeConfig", 1);
class gi {
  /**
   * @class
   * @param config - tools config
   * @param editorConfig - EditorJS config
   * @param api - EditorJS API module
   */
  constructor(e, t, o) {
    this.api = o, this.config = e, this.editorConfig = t;
  }
  /**
   * Returns Tool object based on it's type
   *
   * @param name - tool name
   */
  get(e) {
    const { class: t, isInternal: o = !1, ...i } = this.config[e], n = this.getConstructor(t);
    return new n({
      name: e,
      constructable: t,
      config: i,
      api: this.api,
      isDefault: e === this.editorConfig.defaultBlock,
      defaultPlaceholder: this.editorConfig.placeholder,
      isInternal: o
    });
  }
  /**
   * Find appropriate Tool object constructor for Tool constructable
   *
   * @param constructable - Tools constructable
   */
  getConstructor(e) {
    switch (!0) {
      case e[We.IsInline]:
        return hi;
      case e[Bt.IsTune]:
        return ui;
      default:
        return Ze;
    }
  }
}
class Mt {
  /**
   * MoveDownTune constructor
   *
   * @param {API} api — Editor's API
   */
  constructor({ api: e }) {
    this.CSS = {
      animation: "wobble"
    }, this.api = e;
  }
  /**
   * Tune's appearance in block settings menu
   */
  render() {
    return {
      icon: kt,
      title: this.api.i18n.t("Move down"),
      onActivate: () => this.handleClick(),
      name: "move-down"
    };
  }
  /**
   * Handle clicks on 'move down' button
   */
  handleClick() {
    const e = this.api.blocks.getCurrentBlockIndex(), t = this.api.blocks.getBlockByIndex(e + 1);
    if (!t)
      throw new Error("Unable to move Block down since it is already the last");
    const o = t.holder, i = o.getBoundingClientRect();
    let n = Math.abs(window.innerHeight - o.offsetHeight);
    i.top < window.innerHeight && (n = window.scrollY + o.offsetHeight), window.scrollTo(0, n), this.api.blocks.move(e + 1), this.api.toolbar.toggleBlockSettings(!0);
  }
}
Mt.isTune = !0;
class Lt {
  /**
   * DeleteTune constructor
   *
   * @param {API} api - Editor's API
   */
  constructor({ api: e }) {
    this.api = e;
  }
  /**
   * Tune's appearance in block settings menu
   */
  render() {
    return {
      icon: No,
      title: this.api.i18n.t("Delete"),
      name: "delete",
      confirmation: {
        title: this.api.i18n.t("Click to delete"),
        onActivate: () => this.handleClick()
      }
    };
  }
  /**
   * Delete block conditions passed
   */
  handleClick() {
    this.api.blocks.delete();
  }
}
Lt.isTune = !0;
class At {
  /**
   * MoveUpTune constructor
   *
   * @param {API} api - Editor's API
   */
  constructor({ api: e }) {
    this.CSS = {
      animation: "wobble"
    }, this.api = e;
  }
  /**
   * Tune's appearance in block settings menu
   */
  render() {
    return {
      icon: Oo,
      title: this.api.i18n.t("Move up"),
      onActivate: () => this.handleClick(),
      name: "move-up"
    };
  }
  /**
   * Move current block up
   */
  handleClick() {
    const e = this.api.blocks.getCurrentBlockIndex(), t = this.api.blocks.getBlockByIndex(e), o = this.api.blocks.getBlockByIndex(e - 1);
    if (e === 0 || !t || !o)
      throw new Error("Unable to move Block up since it is already the first");
    const i = t.holder, n = o.holder, r = i.getBoundingClientRect(), a = n.getBoundingClientRect();
    let l;
    a.top > 0 ? l = Math.abs(r.top) - Math.abs(a.top) : l = Math.abs(r.top) + a.height, window.scrollBy(0, -1 * l), this.api.blocks.move(e - 1), this.api.toolbar.toggleBlockSettings(!0);
  }
}
At.isTune = !0;
var bi = Object.defineProperty, mi = Object.getOwnPropertyDescriptor, ki = (s, e, t, o) => {
  for (var i = o > 1 ? void 0 : o ? mi(e, t) : e, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (i = (o ? r(e, t, i) : r(i)) || i);
  return o && i && bi(e, t, i), i;
};
class _t extends y {
  constructor() {
    super(...arguments), this.stubTool = "stub", this.toolsAvailable = new P(), this.toolsUnavailable = new P();
  }
  /**
   * Returns available Tools
   */
  get available() {
    return this.toolsAvailable;
  }
  /**
   * Returns unavailable Tools
   */
  get unavailable() {
    return this.toolsUnavailable;
  }
  /**
   * Return Tools for the Inline Toolbar
   */
  get inlineTools() {
    return this.available.inlineTools;
  }
  /**
   * Return editor block tools
   */
  get blockTools() {
    return this.available.blockTools;
  }
  /**
   * Return available Block Tunes
   *
   * @returns {object} - object of Inline Tool's classes
   */
  get blockTunes() {
    return this.available.blockTunes;
  }
  /**
   * Returns default Tool object
   */
  get defaultTool() {
    return this.blockTools.get(this.config.defaultBlock);
  }
  /**
   * Returns internal tools
   */
  get internal() {
    return this.available.internalTools;
  }
  /**
   * Creates instances via passed or default configuration
   *
   * @returns {Promise<void>}
   */
  async prepare() {
    if (this.validateTools(), this.config.tools = Me({}, this.internalTools, this.config.tools), !Object.prototype.hasOwnProperty.call(this.config, "tools") || Object.keys(this.config.tools).length === 0)
      throw Error("Can't start without tools");
    const e = this.prepareConfig();
    this.factory = new gi(e, this.config, this.Editor.API);
    const t = this.getListOfPrepareFunctions(e);
    if (t.length === 0)
      return Promise.resolve();
    await zt(t, (o) => {
      this.toolPrepareMethodSuccess(o);
    }, (o) => {
      this.toolPrepareMethodFallback(o);
    }), this.prepareBlockTools();
  }
  getAllInlineToolsSanitizeConfig() {
    const e = {};
    return Array.from(this.inlineTools.values()).forEach((t) => {
      Object.assign(e, t.sanitizeConfig);
    }), e;
  }
  /**
   * Calls each Tool reset method to clean up anything set by Tool
   */
  destroy() {
    Object.values(this.available).forEach(async (e) => {
      M(e.reset) && await e.reset();
    });
  }
  /**
   * Returns internal tools
   * Includes Bold, Italic, Link and Paragraph
   */
  get internalTools() {
    return {
      bold: {
        class: Xe,
        isInternal: !0
      },
      italic: {
        class: Ve,
        isInternal: !0
      },
      link: {
        class: qe,
        isInternal: !0
      },
      paragraph: {
        class: Ke,
        inlineToolbar: !0,
        isInternal: !0
      },
      stub: {
        class: St,
        isInternal: !0
      },
      moveUp: {
        class: At,
        isInternal: !0
      },
      delete: {
        class: Lt,
        isInternal: !0
      },
      moveDown: {
        class: Mt,
        isInternal: !0
      }
    };
  }
  /**
   * Tool prepare method success callback
   *
   * @param {object} data - append tool to available list
   */
  toolPrepareMethodSuccess(e) {
    const t = this.factory.get(e.toolName);
    if (t.isInline()) {
      const i = ["render", "surround", "checkState"].filter((n) => !t.create()[n]);
      if (i.length) {
        T(
          `Incorrect Inline Tool: ${t.name}. Some of required methods is not implemented %o`,
          "warn",
          i
        ), this.toolsUnavailable.set(t.name, t);
        return;
      }
    }
    this.toolsAvailable.set(t.name, t);
  }
  /**
   * Tool prepare method fail callback
   *
   * @param {object} data - append tool to unavailable list
   */
  toolPrepareMethodFallback(e) {
    this.toolsUnavailable.set(e.toolName, this.factory.get(e.toolName));
  }
  /**
   * Binds prepare function of plugins with user or default config
   *
   * @returns {Array} list of functions that needs to be fired sequentially
   * @param config - tools config
   */
  getListOfPrepareFunctions(e) {
    const t = [];
    return Object.entries(e).forEach(([o, i]) => {
      t.push({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        function: M(i.class.prepare) ? i.class.prepare : () => {
        },
        data: {
          toolName: o,
          config: i.config
        }
      });
    }), t;
  }
  /**
   * Assign enabled Inline Tools and Block Tunes for Block Tool
   */
  prepareBlockTools() {
    Array.from(this.blockTools.values()).forEach((e) => {
      this.assignInlineToolsToBlockTool(e), this.assignBlockTunesToBlockTool(e);
    });
  }
  /**
   * Assign enabled Inline Tools for Block Tool
   *
   * @param tool - Block Tool
   */
  assignInlineToolsToBlockTool(e) {
    if (this.config.inlineToolbar !== !1) {
      if (e.enabledInlineTools === !0) {
        e.inlineTools = new P(
          Array.isArray(this.config.inlineToolbar) ? this.config.inlineToolbar.map((t) => [t, this.inlineTools.get(t)]) : Array.from(this.inlineTools.entries())
        );
        return;
      }
      Array.isArray(e.enabledInlineTools) && (e.inlineTools = new P(
        e.enabledInlineTools.map((t) => [t, this.inlineTools.get(t)])
      ));
    }
  }
  /**
   * Assign enabled Block Tunes for Block Tool
   *
   * @param tool — Block Tool
   */
  assignBlockTunesToBlockTool(e) {
    if (e.enabledBlockTunes !== !1) {
      if (Array.isArray(e.enabledBlockTunes)) {
        const t = new P(
          e.enabledBlockTunes.map((o) => [o, this.blockTunes.get(o)])
        );
        e.tunes = new P([...t, ...this.blockTunes.internalTools]);
        return;
      }
      if (Array.isArray(this.config.tunes)) {
        const t = new P(
          this.config.tunes.map((o) => [o, this.blockTunes.get(o)])
        );
        e.tunes = new P([...t, ...this.blockTunes.internalTools]);
        return;
      }
      e.tunes = this.blockTunes.internalTools;
    }
  }
  /**
   * Validate Tools configuration objects and throw Error for user if it is invalid
   */
  validateTools() {
    for (const e in this.config.tools)
      if (Object.prototype.hasOwnProperty.call(this.config.tools, e)) {
        if (e in this.internalTools)
          return;
        const t = this.config.tools[e];
        if (!M(t) && !M(t.class))
          throw Error(
            `Tool «${e}» must be a constructor function or an object with function in the «class» property`
          );
      }
  }
  /**
   * Unify tools config
   */
  prepareConfig() {
    const e = {};
    for (const t in this.config.tools)
      D(this.config.tools[t]) ? e[t] = this.config.tools[t] : e[t] = { class: this.config.tools[t] };
    return e;
  }
}
ki([
  le
], _t.prototype, "getAllInlineToolsSanitizeConfig", 1);
const vi = `:root{--selectionColor: #e1f2ff;--inlineSelectionColor: #d4ecff;--bg-light: #eff2f5;--grayText: #707684;--color-dark: #1D202B;--color-active-icon: #388AE5;--color-gray-border: rgba(201, 201, 204, .48);--content-width: 650px;--narrow-mode-right-padding: 50px;--toolbox-buttons-size: 26px;--toolbox-buttons-size--mobile: 36px;--icon-size: 20px;--icon-size--mobile: 28px;--block-padding-vertical: .4em;--color-line-gray: #EFF0F1 }.codex-editor{position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:1}.codex-editor .hide{display:none}.codex-editor__redactor [contenteditable]:empty:after{content:"\\feff"}@media (min-width: 651px){.codex-editor--narrow .codex-editor__redactor{margin-right:50px}}@media (min-width: 651px){.codex-editor--narrow.codex-editor--rtl .codex-editor__redactor{margin-left:50px;margin-right:0}}@media (min-width: 651px){.codex-editor--narrow .ce-toolbar__actions{right:-5px}}.codex-editor-copyable{position:absolute;height:1px;width:1px;top:-400%;opacity:.001}.codex-editor-overlay{position:fixed;top:0px;left:0px;right:0px;bottom:0px;z-index:999;pointer-events:none;overflow:hidden}.codex-editor-overlay__container{position:relative;pointer-events:auto;z-index:0}.codex-editor-overlay__rectangle{position:absolute;pointer-events:none;background-color:#2eaadc33;border:1px solid transparent}.codex-editor svg{max-height:100%}.codex-editor path{stroke:currentColor}.codex-editor ::-moz-selection{background-color:#d4ecff}.codex-editor ::selection{background-color:#d4ecff}.codex-editor--toolbox-opened [contentEditable=true][data-placeholder]:focus:before{opacity:0!important}.ce-scroll-locked{overflow:hidden}.ce-scroll-locked--hard{overflow:hidden;top:calc(-1 * var(--window-scroll-offset));position:fixed;width:100%}.ce-toolbar{position:absolute;left:0;right:0;top:0;-webkit-transition:opacity .1s ease;transition:opacity .1s ease;will-change:opacity,top;display:none}.ce-toolbar--opened{display:block}.ce-toolbar__content{max-width:650px;margin:0 auto;position:relative}.ce-toolbar__plus{color:#1d202b;cursor:pointer;width:26px;height:26px;border-radius:7px;display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-ms-flex-negative:0;flex-shrink:0}@media (max-width: 650px){.ce-toolbar__plus{width:36px;height:36px}}@media (hover: hover){.ce-toolbar__plus:hover{background-color:#eff2f5}}.ce-toolbar__plus--active{background-color:#eff2f5;-webkit-animation:bounceIn .75s 1;animation:bounceIn .75s 1;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.ce-toolbar__plus-shortcut{opacity:.6;word-spacing:-2px;margin-top:5px}@media (max-width: 650px){.ce-toolbar__plus{position:absolute;background-color:#fff;border:1px solid #E8E8EB;-webkit-box-shadow:0 3px 15px -3px rgba(13,20,33,.13);box-shadow:0 3px 15px -3px #0d142121;border-radius:6px;z-index:2;position:static}.ce-toolbar__plus--left-oriented:before{left:15px;margin-left:0}.ce-toolbar__plus--right-oriented:before{left:auto;right:15px;margin-left:0}}.ce-toolbar__actions{position:absolute;right:100%;opacity:0;display:-webkit-box;display:-ms-flexbox;display:flex;padding-right:5px}.ce-toolbar__actions--opened{opacity:1}@media (max-width: 650px){.ce-toolbar__actions{right:auto}}.ce-toolbar__settings-btn{color:#1d202b;width:26px;height:26px;border-radius:7px;display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;margin-left:3px;cursor:pointer;user-select:none}@media (max-width: 650px){.ce-toolbar__settings-btn{width:36px;height:36px}}@media (hover: hover){.ce-toolbar__settings-btn:hover{background-color:#eff2f5}}.ce-toolbar__settings-btn--active{background-color:#eff2f5;-webkit-animation:bounceIn .75s 1;animation:bounceIn .75s 1;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@media (min-width: 651px){.ce-toolbar__settings-btn{width:24px}}.ce-toolbar__settings-btn--hidden{display:none}@media (max-width: 650px){.ce-toolbar__settings-btn{position:absolute;background-color:#fff;border:1px solid #E8E8EB;-webkit-box-shadow:0 3px 15px -3px rgba(13,20,33,.13);box-shadow:0 3px 15px -3px #0d142121;border-radius:6px;z-index:2;position:static}.ce-toolbar__settings-btn--left-oriented:before{left:15px;margin-left:0}.ce-toolbar__settings-btn--right-oriented:before{left:auto;right:15px;margin-left:0}}.ce-toolbar__plus svg,.ce-toolbar__settings-btn svg{width:24px;height:24px}@media (min-width: 651px){.codex-editor--narrow .ce-toolbar__plus{left:5px}}@media (min-width: 651px){.codex-editor--narrow .ce-toolbox .ce-popover{right:0;left:auto;left:initial}}.ce-inline-toolbar{--y-offset: 8px;position:absolute;background-color:#fff;border:1px solid #E8E8EB;-webkit-box-shadow:0 3px 15px -3px rgba(13,20,33,.13);box-shadow:0 3px 15px -3px #0d142121;border-radius:6px;z-index:2;opacity:0;visibility:hidden;-webkit-transition:opacity .25s ease;transition:opacity .25s ease;will-change:opacity,left,top;top:0;left:0;z-index:3}.ce-inline-toolbar--left-oriented:before{left:15px;margin-left:0}.ce-inline-toolbar--right-oriented:before{left:auto;right:15px;margin-left:0}.ce-inline-toolbar--showed{opacity:1;visibility:visible}.ce-inline-toolbar [hidden]{display:none!important}.ce-inline-toolbar__toggler-and-button-wrapper{display:-webkit-box;display:-ms-flexbox;display:flex;width:100%;padding:0 6px}.ce-inline-toolbar__buttons{display:-webkit-box;display:-ms-flexbox;display:flex}.ce-inline-toolbar__dropdown{display:-webkit-box;display:-ms-flexbox;display:flex;padding:6px;margin:0 6px 0 -6px;-webkit-box-align:center;-ms-flex-align:center;align-items:center;cursor:pointer;border-right:1px solid rgba(201,201,204,.48);-webkit-box-sizing:border-box;box-sizing:border-box}@media (hover: hover){.ce-inline-toolbar__dropdown:hover{background:#eff2f5}}.ce-inline-toolbar__dropdown--hidden{display:none}.ce-inline-toolbar__dropdown-content,.ce-inline-toolbar__dropdown-arrow{display:-webkit-box;display:-ms-flexbox;display:flex}.ce-inline-toolbar__dropdown-content svg,.ce-inline-toolbar__dropdown-arrow svg{width:20px;height:20px}.ce-inline-toolbar__shortcut{opacity:.6;word-spacing:-3px;margin-top:3px}.ce-inline-tool{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:6px 1px;cursor:pointer;border:0;outline:none;background-color:transparent;vertical-align:bottom;color:inherit;margin:0;border-radius:0;line-height:normal}.ce-inline-tool svg{width:20px;height:20px}@media (max-width: 650px){.ce-inline-tool svg{width:28px;height:28px}}@media (hover: hover){.ce-inline-tool:hover{background-color:#eff2f5}}.ce-inline-tool--active{color:#388ae5}.ce-inline-tool--focused{background:rgba(34,186,255,.08)!important}.ce-inline-tool--focused{-webkit-box-shadow:inset 0 0 0px 1px rgba(7,161,227,.08);box-shadow:inset 0 0 0 1px #07a1e314}.ce-inline-tool--focused-animated{-webkit-animation-name:buttonClicked;animation-name:buttonClicked;-webkit-animation-duration:.25s;animation-duration:.25s}.ce-inline-tool--link .icon--unlink,.ce-inline-tool--unlink .icon--link{display:none}.ce-inline-tool--unlink .icon--unlink{display:inline-block;margin-bottom:-1px}.ce-inline-tool-input{outline:none;border:0;border-radius:0 0 4px 4px;margin:0;font-size:13px;padding:10px;width:100%;-webkit-box-sizing:border-box;box-sizing:border-box;display:none;font-weight:500;border-top:1px solid rgba(201,201,204,.48);-webkit-appearance:none;font-family:inherit}@media (max-width: 650px){.ce-inline-tool-input{font-size:15px;font-weight:500}}.ce-inline-tool-input::-webkit-input-placeholder{color:#707684}.ce-inline-tool-input::-moz-placeholder{color:#707684}.ce-inline-tool-input:-ms-input-placeholder{color:#707684}.ce-inline-tool-input::-ms-input-placeholder{color:#707684}.ce-inline-tool-input::placeholder{color:#707684}.ce-inline-tool-input--showed{display:block}.ce-conversion-toolbar{position:absolute;background-color:#fff;border:1px solid #E8E8EB;-webkit-box-shadow:0 3px 15px -3px rgba(13,20,33,.13);box-shadow:0 3px 15px -3px #0d142121;border-radius:6px;z-index:2;opacity:0;visibility:hidden;will-change:transform,opacity;-webkit-transition:opacity .1s ease,-webkit-transform .1s ease;transition:opacity .1s ease,-webkit-transform .1s ease;transition:transform .1s ease,opacity .1s ease;transition:transform .1s ease,opacity .1s ease,-webkit-transform .1s ease;-webkit-transform:translateY(-8px);transform:translateY(-8px);left:-1px;width:190px;margin-top:5px;-webkit-box-sizing:content-box;box-sizing:content-box}.ce-conversion-toolbar--left-oriented:before{left:15px;margin-left:0}.ce-conversion-toolbar--right-oriented:before{left:auto;right:15px;margin-left:0}.ce-conversion-toolbar--showed{opacity:1;visibility:visible;-webkit-transform:none;transform:none}.ce-conversion-toolbar [hidden]{display:none!important}.ce-conversion-toolbar__buttons{display:-webkit-box;display:-ms-flexbox;display:flex}.ce-conversion-toolbar__label{color:#707684;font-size:11px;font-weight:500;letter-spacing:.33px;padding:10px 10px 5px;text-transform:uppercase}.ce-conversion-tool{display:-webkit-box;display:-ms-flexbox;display:flex;padding:5px 10px;font-size:14px;line-height:20px;font-weight:500;cursor:pointer;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.ce-conversion-tool--hidden{display:none}.ce-conversion-tool--focused{background:rgba(34,186,255,.08)!important}.ce-conversion-tool--focused{-webkit-box-shadow:inset 0 0 0px 1px rgba(7,161,227,.08);box-shadow:inset 0 0 0 1px #07a1e314}.ce-conversion-tool--focused-animated{-webkit-animation-name:buttonClicked;animation-name:buttonClicked;-webkit-animation-duration:.25s;animation-duration:.25s}.ce-conversion-tool:hover{background:#eff2f5}.ce-conversion-tool__icon{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;width:26px;height:26px;-webkit-box-shadow:0 0 0 1px rgba(201,201,204,.48);box-shadow:0 0 0 1px #c9c9cc7a;border-radius:5px;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;background:#fff;-webkit-box-sizing:content-box;box-sizing:content-box;-ms-flex-negative:0;flex-shrink:0;margin-right:10px}.ce-conversion-tool__icon svg{width:20px;height:20px}@media (max-width: 650px){.ce-conversion-tool__icon{width:36px;height:36px;border-radius:8px}.ce-conversion-tool__icon svg{width:28px;height:28px}}.ce-conversion-tool--last{margin-right:0!important}.ce-conversion-tool--active{color:#388ae5!important}.ce-conversion-tool--active{-webkit-animation:bounceIn .75s 1;animation:bounceIn .75s 1;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.ce-conversion-tool__secondary-label{color:#707684;font-size:12px;margin-left:auto;white-space:nowrap;letter-spacing:-.1em;padding-right:5px;margin-bottom:-2px;opacity:.6}@media (max-width: 650px){.ce-conversion-tool__secondary-label{display:none}}.ce-settings__button{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:6px 1px;border-radius:3px;cursor:pointer;border:0;outline:none;background-color:transparent;vertical-align:bottom;color:inherit;margin:0;line-height:32px}.ce-settings__button svg{width:20px;height:20px}@media (max-width: 650px){.ce-settings__button svg{width:28px;height:28px}}@media (hover: hover){.ce-settings__button:hover{background-color:#eff2f5}}.ce-settings__button--active{color:#388ae5}.ce-settings__button--focused{background:rgba(34,186,255,.08)!important}.ce-settings__button--focused{-webkit-box-shadow:inset 0 0 0px 1px rgba(7,161,227,.08);box-shadow:inset 0 0 0 1px #07a1e314}.ce-settings__button--focused-animated{-webkit-animation-name:buttonClicked;animation-name:buttonClicked;-webkit-animation-duration:.25s;animation-duration:.25s}.ce-settings__button:not(:nth-child(3n+3)){margin-right:3px}.ce-settings__button:nth-child(n+4){margin-top:3px}.ce-settings__button--disabled{cursor:not-allowed!important}.ce-settings__button--disabled{opacity:.3}.ce-settings__button--selected{color:#388ae5}@media (min-width: 651px){.codex-editor--narrow .ce-settings .ce-popover{right:0;left:auto;left:initial}}@-webkit-keyframes fade-in{0%{opacity:0}to{opacity:1}}@keyframes fade-in{0%{opacity:0}to{opacity:1}}.ce-block{-webkit-animation:fade-in .3s ease;animation:fade-in .3s ease;-webkit-animation-fill-mode:none;animation-fill-mode:none;-webkit-animation-fill-mode:initial;animation-fill-mode:initial}.ce-block:first-of-type{margin-top:0}.ce-block--selected .ce-block__content{background:#e1f2ff}.ce-block--selected .ce-block__content [contenteditable]{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ce-block--selected .ce-block__content img,.ce-block--selected .ce-block__content .ce-stub{opacity:.55}.ce-block--stretched .ce-block__content{max-width:none}.ce-block__content{position:relative;max-width:650px;margin:0 auto;-webkit-transition:background-color .15s ease;transition:background-color .15s ease}.ce-block--drop-target .ce-block__content:before{content:"";position:absolute;top:100%;left:-20px;margin-top:-1px;height:8px;width:8px;border:solid #388AE5;border-width:1px 1px 0 0;-webkit-transform-origin:right;transform-origin:right;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.ce-block--drop-target .ce-block__content:after{content:"";position:absolute;top:100%;height:1px;width:100%;color:#388ae5;background:repeating-linear-gradient(90deg,#388AE5,#388AE5 1px,#fff 1px,#fff 6px)}.ce-block a{cursor:pointer;-webkit-text-decoration:underline;text-decoration:underline}.ce-block b{font-weight:700}.ce-block i{font-style:italic}@-webkit-keyframes bounceIn{0%,20%,40%,60%,80%,to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}20%{-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}60%{-webkit-transform:scale3d(1,1,1);transform:scaleZ(1)}}@keyframes bounceIn{0%,20%,40%,60%,80%,to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}20%{-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}60%{-webkit-transform:scale3d(1,1,1);transform:scaleZ(1)}}@-webkit-keyframes selectionBounce{0%,20%,40%,60%,80%,to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1)}50%{-webkit-transform:scale3d(1.01,1.01,1.01);transform:scale3d(1.01,1.01,1.01)}70%{-webkit-transform:scale3d(1,1,1);transform:scaleZ(1)}}@keyframes selectionBounce{0%,20%,40%,60%,80%,to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1)}50%{-webkit-transform:scale3d(1.01,1.01,1.01);transform:scale3d(1.01,1.01,1.01)}70%{-webkit-transform:scale3d(1,1,1);transform:scaleZ(1)}}@-webkit-keyframes buttonClicked{0%,20%,40%,60%,80%,to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{-webkit-transform:scale3d(.95,.95,.95);transform:scale3d(.95,.95,.95)}60%{-webkit-transform:scale3d(1.02,1.02,1.02);transform:scale3d(1.02,1.02,1.02)}80%{-webkit-transform:scale3d(1,1,1);transform:scaleZ(1)}}@keyframes buttonClicked{0%,20%,40%,60%,80%,to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{-webkit-transform:scale3d(.95,.95,.95);transform:scale3d(.95,.95,.95)}60%{-webkit-transform:scale3d(1.02,1.02,1.02);transform:scale3d(1.02,1.02,1.02)}80%{-webkit-transform:scale3d(1,1,1);transform:scaleZ(1)}}.cdx-block{padding:.4em 0}.cdx-block::-webkit-input-placeholder{line-height:normal!important}.cdx-input{border:1px solid rgba(201,201,204,.48);-webkit-box-shadow:inset 0 1px 2px 0 rgba(35,44,72,.06);box-shadow:inset 0 1px 2px #232c480f;border-radius:3px;padding:10px 12px;outline:none;width:100%;-webkit-box-sizing:border-box;box-sizing:border-box}.cdx-input[data-placeholder]:before{position:static!important}.cdx-input[data-placeholder]:before{display:inline-block;width:0;white-space:nowrap;pointer-events:none}.cdx-settings-button{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:6px 1px;border-radius:3px;cursor:pointer;border:0;outline:none;background-color:transparent;vertical-align:bottom;color:inherit;margin:0;min-width:26px;min-height:26px}.cdx-settings-button svg{width:20px;height:20px}@media (max-width: 650px){.cdx-settings-button svg{width:28px;height:28px}}@media (hover: hover){.cdx-settings-button:hover{background-color:#eff2f5}}.cdx-settings-button--focused{background:rgba(34,186,255,.08)!important}.cdx-settings-button--focused{-webkit-box-shadow:inset 0 0 0px 1px rgba(7,161,227,.08);box-shadow:inset 0 0 0 1px #07a1e314}.cdx-settings-button--focused-animated{-webkit-animation-name:buttonClicked;animation-name:buttonClicked;-webkit-animation-duration:.25s;animation-duration:.25s}.cdx-settings-button--active{color:#388ae5}.cdx-settings-button svg{width:auto;height:auto}@media (max-width: 650px){.cdx-settings-button{width:36px;height:36px;border-radius:8px}}.cdx-loader{position:relative;border:1px solid rgba(201,201,204,.48)}.cdx-loader:before{content:"";position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-11px 0 0 -11px;border:2px solid rgba(201,201,204,.48);border-left-color:#388ae5;border-radius:50%;-webkit-animation:cdxRotation 1.2s infinite linear;animation:cdxRotation 1.2s infinite linear}@-webkit-keyframes cdxRotation{0%{-webkit-transform:rotate(0deg);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes cdxRotation{0%{-webkit-transform:rotate(0deg);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.cdx-button{padding:13px;border-radius:3px;border:1px solid rgba(201,201,204,.48);font-size:14.9px;background:#fff;-webkit-box-shadow:0 2px 2px 0 rgba(18,30,57,.04);box-shadow:0 2px 2px #121e390a;color:#707684;text-align:center;cursor:pointer}@media (hover: hover){.cdx-button:hover{background:#FBFCFE;-webkit-box-shadow:0 1px 3px 0 rgba(18,30,57,.08);box-shadow:0 1px 3px #121e3914}}.cdx-button svg{height:20px;margin-right:.2em;margin-top:-2px}.ce-stub{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;padding:12px 18px;margin:10px 0;border-radius:10px;background:#eff2f5;border:1px solid #EFF0F1;color:#707684;font-size:14px}.ce-stub svg{width:20px;height:20px}.ce-stub__info{margin-left:14px}.ce-stub__title{font-weight:500;text-transform:capitalize}.codex-editor.codex-editor--rtl{direction:rtl}.codex-editor.codex-editor--rtl .cdx-list{padding-left:0;padding-right:40px}.codex-editor.codex-editor--rtl .ce-toolbar__plus{right:-26px;left:auto}.codex-editor.codex-editor--rtl .ce-toolbar__actions{right:auto;left:-26px}@media (max-width: 650px){.codex-editor.codex-editor--rtl .ce-toolbar__actions{margin-left:0;margin-right:auto;padding-right:0;padding-left:10px}}.codex-editor.codex-editor--rtl .ce-settings{left:5px;right:auto}.codex-editor.codex-editor--rtl .ce-settings:before{right:auto;left:25px}.codex-editor.codex-editor--rtl .ce-settings__button:not(:nth-child(3n+3)){margin-left:3px;margin-right:0}.codex-editor.codex-editor--rtl .ce-conversion-tool__icon{margin-right:0;margin-left:10px}.codex-editor.codex-editor--rtl .ce-inline-toolbar__dropdown{border-right:0px solid transparent;border-left:1px solid rgba(201,201,204,.48);margin:0 -6px 0 6px}.codex-editor.codex-editor--rtl .ce-inline-toolbar__dropdown .icon--toggler-down{margin-left:0;margin-right:4px}@media (min-width: 651px){.codex-editor--narrow.codex-editor--rtl .ce-toolbar__plus{left:0px;right:5px}}@media (min-width: 651px){.codex-editor--narrow.codex-editor--rtl .ce-toolbar__actions{left:-5px}}.cdx-search-field{--icon-margin-right: 10px;background:rgba(232,232,235,.49);border:1px solid rgba(226,226,229,.2);border-radius:6px;padding:2px;display:grid;grid-template-columns:auto auto 1fr;grid-template-rows:auto}.cdx-search-field__icon{width:26px;height:26px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;margin-right:var(--icon-margin-right)}.cdx-search-field__icon svg{width:20px;height:20px;color:#707684}.cdx-search-field__input{font-size:14px;outline:none;font-weight:500;font-family:inherit;border:0;background:transparent;margin:0;padding:0;line-height:22px;min-width:calc(100% - 26px - var(--icon-margin-right))}.cdx-search-field__input::-webkit-input-placeholder{color:#707684;font-weight:500}.cdx-search-field__input::-moz-placeholder{color:#707684;font-weight:500}.cdx-search-field__input:-ms-input-placeholder{color:#707684;font-weight:500}.cdx-search-field__input::-ms-input-placeholder{color:#707684;font-weight:500}.cdx-search-field__input::placeholder{color:#707684;font-weight:500}.ce-popover{--border-radius: 6px;--width: 200px;--max-height: 270px;--padding: 6px;--offset-from-target: 8px;--color-border: #e8e8eb;--color-shadow: rgba(13,20,33,.13);--color-background: white;--color-text-primary: black;--color-text-secondary: #707684;--color-border-icon: rgba(201, 201, 204, .48);--color-border-icon-disabled: #EFF0F1;--color-text-icon-active: #388AE5;--color-background-icon-active: rgba(56, 138, 229, .1);--color-background-item-focus: rgba(34, 186, 255, .08);--color-shadow-item-focus: rgba(7, 161, 227, .08);--color-background-item-hover: #eff2f5;--color-background-item-confirm: #E24A4A;--color-background-item-confirm-hover: #CE4343;min-width:var(--width);width:var(--width);max-height:var(--max-height);border-radius:var(--border-radius);overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 3px 15px -3px var(--color-shadow);box-shadow:0 3px 15px -3px var(--color-shadow);position:absolute;left:0;top:calc(100% + var(--offset-from-target));background:var(--color-background);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;z-index:4;opacity:0;max-height:0;pointer-events:none;padding:0;border:none}.ce-popover--opened{opacity:1;padding:var(--padding);max-height:var(--max-height);pointer-events:auto;-webkit-animation:panelShowing .1s ease;animation:panelShowing .1s ease;border:1px solid var(--color-border)}@media (max-width: 650px){.ce-popover--opened{-webkit-animation:panelShowingMobile .25s ease;animation:panelShowingMobile .25s ease}}.ce-popover__items{overflow-y:auto;-ms-scroll-chaining:none;overscroll-behavior:contain}@media (max-width: 650px){.ce-popover__overlay{position:fixed;top:0;bottom:0;left:0;right:0;background:#1D202B;z-index:3;opacity:.5;-webkit-transition:opacity .12s ease-in;transition:opacity .12s ease-in;will-change:opacity;visibility:visible}}.ce-popover__overlay--hidden{display:none}.ce-popover--open-top{top:calc(-1 * (var(--offset-from-target) + var(--popover-height)))}@media (max-width: 650px){.ce-popover{--offset: 5px;position:fixed;max-width:none;min-width:calc(100% - var(--offset) * 2);left:var(--offset);right:var(--offset);bottom:calc(var(--offset) + env(safe-area-inset-bottom));top:auto;border-radius:10px}.ce-popover .ce-popover__search{display:none}}.ce-popover__search,.ce-popover__custom-content:not(:empty){margin-bottom:5px}.ce-popover__nothing-found-message{color:#707684;display:none;cursor:default;padding:3px;font-size:14px;line-height:20px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ce-popover__nothing-found-message--displayed{display:block}.ce-popover__custom-content:not(:empty){padding:4px}@media (min-width: 651px){.ce-popover__custom-content:not(:empty){padding:0}}.ce-popover__custom-content--hidden{display:none}.ce-popover-item{--border-radius: 6px;--icon-size: 20px;--icon-size-mobile: 28px;border-radius:var(--border-radius);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;padding:3px;color:var(--color-text-primary);-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}@media (max-width: 650px){.ce-popover-item{padding:4px}}.ce-popover-item:not(:last-of-type){margin-bottom:1px}.ce-popover-item__icon{border-radius:5px;width:26px;height:26px;-webkit-box-shadow:0 0 0 1px var(--color-border-icon);box-shadow:0 0 0 1px var(--color-border-icon);background:#fff;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;margin-right:10px}.ce-popover-item__icon svg{width:20px;height:20px}@media (max-width: 650px){.ce-popover-item__icon{width:36px;height:36px;border-radius:8px}.ce-popover-item__icon svg{width:var(--icon-size-mobile);height:var(--icon-size-mobile)}}.ce-popover-item__title{font-size:14px;line-height:20px;font-weight:500;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}@media (max-width: 650px){.ce-popover-item__title{font-size:16px}}.ce-popover-item__secondary-title{color:var(--color-text-secondary);font-size:12px;margin-left:auto;white-space:nowrap;letter-spacing:-.1em;padding-right:5px;margin-bottom:-2px;opacity:.6}@media (max-width: 650px){.ce-popover-item__secondary-title{display:none}}.ce-popover-item--active{background:var(--color-background-icon-active);color:var(--color-text-icon-active)}.ce-popover-item--active .ce-popover-item__icon{-webkit-box-shadow:none;box-shadow:none}.ce-popover-item--disabled{color:var(--color-text-secondary);cursor:default;pointer-events:none}.ce-popover-item--disabled .ce-popover-item__icon{-webkit-box-shadow:0 0 0 1px var(--color-border-icon-disabled);box-shadow:0 0 0 1px var(--color-border-icon-disabled)}.ce-popover-item--focused:not(.ce-popover-item--no-focus){background:var(--color-background-item-focus)!important}.ce-popover-item--focused:not(.ce-popover-item--no-focus){-webkit-box-shadow:inset 0 0 0px 1px var(--color-shadow-item-focus);box-shadow:inset 0 0 0 1px var(--color-shadow-item-focus)}.ce-popover-item--hidden{display:none}@media (hover: hover){.ce-popover-item:hover{cursor:pointer}.ce-popover-item:hover:not(.ce-popover-item--no-hover){background-color:var(--color-background-item-hover)}.ce-popover-item:hover .ce-popover-item__icon{-webkit-box-shadow:none;box-shadow:none}}.ce-popover-item--confirmation{background:var(--color-background-item-confirm)}.ce-popover-item--confirmation .ce-popover-item__icon{color:var(--color-background-item-confirm)}.ce-popover-item--confirmation .ce-popover-item__title{color:#fff}@media (hover: hover){.ce-popover-item--confirmation:not(.ce-popover-item--no-hover):hover{background:var(--color-background-item-confirm-hover)}}.ce-popover-item--confirmation:not(.ce-popover-item--no-focus).ce-popover-item--focused{background:var(--color-background-item-confirm-hover)!important}.ce-popover-item--confirmation .ce-popover-item__icon,.ce-popover-item--active .ce-popover-item__icon,.ce-popover-item--focused .ce-popover-item__icon{-webkit-box-shadow:none;box-shadow:none}@-webkit-keyframes panelShowing{0%{opacity:0;-webkit-transform:translateY(-8px) scale(.9);transform:translateY(-8px) scale(.9)}70%{opacity:1;-webkit-transform:translateY(2px);transform:translateY(2px)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes panelShowing{0%{opacity:0;-webkit-transform:translateY(-8px) scale(.9);transform:translateY(-8px) scale(.9)}70%{opacity:1;-webkit-transform:translateY(2px);transform:translateY(2px)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes panelShowingMobile{0%{opacity:0;-webkit-transform:translateY(14px) scale(.98);transform:translateY(14px) scale(.98)}70%{opacity:1;-webkit-transform:translateY(-4px);transform:translateY(-4px)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes panelShowingMobile{0%{opacity:0;-webkit-transform:translateY(14px) scale(.98);transform:translateY(14px) scale(.98)}70%{opacity:1;-webkit-transform:translateY(-4px);transform:translateY(-4px)}to{-webkit-transform:translateY(0);transform:translateY(0)}}.wobble{-webkit-animation-name:wobble;animation-name:wobble;-webkit-animation-duration:.4s;animation-duration:.4s}@-webkit-keyframes wobble{0%{-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}15%{-webkit-transform:translate3d(-9%,0,0);transform:translate3d(-9%,0,0)}30%{-webkit-transform:translate3d(9%,0,0);transform:translate3d(9%,0,0)}45%{-webkit-transform:translate3d(-4%,0,0);transform:translate3d(-4%,0,0)}60%{-webkit-transform:translate3d(4%,0,0);transform:translate3d(4%,0,0)}75%{-webkit-transform:translate3d(-1%,0,0);transform:translate3d(-1%,0,0)}to{-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}}@keyframes wobble{0%{-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}15%{-webkit-transform:translate3d(-9%,0,0);transform:translate3d(-9%,0,0)}30%{-webkit-transform:translate3d(9%,0,0);transform:translate3d(9%,0,0)}45%{-webkit-transform:translate3d(-4%,0,0);transform:translate3d(-4%,0,0)}60%{-webkit-transform:translate3d(4%,0,0);transform:translate3d(4%,0,0)}75%{-webkit-transform:translate3d(-1%,0,0);transform:translate3d(-1%,0,0)}to{-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}}
`;
class xi extends y {
  constructor() {
    super(...arguments), this.isMobile = !1, this.contentRectCache = void 0, this.resizeDebouncer = et(() => {
      this.windowResize();
    }, 200);
  }
  /**
   * Editor.js UI CSS class names
   *
   * @returns {{editorWrapper: string, editorZone: string}}
   */
  get CSS() {
    return {
      editorWrapper: "codex-editor",
      editorWrapperNarrow: "codex-editor--narrow",
      editorZone: "codex-editor__redactor",
      editorZoneHidden: "codex-editor__redactor--hidden",
      editorEmpty: "codex-editor--empty",
      editorRtlFix: "codex-editor--rtl"
    };
  }
  /**
   * Return Width of center column of Editor
   *
   * @returns {DOMRect}
   */
  get contentRect() {
    if (this.contentRectCache)
      return this.contentRectCache;
    const e = this.nodes.wrapper.querySelector(`.${R.CSS.content}`);
    return e ? (this.contentRectCache = e.getBoundingClientRect(), this.contentRectCache) : {
      width: 650,
      left: 0,
      right: 0
    };
  }
  /**
   * Making main interface
   */
  async prepare() {
    this.checkIsMobile(), this.make(), this.loadStyles();
  }
  /**
   * Toggle read-only state
   *
   * If readOnly is true:
   *  - removes all listeners from main UI module elements
   *
   * if readOnly is false:
   *  - enables all listeners to UI module elements
   *
   * @param {boolean} readOnlyEnabled - "read only" state
   */
  toggleReadOnly(e) {
    e ? this.disableModuleBindings() : window.requestIdleCallback(() => {
      this.enableModuleBindings();
    }, {
      timeout: 2e3
    });
  }
  /**
   * Check if Editor is empty and set CSS class to wrapper
   */
  checkEmptiness() {
    const { BlockManager: e } = this.Editor;
    this.nodes.wrapper.classList.toggle(this.CSS.editorEmpty, e.isEditorEmpty);
  }
  /**
   * Check if one of Toolbar is opened
   * Used to prevent global keydowns (for example, Enter) conflicts with Enter-on-toolbar
   *
   * @returns {boolean}
   */
  get someToolbarOpened() {
    const { Toolbar: e, BlockSettings: t, InlineToolbar: o, ConversionToolbar: i } = this.Editor;
    return t.opened || o.opened || i.opened || e.toolbox.opened;
  }
  /**
   * Check for some Flipper-buttons is under focus
   */
  get someFlipperButtonFocused() {
    return this.Editor.Toolbar.toolbox.hasFocus() ? !0 : Object.entries(this.Editor).filter(([e, t]) => t.flipper instanceof q).some(([e, t]) => t.flipper.hasFocus());
  }
  /**
   * Clean editor`s UI
   */
  destroy() {
    this.nodes.holder.innerHTML = "";
  }
  /**
   * Close all Editor's toolbars
   */
  closeAllToolbars() {
    const { Toolbar: e, BlockSettings: t, InlineToolbar: o, ConversionToolbar: i } = this.Editor;
    t.close(), o.close(), i.close(), e.toolbox.close();
  }
  /**
   * Check for mobile mode and cache a result
   */
  checkIsMobile() {
    this.isMobile = window.innerWidth < dt;
  }
  /**
   * Makes Editor.js interface
   */
  make() {
    this.nodes.holder = c.getHolder(this.config.holder), this.nodes.wrapper = c.make("div", [
      this.CSS.editorWrapper,
      ...this.isRtl ? [this.CSS.editorRtlFix] : []
    ]), this.nodes.redactor = c.make("div", this.CSS.editorZone), this.nodes.holder.offsetWidth < this.contentRect.width && this.nodes.wrapper.classList.add(this.CSS.editorWrapperNarrow), this.nodes.redactor.style.paddingBottom = this.config.minHeight + "px", this.nodes.wrapper.appendChild(this.nodes.redactor), this.nodes.holder.appendChild(this.nodes.wrapper);
  }
  /**
   * Appends CSS
   */
  loadStyles() {
    const e = "editor-js-styles";
    if (c.get(e))
      return;
    const t = c.make("style", null, {
      id: e,
      textContent: vi.toString()
    });
    this.config.style && !W(this.config.style) && this.config.style.nonce && t.setAttribute("nonce", this.config.style.nonce), c.prepend(document.head, t);
  }
  /**
   * Bind events on the Editor.js interface
   */
  enableModuleBindings() {
    this.readOnlyMutableListeners.on(this.nodes.redactor, "click", (o) => {
      this.redactorClicked(o);
    }, !1), this.readOnlyMutableListeners.on(this.nodes.redactor, "mousedown", (o) => {
      this.documentTouched(o);
    }, {
      capture: !0,
      passive: !0
    }), this.readOnlyMutableListeners.on(this.nodes.redactor, "touchstart", (o) => {
      this.documentTouched(o);
    }, {
      capture: !0,
      passive: !0
    }), this.readOnlyMutableListeners.on(document, "keydown", (o) => {
      this.documentKeydown(o);
    }, !0), this.readOnlyMutableListeners.on(document, "mousedown", (o) => {
      this.documentClicked(o);
    }, !0);
    const t = et(() => {
      this.selectionChanged();
    }, 180);
    this.readOnlyMutableListeners.on(document, "selectionchange", t, !0), this.readOnlyMutableListeners.on(window, "resize", () => {
      this.resizeDebouncer();
    }, {
      passive: !0
    }), this.watchBlockHoveredEvents();
  }
  /**
   * Listen redactor mousemove to emit 'block-hovered' event
   */
  watchBlockHoveredEvents() {
    let e;
    this.readOnlyMutableListeners.on(this.nodes.redactor, "mousemove", Ie((t) => {
      const o = t.target.closest(".ce-block");
      this.Editor.BlockSelection.anyBlockSelected || o && e !== o && (e = o, this.eventsDispatcher.emit(yt, {
        block: this.Editor.BlockManager.getBlockByChildNode(o)
      }));
    }, 20), {
      passive: !0
    });
  }
  /**
   * Unbind events on the Editor.js interface
   */
  disableModuleBindings() {
    this.readOnlyMutableListeners.clearAll();
  }
  /**
   * Resize window handler
   */
  windowResize() {
    this.contentRectCache = null, this.checkIsMobile();
  }
  /**
   * All keydowns on document
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  documentKeydown(e) {
    switch (e.keyCode) {
      case k.ENTER:
        this.enterPressed(e);
        break;
      case k.BACKSPACE:
      case k.DELETE:
        this.backspacePressed(e);
        break;
      case k.ESC:
        this.escapePressed(e);
        break;
      default:
        this.defaultBehaviour(e);
        break;
    }
  }
  /**
   * Ignore all other document's keydown events
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  defaultBehaviour(e) {
    const { currentBlock: t } = this.Editor.BlockManager, o = e.target.closest(`.${this.CSS.editorWrapper}`), i = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
    if (t !== void 0 && o === null) {
      this.Editor.BlockEvents.keydown(e);
      return;
    }
    o || t && i || (this.Editor.BlockManager.dropPointer(), this.Editor.Toolbar.close());
  }
  /**
   * @param {KeyboardEvent} event - keyboard event
   */
  backspacePressed(e) {
    const { BlockManager: t, BlockSelection: o, Caret: i } = this.Editor;
    if (o.anyBlockSelected && !b.isSelectionExists) {
      const n = t.removeSelectedBlocks(), r = t.insertDefaultBlockAtIndex(n, !0);
      i.setToBlock(r, i.positions.START), o.clearSelection(e), e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation();
    }
  }
  /**
   * Escape pressed
   * If some of Toolbar components are opened, then close it otherwise close Toolbar
   *
   * @param {Event} event - escape keydown event
   */
  escapePressed(e) {
    this.Editor.BlockSelection.clearSelection(e), this.Editor.Toolbar.toolbox.opened ? (this.Editor.Toolbar.toolbox.close(), this.Editor.Caret.setToBlock(this.Editor.BlockManager.currentBlock, this.Editor.Caret.positions.END)) : this.Editor.BlockSettings.opened ? this.Editor.BlockSettings.close() : this.Editor.ConversionToolbar.opened ? this.Editor.ConversionToolbar.close() : this.Editor.InlineToolbar.opened ? this.Editor.InlineToolbar.close() : this.Editor.Toolbar.close();
  }
  /**
   * Enter pressed on document
   *
   * @param {KeyboardEvent} event - keyboard event
   */
  enterPressed(e) {
    const { BlockManager: t, BlockSelection: o } = this.Editor, i = t.currentBlockIndex >= 0;
    if (o.anyBlockSelected && !b.isSelectionExists) {
      o.clearSelection(e), e.preventDefault(), e.stopImmediatePropagation(), e.stopPropagation();
      return;
    }
    if (!this.someToolbarOpened && i && e.target.tagName === "BODY") {
      const n = this.Editor.BlockManager.insert();
      this.Editor.Caret.setToBlock(n), this.Editor.Toolbar.moveAndOpen(n);
    }
    this.Editor.BlockSelection.clearSelection(e);
  }
  /**
   * All clicks on document
   *
   * @param {MouseEvent} event - Click event
   */
  documentClicked(e) {
    var a, l;
    if (!e.isTrusted)
      return;
    const t = e.target;
    this.nodes.holder.contains(t) || b.isAtEditor || (this.Editor.BlockManager.dropPointer(), this.Editor.Toolbar.close());
    const i = (a = this.Editor.BlockSettings.nodes.wrapper) == null ? void 0 : a.contains(t), n = (l = this.Editor.Toolbar.nodes.settingsToggler) == null ? void 0 : l.contains(t), r = i || n;
    if (this.Editor.BlockSettings.opened && !r) {
      this.Editor.BlockSettings.close();
      const d = this.Editor.BlockManager.getBlockByChildNode(t);
      this.Editor.Toolbar.moveAndOpen(d);
    }
    this.Editor.BlockSelection.clearSelection(e);
  }
  /**
   * First touch on editor
   * Fired before click
   *
   * Used to change current block — we need to do it before 'selectionChange' event.
   * Also:
   * - Move and show the Toolbar
   * - Set a Caret
   *
   * @param {MouseEvent | TouchEvent} event - touch or mouse event
   */
  documentTouched(e) {
    let t = e.target;
    if (t === this.nodes.redactor) {
      const o = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX, i = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      t = document.elementFromPoint(o, i);
    }
    try {
      this.Editor.BlockManager.setCurrentBlockByChildNode(t);
    } catch {
      this.Editor.RectangleSelection.isRectActivated() || this.Editor.Caret.setToTheLastBlock();
    }
    this.Editor.Toolbar.moveAndOpen();
  }
  /**
   * All clicks on the redactor zone
   *
   * @param {MouseEvent} event - click event
   * @description
   * - By clicks on the Editor's bottom zone:
   *      - if last Block is empty, set a Caret to this
   *      - otherwise, add a new empty Block and set a Caret to that
   */
  redactorClicked(e) {
    if (!b.isCollapsed)
      return;
    const t = e.target, o = e.metaKey || e.ctrlKey;
    if (c.isAnchor(t) && o) {
      e.stopImmediatePropagation(), e.stopPropagation();
      const i = t.getAttribute("href"), n = Wt(i);
      Kt(n);
      return;
    }
    this.processBottomZoneClick(e);
  }
  /**
   * Check if user clicks on the Editor's bottom zone:
   *  - set caret to the last block
   *  - or add new empty block
   *
   * @param event - click event
   */
  processBottomZoneClick(e) {
    const t = this.Editor.BlockManager.getBlockByIndex(-1), o = c.offset(t.holder).bottom, i = e.pageY, { BlockSelection: n } = this.Editor;
    if (e.target instanceof Element && e.target.isEqualNode(this.nodes.redactor) && /**
    * If there is cross block selection started, target will be equal to redactor so we need additional check
    */
    !n.anyBlockSelected && /**
    * Prevent caret jumping (to last block) when clicking between blocks
    */
    o < i) {
      e.stopImmediatePropagation(), e.stopPropagation();
      const { BlockManager: a, Caret: l, Toolbar: d } = this.Editor;
      (!a.lastBlock.tool.isDefault || !a.lastBlock.isEmpty) && a.insertAtEnd(), l.setToTheLastBlock(), d.moveAndOpen(a.lastBlock);
    }
  }
  /**
   * Handle selection changes on mobile devices
   * Uses for showing the Inline Toolbar
   */
  selectionChanged() {
    const { CrossBlockSelection: e, BlockSelection: t } = this.Editor, o = b.anchorElement;
    if (e.isCrossBlockSelectionStarted && t.anyBlockSelected && b.get().removeAllRanges(), !o) {
      b.range || this.Editor.InlineToolbar.close();
      return;
    }
    const i = o.closest(`.${R.CSS.content}`) === null;
    if (i && (this.Editor.InlineToolbar.containsNode(o) || this.Editor.InlineToolbar.close(), !(o.dataset.inlineToolbar === "true")))
      return;
    this.Editor.BlockManager.currentBlock || this.Editor.BlockManager.setCurrentBlockByChildNode(o);
    const n = i !== !0;
    this.Editor.InlineToolbar.tryToShow(!0, n);
  }
}
const wi = {
  // API Modules
  BlocksAPI: oo,
  CaretAPI: io,
  EventsAPI: no,
  I18nAPI: He,
  API: so,
  InlineToolbarAPI: ro,
  ListenersAPI: ao,
  NotifierAPI: uo,
  ReadOnlyAPI: po,
  SanitizerAPI: xo,
  SaverAPI: wo,
  SelectionAPI: yo,
  StylesAPI: Eo,
  ToolbarAPI: Bo,
  TooltipAPI: Mo,
  UiAPI: Lo,
  // Toolbar Modules
  BlockSettings: Yo,
  ConversionToolbar: $,
  Toolbar: Go,
  InlineToolbar: Jo,
  // Modules
  BlockEvents: Qo,
  BlockManager: oi,
  BlockSelection: ii,
  Caret: we,
  CrossBlockSelection: ni,
  DragNDrop: si,
  ModificationsObserver: ri,
  Paste: Tt,
  ReadOnly: ai,
  RectangleSelection: fe,
  Renderer: li,
  Saver: ci,
  Tools: _t,
  UI: xi
};
class yi {
  /**
   * @param {EditorConfig} config - user configuration
   */
  constructor(e) {
    this.moduleInstances = {}, this.eventsDispatcher = new Ee();
    let t, o;
    this.isReady = new Promise((i, n) => {
      t = i, o = n;
    }), Promise.resolve().then(async () => {
      this.configuration = e, this.validate(), this.init(), await this.start(), await this.render();
      const { BlockManager: i, Caret: n, UI: r, ModificationsObserver: a } = this.moduleInstances;
      r.checkEmptiness(), a.enable(), this.configuration.autofocus && n.setToBlock(i.blocks[0], n.positions.START), t();
    }).catch((i) => {
      T(`Editor.js is not ready because of ${i}`, "error"), o(i);
    });
  }
  /**
   * Setting for configuration
   *
   * @param {EditorConfig|string} config - Editor's config to set
   */
  set configuration(e) {
    var o, i;
    D(e) ? this.config = {
      ...e
    } : this.config = {
      holder: e
    }, Le(!!this.config.holderId, "config.holderId", "config.holder"), this.config.holderId && !this.config.holder && (this.config.holder = this.config.holderId, this.config.holderId = null), this.config.holder == null && (this.config.holder = "editorjs"), this.config.logLevel || (this.config.logLevel = at.VERBOSE), Ft(this.config.logLevel), Le(!!this.config.initialBlock, "config.initialBlock", "config.defaultBlock"), this.config.defaultBlock = this.config.defaultBlock || this.config.initialBlock || "paragraph", this.config.minHeight = this.config.minHeight !== void 0 ? this.config.minHeight : 300;
    const t = {
      type: this.config.defaultBlock,
      data: {}
    };
    this.config.placeholder = this.config.placeholder || !1, this.config.sanitizer = this.config.sanitizer || {
      p: !0,
      b: !0,
      a: !0
    }, this.config.hideToolbar = this.config.hideToolbar ? this.config.hideToolbar : !1, this.config.tools = this.config.tools || {}, this.config.i18n = this.config.i18n || {}, this.config.data = this.config.data || { blocks: [] }, this.config.onReady = this.config.onReady || (() => {
    }), this.config.onChange = this.config.onChange || (() => {
    }), this.config.inlineToolbar = this.config.inlineToolbar !== void 0 ? this.config.inlineToolbar : !0, (W(this.config.data) || !this.config.data.blocks || this.config.data.blocks.length === 0) && (this.config.data = { blocks: [t] }), this.config.readOnly = this.config.readOnly || !1, (o = this.config.i18n) != null && o.messages && z.setDictionary(this.config.i18n.messages), this.config.i18n.direction = ((i = this.config.i18n) == null ? void 0 : i.direction) || "ltr";
  }
  /**
   * Returns private property
   *
   * @returns {EditorConfig}
   */
  get configuration() {
    return this.config;
  }
  /**
   * Checks for required fields in Editor's config
   */
  validate() {
    const { holderId: e, holder: t } = this.config;
    if (e && t)
      throw Error("«holderId» and «holder» param can't assign at the same time.");
    if (G(t) && !c.get(t))
      throw Error(`element with ID «${t}» is missing. Pass correct holder's ID.`);
    if (t && D(t) && !c.isElement(t))
      throw Error("«holder» value must be an Element node");
  }
  /**
   * Initializes modules:
   *  - make and save instances
   *  - configure
   */
  init() {
    this.constructModules(), this.configureModules();
  }
  /**
   * Start Editor!
   *
   * Get list of modules that needs to be prepared and return a sequence (Promise)
   *
   * @returns {Promise<void>}
   */
  async start() {
    await [
      "Tools",
      "UI",
      "BlockManager",
      "Paste",
      "BlockSelection",
      "RectangleSelection",
      "CrossBlockSelection",
      "ReadOnly"
    ].reduce(
      (t, o) => t.then(async () => {
        try {
          await this.moduleInstances[o].prepare();
        } catch (i) {
          if (i instanceof ut)
            throw new Error(i.message);
          T(`Module ${o} was skipped because of %o`, "warn", i);
        }
      }),
      Promise.resolve()
    );
  }
  /**
   * Render initial data
   */
  render() {
    return this.moduleInstances.Renderer.render(this.config.data.blocks);
  }
  /**
   * Make modules instances and save it to the @property this.moduleInstances
   */
  constructModules() {
    Object.entries(wi).forEach(([e, t]) => {
      try {
        this.moduleInstances[e] = new t({
          config: this.configuration,
          eventsDispatcher: this.eventsDispatcher
        });
      } catch (o) {
        T("[constructModules]", `Module ${e} skipped because`, "error", o);
      }
    });
  }
  /**
   * Modules instances configuration:
   *  - pass other modules to the 'state' property
   *  - ...
   */
  configureModules() {
    for (const e in this.moduleInstances)
      Object.prototype.hasOwnProperty.call(this.moduleInstances, e) && (this.moduleInstances[e].state = this.getModulesDiff(e));
  }
  /**
   * Return modules without passed name
   *
   * @param {string} name - module for witch modules difference should be calculated
   */
  getModulesDiff(e) {
    const t = {};
    for (const o in this.moduleInstances)
      o !== e && (t[o] = this.moduleInstances[o]);
    return t;
  }
}
/**
 * Editor.js
 *
 * @license Apache-2.0
 * @see Editor.js <https://editorjs.io>
 * @author CodeX Team <https://codex.so>
 */
class Ei {
  /** Editor version */
  static get version() {
    return "2.29.0";
  }
  /**
   * @param {EditorConfig|string|undefined} [configuration] - user configuration
   */
  constructor(e) {
    let t = () => {
    };
    D(e) && M(e.onReady) && (t = e.onReady);
    const o = new yi(e);
    this.isReady = o.isReady.then(() => {
      this.exportAPI(o), t();
    });
  }
  /**
   * Export external API methods
   *
   * @param {Core} editor — Editor's instance
   */
  exportAPI(e) {
    const t = ["configuration"], o = () => {
      Object.values(e.moduleInstances).forEach((n) => {
        M(n.destroy) && n.destroy(), n.listeners.removeAll();
      }), Io(), e = null;
      for (const n in this)
        Object.prototype.hasOwnProperty.call(this, n) && delete this[n];
      Object.setPrototypeOf(this, null);
    };
    t.forEach((n) => {
      this[n] = e[n];
    }), this.destroy = o, Object.setPrototypeOf(this, e.moduleInstances.API.methods), delete this.exportAPI, Object.entries({
      blocks: {
        clear: "clear",
        render: "render"
      },
      caret: {
        focus: "focus"
      },
      events: {
        on: "on",
        off: "off",
        emit: "emit"
      },
      saver: {
        save: "save"
      }
    }).forEach(([n, r]) => {
      Object.entries(r).forEach(([a, l]) => {
        this[l] = e.moduleInstances.API.methods[n][a];
      });
    });
  }
}



/***/ }),

/***/ "./node_modules/@editorjs/header/dist/header.mjs":
/*!*******************************************************!*\
  !*** ./node_modules/@editorjs/header/dist/header.mjs ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ c)
/* harmony export */ });
(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".ce-header{padding:.6em 0 3px;margin:0;line-height:1.25em;outline:none}.ce-header p,.ce-header div{padding:0!important;margin:0!important}.ce-header[contentEditable=true][data-placeholder]:before{position:absolute;content:attr(data-placeholder);color:#707684;font-weight:400;display:none;cursor:text}.ce-header[contentEditable=true][data-placeholder]:empty:before{display:block}.ce-header[contentEditable=true][data-placeholder]:empty:focus:before{display:none}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
const i = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 17V10.2135C19 10.1287 18.9011 10.0824 18.836 10.1367L16 12.5"/></svg>', a = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10 19 9.5 19 12C19 13.9771 16.0684 13.9997 16.0012 16.8981C15.9999 16.9533 16.0448 17 16.1 17L19.3 17"/></svg>', l = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10.5 16.8323 10 17.6 10C18.3677 10 19.5 10.311 19.5 11.5C19.5 12.5315 18.7474 12.9022 18.548 12.9823C18.5378 12.9864 18.5395 13.0047 18.5503 13.0063C18.8115 13.0456 20 13.3065 20 14.8C20 16 19.5 17 17.8 17C17.8 17 16 17 16 16.3"/></svg>', o = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18 10L15.2834 14.8511C15.246 14.9178 15.294 15 15.3704 15C16.8489 15 18.7561 15 20.2 15M19 17C19 15.7187 19 14.8813 19 13.6"/></svg>', h = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 15.9C16 15.9 16.3768 17 17.8 17C19.5 17 20 15.6199 20 14.7C20 12.7323 17.6745 12.0486 16.1635 12.9894C16.094 13.0327 16 12.9846 16 12.9027V10.1C16 10.0448 16.0448 10 16.1 10H19.8"/></svg>', d = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19.5 10C16.5 10.5 16 13.3285 16 15M16 15V15C16 16.1046 16.8954 17 18 17H18.3246C19.3251 17 20.3191 16.3492 20.2522 15.3509C20.0612 12.4958 16 12.6611 16 15Z"/></svg>', u = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 7L9 12M9 17V12M9 12L15 12M15 7V12M15 17L15 12"/></svg>';
/**
 * Header block for the Editor.js.
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license MIT
 * @version 2.0.0
 */
class c {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: HeaderData, config: HeaderConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read only mode flag
   */
  constructor({ data: e, config: t, api: s, readOnly: r }) {
    this.api = s, this.readOnly = r, this._CSS = {
      block: this.api.styles.block,
      wrapper: "ce-header"
    }, this._settings = t, this._data = this.normalizeData(e), this._element = this.getTag();
  }
  /**
   * Normalize input data
   *
   * @param {HeaderData} data - saved data to process
   *
   * @returns {HeaderData}
   * @private
   */
  normalizeData(e) {
    const t = {};
    return typeof e != "object" && (e = {}), t.text = e.text || "", t.level = parseInt(e.level) || this.defaultLevel.number, t;
  }
  /**
   * Return Tool's view
   *
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    return this._element;
  }
  /**
   * Returns header block tunes config
   *
   * @returns {Array}
   */
  renderSettings() {
    return this.levels.map((e) => ({
      icon: e.svg,
      label: this.api.i18n.t(`Heading ${e.number}`),
      onActivate: () => this.setLevel(e.number),
      closeOnActivate: !0,
      isActive: this.currentLevel.number === e.number
    }));
  }
  /**
   * Callback for Block's settings buttons
   *
   * @param {number} level - level to set
   */
  setLevel(e) {
    this.data = {
      level: e,
      text: this.data.text
    };
  }
  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param {HeaderData} data - saved data to merger with current block
   * @public
   */
  merge(e) {
    const t = {
      text: this.data.text + e.text,
      level: this.data.level
    };
    this.data = t;
  }
  /**
   * Validate Text block data:
   * - check for emptiness
   *
   * @param {HeaderData} blockData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(e) {
    return e.text.trim() !== "";
  }
  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLHeadingElement} toolsContent - Text tools rendered view
   * @returns {HeaderData} - saved data
   * @public
   */
  save(e) {
    return {
      text: e.innerHTML,
      level: this.currentLevel.number
    };
  }
  /**
   * Allow Header to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      export: "text",
      // use 'text' property for other blocks
      import: "text"
      // fill 'text' property from other block's export string
    };
  }
  /**
   * Sanitizer Rules
   */
  static get sanitize() {
    return {
      level: !1,
      text: {}
    };
  }
  /**
   * Returns true to notify core that read-only is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return !0;
  }
  /**
   * Get current Tools`s data
   *
   * @returns {HeaderData} Current data
   * @private
   */
  get data() {
    return this._data.text = this._element.innerHTML, this._data.level = this.currentLevel.number, this._data;
  }
  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {HeaderData} data — data to set
   * @private
   */
  set data(e) {
    if (this._data = this.normalizeData(e), e.level !== void 0 && this._element.parentNode) {
      const t = this.getTag();
      t.innerHTML = this._element.innerHTML, this._element.parentNode.replaceChild(t, this._element), this._element = t;
    }
    e.text !== void 0 && (this._element.innerHTML = this._data.text || "");
  }
  /**
   * Get tag for target level
   * By default returns second-leveled header
   *
   * @returns {HTMLElement}
   */
  getTag() {
    const e = document.createElement(this.currentLevel.tag);
    return e.innerHTML = this._data.text || "", e.classList.add(this._CSS.wrapper), e.contentEditable = this.readOnly ? "false" : "true", e.dataset.placeholder = this.api.i18n.t(this._settings.placeholder || ""), e;
  }
  /**
   * Get current level
   *
   * @returns {level}
   */
  get currentLevel() {
    let e = this.levels.find((t) => t.number === this._data.level);
    return e || (e = this.defaultLevel), e;
  }
  /**
   * Return default level
   *
   * @returns {level}
   */
  get defaultLevel() {
    if (this._settings.defaultLevel) {
      const e = this.levels.find((t) => t.number === this._settings.defaultLevel);
      if (e)
        return e;
      console.warn("(ง'̀-'́)ง Heading Tool: the default level specified was not found in available levels");
    }
    return this.levels[1];
  }
  /**
   * @typedef {object} level
   * @property {number} number - level number
   * @property {string} tag - tag corresponds with level number
   * @property {string} svg - icon
   */
  /**
   * Available header levels
   *
   * @returns {level[]}
   */
  get levels() {
    const e = [
      {
        number: 1,
        tag: "H1",
        svg: i
      },
      {
        number: 2,
        tag: "H2",
        svg: a
      },
      {
        number: 3,
        tag: "H3",
        svg: l
      },
      {
        number: 4,
        tag: "H4",
        svg: o
      },
      {
        number: 5,
        tag: "H5",
        svg: h
      },
      {
        number: 6,
        tag: "H6",
        svg: d
      }
    ];
    return this._settings.levels ? e.filter(
      (t) => this._settings.levels.includes(t.number)
    ) : e;
  }
  /**
   * Handle H1-H6 tags on paste to substitute it with header Tool
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(e) {
    const t = e.detail.data;
    let s = this.defaultLevel.number;
    switch (t.tagName) {
      case "H1":
        s = 1;
        break;
      case "H2":
        s = 2;
        break;
      case "H3":
        s = 3;
        break;
      case "H4":
        s = 4;
        break;
      case "H5":
        s = 5;
        break;
      case "H6":
        s = 6;
        break;
    }
    this._settings.levels && (s = this._settings.levels.reduce((r, n) => Math.abs(n - s) < Math.abs(r - s) ? n : r)), this.data = {
      level: s,
      text: t.innerHTML
    };
  }
  /**
   * Used by Editor.js paste handling API.
   * Provides configuration to handle H1-H6 tags.
   *
   * @returns {{handler: (function(HTMLElement): {text: string}), tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: ["H1", "H2", "H3", "H4", "H5", "H6"]
    };
  }
  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: u,
      title: "Heading"
    };
  }
}



/***/ }),

/***/ "./node_modules/@editorjs/paragraph/dist/paragraph.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/@editorjs/paragraph/dist/paragraph.mjs ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ a)
/* harmony export */ });
(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".ce-paragraph{line-height:1.6em;outline:none}.ce-paragraph[data-placeholder]:empty:before{content:attr(data-placeholder);color:#707684;font-weight:400;opacity:0}.codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty:before{opacity:1}.codex-editor--toolbox-opened .ce-block:first-child .ce-paragraph[data-placeholder]:empty:before,.codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty:focus:before{opacity:0}.ce-paragraph p:first-of-type{margin-top:0}.ce-paragraph p:last-of-type{margin-bottom:0}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
const s = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 9V7.2C8 7.08954 8.08954 7 8.2 7L12 7M16 9V7.2C16 7.08954 15.9105 7 15.8 7L12 7M12 7L12 17M12 17H10M12 17H14"/></svg>';
/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */
class a {
  /**
   * Default placeholder for Paragraph Tool
   *
   * @returns {string}
   * @class
   */
  static get DEFAULT_PLACEHOLDER() {
    return "";
  }
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {object} params - constructor params
   * @param {ParagraphData} params.data - previously saved data
   * @param {ParagraphConfig} params.config - user config for Tool
   * @param {object} params.api - editor.js api
   * @param {boolean} readOnly - read only mode flag
   */
  constructor({ data: t, config: e, api: i, readOnly: n }) {
    this.api = i, this.readOnly = n, this._CSS = {
      block: this.api.styles.block,
      wrapper: "ce-paragraph"
    }, this.readOnly || (this.onKeyUp = this.onKeyUp.bind(this)), this._placeholder = e.placeholder ? e.placeholder : a.DEFAULT_PLACEHOLDER, this._data = {}, this._element = null, this._preserveBlank = e.preserveBlank !== void 0 ? e.preserveBlank : !1, this.data = t;
  }
  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  onKeyUp(t) {
    if (t.code !== "Backspace" && t.code !== "Delete")
      return;
    const { textContent: e } = this._element;
    e === "" && (this._element.innerHTML = "");
  }
  /**
   * Create Tool's view
   *
   * @returns {HTMLElement}
   * @private
   */
  drawView() {
    const t = document.createElement("DIV");
    return t.classList.add(this._CSS.wrapper, this._CSS.block), t.contentEditable = !1, t.dataset.placeholder = this.api.i18n.t(this._placeholder), this._data.text && (t.innerHTML = this._data.text), this.readOnly || (t.contentEditable = !0, t.addEventListener("keyup", this.onKeyUp)), t;
  }
  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render() {
    return this._element = this.drawView(), this._element;
  }
  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param {ParagraphData} data
   * @public
   */
  merge(t) {
    const e = {
      text: this.data.text + t.text
    };
    this.data = e;
  }
  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param {ParagraphData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(t) {
    return !(t.text.trim() === "" && !this._preserveBlank);
  }
  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLDivElement} toolsContent - Paragraph tools rendered view
   * @returns {ParagraphData} - saved data
   * @public
   */
  save(t) {
    return {
      text: t.innerHTML
    };
  }
  /**
   * On paste callback fired from Editor.
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(t) {
    const e = {
      text: t.detail.data.innerHTML
    };
    this.data = e;
  }
  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   */
  static get conversionConfig() {
    return {
      export: "text",
      // to convert Paragraph to other block, use 'text' property of saved data
      import: "text"
      // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }
  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: !0
      }
    };
  }
  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return !0;
  }
  /**
   * Get current Tools`s data
   *
   * @returns {ParagraphData} Current data
   * @private
   */
  get data() {
    if (this._element !== null) {
      const t = this._element.innerHTML;
      this._data.text = t;
    }
    return this._data;
  }
  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {ParagraphData} data — data to set
   * @private
   */
  set data(t) {
    this._data = t || {}, this._element !== null && this.hydrate();
  }
  /**
   * Fill tool's view with data
   */
  hydrate() {
    window.requestAnimationFrame(() => {
      this._element.innerHTML = this._data.text || "";
    });
  }
  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   *
   * @returns {{tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: ["P"]
    };
  }
  /**
   * Icon and title for displaying at the Toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: s,
      title: "Text"
    };
  }
}



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************************!*\
  !*** ./src/frontend/ts/admin.ts ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editor */ "./src/frontend/ts/editor.ts");
/* harmony import */ var _htmx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./htmx */ "./src/frontend/ts/htmx.ts");


function main() {
    (0,_htmx__WEBPACK_IMPORTED_MODULE_1__.connect)();
    (0,_editor__WEBPACK_IMPORTED_MODULE_0__.createEditor)();
}
main();

})();

/******/ })()
;//# sourceMappingURL=/assets/js/admin.js.map
