var onKeyDown = function (event) {
    switch (event.keyCode) {
        case 37: // left
        case 65: // a
            moveLeft = true; break;
        case 39: // right
        case 68: // d
            moveRight = true; break;
        case 32: // space
        case 38: // up
        case 87: // w
            if(!scene.gameStarted) startGame(1);
            if (canJump === true) velocity.y += 250;
            canJump = false;
            break;
        case 82: // r
            endLevel(false,scene.currentLevel);
            break;
        case 81: // q
            if(scene.currentLevel>1) endLevel(false,scene.currentLevel-1);
            else endLevel(false,Object.keys(LEVELS).length);
            break;
    }
};
var onKeyUp = function (event) {
    switch (event.keyCode) {
        case 37: // left
        case 65: // a
            moveLeft = false; break;
        case 39: // right
        case 68: // d
            moveRight = false; break;
    }
};
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);
$(function(){
    if($('.ui-loader').length>0) $('.ui-loader').remove();
    var mouse = {};
    var stopMoving=true;
    $('html').on('touchstart','body',function(e){
        mouse.x = (e.originalEvent.touches[0].clientX / window.innerWidth) * 2 - 1;
        if(mouse.x>0) moveRight=true;
        else if(mouse.x<=0) moveLeft=true;
        if(e.originalEvent.touches[1]&&canJump===true) {
            velocity.y+=250;
            canJump=false;
            stopMoving=false;
        }
    }).on('touchend','body',function(e){
        if(stopMoving) {
            moveRight=false;
            moveLeft=false;
        }
        stopMoving=true;
    });
});

var TEXTURELOADER = new THREE.TextureLoader();
var fontLoader = new THREE.FontLoader();
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var moveLeft = false;
var moveRight = false;
var canJump = false;
var LEVELS = {};
createLevels();

var COLLIDEABLES = [];

var rayCaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

// Add a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 50;
// Add a light
var light = new THREE.AmbientLight( 0xffffff );
scene.add(light);
light = new THREE.PointLight(0xffffff);
scene.add(light);

var geometry, material;

material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(-(window.innerWidth/2), 0, 0));
geometry.vertices.push(new THREE.Vector3((window.innerWidth/2), 0, 0));
var baseLine = new THREE.Line(geometry, material);
baseLine.position.y = -5;

geometry = new THREE.BoxGeometry( 10, 10, 10 );
material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );
var PLAYER = new THREE.Mesh(geometry,material);
var PLAYER_EDGES = new THREE.EdgesHelper(PLAYER,0x00FF00);

scene.gameStarted = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) startGame(1);
else startScreen();

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
render();

function render() {
    requestAnimationFrame( render );

    if(scene.gameStarted) {
        COLLIDEABLES.forEach(function(c){
            if(c.movement)c.movement();
        });

        // left and right collisions
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.x -= 4.5;
        rayCaster.ray.direction = new THREE.Vector3(1,0,0);
        var intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnRightSide = intersections.length > 0;
        if(hitOnRightSide) {
            PLAYER.position.x=intersections[0].point.x-5.1;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
        }
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.x += 4.5;
        rayCaster.ray.direction = new THREE.Vector3(-1,0,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnLeftSide = intersections.length > 0;
        if(hitOnLeftSide) {
            PLAYER.position.x=intersections[0].point.x+5.1;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
        }

        // hitting the top of obstacles
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.y += 4.5;
        rayCaster.ray.direction = new THREE.Vector3(0,-1,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnTop = intersections.length > 0;
        if(hitOnTop) {
            PLAYER.position.y=intersections[0].point.y+5;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
            if(intersections[0].object.onHitTop) intersections[0].object.onHitTop();
        }
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.y += 4.5;
        rayCaster.ray.origin.x += 4.5;
        rayCaster.ray.direction = new THREE.Vector3(0,-1,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnTop2 = intersections.length > 0;
        if(hitOnTop2) {
            PLAYER.position.y=intersections[0].point.y+5;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
            if(intersections[0].object.onHitTop) intersections[0].object.onHitTop();
        }
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.y += 4.5;
        rayCaster.ray.origin.x -= 4.5;
        rayCaster.ray.direction = new THREE.Vector3(0,-1,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnTop3 = intersections.length > 0;
        if(hitOnTop3) {
            PLAYER.position.y=intersections[0].point.y+5;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
            if(intersections[0].object.onHitTop) intersections[0].object.onHitTop();
        }

        // hitting the bottom of obstacles
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.y -= 4.5;
        rayCaster.ray.direction = new THREE.Vector3(0,1,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnBottom = intersections.length > 0;
        if(hitOnBottom) {
            PLAYER.position.y=intersections[0].point.y-5;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
        }
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.y -= 4.5;
        rayCaster.ray.origin.x += 4.5;
        rayCaster.ray.direction = new THREE.Vector3(0,1,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnBottom2 = intersections.length > 0;
        if(hitOnBottom2) {
            PLAYER.position.y=intersections[0].point.y-5;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
        }
        rayCaster.ray.origin.copy(PLAYER.position);
        rayCaster.ray.origin.y -= 4.5;
        rayCaster.ray.origin.x -= 4.5;
        rayCaster.ray.direction = new THREE.Vector3(0,1,0);
        intersections = rayCaster.intersectObjects(COLLIDEABLES);
        var hitOnBottom3 = intersections.length > 0;
        if(hitOnBottom3) {
            PLAYER.position.y=intersections[0].point.y-5;
            if(intersections[0].object.onHit) intersections[0].object.onHit();
        }


        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if (moveLeft) velocity.x -= 800.0 * delta;
        if (moveRight) velocity.x += 800.0 * delta;

        if (hitOnRightSide && moveRight) {
            velocity.x = 0;
            moveRight=false;
        }
        if (hitOnLeftSide && moveLeft) {
            velocity.x = 0;
            moveLeft=false;
        }
        if (hitOnTop===true||hitOnTop2===true||hitOnTop3===true) {
            velocity.y = Math.max(0, velocity.y);
            if(velocity.y==0) canJump=true;
        }
        if (hitOnBottom===true||hitOnBottom2===true||hitOnBottom3===true) {
            velocity.y -= 250; // this is actually too much. Should be minus what's left of the jump. But this is easier.
        }

        PLAYER.translateX(velocity.x * delta);
        PLAYER.translateY(velocity.y * delta);
        PLAYER.translateZ(velocity.z * delta);

        if (PLAYER.position.y < 0) {
            velocity.y = 0;
            PLAYER.position.y = 0;
            canJump = true;
        }
        camera.position.x=PLAYER.position.x;
        camera.position.y=PLAYER.position.y;
        prevTime = time;
    }

    renderer.render( scene, camera );
}

function startScreen() {
    fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
        var fontOpts = {
            font: font,
            size: 3,
            height: 0.1,
            curveSegments: 12
        };
        var material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
        var geometry = new THREE.TextGeometry('Use A/D or the Left/Right arrows to move',fontOpts);
        var startText = new THREE.Mesh( geometry, material );
        startText.position.z -= 15;
        startText.position.x -= 30;
        startText.updateMatrixWorld();
        COLLIDEABLES.push(startText);
        scene.add(startText);
        geometry = new THREE.TextGeometry('Use W or Space to jump',fontOpts);
        startText = new THREE.Mesh( geometry, material );
        startText.position.z -= 15;
        startText.position.x -= 30;
        startText.position.y -= 5;
        startText.updateMatrixWorld();
        COLLIDEABLES.push(startText);
        scene.add(startText);
        geometry = new THREE.TextGeometry('Your goal is to get to the green pole',fontOpts);
        startText = new THREE.Mesh( geometry, material );
        startText.position.z -= 15;
        startText.position.x -= 30;
        startText.position.y -= 10;
        startText.updateMatrixWorld();
        COLLIDEABLES.push(startText);
        scene.add(startText);
        geometry = new THREE.TextGeometry('Hit Space to Begin',fontOpts);
        startText = new THREE.Mesh( geometry, material );
        startText.position.z -= 15;
        startText.position.x -= 30;
        startText.position.y -= 15;
        startText.updateMatrixWorld();
        COLLIDEABLES.push(startText);
        scene.add(startText);
    });
}

function startGame(startLevel) {
    scene.gameStarted = true;
    scene.totalTime = 0.00;
    scene.totalDeaths = 0;
    COLLIDEABLES.forEach(function(c){
        scene.remove(c);
    });
    scene.add(baseLine);
    scene.add(PLAYER);
    scene.add(PLAYER_EDGES);
    prevTime = performance.now();
    endLevel(false,startLevel);
}

function gameOver() {
    COLLIDEABLES.forEach(function(c){
        scene.remove(c);
    });
    scene.remove(PLAYER);
    scene.remove(PLAYER_EDGES);
    scene.remove(baseLine);
    PLAYER.position.x = 0;
    PLAYER.position.y = 0;
    var time = (performance.now() - scene.levelStartTime)/1000;
    scene.totalTime+=+time.toFixed(2);
    scene.totalDeaths+=scene.levelDeaths;
    fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
        var fontOpts = {
            font: font,
            size: 3,
            height: 0.1,
            curveSegments: 12
        };
        var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
        var geometry = new THREE.TextGeometry('Game Over', fontOpts);
        var text = new THREE.Mesh( geometry, material );
        text.position.z -= 15;
        text.position.x -= 30;
        text.updateMatrixWorld();
        COLLIDEABLES.push(text);
        scene.add(text);
        geometry = new THREE.TextGeometry('Total Time: '+scene.totalTime.toFixed(2), fontOpts);
        text = new THREE.Mesh( geometry, material );
        text.position.z -= 15;
        text.position.x -= 30;
        text.position.y -= 5;
        text.updateMatrixWorld();
        COLLIDEABLES.push(text);
        scene.add(text);
        geometry = new THREE.TextGeometry('Total Deaths: '+scene.totalDeaths, fontOpts);
        text = new THREE.Mesh( geometry, material );
        text.position.z -= 15;
        text.position.x -= 30;
        text.position.y -= 10;
        text.updateMatrixWorld();
        COLLIDEABLES.push(text);
        scene.add(text);
        geometry = new THREE.TextGeometry('Hit Space To Restart', fontOpts);
        text = new THREE.Mesh( geometry, material );
        text.position.z -= 15;
        text.position.x -= 30;
        text.position.y -= 15;
        text.updateMatrixWorld();
        COLLIDEABLES.push(text);
        scene.add(text);
    });
    scene.gameStarted = false;
}

function endLevel(finished,loadLvl) {
    COLLIDEABLES.forEach(function(c){
        scene.remove(c);
    });
    COLLIDEABLES=[];
    PLAYER.position.x = 0;
    PLAYER.position.y = 0;
    if(finished) {
        var time = (performance.now() - scene.levelStartTime)/1000;
        scene.totalTime+=+time.toFixed(2);
        scene.totalDeaths+=scene.levelDeaths;
        fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
            var geometry = new THREE.TextGeometry(time.toFixed(2), {
                font: font,
                size: 3,
                height: 1,
                curveSegments: 12
            });
            var material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
            var completeTime = new THREE.Mesh( geometry, material );
            completeTime.position.z -= 15;
            completeTime.movement = function() {
                this.position.x -= 1;
                this.rotation.y += DTR(0.5);
                if(!this.visible) scene.remove(this);
            };
            completeTime.updateMatrixWorld();
            COLLIDEABLES.push(completeTime);
            scene.add(completeTime);
            geometry = new THREE.TextGeometry(scene.levelDeaths+' Deaths', {
                font: font,
                size: 3,
                height: 1,
                curveSegments: 12
            });
            var deathCount = new THREE.Mesh( geometry, material );
            deathCount.position.z -= 15;
            deathCount.position.y -= 10;
            deathCount.movement = function() {
                this.position.x -= 1;
                this.rotation.y += DTR(0.5);
                if(!this.visible) scene.remove(this);
            };
            deathCount.updateMatrixWorld();
            COLLIDEABLES.push(deathCount);
            scene.add(deathCount);
            if(loadLvl) LEVELS[loadLvl]();
        });
    } else {
        if(loadLvl) LEVELS[loadLvl](false);
    }
}

function createSpikes(startVector,numOfSpikes,pointDir,move) {
    numOfSpikes = typeof numOfSpikes !== 'undefined' ? numOfSpikes : 1;
    pointDir = typeof pointDir !== 'undefined' ? pointDir : 'u';
    move = typeof move !== 'undefined' ? move : false;
    var geometry = new THREE.ConeGeometry( 2, 5, 32 );
    var material = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
    var shift = 0;
    while(numOfSpikes>0) {
        numOfSpikes--;
        var SPIKE = new THREE.Mesh(geometry,material);
        SPIKE.position.copy(startVector);
        switch (pointDir) {
            case 'u': SPIKE.position.x += shift; break;
            case 'd': SPIKE.rotation.z += DTR(180); SPIKE.position.x += shift; break;
            case 'l': SPIKE.rotation.z += DTR(90); SPIKE.position.y += shift; break;
            case 'r': SPIKE.rotation.z -= DTR(90); SPIKE.position.y += shift; break;
        }
        shift+=2;
        SPIKE.onHit = function() {
            scene.levelDeaths++;
            endLevel(false,scene.currentLevel);
        };
        if(move) {
            SPIKE.baseX=SPIKE.position.x;
            SPIKE.baseY=SPIKE.position.y;
            if(pointDir=='u'||pointDir=='d') {
                SPIKE.moveDir='u';
                SPIKE.movement = function() {
                    if(this.moveDir=='u'&&(this.position.y<this.baseY+4)){
                        this.position.y+=0.1;
                    } else if(this.position.y>this.baseY-4) {
                        this.moveDir='d';
                        this.position.y-=0.1;
                    } else {
                        this.moveDir='u';
                    }
                };
            } else {
                SPIKE.moveDir='r';
                SPIKE.movement = function() {
                    if(this.moveDir=='r'&&(this.position.x<this.baseX+2)){
                        this.position.x+=0.1;
                    } else if(this.position.x>this.baseX-2) {
                        this.moveDir='l';
                        this.position.x-=0.1;
                    } else {
                        this.moveDir='r';
                    }
                };
            }
        }
        SPIKE.updateMatrixWorld();
        scene.add(SPIKE);
        COLLIDEABLES.push(SPIKE);
    }

}

/** @returns {Number} */
function DTR(d) {
    return d * (3.1415/180);
}

function createLevels() {
    var geometry = new THREE.CylinderGeometry( 1, 1, 20, 32 );
    var material = new THREE.MeshPhongMaterial( {color: 0x00FF00} );
    var POLE = new THREE.Mesh(geometry,material);
    geometry = new THREE.BoxGeometry( 10, 10, 10 );
    material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );
    var PLAT,texture;
    LEVELS = {
        1: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=1;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=15;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x-=15;
            PLAT.position.y+=25;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                endLevel(true,2);
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
        },
        2: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=2;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x-=15;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=15;
            PLAT.position.y+=25;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);

            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                endLevel(true,3);
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
        },
        3: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=3;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=15;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=40;
            PLAT.position.y+=25;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=65;
            PLAT.position.y+=50;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=40;
            PLAT.position.y+=75;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);

            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                endLevel(true,4);
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
        },
        4: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=4;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=15;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=40;
            PLAT.position.y+=25;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=65;
            PLAT.position.y+=50;
            PLAT.baseX=PLAT.position.x;
            PLAT.moveDir='r';
            PLAT.movement = function() {
                if(this.moveDir=='r'&&(this.position.x<this.baseX+20)){
                    this.position.x+=0.5;
                } else if(this.position.x>this.baseX-20) {
                    this.moveDir='l';
                    this.position.x-=0.5;
                } else {
                    this.moveDir='r';
                }
            };
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=40;
            PLAT.position.y+=75;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);

            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                endLevel(true,5);
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
        },
        5: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=5;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=15;
            PLAT.position.y+=17;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=40;
            PLAT.position.y+=45;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=65;
            PLAT.position.y+=70;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=75;
            PLAT.position.y+=30;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=115;
            PLAT.position.y+=50;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=140;
            PLAT.position.y+=75;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=115;
            PLAT.position.y+=95;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=90;
            PLAT.position.y+=120;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                endLevel(true,6);
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
            createSpikes(new THREE.Vector3(25,-2.5,0),70);
            createSpikes(new THREE.Vector3(13,20,0),3,'u',true);
        },
        6: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=6;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=15;
            PLAT.position.y+=15;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=45;
            PLAT.position.y+=30;
            PLAT.baseX=PLAT.position.x;
            PLAT.moveDir='r';
            PLAT.movement = function() {
                if(this.moveDir=='r'&&(this.position.x<this.baseX+20)){
                    this.position.x+=0.5;
                } else if(this.position.x>this.baseX-20) {
                    this.moveDir='l';
                    this.position.x-=0.5;
                } else {
                    this.moveDir='r';
                }
            };
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=105;
            PLAT.position.y+=30;
            PLAT.baseX=PLAT.position.x;
            PLAT.moveDir='l';
            PLAT.movement = function() {
                if(this.moveDir=='r'&&(this.position.x<this.baseX+20)){
                    this.position.x+=0.5;
                } else if(this.position.x>this.baseX-20) {
                    this.moveDir='l';
                    this.position.x-=0.5;
                } else {
                    this.moveDir='r';
                }
            };
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=130;
            PLAT.position.y+=45;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=155;
            PLAT.position.y+=75;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=180;
            PLAT.position.y+=104;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=205;
            PLAT.position.y+=85;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=240;
            PLAT.position.y+=105;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=265;
            PLAT.position.y+=120;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                endLevel(true,7);
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
            createSpikes(new THREE.Vector3(45,-2.5,0),150);
            createSpikes(new THREE.Vector3(174,101,0),4,'l');
        },
        7: function(resetDeaths) {
            geometry = new THREE.BoxGeometry( 10, 10, 10 );
            texture = TEXTURELOADER.load('img/platform-texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            resetDeaths = typeof resetDeaths !== 'undefined' ? resetDeaths : true;
            scene.currentLevel=7;
            scene.levelStartTime=performance.now();
            if(!resetDeaths||!scene.levelDeaths) scene.levelDeaths=0;
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=30;
            PLAT.position.y+=15;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            material = new THREE.MeshPhongMaterial( {color: 0x444444} );
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x+=65;
            PLAT.position.y+=30;
            PLAT.onHitTop = function() {
                PLAYER.position.x = -25;
                PLAYER.position.y = 42.5;
            };
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x-=25;
            PLAT.position.y+=40;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF,map:texture} );
            PLAT = new THREE.Mesh(geometry,material);
            PLAT.position.x-=55;
            PLAT.position.y+=60;
            scene.add(PLAT);
            COLLIDEABLES.push(PLAT);
            geometry = new THREE.CylinderGeometry( 1, 1, 20, 32 );
            material = new THREE.MeshPhongMaterial( {color: 0x00FF00} );
            POLE = new THREE.Mesh(geometry,material);
            POLE.position.copy(PLAT.position);
            POLE.position.y+=10;
            POLE.onHit = function(){
                gameOver();
            };
            scene.add(POLE);
            POLE.updateMatrixWorld();
            COLLIDEABLES.push(POLE);
        }
    };
}