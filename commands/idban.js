module.exports = {
    name: 'idban',
    description: 'Bans 1 or more users en masse',
    execute(msg, args){
        //check for message author ban permissions
    if (msg.guild.member(msg.author).hasPermission('BAN_MEMBERS')){

      //gets delimited params from command
      let idarray = args.filter(param => {
        return param > 10000000000000000 && param < 999999999999999999
      })
      //parse through array of IDs 
      
      idarray.forEach(userid => {
        resultsarray=[]

        //ban function
        msg.guild.members.ban(userid).then(user => {
          resultsarray.push("Success: " +userid +"\n")
          if(userid == idarray[(idarray.length)-1]){
            msg.channel.send("Ban results: \n" +resultsarray, {split: true}).then(msg =>{
              console.log("Successfully sent results")
            }).catch(err =>{
              console.log("Unable to send results")
              console.log(err)
            })
          }
        }).catch(err =>{
          resultsarray.push("Failure: " +userid +"\n")
          if(userid == idarray[(idarray.length)-1]){
            msg.channel.send("Ban results: \n" +resultsarray, {split: true}).then(msg =>{
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