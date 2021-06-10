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
let recentJoin = []
const {prefix, token, notifications} = config


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} in servers:`);
  client.guilds.cache.each(guild => {
    console.log(guild.name +" : " +guild.id)
    recentJoin.push({'id': guild.id, 'uids': uids=[]})
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

  
  const date = member.user.createdAt
  const cd = `${date.getDate()}${date.getMonth()}${date.getFullYear()}`
  const gid = member.guild.id

  //finds array specific to guild join in recentJoins
  const position = recentJoin.findIndex(element => element.id == gid)

  //gets details to send notifications
  const notif_pos = notifications.findIndex(element => element.server_id = gid)

  const notification_channel = notifications[notif_pos].channel_id
  const notification_role = notifications[notif_pos].role_id

  //pushes new member details object to guild specific array. Removes first object in array if length = 3
  if(recentJoin[position].uids.length <3){
    recentJoin[position].uids.push({"id": member.id, "date": cd})
  }
  else{
    recentJoin[position].uids.shift()
    recentJoin[position].uids.push({"id": member.id, "date": cd})
  }

  console.log(recentJoin[position])
  
  //Checks if recent 3 joins have the same create date. If date is same, mentions Mod role and provides UIDs + date.
  if(recentJoin[position].uids.length == 3){
    if(recentJoin[position].uids[0].date == recentJoin[position].uids[1].date == recentJoin[position].uids[2].date){
      client.channels.fetch(notification_channel).then(chan =>{
        chan.send(`3 users with the same create date have joined in succession. User IDs: \n ${recentJoin[position].uids[0].id} \n${recentJoin[position].uids[1].id} \n${recentJoin[position].uids[2].id} \n Create date: ${date} <@&${notification_role}>`)
      }).catch(err =>{
        console.log("Unable to send to channel")
        console.log(err)
      })
    }
  }
})

client.login(token);