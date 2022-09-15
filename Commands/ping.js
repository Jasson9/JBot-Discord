module.exports = {
    name: 'ping',
    description: 'ping the bot to check bot response delay',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                var InteractionTime = interaction.createdTimestamp;
                await interaction.reply({ content: 'pinging', ephemeral: true }).then(async function (res) {
                    var PostInteractionTime = Date.now();
                    await interaction.editReply({ content: `the ping is : ${PostInteractionTime - InteractionTime}ms`, ephemeral: true });
                })
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