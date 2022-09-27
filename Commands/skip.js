const AudioPlayer = require("../lib/AudioPlayer.js")

module.exports = {
    name: 'skip',
    type: 1,
    description: 'skip current song',
    options: [{
        "name": "tonumber",
        "required": false,
        "description": "skip to specified number in playlist",
        "type": 4
    }],
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                var index = interaction.options?.getInteger("tonumber");
                var res = await AudioPlayer.skip(interaction,index);
                if(res){
                    await interaction.reply({content:res});
                }
            }
        } catch (error) {
            console.log(error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: "An Error Occured", ephemeral: false });
            } else {
                await interaction.reply({ content: "An Error Occured", ephemeral: false });
            }
        }
    }
}