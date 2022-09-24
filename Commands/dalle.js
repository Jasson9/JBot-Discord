const Craiyon = require('../lib/Craiyon.js');
module.exports = {
    name: 'dalle',
    type: 1,
    description: 'Generate image base on title (using Craiyon)!',
    options: [{
        "name": "text",
        "required": true,
        "description": "The text for Title",
        "type": 3
    }, {
        "name": "amount",
        "required": false,
        "description": "specify how many images you want to generate(max 9)",
        "type": 4
    }],
    async execute(interaction, client) {
        if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
            try {
                var starttimer = Date.now();
                var text = interaction.options.getString('text');
                var amount = interaction.options.getInteger('amount') || 9;
                if (amount > 9 || amount < 1) {
                    await interaction.reply({ content: "Amount must be between 1 to 9", ephemeral: true });
                    return;
                }
                await interaction.reply({ content: "Processing... This may take up to 2 minutes", ephemeral: true });
                var images = await Craiyon.GenerateImage(text);
                var payload = [];
                for (var i = 0; i < amount; i++) {
                    payload.push({ "attachment": images[i] })
                }
                var endtimer = Date.now();
                await interaction.editReply({ content: `Done, Time Elapsed : ${(endtimer - starttimer) / 1000} seconds`, ephemeral: true });
                await interaction.followUp({ content: `${text} \n\nby <@${interaction.member.id}>`, files: payload, ephemeral: false });
            } catch (error) {
                console.log(error);
                if(interaction.deferred||interaction.replied){
                    await interaction.editReply({ content: "An Error Occured", ephemeral: false });
                }else{
                    await interaction.reply({ content: "An Error Occured", ephemeral: false });
                }
            }
        }
    }
}