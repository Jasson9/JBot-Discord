module.exports = {
    name: 'about',
    description: 'About This Bot',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                interaction.reply({ content: "This bot is created by Jasson9 \n\nCheck out his Github: https://github.com/Jasson9", ephemeral: true });
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