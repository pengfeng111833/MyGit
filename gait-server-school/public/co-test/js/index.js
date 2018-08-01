'use strict';

$(document).ready(function() {
    var req = new Request('/hello');
    req.getJSON(function(result) {
        console.log(result);
    });
    req.postJSON({
        content: 1
    }, function(result) {
        console.log(result);
    });
})
