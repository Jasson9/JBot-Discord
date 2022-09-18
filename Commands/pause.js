const AudioPlayer = require("../lib/AudioPlayer.js");
const {AudioPlayerStatus} = require("@discordjs/voice");
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
                if(AudioPlayer.guilds[interaction.guildId]?.audioplayer?.state.status==AudioPlayerStatus.Paused||AudioPlayer.guilds[interaction.guildId]?.audioplayer?.state.status==AudioPlayerStatus.AutoPaused){
                    AudioPlayer.resume(interaction);
                    await interaction.reply({ content: `***Music Resumed***`})
                }else{
                    if(AudioPlayer.guilds[interaction.guildId]?.audioplayer?.state.status==AudioPlayerStatus.Buffering||AudioPlayer.guilds[interaction.guildId]?.audioplayer?.state.status==AudioPlayerStatus.Playing){
                        AudioPlayer.pause(interaction);
                        await interaction.reply({ content: `***Music Paused***`})
                    }
                }

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