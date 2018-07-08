/* global Map */
var Canvas = document.getElementById("Canvas");
var ctx = Canvas.getContext("2d");
var btnGenerate = document.getElementById("btnGenerate");
var socket = io.connect();
var txtinputURL = document.getElementById('inputURL');

btnGenerate.addEventListener("click", getDungeonObjects);

// Keyboard input
keys = [];
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
    console.log(e.keyCode);
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

//Resize canvas
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

var Game = {
    loaded:false, 
    camera:{
        pos:{x:0,y:0},
        pos2:{x:0,y:0}
    },
    players:[]
};

function getDungeonObjects(){  
    socket.emit('scrape',txtinputURL.value);
}

function joinRoom(url,x,y){  
    console.log('joining '+url);
    socket.emit('joinRoom',url,x,y);
}

function createRandomMap(dungeonObjects){

    //Generate map
    randomMap = Object.create(Map);
    randomMap.instantiate(30, 256, 32, 500, 0, dungeonObjects.links, dungeonObjects.images, dungeonObjects.paragraphs);

    //Create player
    Game.player = Object.create(Player);
    Game.player.instantiate(randomMap,randomMap.randomTile(2),'rgb(0,255,0)')

    //Send join room message to server
    joinRoom(txtinputURL.value,Game.player.pos.x,Game.player.pos.y)

    Game.loaded = true;
}

//Netcode
socket.on('connect', function () {
    console.log('connected to server');
});

socket.on('room', function (room){
    Game.players = room;
});

socket.emit('chat message', 'hello room #'+'room');

socket.on('dungeonObjects', function (dungeonObjects) {
    console.log('received dunegonObjects');
    createRandomMap(dungeonObjects)
});

//Game
Game.start = function () {
    getDungeonObjects()
};

Game.update = function () {
     if(this.loaded){
         this.player.update();
     }
};

Game.draw = function () {
    ctx.resetTransform();
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    if(this.loaded){
        //Move camera
        this.camera.pos2.x = -(this.player.pos.x*randomMap.tileSize)+(ctx.canvas.width/2)
        this.camera.pos2.y = -(this.player.pos.y*randomMap.tileSize)+(ctx.canvas.height/2)
        this.camera.pos.x = Math.floor((this.camera.pos.x+this.camera.pos2.x)*0.5)
        this.camera.pos.y = Math.floor((this.camera.pos.y+this.camera.pos2.y)*0.5)

        ctx.translate(this.camera.pos.x,this.camera.pos.y);

        var drawWidth = Math.floor(((ctx.canvas.width*0.5)/randomMap.tileSize))+1;
        var drawHeight = Math.floor(((ctx.canvas.height*0.5)/randomMap.tileSize))+1;

        randomMap.draw(ctx,
        this.player.pos.x-drawWidth,
        this.player.pos.y-drawHeight,
        this.player.pos.x+drawWidth,
        this.player.pos.y+drawHeight);

        //Draw player
        this.player.draw(ctx);

        //Draw other players
        for(var player in this.players){
            ctx.fillStyle = 'rgb(255,0,0)';
            ctx.fillRect(this.players[player].x * randomMap.tileSize, this.players[player].y * randomMap.tileSize, randomMap.tileSize, randomMap.tileSize);
        }

    }
};

//Game loop
;(function () {
    function main(tFrame) {
        Game.stopMain = window.requestAnimationFrame(main);
        var nextTick = Game.lastTick + Game.tickLength;
        var numTicks = 0;

        //If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
        //If tFrame = nextTick then 1 tick needs to be updated (and so forth).
        //Note: As we mention in summary, you should keep track of how large numTicks is.
        //If it is large, then either your game was asleep, or the machine cannot keep up.
        if (tFrame > nextTick) {
            var timeSinceTick = tFrame - Game.lastTick;
            numTicks = Math.floor(timeSinceTick / Game.tickLength);
        }

        queueUpdates(numTicks);
        Game.draw(tFrame);
        Game.frameRate = parseInt(1000 / (tFrame - Game.lastRender));
        Game.lastRender = tFrame;
    }

    function queueUpdates(numTicks) {
        for (var i = 0; i < numTicks; i++) {
            Game.lastTick = Game.lastTick + Game.tickLength; //Now lastTick is this tick.
            Game.update(Game.lastTick);
        }
    }

    Game.lastTick = performance.now();
    Game.lastRender = Game.lastTick; //Pretend the first draw was on first update.
    Game.tickLength = 50; //This sets your simulation to run at (16ms)

    Game.start();
    main(performance.now()); // Start the cycle
})();