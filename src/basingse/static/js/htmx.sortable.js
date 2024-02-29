htmx.onLoad(function (content) {
    var sortables = content.querySelectorAll(".sortable");
    for (var i = 0; i < sortables.length; i++) {
        var sortable = sortables[i];
        new Sortable(sortable, {
            animation: 150,
            ghostClass: 'blue-background-class'
        });
    }
})


htmx.onLoad(function (content) {
    var sortables = content.querySelectorAll(".nav-sortable-admin .navbar-nav");
    for (var i = 0; i < sortables.length; i++) {
        var sortable = sortables[i];
        new Sortable(sortable, {
            animation: 150,
            dragable: '.nav-item',
            ghostClass: 'blue-background-class'
        });
    }
})
