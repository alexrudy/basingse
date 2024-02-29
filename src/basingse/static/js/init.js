const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const datetimeItemList = document.querySelectorAll('.datetime')
const datetimeItemResults = [...datetimeItemList].map(datetimeEl => datetimeEl.textContent = Intl.DateTimeFormat(navigator.language, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' }).format(new Date(datetimeEl.textContent)))

function getAuthToken() {
    return document.querySelector("meta[name='csrf']").getAttribute("content");
}


// htmx.logAll();
document.body.addEventListener('htmx:configRequest', function (evt) {
    evt.detail.headers['X-CSRFToken'] = getAuthToken(); // add the CSRF token
});
