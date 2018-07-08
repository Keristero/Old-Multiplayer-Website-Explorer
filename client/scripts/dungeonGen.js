/* global ctx, tiles, prefabs, TileSets */

var Canvas = document.getElementById("Canvas");
var ctx = Canvas.getContext("2d");

/** Map Object
 * An object with methods containing all the procedural generation code for arranging rooms and tiles from the tileset.
 * @type Object
 */
var Map = Object.create(Object.prototype);

/** Map generate
 * Arranges Map rooms following rules from tileset and prints them to Map.tiles
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Map.generate = function() {
    for (RoomA = 0, RoomB = 1, Attempts = 0; RoomB < this.rooms.length; Attempts++) {
        
        //Find Valid Placements
        for (DoorA = 0; DoorA < this.rooms[RoomA].doors.length; DoorA++) { //Loop through each door on RoomA
            for (DoorB = 0; DoorB < this.rooms[RoomB].doors.length; DoorB++) { //Loop through each door on RoomB
                if (this.rooms[RoomB].allowRotate) {
                    for (Rotation = 0; Rotation < 4; Rotation++) {
                        this.rooms[RoomB].rotateRight();
                        this.moveRoomB(); //Move RoomB to the new position
                        if (this.testRoomB()) { //If RoomB is not overlapping any other rooms at its new position
                            this.ValidDoors.push({
                                DoorA: DoorA,
                                DoorB: DoorB,
                                Rotation: Rotation
                            }); //save this door + Rotation combination as a valid door
                        };
                    };
                } else {
                    this.moveRoomB(); //Move RoomB to the new position
                    if (this.testRoomB()) { //If RoomB is not overlapping any other rooms at its new position
                        this.ValidDoors.push({
                            DoorA: DoorA,
                            DoorB: DoorB,
                            Rotation: 0
                        }); //save this door + Rotation combination as a valid door
                    };
                }
            };
        };

        //Choose Valid Placement
        if (this.ValidDoors.length > 0) { // If atleast one valid placement was found, Place room B there.
            ChosenPlacement = RNG(0, this.ValidDoors.length - 1); //Choose a random door from the valid combinations
            DoorA = this.ValidDoors[ChosenPlacement].DoorA;
            DoorB = this.ValidDoors[ChosenPlacement].DoorB;
            if (this.rooms[RoomB].allowRotate) { // If RoomB is allowed to rotate, rotate it to match the rotation it has in its valid placement.
                for (rotating = 0; rotating <= this.ValidDoors[ChosenPlacement].Rotation; rotating++) {
                    this.rooms[RoomB].rotateRight(); // Rotate the room to the correct orientation
                };
            };
            this.moveRoomB(); // Move the room to its final position
            // Clear the valid doors array and move onto the next room placement
            this.ValidDoors = [];
            RoomB++;
            RoomA++;
            Attempts = 0;
        } else { // If no valid placement was found, choose a new room to try connect to, after each fail broaden the backtrack range.
            if (Attempts < this.MaximumAttempts) {
                RoomA = RNG(Math.max(0, RoomB - Attempts), RoomB - 1);
                console.log(RoomB + " could not be placed on " + RoomA + " ," + Attempts + " Attempts");
            } else {
                console.log("Max attempts reached, failed to place all rooms, extra rooms were removed");
                this.rooms.splice(RoomB, this.rooms.length - RoomB);
            };
        };
    };
    
    //Create Map
    for (x = 0; x < this.size; x++) {
        this.tiles.push([]);
        for (y = 0; y < this.size; y++) {
            this.tiles[x].push(TileSets[this.tileSet].fillTile);
        }
    }
    //loop through all the rooms and add their tiles to the map tiles array
    for (i = 0; i < this.rooms.length; i++) {
        for (x = 0; x < this.rooms[i].grid.length; x++) {
            for (y = 0; y < this.rooms[i].grid[x].length; y++) {
                for (r = 0; r < TileSets[this.tileSet].tiles[this.rooms[i].grid[x][y]].replacements.length; r++) {
                    if (this.tiles[this.rooms[i].x + x][this.rooms[i].y + y] === TileSets[this.tileSet].tiles[this.rooms[i].grid[x][y]].replacements[r][0]) {
                        this.tiles[this.rooms[i].x + x][this.rooms[i].y + y] = TileSets[this.tileSet].tiles[this.rooms[i].grid[x][y]].replacements[r][1];
                        break;
                    };
                };
            };
        };
    };

};

/** Map Instantiate
 * Populates Map.tiles with a 2d map array
 * @param {Integer} rooms - Number of rooms to try placee
 * @param {Integer} size - Width and height of the map array to be generated
 * @param {Integer} tileSize - Size of each tile for debug drawing
 * @param {Integer} MaximumAttempts - Amount of times to try placing a room before giving up dungeon generation
 * @param {Integer} tileSet - which tileset to use to generate the map
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */

Map.instantiate = function(rooms, size, tileSize, MaximumAttempts, tileSet, links, images, paragraphs) {
    //Reset random number generator
    Math.resetSeed();
    //Map properties
    this.size = size;
    this.tileSize = tileSize;
    this.tileSet = tileSet;
    //Map generator behaviour
    this.BacktrackRange; //When room B cant be placed, how recent will the new randomly chosen room A be
    this.MaximumAttempts = MaximumAttempts;//Number of times program is allowed to try placing a room
    //Map generator values
    this.RoomA = 0;
    this.ValidDoors = [];
    this.ChosenPlacement = 0;
    this.tiles = [];
    this.rooms = [];
    //Net Dungeon items
    this.links = links;
    this.paragraphs = paragraphs;
    console.log('links:'+this.links.length);
    console.log('paragraphs:'+this.paragraphs.length)
    this.itemsTotal = this.links.length+this.paragraphs.length;
    //Images
    this.images = images;

    // Create random rooms
    for (NOItems = 0; NOItems < this.itemsTotal; NOItems) {
        this.rooms.push(Object.create(Room));
        this.rooms[this.rooms.length - 1].instantiate(RNG(0, TileSets[this.tileSet].prefabs.length - 1),this);
        this.rooms[this.rooms.length - 1].findItems();
        NOItems += this.rooms[this.rooms.length - 1].items.length;
        console.log(NOItems+" out of "+this.itemsTotal+" item spots created");
    };
    this.generate();
    ///Assign links to link spots, making them active;
    for(var i = 0; i < this.links.length; i++){
        console.log('link '+i+' placing..');
        this.links[i].pos = this.randomTile(4);
        this.tiles[this.links[i].pos.x][this.links[i].pos.y] = 5;
        console.log('link '+i+' placed');
    }
    //Assign paragraphs to link spots, making them active;
    for(var i = 0; i < this.paragraphs.length; i++){
        console.log('link '+i+' placing...');
        this.paragraphs[i].pos = this.randomTile(4);
        this.tiles[this.paragraphs[i].pos.x][this.paragraphs[i].pos.y] = 7;
        console.log('paragraph '+i+' placed');
    }
    //Place images around dungeon
    for(var i = 0; i < this.images.length; i++){
        var newImage = new Image;
        newImage.src = this.images[i].src
        newImage.pos = this.randomTile(2);
        this.images[i] = newImage;
    }


    this.complete = true;
};

/** Map testOverlap
 * Preforms tile to tile collision testing given two Room objects
 * @param {Object} RoomA
 * @param {Object} RoomB
 * @returns {Boolean}
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Map.testOverlap = function(RoomA, RoomB) {
    //Loop through RoomA's tiles
    for (x1 = 0; x1 < RoomA.grid.length; x1++) {
        for (y1 = 0; y1 < RoomA.grid[x1].length; y1++) {
            if (TileSets[this.tileSet].tiles[RoomA.grid[x1][y1]].collisions.length > 0) {//If the tile needs collision testing
                //Loop through RoomB's tiles
                for (x2 = 0; x2 < RoomB.grid.length; x2++) {
                    for (y2 = 0; y2 < RoomB.grid[x2].length; y2++) {
                        if (x1 + RoomA.x === x2 + RoomB.x && y1 + RoomA.y === y2 + RoomB.y) {//If the two tiles collide
                            for (h = 0; h < TileSets[this.tileSet].tiles[RoomA.grid[x1][y1]].collisions.length; h++) {
                                if (TileSets[this.tileSet].tiles[RoomA.grid[x1][y1]].collisions[h] === RoomB.grid[x2][y2]) {
                                    return true; //return true if the other tile is listed in its collisions
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    return false;
};

/** Map moveRoomB
 * Simply moves the room with index RoomB to the position where DoorA and DoorB overlap, used in Map.generate
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Map.moveRoomB = function() {
    this.rooms[RoomB].x = this.rooms[RoomA].x + this.rooms[RoomA].doors[DoorA].x - this.rooms[RoomB].doors[DoorB].x;
    this.rooms[RoomB].y = this.rooms[RoomA].y + this.rooms[RoomA].doors[DoorA].y - this.rooms[RoomB].doors[DoorB].y;
};

/** Map testRoomB
 * Performs basic AABB collision testing between RoomB and previously placed rooms in Map.rooms
 * @returns {Boolean}
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Map.testRoomB = function() {
    //If room is within map
    if (this.rooms[RoomB].x > 0 && this.rooms[RoomB].x < this.size - this.rooms[RoomB].grid.length &&
        this.rooms[RoomB].y > 0 && this.rooms[RoomB].y < this.size - this.rooms[RoomB].grid.length) {
        for (i = 0; i < RoomB; i++) {
            //If room is overlapping another
            if (this.rooms[i].x < this.rooms[RoomB].x + this.rooms[RoomB].grid.length && this.rooms[i].x + this.rooms[i].grid.length > this.rooms[RoomB].x && 
                this.rooms[i].y < this.rooms[RoomB].y + this.rooms[RoomB].grid.length && this.rooms[i].y + this.rooms[i].grid.length > this.rooms[RoomB].y) {
                //Detailed collision testing
                if (this.testOverlap(this.rooms[RoomB], this.rooms[i])) {
                    return false;
                }
            }
        }
    } else {
        return false;
    }
    return true;
};

/** Map draw
 * Draws the map tiles array to canvas using tileset information, for debugging mainly
 * version 2.0 has start and end varibles for optimization, only draw what needs to be drawn.
 * @param {type} context -- Canvas context 2d for drawing onto
 * @author Jonathan Nimmo
 * @version 2.0
 * @since 1-6-2016
 */
Map.draw = function(context,startX,startY,endX,endY) {

    //First draw images
    for(var i = 0; i < this.images.length; i++){
        if((this.images[i].pos.x*this.tileSize)+this.images[i].width > Math.max(startX,0)*this.tileSize && 
            this.images[i].pos.x < Math.min(endX,this.size) && 
            (this.images[i].pos.y*this.tileSize)+this.images[i].height > Math.max(startY,0)*this.tileSize && 
            this.images[i].pos.y < Math.min(endY,this.size)){

            context.drawImage(this.images[i],this.images[i].pos.x*this.tileSize,this.images[i].pos.y*this.tileSize,this.images[i].width*(this.tileSize/32),this.images[i].height*(this.tileSize/32));
        }
    }
    
    //Then draw tiles
    for (x = Math.max(startX,0); x < Math.min(endX,this.size); x++) {
        for (y = Math.max(startY,0); y < Math.min(endY,this.size); y++) {
            if (TileSets[this.tileSet].tiles[this.tiles[x][y]].draw) {
                context.fillStyle = TileSets[this.tileSet].tiles[this.tiles[x][y]].colour;
                context.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            };
        };
    };

    //Draw link text
    for (x = Math.max(startX,0); x < Math.min(endX,this.size); x++) {
        for (y = Math.max(startY,0); y < Math.min(endY,this.size); y++) {
            if (TileSets[this.tileSet].tiles[this.tiles[x][y]].activeLink) {
                var link = this.getLink(x,y);
                if(link !== null){
                    context.fillStyle = "rgb(0,255,0)";
                    context.font = "12px Arial";
                    context.textAlign = 'center';
                    context.fillText(link.innerHTML,(x*this.tileSize)+this.tileSize*0.5,(y * this.tileSize)-this.tileSize*0.2);
                }
            };
        };
    };
};
Map.getLink = function(x,y) {
    for(var i = 0; i < this.links.length; i++){
        if(this.links[i].pos.x === x && this.links[i].pos.y === y){
            return this.links[i];
        }
    }
    return null;
};

Map.getParagraph = function(x,y) {
    for(var i = 0; i < this.paragraphs.length; i++){
        if(this.paragraphs[i].pos.x === x && this.paragraphs[i].pos.y === y){
            return this.paragraphs[i];
        }
    }
    return null;
};

Map.randomTile = function(tileType){
    var tilePool = [];
    for(x = 0; x < this.tiles.length; x++){
        for(y = 0; y < this.tiles[x].length; y++){
            if(this.tiles[x][y] === tileType){
                tilePool.push({x:x, y:y});
            };
        };
    };
    if(tilePool.length > 0){
        return tilePool[RNG(0,tilePool.length-1)];
    } else {
        console.log('No tiles were found of type '+tileType);
        return null;
    }
};

// Room Object
var Room = Object.create(Object.prototype);

/** Room rotateRight
 * rotates the room's grid array right 90 degrees, also calls find doors to update door positions
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Room.rotateRight = function() {
    // create a temporary array to contain the rotated grid
    var temp = new Array(this.grid.length);
    var i, j;
    for (i = 0; i < temp.length; ++i) {
        temp[i] = new Array(temp.length);
        for (j = 0; j < temp.length; ++j) {
            temp[i][j] = this.grid[temp.length - j - 1][i];
        }
    }
    this.grid = temp;
    // replace the grid with the rotated array
    this.findDoors();
};

/** Room findDoors
 * populates the room's doors array with the local coordinates of each door in the rooms grid array
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Room.findDoors = function() {
    this.doors = [];
    for(var i = 0; i < TileSets[this.parentMap.tileSet].tiles.length; i++){
        if (TileSets[this.parentMap.tileSet].tiles[i].door) {
            var foundDoors = this.findTiles(i);
            for(var j = 0; j < foundDoors.length; j++){
                this.doors.push(foundDoors[j]);
            }
        }
    }
};
Room.findItems = function() {
    this.items = [];
    for(var i = 0; i < TileSets[this.parentMap.tileSet].tiles.length; i++){
        if (TileSets[this.parentMap.tileSet].tiles[i].item) {
            var foundItems = this.findTiles(i);
            for(var j = 0; j < foundItems.length; j++){
                this.items.push(foundItems[j]);
            }
        }
    }
};
Room.findTiles = function(tileID) {
    var tiles=[];
    for (x = 0; x < this.grid.length; x++) {
        for (y = 0; y < this.grid[x].length; y++) {
            // add found tiles positions to tiles array
            if (this.grid[x][y] === tileID) {
                tiles.push({
                    x: x,
                    y: y
                });
            };
        };
    };
    return tiles;
};

/** Room instantiate
 * Instantiates the room with the layout of a prefab from the current Map tileset
 * @param {object} prefab - The prefab index from the current tileSet to use for this room's layout
 * @param {object} map - the map this room belongs to.
 * @author Jonathan Nimmo
 * @version 1.0
 * @since 1-6-2016
 */
Room.instantiate = function(prefab, map) {
    this.parentMap = map;
    this.x = map.size / 2;
    this.y = map.size / 2;
    this.prefab = prefab;
    this.grid = TileSets[map.tileSet].prefabs[this.prefab].grid;
    this.allowRotate = TileSets[map.tileSet].prefabs[this.prefab].allowRotate;
    this.findDoors();
};