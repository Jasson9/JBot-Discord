const info = require("./info.js")
module.exports={
    "name":"nowplaying",
    "description": `${info.description} (same command as /info)`,
    async execute(interaction,client){
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            interaction.commandName = "info";
            await info.execute(interaction,client);
        }
    }
}