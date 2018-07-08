/** TileSets object
 * An array containing tilesets to be used in map generation, each tile set consists of tiles and rooms,
 * as well as a fillTile which just tells the generator what tile fills the empty space on the map
 * 
 * Tiles have several properties:
 * name - string - actually not used for anything in this demo
 * collisions - integer - what tiles this tile is not allowed to overlap when being placed.
 * replacements - array - replaces tile [0] in the array with tile [1] when this tile overlaps tile [0]
 * draw - bool - should this tile be drawn
 * door - bool - door tiles are used as connection points between rooms, each tileset should have atleast one door tile
 * colour - string - rgba colour to fill this tile with when drawing
 * 
 * prefabs are 2d arrays containing tile indexes, each number in a prefab represents a tile from the tileset, these arrays are used as rooms in map geneation
 * prefabs has several properties:
 * name - string - actually not used for anything in this demo
 * allowRotate - bool - should the map generator attempt to place this room rotated
 * grid - array - contains tile indexes, each number in a prefab represents a tile from the tileset, these arrays are used as rooms in map geneation
 */
TileSets = [
    Testing = {
        fillTile: 0,
        tiles:[{
            name: 'air',
            collisions: [],
            replacements: [],
            draw: false
        }, {
            name: 'door',
            collisions: [2,3,6],
            replacements: [
                [0, 3],
                [3, 2]
            ],
            door: true,
            draw: true,
            colour: 'rgba(0,0,255,1)'
        }, {
            name: 'ground',
            collisions: [2,3,4,6],
            replacements: [
                [0, 2]
            ],
            draw: true,
            colour: 'rgba(150,150,150,0.5)'
        }, {
            name: 'wall',
            collisions: [2],
            replacements: [
                [0, 3],
                [3, 2]
            ],
            draw: true,
            solid: true,
            colour: 'rgba(50,50,50,0.5)'
        }, {
            name: 'itemSpot',
            collisions: [2,3,4],
            replacements: [
                [0, 4]
            ],
            draw: true,
            item: true,
            colour: 'rgba(128,0,128,1)'
        }, {
            name: 'activeLink',
            collisions: [2,3,4],
            replacements: [
                [0, 4]
            ],
            draw: true,
            activeLink: true,
            colour: 'rgba(180,255,180,1)'
        }, {
            name: 'solidWall',
            collisions: [2],
            replacements: [
                [0, 6]
            ],
            draw: true,
            solid: true,
            colour: 'rgba(50,50,50,0.5)'
        }, {
            name: 'paragraph',
            collisions: [2],
            replacements: [
                [0, 6]
            ],
            draw: true,
            colour: 'rgba(0,0,255,1)'
        }],
        prefabs: [{
            name: '4 portal medium room',
            allowRotate: false,
            grid: [[6,6,6,3,1,3,6,6,6],[6,2,2,2,2,2,2,2,6],[6,2,4,2,2,2,4,2,6],[3,2,2,2,2,2,2,2,3],[1,2,2,2,2,2,2,2,1],[3,2,2,2,2,2,2,2,3],[6,2,4,2,2,2,4,2,3],[6,2,2,2,2,2,2,2,6],[6,6,6,3,1,3,6,6,6]]
        }, {
            name: 'wide hall',
            allowRotate: true,
            grid: [[0,0,0,6,3,1,3,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,3,1,3,6,0,0,0]]
        }, {
            name: 'wide bend',
            allowRotate: true,
            grid:[[0,0,0,0,0,0,6,3,1,3,6],[0,0,0,0,0,0,6,2,2,2,6],[0,0,0,0,0,0,6,2,2,2,6],[0,0,0,0,0,0,6,2,2,2,6],[0,0,0,0,0,0,6,2,2,2,6],[0,0,0,0,0,0,6,2,2,2,6],[6,6,6,6,6,6,6,2,2,2,6],[3,2,2,2,2,2,2,2,2,2,6],[1,2,2,2,2,2,2,2,2,2,6],[3,2,2,2,2,2,2,2,2,2,6],[6,6,6,6,6,6,6,6,6,6,6]]
        }, {
            name: 'T connector',
            allowRotate: true,
            grid: [[0,0,0,6,3,1,3,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,6,6,6],[0,0,0,6,2,2,2,2,2,2,3],[0,0,0,6,2,2,2,2,2,2,1],[0,0,0,6,2,2,2,2,2,2,3],[0,0,0,6,2,2,2,6,6,6,6],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,2,2,2,6,0,0,0],[0,0,0,6,3,1,3,6,0,0,0]]
        }, {
            name: 'portal room',
            allowRotate: true,
            grid:[[6,6,6,6,6,6,6,3,1,3,6],[6,2,2,2,2,2,2,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,6],[6,2,4,2,2,2,4,2,2,2,6],[3,2,2,2,2,2,2,2,2,2,6],[1,2,2,2,2,2,2,2,2,2,6],[3,2,2,2,2,2,2,2,2,2,6],[6,2,4,2,2,2,4,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,6],[6,6,6,6,6,6,6,3,1,3,6]]
        }, {
            name: 'big room',
            allowRotate: false,
            grid: [[6,3,1,3,6,6,6,6,6,6,6,3,1,3,6],[3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],[1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],[3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],[6,2,2,2,2,2,2,2,2,2,2,2,2,2,6],[6,2,2,2,2,4,2,2,2,4,2,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,2,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,2,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,2,2,2,2,6],[6,2,2,2,2,4,2,2,2,4,2,2,2,2,6],[6,2,2,2,2,2,2,2,2,2,2,2,2,2,6],[3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],[1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],[3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],[6,3,1,3,6,6,6,6,6,6,6,3,1,3,6]]
        }]
    }
];