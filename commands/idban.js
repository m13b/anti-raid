module.exports = {
    name: 'idban',
    description: 'Bans 1 or more users en masse',
    execute(msg, args){
      //check for message author ban permissions
      if (msg.guild.member(msg.author).hasPermission('BAN_MEMBERS')){

        //filters args that aren't IDs
        let idarray = args.filter(param => {
          return param > 10000000000000000 && param < 999999999999999999
        })
        
        //array for holding results
        let resultsarray=[]

        idarray.forEach(userid => {

          //ban function
          msg.guild.members.ban(userid).then(user => {
            resultsarray.push(`\n Success: ${userid}`)

            //if last ID, send message indidicating results
            if(userid == idarray[(idarray.length)-1]){
              msg.channel.send(`Ban results: \n ${resultsarray}`, {split: true}).then(() =>{
                console.log("Successfully sent results")
              }).catch(err =>{
                console.log("Unable to send results")
                console.log(err)
              })
            }
          }).catch(err =>{
            resultsarray.push(`\n Failure: ${userid}`)
            console.log(err)
            if(userid == idarray[(idarray.length)-1]){
              msg.channel.send(`Ban results: \n ${resultsarray}`, {split: true}).then(() =>{
                console.log("Successfully sent results")
              }).catch(err =>{
                console.log("Unable to send results")
                console.log(err)
              })
            }
          })
        })
      }
    }
}