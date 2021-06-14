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
    //adds guild to recentJoin array for user join tracking
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

  //finds server specific recentJoin array
  const recent_obj = recentJoin.find(element => element.id == gid)

  //gets server specific details to send notifications
  const notif_obj = notifications.find(element => element.server_id == gid)

  //pushes new member details object to guild specific array. Removes first object in array if length = 3
  if(recent_obj.uids.length == 3){
    recent_obj.uids.shift()
  }
  
  recent_obj.uids.push({"id": member.id, "date": cd})
  
  
  //Checks if recent 3 joins have the same create date. If date is same, mentions Mod role and provides UIDs + date.
  if(recent_obj.uids.length == 3){
    if(recent_obj.uids[0].date == recent_obj.uids[1].date && recent_obj.uids[0].date == recent_obj.uids[2].date && recent_obj.uids[0].id != recent_obj.uids[2].id){
      client.channels.fetch(notif_obj.channel_id).then(chan =>{
        //Note: notification can mention role ID only. No user IDs atm
        chan.send(`3 users with the same create date have joined in succession. \nUser IDs: \n${recent_obj.uids[0].id} \n${recent_obj.uids[1].id} \n${recent_obj.uids[2].id} \nCreate date: ${date} <@&${notif_obj.role_id}>`)
      }).catch(err =>{
        console.log("Unable to send to channel")
        console.log(err)
      })
    }
  }

  console.log(recent_obj.uids)
})

client.login(token);