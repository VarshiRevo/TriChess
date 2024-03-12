

var renderer;
var scene;
var camera;
var planes = [];
var cameraControls;
var squareFrom = -1;
var currentTurn = "spectator";

var boards = -1;

var playerColor;

var objects = [];
var squaretiles = [];
var movelist = [];

var container;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var selectedobject = null;
var heldPiece = null;
var offset = new THREE.Vector3();

var PieceList = [null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null];

var BoardPieces = new Array(64);
var PiecesToLoad = ['rook', 'knight', 't', 'king', 'queen', 't', 'knight', 'rook'];
var Colors = ['white', 'black'];

function Piece(){
    this.name = "";
    this.x = 0;
    this.z = 0;
    this.y = 0;
    this.index = -1;
    this.row = -1;
    this.col = -1;
}

var loadWorld = function(boards) {

    init();
    animate();

    function init() {

        scene = new THREE.Scene();

        container = document.getElementById('container');
        document.body.appendChild( container );

        var w = container.clientWidth;
        var h = container.clientHeight;

        camera = new THREE.PerspectiveCamera(60, w / h, 1, 5000);
        camera.position.x = 0;
        camera.position.y = 150;
        camera.position.z = 150;
        //camera.lookAt(scene.position);

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(w, h);
        renderer.shadowMap.enabled = true;

        container.appendChild(renderer.domElement);

        createChessBoard();
        loadPieces();

        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(0, 800, 0);
        spotLight.shadowCameraNear = 20;
        spotLight.shadowCameraFar = 1500;
        spotLight.castShadow = true;
        scene.add(spotLight);

        for(var i = 0; i < boards; i++) {
            var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(24 * 8, 24 * 8, 8, 8), new THREE.MeshBasicMaterial({
                transparent: true,
                color: 0x0000ff,
                opacity: 0.0
            }));
            plane.position.z = 0;
            plane.position.x = 0;
            plane.position.y = .5 + i * 80;
            plane.rotation.x = 3 * Math.PI / 2;
            plane.rotation.y = 0;
            plane.rotation.z = 0;
            plane.name = "Plane_" + i;
            planes.push(plane);
            scene.add(plane);
        }

        container.addEventListener('mousemove', onDocumentMouseMove, false);
        container.addEventListener('mousedown', onDocumentMouseDown, false);
        container.addEventListener('mouseup', onDocumentMouseUp, false);
        window.addEventListener( 'resize', onWindowResize, false );

        cameraControls = new THREE.OrbitControls(camera, container);
        cameraControls.addEventListener( 'change', render );
    }

    function createChessBoard() {
        var SquareWidth = 24, SquareHeight = 24;

        var textureLoader = new THREE.TextureLoader();

        var SquareGeo = new THREE.BoxGeometry(SquareWidth, SquareHeight, 1);

        for(var i = 0; i < boards; i++) {
            for (var row = 0; row < 8; row++) {
                var alternate = ( row + 1 ) & 1;
                for (var col = 0; col < 8; col++) {
                    var mesh;
                    if (alternate == 0) {
                        var LightSquareMat = new THREE.MeshLambertMaterial({map: textureLoader.load('images/LightSquare.png')});
                        mesh = new THREE.Mesh(SquareGeo, LightSquareMat);
                    }
                    else {
                        var DarkSquareMat = new THREE.MeshLambertMaterial({map: textureLoader.load('images/DarkSquare.png')});
                        mesh = new THREE.Mesh(SquareGeo, DarkSquareMat);
                    }
                    alternate ^= 1;
                    mesh.position.x = -( SquareWidth * 3.5 ) + col * SquareWidth;
                    mesh.position.z = -( SquareHeight * 3.5 ) + row * SquareHeight;
                    mesh.position.y = i * 80;
                    mesh.rotation.x = Math.PI / 2;
                    mesh.name = "Row" + row + "-Col" + col + "-Board" + i + "-Color" + Colors[alternate];
                    squaretiles.push(mesh);
                    scene.add(mesh);
                }
            }
        }
    }

    var piecesLoaded = false;

    function waitForPiecesToLoad() {
        var allloaded = true;
        for (var i = 0; i < 32; i++) {
            if (PieceList[i] == null) {
                allloaded = false;
                break;
            }
        }

        if (!allloaded) {
            setTimeout(waitForPiecesToLoad, 500);
        }
        else {
            piecesLoaded = true;
            socket.emit('requestPieceLocations', {});
        }
    }

    function loadPieces() {
        for (var i = 0; i < 8; i++) {
            loadPiece('pawn', '', i);
            loadPiece('pawn', 'w', i + 16);
            loadPiece(PiecesToLoad[i], '', i + 8);
            loadPiece(PiecesToLoad[i], 'w', i + 24);
        }

        setTimeout(waitForPiecesToLoad, 500);
    }

    function loadPiece(modelname, white, index) {
        // instantiate a loader
        var loader = new THREE.OBJMTLLoader();
        // load an obj / mtl resource pair
        loader.load(
            // OBJ resource URL
            'models/' + modelname + '.obj',
            // MTL resource URL
            'models/' + modelname + white + '.mtl',
            // Function when both resources are loaded			// Function when both resources are loaded
            function (object) {
                // Added to fix raycasting
                object.castShadow = true;
                object.receiveShadow = true;
                object.scale.set(.4, .4, .4);

                var obj = new THREE.Object3D();
                obj.name = 'Piece';
                object.parent = obj;
                obj.add(object);
                objects.push(obj);
                PieceList[index] = obj;//ect;
            }
        );
    }

    function animate(){
        requestAnimationFrame( animate );
        cameraControls.update();
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    function SnapSelectedPieceToSquare(squareTo) {
        if (selectedobject == null) return;

        var row = Math.floor(squareTo / 8);
        var col = squareTo % 8;
        selectedobject.position.x = -24 * 3 + (col % 8) * 24 - 12;
        selectedobject.position.z = -24 * 3 - 12 + (row % 8) * 24;
        selectedobject.position.y = Math.floor(squareTo / 64) * 80;

        if(squareFrom == squareTo) {
            updateHeldData();
            socket.emit('updateModelPosition', heldPiece);
        }
        else{
            updateHeldData();
            heldPiece.row = row;
            heldPiece.col = col;
            socket.emit('updateModelPosition', heldPiece);
            socket.emit('commitMove', heldPiece);
        }

        socket.emit('clearMoveTiles');
    }

    function reverseSquare(square) {
        var row = 7 - Math.floor(square / 8);
        var col = square % 8;
        return ( row * 8 + col );
    }

    function onWindowResize() {

        var w = container.clientWidth;
        var h = container.clientHeight;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize( w, h );

    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        vector.unproject(camera);

        raycaster.set(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0 && playerColor == currentTurn) {
            cameraControls.enabled = false;
            movelist = [];

            for (var i = 0; i < intersects.length; i++) {
                var obj = intersects[i].object;
                var name = obj.name;
                if (name.length == 0) {
                    var par = obj.parent;
                    name = par.name;
                    if (name == '') {
                        par = par.parent;
                        name = par.name;
                        obj = par;
                    }
                    else {
                        obj = par;
                    }
                }
                if (name.indexOf("Piece") >= 0 && name.indexOf(playerColor) >= 0) {
                    selectedobject = obj;
                    socket.emit('requestOrigin', pieceIndexByName(selectedobject.name));
                    break;
                }
            }
        }
    }

    function onDocumentMouseMove(event) {

        var w = container.clientWidth;
        var h = container.clientHeight;

        mouse.x = ( event.clientX / w ) * 2 - 1;
        mouse.y = -( event.clientY / h ) * 2 + 1;

        if (selectedobject != null) {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            vector.unproject(camera);

            raycaster.set(camera.position, vector.sub(camera.position).normalize());

            var intersects = raycaster.intersectObjects(planes);
            selectedobject.position.copy(intersects[0].point);
            updateHeldData();
            socket.emit('updateModelPosition', heldPiece);
        }
    }

    function onDocumentMouseUp(event) {
        event.preventDefault();

        if(selectedobject != null) {
            // First, look for a square.
            var intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                var squareDest = -1;
                for (var i = 0; i < intersects.length; i++) {
                    intersects[i].object;
                    var name = intersects[i].object.name;
                    if (name.indexOf("-Color") >= 0) {
                        var row = name.substring(3, 4);
                        var col = name.substring(8, 9);
                        var boardLevel = name.substring(15, 16);
                        squareDest = parseInt(row) * 8 + (64 * parseInt(boardLevel)) + parseInt(col);
                        break;
                    }
                }
            }

            var legalmovemade = false;
            for (var i = 0; i < movelist.length; i++) {
                if (movelist[i] == squareDest) {
                    // A legal move was made.
                    legalmovemade = true;
                    SnapSelectedPieceToSquare(squareDest);
                }
            }

            if (!legalmovemade) {
                SnapSelectedPieceToSquare(squareFrom);
            }

            selectedobject = null;
        }
        cameraControls.enabled = true;
    }

};

var placePieceFromServer = function(piece){
    if(piece.row != -1 && piece.col != -1) {
        PieceList[piece.index].position.x = piece.x;
        PieceList[piece.index].position.z = piece.z;
        PieceList[piece.index].position.y = piece.y;
        PieceList[piece.index].rotation.x = 3 * Math.PI / 2;
        PieceList[piece.index].name = piece.name;
        scene.add(PieceList[piece.index]);
    }
};

var updateHeldData = function(){
    heldPiece = new Piece();

    heldPiece.x = selectedobject.position.x;
    heldPiece.z = selectedobject.position.z;
    heldPiece.y = selectedobject.position.y;
    heldPiece.name = selectedobject.name;
};

var moveHeldPiece = function(piece){
    var heldPiece = PieceList[pieceIndexByName(piece.name)];

    heldPiece.position.x = piece.x;
    heldPiece.position.z = piece.z;
    heldPiece.position.y = piece.y;
};

var removePiece = function(pieceName) {
    var index = pieceIndexByName(pieceName);
    scene.remove(PieceList[index]);
}

var pieceIndexByName = function(pieceName){
    var index;

    for (var i = 0; i < PieceList.length; i++){
        if (PieceList[i].name == pieceName){
            index = i;
            break;
        }
    }

    return index;
};

var setOriginSquare = function(origin){
    squareFrom = origin;
    socket.emit('requestMoves');
};

var setMoveList = function(moves){
    movelist = JSON.parse(moves);
    for (var i = 0; i < movelist.length; i++) {
        squaretiles[movelist[i]].material.color.set(0xff0000);
    }
};

var specifyBoardLevel = function(boards){
    if(boards == -1 && playerColor == 'White') {
        var input = -1;
        while (isNaN(input) || input < 1 || input > 8) {
            input = prompt("Set board height (1 - 8)", "1");
        }
        socket.emit('giveServerBoardLevel', input);
    }
};

var setClientBoardLevel = function(serverBoards){
    boards = serverBoards;
    loadWorld(boards);
};

var clearMoveTiles = function(){
    for (var i = 0; i < movelist.length; i++) {
        squaretiles[movelist[i]].material.color.set(0xffffff);
    }
    movelist = [];
};

var setPlayerColor = function(color){
    playerColor = color;
};

var setCurrentTurn = function(turn){
    currentTurn = turn;
};