htmx.defineExtension('json-enc', {
    onEvent: function (name, evt) {
        if (name === "htmx:configRequest") {
            evt.detail.headers['Content-Type'] = "application/json";

            let token = document.querySelector('#csrf_token');
            if (!!token) {
                evt.detail.headers["X-CSRFToken"] = token.value;
            }
        }
    },

    encodeParameters: function (xhr, parameters, elt) {
        xhr.overrideMimeType('text/json');
        return (JSON.stringify(parameters));
    }
});
