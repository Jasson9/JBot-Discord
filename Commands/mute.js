var AudioPlayer = require("../lib/AudioPlayer");
module.exports = {
    name: 'mute',
    description: 'Mute music player',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                if(!AudioPlayer.guilds[interaction.guildId].muted){
                    AudioPlayer.setvolume(AudioPlayer.guilds[interaction.guildId]?.volume,interaction,true);
                    await interaction.reply("Music player muted")
                }else{
                    AudioPlayer.setvolume(AudioPlayer.guilds[interaction.guildId]?.volume,interaction,false);
                    await interaction.reply("Music player unmuted")
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