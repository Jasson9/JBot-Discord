const AudioPlayer = require("../lib/AudioPlayer.js");
module.exports = {
    name: 'join',
    description: 'join channel',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                AudioPlayer.join(interaction);
                await interaction.reply({content:"voice channel joined"});
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