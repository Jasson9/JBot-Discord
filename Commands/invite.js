var link = "https://discord.com/api/oauth2/authorize?client_id=783386554366033960&permissions=2184186176&scope=bot"
var config = require("../Config.json")
module.exports={
    name: 'invite',
    description:'Give invitation link',
    async execute(interaction, client){
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            await interaction.reply({content:`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2184186176&scope=bot%20applications.commands`})
        }
    }
}