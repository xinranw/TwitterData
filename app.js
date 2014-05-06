var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var geocoder = require('geocoder');

var twitter = require('twit');
var twit = new twitter({
    consumer_key: 'Vp3ORRtabkFKXJbAXkEEEuMIi',
    consumer_secret: 'npVULDcE6kpsp1El38EZcXStaXVjM8Ns7xzo4mgHHAupn9PRxu',
    access_token: '25681857-qsLW4MVP5aJ3W64pjvCfLTHoey5wfblOwH4PV7CZJ',
    access_token_secret: 'kGhh6vR1qoniHjCsXQLcgTx2YZfeym4iT4yhHK385aFpc'
});

var appKey = 'q941CljQkSDfMycocduN5368300f6bc58';

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// var url = 'api.frrole.com';
// var options = {
//   host: url,
//   port: 80,
//   path: '/v1/trending-topics?location=united%20states&category=news&timeinterval=24&apikey='+appKey,
//   method: 'GET'
// };

// var twitterData;

// http.get(options, function(res){
//     var data = '';

//     res.on('data', function (chunk){
//         data += chunk;
//     });

//     res.on('end',function(){
//         twitterData = JSON.parse(data);
//     });

// });

var getTwitterData = function(){
    dataFile = require('./newsData.json');
    twitterData = dataFile.results;
    function tweetsComparator(a,b) {
        return parseInt(b.total_tweets) - parseInt(a.total_tweets);
    }
    twitterData.sort(tweetsComparator);
    return twitterData;
};

var counter = 0;
var getTwitterLocations = function(queries, responseFunction){
    for (var j = 0; j < queries.length; j++){
        twit.get('search/tweets', {q: queries[j], lang: 'en', count: 100}, function(err, data, response) {
            twitterData = data;
            console.log("Error?" + err);
            statuses = twitterData.statuses;
            for (var i in statuses){
                if (!(statuses[i].coordinates === null && statuses[i].user.location === '')){
                    id = statuses[i].user.id;

                    if (!(id in twitterTable)){
                        loc = statuses[i].coordinates || statuses[i].user.location;
                        twitterTable[id] = {count: 0, location: loc};
                    }
                    twitterTable[id].count = twitterTable[id].count + 1;
                }
            }
            counter += 1;
            if (counter >= queries.length){
                responseFunction();
            }
        });
    }
};


var twitterTable = {};

app.get('*', function(req, res){
    var queries = [];
    queries[0] = "";
    queries[1] = "";
    queries[2] = "";
    queries[3] = "";
    queries[4] = "";
    queries[5] = "";
    queries[6] = "";
    queries[7] = "";
    queries[8] = "";
    queries[9] = "";
    // queries[10] = "";
    // queries[11] = "";
    // queries[12] = "";
    // queries[13] = "";
    // queries[14] = "";
    // queries[15] = "";
    // queries[16] = "";
    // queries[17] = "";
    // queries[18] = "";
    // queries[19] = "";


    rawData = getTwitterData();
    for (var i = 0; i < 100; i++){
        index = Math.floor(i/10);
        if (i % 10 !== 0){
            queries[index] += " OR ";
        }
        queries[index] += rawData[i].entity;
    }
    console.log(queries);


    getTwitterLocations(queries, function(){
        for (var i in twitterTable){
            geocoder.geocode(twitterTable[i].location, function ( err, data ) {
                if (data.results.length !== 0){
                    longitude = data.results.geometry.location.lng;
                    latitude = data.results.geometry.location.lat;
                    twitterTable[i].location = {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    };
                }
            });
        }
        res.send(twitterTable);
    });



    // getTwitterLocations(query, function(){
    //     statuses = twitterData.statuses;
    //     for (var i in statuses){
    //         id = statuses[i].user.id;
    //         if (!(id in twitterTable)){
    //             twitterTable[id] = 0;
    //         }
    //         twitterTable[id] = twitterTable[id] + 1;
    //     }
    //     res.send(twitterTable);
    // });

    // res.send(getTwitterData());
});

var server = app.listen(8888, function(){
    console.log('Listening on port %d', server.address().port);
});

function isEmpty(obj){
    return (object.getOwnPropertyNames(obj).length === 0);
}