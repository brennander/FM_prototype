//setting the stage and renderer
var container = new PIXI.Container();

//set the grid values        
var gridSize = [ 9 , 9 ];
var tileSize = 64;
var gridTiles = [];
var gridBase, gridBtn, gridFlat, player;
                    
var renderer = PIXI.autoDetectRenderer(gridSize[0]*tileSize, gridSize[1]*tileSize);
renderer.backgroundColor = 0xffeebb;

//add container to #stage element
document.getElementById("stage").appendChild(renderer.view);

//load the grid sprites
PIXI.loader
    .add([
    "img/gridSprite_base.png",
    "img/gridSprite_flat.png",
    "img/gridSprite_button.png"])
    .on("progress", loadProgressHandler)
    .load(init);

function loadProgressHandler() {
    console.log("loading");
};

//mouse event handler

//var mouseHandler = new PIXI.interaction.InteractionManager(renderer);


//initial setup
function init() {
        
    gridBase = PIXI.Texture.fromFrame("img/gridSprite_base.png");
    gridFlat = PIXI.Texture.fromFrame("img/gridSprite_flat.png");
    gridBtn = PIXI.Texture.fromFrame("img/gridSprite_button.png");
    
    // Create the grid
    for (i=0;i<gridSize[0];i++) {
        for (j=0;j<gridSize[1];j++) {
            var tile = new gridTile();            
        };
    };
    
    //Spawn player at random location
    player = new Actor(gridTiles[(Math.floor(Math.random()*gridTiles.length))], true);
    
    requestAnimationFrame( animate )
    console.log("setup");
};

//grid tile constructor
function gridTile() {
    
    //grid sprite and shader
    var tile = new PIXI.Sprite(gridBase);                            
    var outline = new PIXI.filters.OutlineFilter(renderer.width, renderer.height, gridSize[0]*1.5, 0xffeebb);
    
    //CURRENTLY OVERRIDES THE SHADER COLORS -- NEEDS FIXING
    var filter = new PIXI.filters.ColorMatrixFilter();
    var colorMatrix = [1,0,0,0,
                       0,0,0,0,
                       0,0,0,0,
                       0,0,0,1];
    filter.matrix = colorMatrix;

    //tile properties
    tile.id = [ i + 1 , j + 1 ];
    tile.isActor = false;                                
    tile.position.x = i*64;
    tile.position.y = j*64;
    tile.buttonMode = true;
    tile.interactive = true;
    tile.isSelected = false;
    tile.alpha = 1;
    tile.shader = outline;

//            //check for Actor position
//            if (tile.id[0] == gridSize[0] && tile.id[1] == gridSize[1]) {
//                tile.texture = gridBtn;
//                tile.isActor = true;
//                tile.shader.color = 0x6666ff;
//            };

    //add to container and gridTiles
    container.addChild(tile);
    gridTiles.push(tile);

    //selection functions
    tile.mouseover = function(data) {
        this.shader.color = 0xFF0000;

        this.mousedown = this.touchstart = function(data) {
            if (!this.isSelected) {
                this.isSelected = true;
                this.filters = [filter];
            } else if (this.isSelected) {
                this.isSelected = false;
                this.filters = null;
            };
            
            if (this.isSelected && player.actor.isMoving) {
                
            };
        };
    };

    tile.mouseout = function(data) {
        if (!this.isSelected) {
            this.shader.color = 0xffeebb;
        } else if (this.isSelected) {
            this.shader.color = 0xff00ff;
        };
    };
};

function Actor(gridPos, isPlayer) {
    var actor = new PIXI.Sprite(gridBtn);
    var outline = new PIXI.filters.OutlineFilter(renderer.width, renderer.height, gridSize[0]*1.5, 0x6666ff);
    var filter = new PIXI.filters.ColorMatrixFilter();
    
    actor.isPlayer = isPlayer;
    actor.isActor = true;
    actor.buttonMode = true;
    actor.interactive = true;
    actor.isSelected = false;
    actor.alpha = 1;
    actor.shader = outline;
    actor.position.x = gridPos.position.x;
    actor.position.y = gridPos.position.y;
    actor.gridLoc = gridPos.id[0]*gridPos.id[1];
    actor.speed = 3;
    actor.isMoving = false;
    
    actor.moveArea = [];
    
    container.addChild(actor);
    
    //selection functions
    actor.mouseover = function(data) {
        this.shader.color = 0xFF0000;

        this.mousedown = this.touchstart = function(data) {
            if (!this.isSelected) {
                this.isSelected = true;
                this.texture = gridFlat;
                
                if (this.isPlayer) {
                    actor.isMoving = true;
                };
            } else if (this.isSelected) {
                this.isSelected = false;
                this.texture = gridBtn;
                
                if (this.isPlayer) {
                    actor.isMoving = false;
                };
            };
        };
    };

    actor.mouseout = function(data) {
        if (!this.isSelected) {
            this.shader.color = 0x6666ff;
        } else if (this.isSelected) {
            this.shader.color = 0xff00ff;
        };
    };
    
    actor.getMovementArea = function() {
        var filter = new PIXI.filters.ColorMatrixFilter();
        var colorMatrix = [1,0,0,0,
                           0,1,0,0,
                           0,0,0,0,
                           0,0,0,1];
        filter.matrix = colorMatrix;

        for (i=0;i<gridTiles.length;i++) {
            if (gridTiles[i].position.x <= this.position.x + tileSize * this.speed) {
                if (gridTiles[i].position.x >= this.position.x - tileSize * this.speed) {
                    if (gridTiles[i].position.y <= this.position.y + tileSize * this.speed) {
                        if (gridTiles[i].position.y >= this.position.y - tileSize * this.speed) {
                            moveArea.push(gridTiles[i]);
                        };
                    };
                };
            };
        };
    };
    
    actor.showMoveArea = function() {
            for (i=0;i<this.moveArea.length;i++) {
                this.moveArea[i].filters = [filter];
            };
        };
        
    actor.hideMoveArea = function() {
        for (i=0;i<this.moveArea.length;i++) {
            this.moveArea[i].filters = null;
        };
    };
    
    actor.move = function(toTile) {
        this.getMovementArea();
        var canMove = false;
        
        if (isMoving) {
            this.showMoveArea();
            
            for (i=0;i<this.moveArea.length;i++) {
                if (this.moveArea[i].id.equals(toTile.id)) {
                    canMove = true;
                };
            };
            
            if (canMove) {
                this.position.x = toTile.position.x;
                this.position.y = toTile.position.y;

                this.gridLoc = toTile.id[0]*toTile.id[1];
            };
        };
    };
};

//mouseHandler.onMouseDown = function() {};

Array.prototype.equals = function (array, strict) {
    if (!array)
        return false;

    if (arguments.length == 1)
        strict = true;

    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i], strict))
                return false;
        }
        else if (strict && this[i] != array[i]) {
            return false;
        }
        else if (!strict) {
            return this.sort().equals(array.sort(), true);
        }
    }
    return true;
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render(container);
};
                

