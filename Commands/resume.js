const AudioPlayer = require("../lib/AudioPlayer.js");

module.exports = {
    name: 'resume',
    type: 1,
    description: 'resume music player',
    options:
        [
            {
                "name": "delay",
                "required": false,
                "description": "specify resume delay",
                "type": 4
            }
        ],
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                try {
                    var delay = interaction.options.getInteger("delay");
                    AudioPlayer.resume(interaction,delay);
                    await interaction.reply({ content: "Music Resumed" })
                } catch (error) {
                    console.log(error);
                    await interaction.editReply({ content: "An Error Occured", ephemeral: false });
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