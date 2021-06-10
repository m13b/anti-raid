const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();

//initialize commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

//globals
var recentJoin = []
const {prefix, token} = config


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} in servers:`);
  client.guilds.cache.each(guild => {
    console.log(guild.name +" : " +guild.id)
  })

});

//new message handler
client.on('message', msg => {
  //Ignores messages not sent in guild/incorrect prefix/sent by bot
  if (!msg.guild || !msg.content.startsWith(prefix) || msg.author.bot) return

  const args = msg.content.slice(prefix.length).trim().split(/\s+|\n|\r/)
  const command = args.shift().toLowerCase()

  if (!client.commands.has(command)) return;

  try {
		client.commands.get(command).execute(msg, args);
	} catch (error) {
		console.log(error);
		msg.reply('Unable to execute command');
	}
});

//member join event handler
client.on('guildMemberAdd', member => {

  let date = member.user.createdAt
  let cd = `${date.getDate()}${date.getMonth()}${date.getFullYear()}`
  if(recentJoin.length <3){
    recentJoin.push({"id": member.id, "date": cd})
  }
  else{
    recentJoin.shift()
    recentJoin.push({"id": member.id, "date": cd})
  }

  console.log(recentJoin)

  if(recentJoin.length == 3){
    if(recentJoin[0].date == recentJoin[1].date == recentJoin[2].date){
      client.channels.fetch("309439259448967168").then(chan =>{
        chan.send(`3 users with the same create date have joined in succession. User IDs: \n ${recentJoin[0].id} \n${recentJoin[1].id} \n${recentJoin[2].id} \n Create date: ${date} <@&288153870801043458>`)
      }).catch(err =>{
        console.log("Unable to send to channel")
        console.log(err)
      })
    }
  }
})

client.login(token);