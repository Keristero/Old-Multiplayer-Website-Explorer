var http = require('http');
var path = require('path');
var fs = require('fs');
var socketio = require('socket.io');
var express = require('express');
var jsdom = require("jsdom");
var striptags = require('striptags');

//Create http server
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
router.use(express.static(path.resolve(__dirname, 'client')));

//Socket IO
var sockets = [];
var rooms = {};

io.on('connection', function (socket) {
    console.log(socket.id+' connected')
    sockets.push(socket);

    socket.on('disconnect', function () {
        leaveRoom(socket);
        console.log(socket.id+' disconnected')
        sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('joinRoom', function(url,x,y){
        leaveRoom(socket);
        joinRoom(url,x,y)
    });

    socket.on('position', function(pos){
        for(var player in rooms[socket.room]){
            if(rooms[socket.room][player].id === socket.id){
                rooms[socket.room][player].x = pos.x;
                rooms[socket.room][player].y = pos.y;
            }
        }

    });
    
    socket.on('scrape', function (url) {
        //Create an empty object to be populated
        var dungeonObjects = {links:[], images:[], paragraphs:[]}
        //populate object
        jsdom.env(
        url,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            if(!err){
                //Log all the links on the page
                links = window.$("a")
                for(var i in links){
                    if(links[i].href !== undefined){
                        if(links[i].href.length > 0){
                            dungeonObjects.links.push({innerHTML:striptags(links[i].innerHTML),url:links[i].href});
                        }
                    }
                }
                //Log all the pictures on the page
                images = window.$("img")
                for(var i in images){
                    if(images[i].src !== undefined){
                        dungeonObjects.images.push({alt:images[i].alt,src:images[i].src});
                    }
                }
                //Log all the links on the page
                paragraphs = window.$("p")
                for(var i in paragraphs){
                    if(paragraphs[i].innerHTML !== undefined){
                        if(paragraphs[i].innerHTML.length > 0){
                            dungeonObjects.paragraphs.push({innerHTML:striptags(paragraphs[i].innerHTML)});
                        }
                    }
                }
                //send results to the client
                socket.emit('dungeonObjects',dungeonObjects);
            }else{
                console.log(err)
            }
        }
    );
    });

    function leaveRoom(socket){
        for(var roomName in rooms){
            for(var player in rooms[roomName]){
                if(rooms[roomName][player].id === socket.id){
                    console.log(rooms[roomName][player].id+' removed from '+roomName);
                    rooms[roomName].splice(player,1);
                }
            }
            if(rooms[roomName].length === 0){
                delete rooms[roomName];
                console.log('deleted room');
            }
        }
    }

    function joinRoom(url,x,y){
        socket.room = url;
        console.log('player joined '+url);
        if(rooms.hasOwnProperty(url)){//If room exists
            //Create a player in the room
            rooms[url].push({id:socket.id,x:x,y:y});
        }else{//If room does not exist
            //Create a room property of rooms containing an empty array
            Object.defineProperty(rooms, url, {value : [],writable : true, enumerable : true, configurable : true});
            //Create a player in the room
            rooms[url].push({id:socket.id,x:x,y:y});
        }
        console.log(rooms);
    }

    console.log(sockets.length+' clients connected currently');

});

function sendPositions(){
    for (var roomName in rooms){
        for(var player in rooms[roomName]){
            for(var socket in sockets){
                if(sockets[socket].id === rooms[roomName][player].id){
                    var listOfOtherPlayers = JSON.parse(JSON.stringify(rooms[roomName]));
                    listOfOtherPlayers.splice(player,1);
                    sockets[socket].emit('room',listOfOtherPlayers);
                }
            }
        }
    }
    setTimeout(sendPositions,50);
}
sendPositions();

//===Host===//
server.listen(process.env.PORT || 3000, process.env.IP || "127.0.0.1", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});