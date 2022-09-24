const AudioPlayer = require("../lib/AudioPlayer.js");
const config = require("../Config.json");
module.exports = {
    name: 'volume',
    type: 1,
    description: 'set volume of music player!',
    options: [{
        "name": "volume",
        "required": true,
        "description": "specify the volume from scale 0(mute) to 100",
        "type": 4
    }],
    async execute(interaction, client){
        if(interaction.isChatInputCommand() && interaction.commandName === this.name){
            try {
                var volume = interaction.options?.getInteger("volume") || AudioPlayer.guilds[interaction.guildId]?.volume || config.def_volume;
                var resvolume = AudioPlayer.setvolume(volume,interaction,false);
                await interaction.reply(`Volume: ${resvolume}`)
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