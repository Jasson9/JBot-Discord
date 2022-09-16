const AudioPlayer = require("../lib/AudioPlayer.js");
const config = require("../Config.json");
const {AudioPlayerStatus , joinVoiceChannel} = require("@discordjs/voice");

module.exports = {
    name: 'play',
    type: 1,
    description: 'play youtube video or music',
    options: [{
        "name": "keyword-or-link",
        "required": true,
        "description": "keyword or youtube watch or playlist url!",
        "type": 3
    }, {
        "name": "volume",
        "required": false,
        "description": "specify volume from 0 to 100, default=25",
        "type": 4
    }],
    async execute(interaction, client) {
        if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
            try {
                var input = interaction.options.getString("keyword-or-link");
                var volume = interaction.options.getInteger("volume");
                var channelId = interaction.channelId
                var channel = await client.channels.fetch(channelId);

                //check for voice channel and join
                if(interaction.member.voice.channel==null){
                    await interaction.reply({content:"Join a voice channel first"});
                    return
                }
                if (!AudioPlayer.connection) AudioPlayer.join(interaction);
                if (!input && AudioPlayer.playlist[0]) {
                    AudioPlayer.resume();
                    await interaction.reply({content:"***Music resumed***"});
                } else {
                    await interaction.deferReply();
                    //add to playlist
                    console.log(AudioPlayer.audioplayer.state.status);
                    var song = await AudioPlayer.InputSong(input, channel, interaction.member.user.username, volume)
                        .catch(async err=>{
                            await interaction.reply({content:err});
                            return
                        });
                    if (AudioPlayer.audioplayer.state.status == AudioPlayerStatus.Idle || AudioPlayer.audioplayer.state.status == AudioPlayerStatus.AutoPaused ) {
                        //play as first song
                        AudioPlayer.play();
                        await AudioPlayer.sendplayback({Interaction:interaction}).then(res=>{
                        });
                    }else{
                        //send reply for adding to playlist
                        await interaction.editReply({
                            content:`***${song.title}*** - ${Math.floor(song.duration/60)}.${(song.duration%60).toLocaleString("en-US",{minimumIntegerDigits:2,useGrouping:false})} has been added to the playlist by ${song.username}`
                        })
                    }
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