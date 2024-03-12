
var BoardColors, BoardPieces;
var movelist = [];

var boards = -1;

var ServerPieceLocations =
    [
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null
    ];

var StartBoardBottomPieces =
    [
        4, 2, 3, 6, 5, 3, 2, 4,
        1, 1, 1, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    ];

var StartBoardTopPieces =
    [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1,
        4, 2, 3, 6, 5, 3, 2, 4
    ];

var StartBoardBlankPieces =
    [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    ];

var StartBoardBottomColors =
    [
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1
    ];

var StartBoardTopColors =
    [
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    ];

var StartBoardBlankColors =
    [
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1
    ];

var players = [];
var blackIndex = -1;
var whiteIndex = -1;
var currentTurn = 'White';

function Player(){

    this.playerId = players.length;
    this.color = 'spectator';
}

var addPlayer = function(id){

    var player = new Player();
    player.playerId = id;

    players.push( player );

    if(whiteIndex < 0) {
        whiteIndex = players.indexOf(player);
        player.color = 'White';
    }
    else if(blackIndex < 0){
        blackIndex = players.indexOf(player);
        player.color = 'Black';
    }

    return player;
};

var removePlayer = function(player){

    var index = players.indexOf(player);

    if(index == whiteIndex)
        whiteIndex = -1;
    else if(index == blackIndex)
        blackIndex = -1;

    if(blackIndex == -1 && whiteIndex == -1)
        boards = -1;

    if (index > -1) {
        players.splice(index, 1);
    }

    if(players.length == 0)
        boards = -1;
};

var playerForId = function(id){
    var player;
    for (var i = 0; i < players.length; i++){
        if (players[i].playerId === id){

            player = players[i];
            break;
        }
    }
    return player;
};

function initchessgame()
{
    BoardColors = new Array(boards * 64);
    BoardPieces = new Array(boards * 64);

    /*if(boards == 1) {   //possibly not needed
        for (var i = 0; i < 32; i++) {
            BoardColors[i] = StartBoardBottomColors[i];
            BoardColors[i + 32] = StartBoardTopColors[i];
            BoardPieces[i] = StartBoardBottomPieces[i];
            BoardPieces[i + 32] = StartBoardTopPieces[i];
        }
    }
    else if (boards > 1)    //possibly can do all cases
    {*/
        for (var i = 0; i < 32; i++) {
            BoardColors[i] = StartBoardBottomColors[i];
            BoardColors[i + 32 + ((boards-1) * 64)] = StartBoardTopColors[i];

            BoardPieces[i] = StartBoardBottomPieces[i];
            BoardPieces[i + 32 + ((boards-1) * 64)] = StartBoardTopPieces[i];
        }

        for (var i = 0; i < ((boards-1) * 64); i++) {
            BoardColors[i + 32] = StartBoardBlankColors[i % 64];
            BoardPieces[i + 32] = StartBoardBlankPieces[i % 64];
        }
    //}
}

function addRowsAndColumns(square,limit)
{
    var color = BoardColors[square];
    if( color < 0 ) return;
    var piece = BoardPieces[square];
    if( piece < 1 ) return;

    var row = Math.floor( square / 8 );
    var col = square % 8;

    var xcolor = color ^ 1;

    var Sq = row * 8 + col;
    var f = col;
    var r = (row % 8);
    var ii;
    var lim;
    var b = Math.floor( square / 64 );
    var board;

    lim = limit;
    ii = Sq + 1;
    while( col < 7 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii++;
        col++;
        lim--;
    }

    lim = limit;
    ii = Sq - 1;
    col = f;
    while( col > 0 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii--;
        col--;
        lim--;
    }

    lim = limit;
    ii = Sq + 8;
    row = r;
    while( row < 7 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii += 8;
        row++;
        lim--;
    }

    lim = limit;
    ii = Sq - 8;
    row = r;
    while( row > 0 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii -= 8;
        row--;
        lim--;
    }

    if(boards > 1) //if we have multiple boards
    {
        lim = limit;
        board = b;  //board our piece is on
        ii = Sq + 64;
        while( board < boards-1 && BoardColors[ii] != color && lim > 0) //going up
        {
            movelist.push( ii );
            if( BoardColors[ii] == xcolor ) break;
            ii += 64;
            board++;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = Sq - 64;
        while( board > 0 && BoardColors[ii] != color && lim > 0) //going down
        {
            movelist.push( ii );
            if( BoardColors[ii] == xcolor ) break;
            ii -= 64;
            board--;
            lim--;
        }
    }
}

function addDiagonals(square,limit)
{
    var color = BoardColors[square];
    if( color < 0 ) return;
    var piece = BoardPieces[square];
    if( piece < 1 ) return;

    var row = (Math.floor( square / 8 ) % 8);
    var col = square % 8;

    var xcolor = color ^ 1;
    var b = Math.floor( square / 64 );
    var Sq = row * 8 + col + 64 * b;
    var f = col;
    var r = row;
    var ii;
    var lim;
    var board;

    lim = limit;
    ii = Sq + 9;
    row = r;
    col = f;
    while( col < 7 && row < 7 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii += 9;
        col++;
        row++;
        lim--;
    }

    lim = limit;
    ii = Sq + 7;
    col = f;
    row = r;
    while( col > 0 && row < 7 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii += 7;
        col--;
        row++;
        lim--;
    }

    lim = limit;
    ii = Sq - 7;
    col = f;
    row = r;
    while( col < 7 && row > 0 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii -= 7;
        col++;
        row--;
        lim--;
    }

    lim = limit;
    ii = Sq - 9;
    col = f;
    row = r;
    while( col > 0 && row > 0 && BoardColors[ii] != color && lim > 0 )
    {
        movelist.push( ii );
        if( BoardColors[ii] == xcolor ) break;
        ii -= 9;
        col--;
        row--;
        lim--;
    }

    if(boards > 1) //if we have multiple boards [ POV for comments: black on left side and white on right side ]
    {
        lim = limit;
        board = b;  //board our piece is on
        ii = Sq + 9 + 64;
        row = r;
        col = f;
        while( board < boards-1 && col < 7 && row < 7 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii );  //up diagonal left towards pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii += 9 + 64;
            board++;
            col++;
            row++;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = Sq + 7 + 64;
        col = f;
        row = r;
        while( board < boards-1 && col > 0 && row < 7 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii );  //up diagonal left away pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii += 7 + 64;
            board++;
            col--;
            row++;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = Sq - 7 - 64;
        col = f;
        row = r;
        while( board > 0 && col < 7 && row > 0 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii ); //down diagonal right toward pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii -= 7 + 64;
            board--;
            col++;
            row--;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = Sq - 9 - 64;
        col = f;
        row = r;
        while( board > 0 && col > 0 && row > 0 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii ); //down diagonal right away pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii -= 9 + 64;
            board--;
            col--;
            row--;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = (Sq - 9) + 64;
        row = r;
        col = f;
        while( board < boards-1 && col > 0 && row > 0 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii ); //up diagonal right away pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii += 64 - 9;
            board++;
            col--;
            row--;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = (Sq - 7) + 64;
        col = f;
        row = r;
        while( board < boards-1 && col > 0 && row > 0 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii ); //up diagonal right toward pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii += 64 - 7;
            board++;
            col--;
            row--;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = (Sq + 7) - 64;
        col = f;
        row = r;
        while( board > 0 && col > 0 && row < 7 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii ); //down diagonal left away pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii -= 64 - 7;
            board--;
            col--;
            row++;
            lim--;
        }

        lim = limit;
        board = b;  //board our piece is on
        ii = (Sq + 9) - 64;
        col = f;
        row = r;
        while( board > 0 && col < 7 && row < 7 && BoardColors[ii] != color && lim > 0 )
        {
            movelist.push( ii ); //down diagonal right away pov, working
            if( BoardColors[ii] == xcolor ) break;
            ii -= 64 - 9;
            board--;
            col++;
            row++;
            lim--;
        }
    }
}

function getlegalmoves(square)
{
    movelist = [];

    if( square < 0 || square >= boards * 64 ) return;

    var color = BoardColors[square];
    if( color < 0 ) return;
    var piece = BoardPieces[square];
    if( piece < 1 ) return;

    var row = Math.floor( square / 8 );
    var col = square % 8;
    var board = Math.floor( square / 64 );

    var xcolor = color ^ 1;

    var Sq = row * 8 + col;

    switch( piece )
    {
        // Pawn
        case 1:
            if( color == 1 ) //white
            {
                //if( row >= 7 ) return;
                if( (row % 8 != 7) && BoardColors[square+8] == -1 ) //forward
                {
                    movelist.push( square+8 );
                }
                if( row == 1 && BoardColors[square+16] == -1 ) //home, double move
                {
                    movelist.push( square+16 );
                    if( BoardColors[square+128] == -1) //up
                    {
                        movelist.push( square+128 );
                    }
                }
                if( (col % 8) != 0 && BoardColors[square+8-1] == xcolor ) //attack forward
                {
                    movelist.push( square+8-1 );
                }
                if( (col % 8) != 7 && BoardColors[square+8+1] == xcolor ) //attack forward
                {
                    movelist.push( square+8+1 );
                }
                if( (col % 8) != 0 && BoardColors[square+8-1+64] == xcolor ) //attack above
                {
                    movelist.push( square+8-1+64 );
                }
                if( (col % 8) != 7 && BoardColors[square+8+1+64] == xcolor ) //attack above
                {
                    movelist.push( square+8+1+64 );
                }
                /*if( BoardColors[square+8-1-64] == xcolor ) //attack below
                {
                    movelist.push( square+8-1-64 );
                }
                if( BoardColors[square+8+1-64] == xcolor ) //attack below
                {
                    movelist.push( square+8+1-64 );
                }*/
                if( BoardColors[square+64] == -1) //up
                {
                    movelist.push( square+64 );
                }
                /*if( BoardColors[square-64] == -1) //down
                {
                    movelist.push( square-64 );
                }*/
            }
            else if( color == 0 ) //black
            {
                //if( square < 8 ) return;
                if( (row % 8 != 0) && BoardColors[square-8] == -1 ) //forward
                {
                    movelist.push( square-8 );
                }
                if( row == (6 + 8 * (boards-1)) && BoardColors[square-16] == -1 ) //home, double move
                {
                    movelist.push( square-16 );
                    if( BoardColors[square-128] == -1) //down
                    {
                        movelist.push( square-128 );
                    }
                }
                if( (col % 8) != 0 && BoardColors[square-8-1] == xcolor ) //attack forward
                {
                    movelist.push( square-8-1 );
                }
                if( (col % 8) != 7 && BoardColors[square-8+1] == xcolor ) //attack forward
                {
                    movelist.push( square-8+1 );
                }
                /*if( BoardColors[square-8-1+64] == xcolor ) //attack above
                {
                    movelist.push( square-8-1+64 );
                }
                if( BoardColors[square-8+1+64] == xcolor ) //attack above
                {
                    movelist.push( square-8+1+64 );
                }*/
                if( (col % 8) != 0 && BoardColors[square-8-1-64] == xcolor ) //attack below
                {
                    movelist.push( square-8-1-64 );
                }
                if( (col % 8) != 7 && BoardColors[square-8+1-64] == xcolor ) //attack below
                {
                    movelist.push( square-8+1-64 );
                }
                /*if( BoardColors[square+64] == -1) //up
                {
                    movelist.push( square+64 );
                }*/
                if( BoardColors[square-64] == -1) //down
                {
                    movelist.push( square-64 );
                }
            }
            break;
        // Knight
        case 2: //comments are from perspective of black on left and white on right
            if( col < 7 ) //if column isnt close side
            {
                if( (row % 8) > 1 && BoardColors[Sq-15] != color ){ //if row isnt 1 away from white side
                    movelist.push( Sq - 15 );
                }
                if( (row % 8) < 6 && BoardColors[Sq+17] != color ){ //if row isnt 1 away from black side
                    movelist.push( Sq + 17 );
                }
                if( col < 6 ) //if column isnt 1 away from close side
                {
                    if( (row % 8) > 0 && BoardColors[Sq-6] != color ){ //if row isnt white side
                        movelist.push( Sq - 6 );
                    }
                    if( (row % 8) < 7 && BoardColors[Sq+10] != color ){ //if row isnt black side
                        movelist.push( Sq + 10 );
                    }
                }
            }
            if( col > 0 ) //if column isnt at far side
            {
                if( (row % 8) > 1 && BoardColors[Sq-17] != color ){ //if row isnt 1 away from white side
                    movelist.push( Sq - 17 );
                }
                if( (row % 8) < 6 && BoardColors[Sq+15] != color ){ //if row isnt 1 away from black side
                    movelist.push( Sq + 15 );
                }
                if( col > 1 ) //if column isnt 1 away from far side
                {
                    if( (row % 8) > 0 && BoardColors[Sq-10] != color ){ //if row isnt white side
                        movelist.push( Sq - 10 );
                    }
                    if( (row % 8) < 7 && BoardColors[Sq+6] != color ){ //if row isnt black
                        movelist.push( Sq + 6 );
                    }
                }
            }
            if(boards > 1) //if we AT LEAST have to check for up and down by one
            {
                if(board < boards-1) //if we are not on the top floor we can go up
                {
                    if( col < 6 && BoardColors[Sq+66] != color) //piece two away from close side
                    {
                        movelist.push( Sq + 66 );
                    }
                    if( col > 1 && BoardColors[Sq+62] != color) //piece two away from far side
                    {
                        movelist.push( Sq + 62 );
                    }
                    if( (row % 8) > 1 && BoardColors[Sq+48] != color) //2 away from right
                    {
                        movelist.push( Sq + 48 );
                    }
                    if( (row % 8) < 6 && BoardColors[Sq+80] != color) //2 away from left
                    {
                        movelist.push( Sq + 80 );
                    }
                }
                if(board > 0) //if we are not on the bottom floor we can go down
                {
                    if( col < 6 && BoardColors[Sq-62] != color) //piece two away from close side
                    {
                        movelist.push( Sq - 62 );
                    }
                    if( col > 1 && BoardColors[Sq-66] != color) //piece two away from far side
                    {
                        movelist.push( Sq - 66 );
                    }
                    if( (row % 8) > 1 && BoardColors[Sq-80] != color) //2 away from right
                    {
                        movelist.push( Sq - 80 );
                    }
                    if( (row % 8) < 6 && BoardColors[Sq-48] != color) //2 away from left
                    {
                        movelist.push( Sq - 48 );
                    }
                }
            }
            if(boards > 2) //if we then have to check for up and down by two
            {
                if(board < boards-2) //if we are not on the second from top floor we can go up
                {
                    if( col < 7 && BoardColors[Sq+129] != color) //piece one away from close side
                    {
                        movelist.push( Sq + 129 );
                    }
                    if( col > 0 && BoardColors[Sq+127] != color) //piece one away from far side
                    {
                        movelist.push( Sq + 127 );
                    }
                    if( (row % 8) > 0 && BoardColors[Sq+120] != color) //piece one away from right side
                    {
                        movelist.push( Sq + 120 );
                    }
                    if( (row % 8) < 7 && BoardColors[Sq+136] != color) //piece one away from left side
                    {
                        movelist.push( Sq + 136 );
                    }
                }
                if(board > 1) //if we are not on the second from bottom floor we can go down
                {
                    if( col < 7 && BoardColors[Sq-127] != color) //piece one away from close side
                    {
                        movelist.push( Sq - 127 );
                    }
                    if( col > 0 && BoardColors[Sq-129] != color) //piece one away from far side
                    {
                        movelist.push( Sq - 129 );
                    }
                    if( (row % 8) > 0 && BoardColors[Sq-136] != color) //piece one away from right side
                    {
                        movelist.push( Sq - 136 );
                    }
                    if( (row % 8) < 7 && BoardColors[Sq-120] != color) //piece one away from left side
                    {
                        movelist.push( Sq - 120 );
                    }
                }
            } //phew, that was rough... now to fix diagonals and rows/cols, that should be much simpler!

            break;
        // Bishop
        case 3:
            addDiagonals( square, 100 );
            break;
        // Rook
        case 4:
            addRowsAndColumns( square, 100 );
            break;
        // Queen
        case 5:
            addRowsAndColumns( square, 100 );
            addDiagonals( square, 100 );
            break;
        // King
        case 6:
            addRowsAndColumns( square, 1 );
            addDiagonals( square, 1 );
            break;
    }
    return square;
}

var PieceNames = ['Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Bishop', 'Knight', 'Rook'];

function Piece(){
    this.name = "";
    this.x = 0;
    this.z = 0;
    this.y = 0;
    this.row = -1;
    this.col = -1;
}

function placePieces() {

    for (var i = 0; i < 8; i++) {

        ServerPieceLocations[i].x = -24 * 3 + i * 24 - 12;
        ServerPieceLocations[i].z = 24 * 3 - 12;
        ServerPieceLocations[i].y = (boards - 1) * 80;
        ServerPieceLocations[i].name = "Piece-BlackPawn" + i;
        ServerPieceLocations[i].index = i;
        ServerPieceLocations[i].row = 6 + ((boards - 1) * 8);
        ServerPieceLocations[i].col = i;

        ServerPieceLocations[i + 8].x = -24 * 3 + i * 24 - 12;
        ServerPieceLocations[i + 8].z = 24 * 4 - 12;
        ServerPieceLocations[i + 8].y = (boards - 1) * 80;
        ServerPieceLocations[i + 8].name = "Piece-Black" + PieceNames[i] + (i + 8);
        ServerPieceLocations[i + 8].index = i + 8;
        ServerPieceLocations[i + 8].row = 7 + ((boards - 1) * 8);
        ServerPieceLocations[i + 8].col = i;

        ServerPieceLocations[i + 16].x = -24 * 3 + i * 24 - 12;
        ServerPieceLocations[i + 16].z = -24 * 2 - 12;
        ServerPieceLocations[i + 16].y = 0;
        ServerPieceLocations[i + 16].name = "Piece-WhitePawn" + (i + 16);
        ServerPieceLocations[i + 16].index = i + 16;
        ServerPieceLocations[i + 16].row = 1;
        ServerPieceLocations[i + 16].col = i;

        ServerPieceLocations[i + 24].x = -24 * 3 + i * 24 - 12;
        ServerPieceLocations[i + 24].z = -24 * 3 - 12;
        ServerPieceLocations[i + 24].y = 0;
        ServerPieceLocations[i + 24].name = "Piece-White" + PieceNames[i] + (i + 24);
        ServerPieceLocations[i + 24].index = i + 24;
        ServerPieceLocations[i + 24].row = 0;
        ServerPieceLocations[i + 24].col = i;
    }
}

function turnTaken(){
    if(currentTurn == 'White')
        currentTurn = 'Black';
    else
        currentTurn = 'White';
}

var newGame = function(){
    initchessgame();
    for(var i = 0; i < ServerPieceLocations.length; i++){
        ServerPieceLocations[i] = new Piece();
    }
    placePieces();
    currentTurn = 'White';
};

var pieceOriginByIndex = function(pieceIndex){
    var origin = ServerPieceLocations[pieceIndex].row * 8 + ServerPieceLocations[pieceIndex].col;
    return getlegalmoves(origin);
};

var getMoveList = function(){
    return JSON.stringify(movelist);
};

var getTurn = function(){
    return currentTurn;
};

var movePiece = function(piece){

    var movedPiece = getPieceByName(piece.name);
    var removeIndex = -1;
    var src = movedPiece.row * 8 + movedPiece.col;
    var dst = piece.row * 8 + piece.col;

    if(BoardPieces[dst] > 0){
        var removePiece = getPieceAtSquare(dst);

        removePiece.row = -1;
        removePiece.col = -1;

        removeIndex = removePiece.index;
    }

    BoardColors[dst] = BoardColors[src];
    BoardColors[src] = -1;
    BoardPieces[dst] = BoardPieces[src];
    BoardPieces[src] = 0;

    movedPiece.x = piece.x;
    movedPiece.z = piece.z;
    movedPiece.y = piece.y;
    movedPiece.row = piece.row;
    movedPiece.col = piece.col;

    turnTaken();

    if(removeIndex != -1)
        return ServerPieceLocations[removeIndex].name;
};

var setBoards = function(userBoards){
    boards = userBoards;
};

var getBoards = function(){
    return boards;
};

function getPieceAtSquare(square){
    var index;

    for(var i = 0; i < ServerPieceLocations.length; i++){
        var tile = ServerPieceLocations[i].row * 8 + ServerPieceLocations[i].col;
        if(square == tile){
            index = i;
            break;
        }
    }

    return ServerPieceLocations[index];
}

function getPieceByName(pieceName){
    var index;

    for (var i = 0; i < ServerPieceLocations.length; i++){
        if (ServerPieceLocations[i].name == pieceName){
            index = i;
            break;
        }
    }

    return ServerPieceLocations[index];
}

/*function removeSelfCheckMoves() {
    var threatenedLocations = [];
    for (var i = 0; i < ServerPieceLocations[index]);
}

function trackThreats(oppositeColor){
    //for each piece of oppositeColor
        //getLegalMoves(pieceSpace) store moves in array

    //each move is a threatened space

    //IF KING BEING MOVED, remove threatened spaces from legal moves before giving moves to client

    //IF OTHER PIECE BEING MOVED, for each possile move, simulate it and trackThreats
}

function checkIfCheck{
    //call this when a turn is taken
    //
}*/

module.exports.players = players;

module.exports.getBoards = getBoards;
module.exports.setBoards = setBoards;
module.exports.ServerPieceLocations = ServerPieceLocations;
module.exports.getMoveList = getMoveList;
module.exports.getTurn = getTurn;

module.exports.addPlayer = addPlayer;
module.exports.removePlayer = removePlayer;

module.exports.movePiece = movePiece;
module.exports.pieceOriginByIndex = pieceOriginByIndex;
module.exports.playerForId = playerForId;

module.exports.newGame = newGame;