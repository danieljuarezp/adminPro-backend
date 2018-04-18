var express = require('express');

var app = express();

const path = require('path');

const fs = require('fs');

app.get('/:collection/:img', (req, res, next) => {

    var collection = req.params.collection;
    var img = req.params.img;

    var pathImage = path.resolve(__dirname, `../Uploads/${collection}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }


});

module.exports = app;