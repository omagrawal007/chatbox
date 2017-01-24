// module.exports = require('./lib/express');
var express=require('./lib/express');
var app =express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var mysql = require('mysql');
var bodyParser = require('body-parser')


/* database connection with my sql code start here*/

// connection.connect();


function BD()
{

		var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database:'chat_app'
});
		return connection;

}

function commanfunction(data)
{

	var dataReturn={};
	if(data.status_code==200)
	{
		dataReturn={"status_code":200,"msg":"data not found"}
	}
	else
	{
		dataReturn={"status_code":data.status_code,"msg":"data  found","data":data.data};

	}
	return dataReturn;
}
/* database connection with mysql code end here*/

// this function use for close database connection from server side application

//connection.end()
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(bodyParser.json());


app.post('/chatList',function(req,res){
	var connection=BD();

	

	connection.query("select * from login",function(index,rows){
		var getClientData={};
		if(rows.length>0)
		{			
				clientdata={"status_code":201,"data":rows}
				getClientData=commanfunction(clientdata);
		}
		else
		{
				clientdata={"status_code":200}
				getClientData=commanfunction(clientdata);

		}
		res.json(getClientData);



	});



});


app.post('/groupCreate',function(req,res){

	var connection=BD();
	var getList={};
	connection.query("select * from chat_link where (from_chat='"+req.body.from_user+"' and to_chat='"+req.body.to_user+"') or  (from_chat='"+req.body.to_user+"' and to_chat='"+req.body.from_user+"')",function(index,rows){
		if(rows.length>0)
		{

			getList={"from_chat":rows[0].from_chat,"to_chat":rows[0].to_chat,"room_id":rows[0].room_id};
			res.json(getList);
		}
		else
		{
					var ramdomnumber=Math.floor((Math.random() * 10) + 1);
					var roomNumber="room"+ramdomnumber;
   				    connection.query("insert into chat_link(from_chat,to_chat,room_id) values('"+req.body.from_user+"','"+req.body.to_user+"','"+roomNumber+"')",function(err){
   					    	getList={"from_chat":req.body.from_user,"to_chat":req.body.to_user,"room_id":roomNumber};
   					    	res.json(getList);
   				    });
		}



	})
	





})

app.post('/singup',function(req,res){
	var connection=BD();

	var getClientData={};
	var clientdata={};
	
	connection.query("select * from  login where email='"+req.body.email+"'",function(inde,mainrows){


		// console.log(mainrows);
		/*  insert data code start here*/
		if(mainrows.length<=0)
		{
				
				
		 connection.query("insert into login(f_name,l_name,email,password,contact_number) values('"+req.body.first_name+"','"+req.body.last_name+"','"+req.body.email+"','"+req.body.password+"','"+req.body.contact+"')",function(erro){
		
		
			if(erro)
			{
				clientdata={"status_code":200}
				getClientData=commanfunction(clientdata);

			}
			else
			{

				clientdata={"status_code":201,"data":"found"}
				getClientData=	commanfunction(clientdata);

			}
			res.json(getClientData);

	});

		}
		else
		{



			clientdata={"status_code":202,"data":"already exists"};
				getClientData=	commanfunction(clientdata);


		res.json(getClientData);

		}


		




		/* insert data code end here*/





	});

	






});
app.post('/login',function(req,res){
	
	// console.log(req)
	var connection=BD();
	// console.log("select * from login where email where email='"+req.body.userName+"' and email='"+req.body.userName+"'");
	connection.query("select * from login  where email='"+req.body.userName+"' and password='"+req.body.password+"' limit 0,1",function(index,rows){
			
		
		var clientdata={};
       if(rows.length<=0)
       {       			
       			clientdata={"status_code":200};
				getClientData=commanfunction(clientdata);

       }
       else
       {       			
				clientdata={"status_code":201,"data":rows};
				getClientData=	commanfunction(clientdata);

       }
    		res.json(getClientData);

	})
});


app.post('/chatRoom',function(req,res){

	// console.log(req.body.room_id);

	io.on('connection', function(socket){

		socket.join(req.body.room_id);

	  socket.on('chat', function(msg){
	  	console.log("start");
	    // io.to(req.body.room_id).emit('some event');

	  });






	});




	

});


/* get room chat information code start here*/
function chatInfo(room_name,CallBackFunction){
	var getDbConnection=BD();
	getDbConnection.query("select * from message_contact where room_id='"+room_name+"'",function(index,rows){
		CallBackFunction(rows);
	});
}
/* get room chat information code end here*/
io.on('connection', function(socket){
	socket.on('newconnect',function(getroom){


			socket.join(getroom.room_id);
			chatInfo(getroom.room_id,function(responseResult){
				socket.emit("FirstChatTransfer",responseResult);
			});

			io.to(getroom.room_id).emit('varify',"tested successfull");		
	});
  socket.on('chat', function(msg){	  
  	var room = io.sockets.adapter.rooms[msg.room];
  	socket.in(msg.room).emit('recieve', msg.chatMsg);    
  });


  socket.on('chatDataSend',function(chatInformation){
  	var connection1=BD();
  	connection1.query("insert into message_contact(room_id,sender_id,message) values('"+chatInformation.room+"','"+chatInformation.user_id+"','"+chatInformation.chatMsg+"')",function(erro){
		if(erro)
			{
				clientdata={"status_code":200}
				getClientData=commanfunction(clientdata);

			}
			else
			{
				clientdata={"status_code":201,"data":"found"}
				getClientData=	commanfunction(clientdata);
			}
			getClientData=JSON.stringify(getClientData);
			socket.in(chatInformation.room).emit('successRecieve',chatInformation.chatMsg); 
  	});






  })


});

http.listen(3000, function(){
  console.log('listening on *:3000');
});