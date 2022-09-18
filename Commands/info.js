const AudioPlayer = require("../lib/AudioPlayer.js");

module.exports = {
    name: 'info',
    description:'get currently played music info',
    async execute(interaction, client){
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            try {
                await interaction.deferReply();
                if(AudioPlayer.guilds[interaction.guildId].playlist.songs[0]){
                    await AudioPlayer.sendplayback({Interaction:interaction,withElapsed:true});
                }else{
                    await interaction.editReply("No song currently playing")
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