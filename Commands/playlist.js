const AudioPlayer = require("../lib/AudioPlayer.js");

module.exports = {
    name: 'playlist',
    type: 1,
    description: 'Show playlist',
    options: [{
        "name": "remove",
        "require": false,
        "description": "remove song at number",
        "type": 4
    }],
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
                await interaction.deferReply();
                var number = interaction.options.getInteger("remove");

                if (number > 0 && number != undefined) {
                    if (number == 1) {
                        await interaction.editReply({ content: "cannot remove currently played song, use skip instead" });
                    } else {
                        var music = AudioPlayer.playlist[number - 1];
                        AudioPlayer.playlist.splice(number - 1, 1);
                        await interaction.editReply({ content: `successfuly remove ${music.title}` })
                    }
                }
                var message = [];
                for (var i = 0; i < AudioPlayer.playlist.length; i++) {
                    message.push(`${i + 1}. ${AudioPlayer.playlist[i].title} (${AudioPlayer.playlist[i].username})`);
                }
                if (message.length > 20) {
                    await interaction.editReply({ content: `Playlist ${AudioPlayer.playlist.length} song/s:` });
                    var pages = Math.floor(message.length / 20);
                    for (var t = 0; t < pages; t++) {
                        await interaction.followUp({ content: message.splice(0, 20).join("\n") });
                    }
                    await interaction.followUp({ content: message.join("\n") });
                } else {
                    await interaction.editReply({ content: `Playlist ${AudioPlayer.playlist.length} song/s:\n${message.join("\n")}` })
                }
            }
        } catch (error) {
            console.log(error);
            await interaction.editReply({ content: "An Error Occured", ephemeral: true });
        }

    }
}