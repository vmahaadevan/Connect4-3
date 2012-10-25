///////////////chat//////////////
var KEY = {
		ENTER : 13
	};


function getChat(){
    ajaxCall('get', {a:'chat',method:'getChat'}, getChatCallback);

    var $chat = $('#lobby-chat-box');
    $chat.scrollTop($chat[0].scrollHeight);
}

function getChatCallback(users){
    var names = users.map(function(u){ return u.name; });
    var strNames = "Users " + users.map(prop("name")).join(", ");
    //console.log(strNames);

    var h='';
    for(var i=0, l=users.length; i<l; i++){
        h+=users[i].name+' says: '+users[i].message+'<span style="color:gray"> at the time '+users[i].timeStamp+'</span><br/>';
    }

    $('#lobby-chat-box').html(h);
    setTimeout(getChat,1500);
}

function sendChat(msg){
	ajaxCall('get', {a:'chat',method:'setChat', data:msg}, setChatCallback);	
}

function setChatCallback(data){
	console.dir(data);	
}





function prop(name){
    return function(object){
        return object[name];
    };
}
