const AudioPlayer = require("../lib/AudioPlayer.js");

module.exports = {
    name: 'play',
    type: 1,
    description: 'play youtube video or music',
    options: [{
        "name": "keyword-or-link",
        "required": true,
        "description": "keyword or youtube watch or playlist url!",
        "type": 3
    }],
    altdesc: "",
    async execute(interaction, client) {
        if ((interaction.isChatInputCommand() && interaction.commandName === this.name)||interaction.fromSearch) {
            //console.log(interaction)
            try {
                // console.log("play")
                var input = interaction.options.getString("keyword-or-link");
                var volume = interaction.options.getInteger("volume");
                var channelId = interaction.channelId
                var channel = await client.channels.fetch(channelId);
                // console.log(interaction.fromSearch)
                if (!interaction.fromSearch) {
                    await interaction.deferReply();
                }
                //check for voice channel and join
                if(interaction.member.voice.channel==null){
                    await interaction.editReply({content:"Join a voice channel first"});
                    return
                }
                if (!AudioPlayer.connection) AudioPlayer.join(interaction);
                if (!input && AudioPlayer.guilds[interaction.guildId][0]) {
                    AudioPlayer.resume(interaction);
                    await interaction.editReply({content:"***Music resumed***"});
                } else {
                    //add to playlist
                    //console.log(AudioPlayer.guilds[interaction.guildId].audioplayer.state.status);

                    if(!AudioPlayer.guilds[interaction.guildId].audioplayer)AudioPlayer.guilds[interaction.guildId].createAudioPlayer();
                    if (AudioPlayer.guilds[interaction.guildId].songs?.length >= 1) {
                        var song = await AudioPlayer.InputSong(input, channel, interaction.member.user.username, interaction)
                        .catch(async err=>{
                            console.log(err);
                            //await interaction.editReply({content:err});
                            return
                        });
                        //send reply for adding to playlist
                        if(song!=null){
                            await interaction.editReply({
                                content:`***${song.title}*** - ${Math.floor(song.duration/60)}.${(song.duration%60).toLocaleString("en-US",{minimumIntegerDigits:2,useGrouping:false})} has been added to the playlist by ${song.username}\n total song in playlist: ${AudioPlayer.guilds[interaction.guildId].songs.length}`
                            })
                        }
                    }else{
                        var song = await AudioPlayer.InputSong(input, channel, interaction.member.user.username, interaction)
                        .catch(async err=>{
                            console.log(err);
                            //await interaction.editReply({content:err});
                            return
                        });
                        //play as first song
                        AudioPlayer.play(interaction.guildId);
                        await AudioPlayer.sendplayback({Interaction:interaction}).then(res=>{
                        });
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
}