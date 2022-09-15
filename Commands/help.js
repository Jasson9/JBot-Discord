module.exports={
    name: 'help',
    description:'Show help message',
    async execute(interaction, client){
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            
        }
    }
}