const info = require("./info.js")
module.exports={
    "name":"nowplaying",
    "description": `${info.description} (same command as /info)`,
    async execute(interaction,client){
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            info.execute(interaction,client);
        }

    }
}