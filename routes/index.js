"use strict";
var express = require("express");
var router = express.Router();
var passport = require("passport");
var connection = require("../public/javascripts/db");
var workshop = require("../public/javascripts/workshop-scraper");
var lookup = require("../public/javascripts/single-item");
var top3 = require("../public/javascripts/latest");
var getImage = require("../public/javascripts/getImage");
var async = require('async');

/* GET home page. */
router.get("/", function (req, res) {
    top3.main().then((out) => {
        var items = [];
        var count = 0;
        async.map(out, function (each, next) {
            var item = each;
            //better way -- select the data you required to process so that you don't need the flag
            getImage.main(item.Link).then((data) => {
                var temp_img = /(imw=[0-9]+&imh=[0-9]+)/.exec(data);
                item.Img = data.replace(temp_img[0], 'imw=1920&imh=1080').replace('letterbox=true', 'letterbox=false');
                items.push(item);
                count++;
                if (count == 3) {
                    console.log(items);
                    res.render("index.html", {
                        title: "Mods & Maps",
                        req: req,
                        item: items
                    });
                }
            })
        })
    }).catch((e) => console.log(e));

});

router.get("/maps", function (req, res) {
    res.render("maps.html", {
        title: "Maps",
        req: req
    });
});

router.get("/add-mod", function (req, res) {
    res.render("mod_add.html", {
        title: "Add mod",
        req: req
    });
});

router.post("/add-mod", function (req, res) {
    connection.query(
        ` INSERT INTO mods(type, name, author, url, status) VALUES("${req.body.type}","${req.body.mod_name}", "${req.user._json.steamid}","${req.body.mod_link}", 0)`,
        function (err) {
            if (err) throw err;
            res.send(`The map is: ${req.body.mod_name}`);
        });
});


router.get("/pending-mods", function (req, res) {
    var totalEntries,
        pageSize,
        currentPage = 1,
        items = [],
        itemsArray = [],
        itemsList = [];

    if (typeof req.query.page !== "undefined") {
        currentPage = +req.query.page;
    }
    workshop.main(currentPage).then(out => {
        var table = out;

        //Pagination
        var pageCount = parseInt(parseInt(table[0].Total) / 30) + 1;
        totalEntries = table.totalItems;
        pageSize = table.length;
        for (let i = 0; i < table.length; i++) {
            items.push(table[i]);
        }
        while (items.length > 0) {
            itemsArray.push(items.splice(0, pageSize));
        }
        itemsList = itemsArray[0];

        //End of Pagination

        res.render("mod_pending.html", {
            title: "Pending mods",
            req: req,
            table: table,
            items: itemsList,
            pageSize: pageSize,
            totalEntries: totalEntries,
            pageCount: pageCount,
            currentPage: currentPage
        });

        //TODO: Add to DB & swap out steamid to author name. - Mario
    });
});

router.get("/approve-mod/:id", function (req, res) {
    connection.query(`UPDATE mods SET status = 1 WHERE id = ${req.params.id}`, function () {
        res.redirect("/pending-mods");
    });
});

router.get("/dismiss-mod/:id", function (req, res) {
    connection.query(`UPDATE mods SET status = 2 WHERE id = ${req.params.id}`, function () {
        res.redirect("/pending-mods");
    });
});

router.get("/login",
    passport.authenticate("steam", {
        failureRedirect: "/"
    }),
    function (req, res) {
        res.redirect("/");
    });

router.get("/login/return",
    function (req, res, next) {
        req.url = req.originalUrl;
        next();
    },
    passport.authenticate("steam", {
        failureRedirect: "/"
    }),
    function (req, res) {
        res.redirect("/");
    }
);

//TODO: add to single-item.js check for comment pagination, if so do loop. - Liam
router.get("/item/:id",
    function (req, res) {
        const item = req.params.id;
        lookup.main(item).then(items => {
            res.render("item.html", {
                title: `Item ${req.params.id}`,
                req: req,
                items: items[0]
            });
        });
    }
);
module.exports = router;