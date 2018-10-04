//setup
const fs = require('fs');
const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();
var dispatcher = undefined;
const state = {
            queue: [],
            status: "av",
          }
var queueNames = [];
var tmp = "";
client.on('ready', () => {
    console.log('Ready!');
});

//login
client.login(token);// place your bot own token here, or import it from a config json




//command handler
//------------------------------------------------------------//
function playMusic(url, message){
  const opus = require('node-opus');
  const ytdl = require('ytdl-core');
  const streamOptions = { seek: 0, volume: 1 };
  const stream = ytdl(url, { filter : 'audioonly' });
  state.playing = url;
  state.status = "bs";
  try{
  dispatcher = message.guild.voiceConnection.playStream(stream, streamOptions);
  dispatcher.on("end", function(){
    state.status = "av";
    if(state.queue.length > 0) {
      state.queue.shift();
      playMusic(state.queue[0], message);
    }
  }
  )}
  catch(error){console.log(error)};

}

function queueMusic(url){
  state.queue.push(url);
}

function sortQueue(){
  queueNames = queueNames.sort((a,b) => a[0] - b[0]);
}

async function getName(url, index){
  const opus = require('node-opus');
  const ytdl = require('ytdl-core');
  const streamOptions = { seek: 0, volume: 1 };
  const stream = ytdl(url, { filter : 'audioonly' });
  response = await ytdl.getInfo(url);
  queueNames.push([index,`${response.title} \n`]);
}



client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  try{
//////////////////////////////////////////////////////////////////////////////
    if(commandName == "play"){
      const channel = message.member.voiceChannel;

      channel.join()
      .then(connection => console.log('Connected!'))
      .catch(error => console.log(error));
      if(state.status == "av") {
        queueMusic(args[0]);
        playMusic(args[0], message)
      }
      else if(state.status == "bs"){
        queueMusic(args[0]);
        console.log("added to the queue");
      }

    }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "skip")
        dispatcher.end();
//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "stop"){
        state.queue = [];
        state.status = "av";
        dispatcher.end();
    }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "disconnect"){
      const channel = message.member.voiceChannel;

      channel.leave()
    }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "queue"){
      try{
        queue = state.queue;
        queueNames = [];
        tmp = "";
        responses = [];
        if(state.status != "av" && queue.length > 0)for (i = 0; i < queue.length; i+=1){
          responses.push(getName(queue[i], i));
        }
        Promise.all(responses)
        .then(r => {sortQueue();})
        .then(r => {
          queueNames.map((a) => {
            if(a[0] == 0) tmp += `Playing right now: ${a[1]}`;
            else tmp += `${a[0]} in the queue - ${a[1]}`
          })
        })
        .then(r => {message.channel.send(tmp)})//next then
    }
    catch(error){ console.log(error)}
    }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "pause"){
      dispatcher.pause();
      console.log(dispatcher.paused)
    }
    else if(commandName == "resume"){
      dispatcher.resume();
    }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "desbugar"){
      const channel = message.member.voiceChannel;

      channel.join()
      .then(connection => console.log('Connected!'))
      .catch(error => console.log(error));
      channel.leave()
      channel.join()
      .then(connection => console.log('Connected!'))
      .catch(error => console.log(error));
      state.queue = [];
      state.status = "av";
      if(dispatcher != undefined)dispatcher.end();
    }

//////////////////////////////////////////////////////////////////////////////
    else if(commandName == "join"){
      const channel = message.member.voiceChannel;

      channel.join()
      .then(connection => console.log('Connected!'))
      .catch(error => console.log(error));
    }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName =="kick"){
    const taggedUser = message.mentions.users.first();

    message.channel.send(`You wanted to kick: ${taggedUser.username}`);
  }
//////////////////////////////////////////////////////////////////////////////
    else if(commandName =="help"){
      finalmessage = "";
      comandos = ["!play [url*] - toca a musica da url, ou adiciona a mesma na fila",
      "!queue - exibe uma mensagem no canal falando as filas que estão no mesmo",
      "!desbugar - tenta desbugar o bot",
      "!join - o bot entra no canal atual",
      "!disconnect - o bot sai do canal atual",
      "!pause - pausa a musica atual",
      "!resume - resume a musica pausada",
      "!skip - pula a musica atual",
      "!stop - para a musica e limpa a fila"]
      for(let mensagem of comandos){
        finalmessage += `${mensagem}\n`
      }
      message.author.send(finalmessage);
    }
  }
//////////////////////////////////////////////////////////////////////////////
  catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
  }
  //
  // if (!client.commands.has(commandName)) return;
  // const command = client.commands.get(commandName);
  // if(command.args && !args.length)  message.channel.send(`You didn't provide any arguments, ${message.author}!`);
  // try {
  //     command.execute(message, args);
  // }
  // catch (error) {
  //     console.error(error);
  //     message.reply('there was an error trying to execute that command!');
  // }
});

client.on("guildMemberAdd", member => {
    let guild = member.guild;
    guild.defaultChannel.sendMessage(`Welcome ${member.user} to our Discord Server.  Type !help to get access to our informations.`).catch(console.error);
  });
