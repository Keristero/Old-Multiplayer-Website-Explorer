var Player = {
    instantiate:function(map,pos,colour){
        this.map = map;
        this.pos = pos ||{x:0,y:0};
        this.vel = {x:0,y:0};
        this.colour = colour
    },
    update:function(){
        //Reset velocity
        this.vel.x = 0;
        this.vel.y = 0;

        //Movement
        if(keys[87]){
            this.vel.y--;
        }else if(keys[83]){
            this.vel.y++;
        }
        if(keys[65]){
            this.vel.x--;
        }else if(keys[68]){
            this.vel.x++;
        }
        if(keys[187] || keys[61] ){
            this.map.tileSize+=1;
            Game.camera.pos.x = -(this.pos.x*this.map.tileSize)+(ctx.canvas.width/2)
            Game.camera.pos.y = -(this.pos.y*this.map.tileSize)+(ctx.canvas.height/2)
        }else if(keys[189] || keys[173]){
            this.map.tileSize-=1;
            Game.camera.pos.x = -(this.pos.x*this.map.tileSize)+(ctx.canvas.width/2)
            Game.camera.pos.y = -(this.pos.y*this.map.tileSize)+(ctx.canvas.height/2)
        }

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        //set overlapping tiles
        this.overlap = this.map.tiles[this.pos.x][this.pos.y]

        //If player overlaps a link, go through it
        if(this.overlap === 5){

            //Join new room
            var link = this.map.getLink(this.pos.x,this.pos.y);
            txtinputURL.value = link.url;
            getDungeonObjects();
            Game.loaded = false;
        }

        //If player overlaps a wall, go back.
        if(TileSets[this.map.tileSet].tiles[this.overlap].solid){
            this.pos.x -= this.vel.x;
            this.pos.y -= this.vel.y;
        }

        //If player overlaps a paragraph, text to speech it.
        if(this.overlap === 7){
            var paragraph = this.map.getParagraph(this.pos.x,this.pos.y);
            if(!paragraph.playing){
                responsiveVoice.speak(paragraph.innerHTML, "UK English Male", { onend: function(){paragraph.playing = false;}});
                paragraph.playing = true;
            }
        }

        socket.emit('position',this.pos);
        
    },
    draw:function(ctx){
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.pos.x * this.map.tileSize, this.pos.y * this.map.tileSize, this.map.tileSize, this.map.tileSize);
    }
};