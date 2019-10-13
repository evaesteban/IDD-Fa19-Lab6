/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
var language;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.
    socket.emit('changeBG','purple');
    socket.emit('changeFont', 'white');
    socket.emit('answer', "Hi! Thank you for taking the survey!"); //We start with the introduction;
    setTimeout(timedQuestion, 10000, socket, "How are you today?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    question = 'Do you prefer Spanish or English?';
  } else if(questionNum == 1){
    language = input.toLowerCase();
    if(language == 'english'){
    answer = 'Bear with me, this will only take a minute!'; // output response
    } else if(language == 'spanish'){
    answer = '¡No se preocupe, la encuesta solo durará un minuto!';
    }
    waitTime = 3000;
    if(language == 'english'){
    question = 'How did you find the tour?'; // load next question
    } else if(language == 'spanish'){
     question = '¿Qué le parecio el tour?';
    }
    } else if (questionNum == 2) {
    if(language == 'english'){
    question = 'Why did you find the tour ' + input + '?'; // load next question
    } else{
    question = '¿Por qué le pareció el tour ' + input + '?';
    } 
    } else if (questionNum == 3) {
    if(language == 'english'){
    answer = 'I see what you mean...';
    } else{
    answer = 'Entiendo...';
    }
    waitTime = 3000;
    if(language == 'english'){
    question = 'And what was your favourite part?';
    } else{
    question = '¿Y cuál fue su parte favorita?';
    }
    } else if (questionNum == 4){
    if(language == 'english'){
    answer = 'Oh, '+ input + ' was my favourite too!';
    } else{
    answer = '¡Ay, ' + input + ' fue mi parte favorita también!';
    }
    waitTime = 5000;
    if(language == 'english'){
    question = 'Last question...would you recommend this tour to your friends?';
    }
    else{
    question = 'Última pregunta...recomendaría este tour a sus amigos?';
    }
} else {
    if(language == 'english'){
    answer = 'Great, that is all I needed, thank you!'; // output response
    } else{
    answer = '¡Gracias, eso es todo lo que necesitaba!';
    }
    waitTime = 0;
    question = '';
  }

  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }
}
//----------------------------------------------------------------------------//
