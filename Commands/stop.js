const AudioPlayer = require("../lib/AudioPlayer.js")
module.exports = {
    name: 'stop',
    description: 'stop music player',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                AudioPlayer.destroy();
                await interaction.reply({content:"player stopped!"});
            }
        } catch (error) {
            console.log(error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: "An Error Occured", ephemeral: true });
            } else {
                await interaction.reply({ content: "An Error Occured", ephemeral: true });
            }
        }

    }

}