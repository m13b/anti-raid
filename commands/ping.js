module.exports = {
    name: 'ping',
    description: 'Basic response check',
    execute(message, args){
        message.reply('Pong!')
    }
}