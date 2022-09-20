module.exports={
    name: 'help',
    description:'Show help message',
    async execute(interaction, client){
        console.log(interaction.commandName)
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            await interaction.reply({content:"this is help message"})
        }
    }
}