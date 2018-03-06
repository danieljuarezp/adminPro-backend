var express = require('express');
var fs = require('fs');

var app = express();

app.get('/:collection/:img', (req, res, next) => {

    var collection = req.params.collection;
    var img = req.params.img;

    var path = `./Uploads/${collection}/${img}`;

    fs.exists(path, exist => {

        if (!exist) {
            path = './assets/no-img.jpg';
        }

        res.sendfile(path);
    });


});

module.exports = app;