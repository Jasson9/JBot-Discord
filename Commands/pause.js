const AudioPlayer = require("../lib/AudioPlayer.js");

module.exports = {
    name: 'pause',
    type: 1,
    description: 'Pause music player',
    options:
        [
            {
                "name": "delay",
                "required": false,
                "description": "specify fade out delay",
                "type": 4
            }
        ],
    async execute(interaction, client) {
        if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
            try {
                AudioPlayer.pause();
                await interaction.reply({ content: `***Music Paused*** by ${interaction.member.user.username}` })
            } catch (error) {
                console.log(error);
                if(interaction.deferred||interaction.replied){
                    await interaction.editReply({ content: "An Error Occured", ephemeral: true });
                }else{
                    await interaction.reply({ content: "An Error Occured", ephemeral: true });
                }
            }
        }
    }
}