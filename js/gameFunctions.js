var xhtmlns = "http://www.w3.org/1999/xhtml";
var svgns = "http://www.w3.org/2000/svg";
var BOARDX = 50;				//starting pos of board
var BOARDY = 50;				//look above
var boardArr = [];		//2d array [row][col]
var pieceArr = [];		//2d array [player][piece] (player is either 0 or 1)
var BOARDWIDTH = 8;				//how many squares across
var BOARDHEIGHT = 8;			//how many squares down
//the problem of dragging....
var myX;						//hold my last pos.
var myY;						//hold my last pos.
var mover='';					//hold the id of the thing I'm moving
var turn;						//hold whose turn it is (0 or 1)
var svg = $('svg');

function gameInit(){
	//create a parent to stick board in...
	var gEle=document.createElementNS(svgns,'g');
	gEle.setAttributeNS(null,'transform','translate('+BOARDX+','+BOARDY+')');
	gEle.setAttributeNS(null,'id','game_'+gameId);
	//stick g on board
	document.getElementsByTagName('svg')[0].insertBefore(gEle,document.getElementsByTagName('svg')[0].childNodes[5]);
	//create the board...
	//var x = new Cell(document.getElementById('someIDsetByTheServer'),'cell_00',75,0,0);
	for(var i=0;i<BOARDWIDTH;i++){
		boardArr[i]=[];
		for(var j=0;j<BOARDHEIGHT;j++){
			boardArr[i][j]=new Cell(document.getElementById('game_'+gameId),'cell_'+j+i,60,j,i);
		}
	}
	
	//new Piece(board,player,cellRow,cellCol,type,num)
	//create red
	pieceArr[0]=[];
	var idCount=0;
	for(var i=0;i<8;i++){
		for(var j=0;j<3;j++){
				pieceArr[0][idCount]=new Piece('game_'+gameId,0,570,250,'Checker',idCount);
				idCount++;
		}
	}
				
	//create green
	pieceArr[1]=[];
    var idCount=0
	for(var i=0;i<8;i++){
		for(var j=5;j<8;j++){
				pieceArr[1][idCount]=new Piece('game_'+gameId,1,570,310,'Checker',idCount);
				idCount++;
		}
	}

	//put the drop code on the document...
	document.getElementsByTagName('svg')[0].addEventListener('mouseup',releaseMove,false);
	//put the go() method on the svg doc.
	document.getElementsByTagName('svg')[0].addEventListener('mousemove',go,false);
	//put the player in the text
	document.getElementById('youPlayer').firstChild.data+=player;
	document.getElementById('opponentPlayer').firstChild.data+=player2;
	
	//set the colors of whose turn it is
	if (turn==playerId){
		document.getElementById('youPlayer').setAttributeNS(null,'fill',"orange");
		document.getElementById('opponentPlayer').setAttributeNS(null,'fill',"black");
	} else {
		document.getElementById('youPlayer').setAttributeNS(null,'fill',"black");
		document.getElementById('opponentPlayer').setAttributeNS(null,'fill',"orange");
	}
	
	checkTurnAjax('checkTurn',gameId);
}
			
///////////////////////Dragging code/////////////////////////


////setMove/////
//	set the id of the thing I'm moving...
////////////////
function setMove(which){		
	mover = which;
	//get the last position of the thing... (NOW through the transform=translate(x,y))
	var xy = getTransform(which);

  //  console.log(which);

	myX = xy[0];
	myY = xy[1];
	//get the object then re-append it to the document so it is on top!
	getPiece(which).putOnTop(which);
}
			
			
////releaseMove/////
//	clear the id of the thing I'm moving...
////////////////
function releaseMove(evt){
	//alert(evt);
	//check hit (need the current coords)
	// get the x and y of the mouse
	if (mover !== ''){
		//is it YOUR turn?

		if(turn == playerId){
            var mouseX = (evt.clientX  -= svg.position().left);
            var mouseY = (evt.clientY  -= svg.position().top);

			var hit = checkHit(mouseX, mouseY, mover);
		} else {
			var hit = false;
			nytwarning();
		}

		if (hit==true) {
			//I'm on the square...
			//send the move to the server!!!
		} else {
			//move back
			setTransform(mover,myX,myY);
		}
		mover = '';	
	}
}
			
			
////go/////
//	move the thing I'm moving...
////////////////
function go(evt){
    var mouseX = (evt.clientX  -= svg.position().left);
    var mouseY = (evt.clientY  -= svg.position().top);

   // console.log('go: mouseX->' + mouseX + ' mouseY->' + mouseY);

    if (mover != '') {
		setTransform(mover,mouseX,mouseY);
	}
}
			
////checkHit/////
//	did I land on anything important...
////////////////
function checkHit(x,y,which){
    //console.log('checkHit:  x->' + x + 'y->' + y);

	//lets change the x and y coords (mouse) to match the transform
	x = x - BOARDX;
	y = y - BOARDY;

    //console.log('checkHit: x->' + x + ' y->' + y);

	//go through ALL of the board
	for(var i=0;i<BOARDWIDTH;i++){
		for(var j=0;j<BOARDHEIGHT;j++){
			var drop = boardArr[i][j].myBBox;

			if (x>drop.x && x<(drop.x+drop.width) && y>drop.y && y<(drop.y+drop.height) && boardArr[i][j].droppable && boardArr[i][j].occupied == ''){
               // console.dir('drop ' + drop);
				//NEED - check is it a legal move???
				//if it is - then
				//put me to the center....

                for (var f=7; f>=0; f--){
                    if (boardArr[f][j].occupied == '') {
                        console.dir(boardArr[f][j]);

                        setTransform(which, boardArr[f][j].getCenterX(),boardArr[f][j].getCenterY());
                        getPiece(which).changeCell(boardArr[f][j].id,f,j);

                        //fill the new cell
                        console.log(parseInt(which.substring((which.search(/\|/)+1),which.length)));

                        //change other's board
                        changeBoardAjax(which, f, j, 'changeBoard', gameId);

                        break;
                    }
                }

				//change who's turn it is
				changeTurn();
				return true;
			}
		}	
	}
	return false;
}

///////////////////////////////Utilities////////////////////////////////////////
////get Piece/////
//	get the piece (object) from the id and return it...
////////////////
function getPiece(which){
	return pieceArr[parseInt(which.substr((which.search(/\_/)+1),1))][parseInt(which.substring((which.search(/\|/)+1),which.length))];
}
			
////get Transform/////
//	look at the id of the piece sent in and work on it's transform
////////////////
function getTransform(which){
	var hold=document.getElementById(which).getAttributeNS(null,'transform');
	var retVal=[];
	retVal[0]=hold.substring((hold.search(/\(/) + 1),hold.search(/,/)); //x value
	retVal[1]=hold.substring((hold.search(/,/) + 1),hold.search(/\)/)); //y value

    console.log('getTransform:  ' + retVal);
	return retVal;
}
			
////set Transform/////
//	look at the id, x, y of the piece sent in and set it's translate
////////////////
function setTransform(which,x,y){
   // console.log('setTransform:  ' + which + ' x: ' + x +' y: ' +y);
	document.getElementById(which).setAttributeNS(null,'transform','translate('+x+','+y+')');
}

////change turn////
//	change who's turn it is
//////////////////
function changeTurn(){
	//locally
	//turn = Math.abs(turn-1);
	//how about for the server (and other player)?
	//send JSON message to server, have both clients monitor server to know who's turn it is...
	document.getElementById('output2').firstChild.data='playerId '+playerId+ ' turn '+turn;
	changeServerTurnAjax('changeTurn',gameId);
}


/////////////////////////////////Messages to user/////////////////////////////////
////nytwarning (not your turn)/////
//	tell player it isn't his turn!
////////////////
function nytwarning(){
	if(document.getElementById('nyt').getAttributeNS(null,'display') == 'none'){
		document.getElementById('nyt').setAttributeNS(null,'display','inline');
		setTimeout('nytwarning()',2000);
	}else{
		document.getElementById('nyt').setAttributeNS(null,'display','none');
	}
}

////nypwarning (not your piece)/////
//	tell player it isn't his piece!
////////////////
function nypwarning(){
	if (document.getElementById('nyp').getAttributeNS(null,'display') == 'none'){
		document.getElementById('nyp').setAttributeNS(null,'display','inline');
		setTimeout('nypwarning()',2000);
	}else{
		document.getElementById('nyp').setAttributeNS(null,'display','none');
	}
}

