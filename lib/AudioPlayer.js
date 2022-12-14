const { StreamType, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');
const ytdl = require("ytdl-core");
const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
const playlistPattern = /^.*(list=)([^#\&\?]*).*/;
const ytsr = require("yt-search");
const config = require("../Config.json");
const audioplayer = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});
var resource;
var connection;
var volume = config.def_volume;
class Song {
    constructor(title, duration, link, channel, username) {
        this.channel = channel;
        this.title = title;
        this.username = username;
        this.duration = duration;
        this.link = link;
    }
}
var playlist = [];

async function sendplayback({ Interaction, useClient}) {
    var song = playlist[0];
    var timeElapsed = Math.round(audioplayer.state.playbackDuration/1000);
    var timeElapsedString = `${Math.floor(timeElapsed / 60)}.${(timeElapsed % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
    if(isNaN(timeElapsed)){
        timeElapsed=Number(0);
        timeElapsedString = "0.00";
    };
    var totalTimestring=`${Math.floor(song.duration / 60)}.${(song.duration % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
    var progressString = String("-").repeat(41).split("");
    progressString[Math.round((timeElapsed/song.duration)*40)] = "o";
    if (song) {
        var payload = `Now Playing:\n***${song.title}*** \n${timeElapsedString} ${progressString.join("")} ${totalTimestring}\n\nvolume: ${volume}\nRequest from ***${song.username}***\n${song.link}`;
        if (Interaction) {
            await Interaction.editReply({
                    content: payload
                })
        }
        if (useClient) {
            song.channel.send(payload)
        }
    } else {
        return "No song currently";
    }
}
function ErrorCallback(song){
    song.channel.send({content:`cannot play ${song.link||song.title}\nmake sure it's not age restricted or violate community guidelines`})
}

function play() {
    try {
        if(playlist[0].link){
        stream.on('error',err=>ErrorCallback(playlist[0]))
        const stream = ytdl(playlist[0].link+'&bpctr=9999999999&has_verified=1', {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 1 << 25
        });
        resource = createAudioResource(stream, {
            inputType: StreamType.OggOpus,
            inlineVolume: true,
            silencePaddingFrames:50
        });
        setvolume(volume);
        connection.subscribe(audioplayer);
        audioplayer.play(resource);
        audioplayer.on('error', error => {ErrorCallback(playlist[0]);
        });
        }
    } catch (error) {
        playlist[0].channel.send({content:`${playlist[0].link} cannot be played \nmake sure it's not age restricted or violate community guidelines`})
        skip();
    }
}

audioplayer.on(AudioPlayerStatus.Idle, async() => {
    if(playlist[0]&&playlist[1]){
    playlist.shift();
    await sendplayback({useClient:true});
    if (playlist[0]) play();
    }else{
        if(!playlist[1] && playlist[0]){
            playlist[0].channel.send("")
        }
    }
});

function skip(index) {
    if (!index) index = 2;
    if (playlist[index - 1]) {
        playlist.splice(0, index - 1);
        sendplayback({ useClient: true });
        play();
    } else {
        audioplayer.stop();
        return `There is no song at playlist no.${index}`
    }
}

async function InputSong(input, channel, username, argsvolume) {
    var song;
    this.volume=argsvolume;
    try {
        if (playlistPattern.test(input)) {
            var id = playlistPattern.exec(new String(input))[2];
            var list = await ytsr({listId:id}).catch(err=>{
                channel.send({content:`cannot get ${input} playlist`})
                return
            })
            channel.send(`***${list.videos.length}***???? music has been added to the playlist`)
            list.videos.forEach(song => {
                playlist.push(new Song(song.title, song.duration.seconds, `https://youtube.com/watch?v=${song.videoId}`, channel, username));
            });
        } else {
            if (videoPattern.test(input)) {
                await ytdl.getInfo(input).catch(err => {
                    channel.send({content:`cannot play ${input} make sure the it's not age restricted or violate community guidelines \nelse try another link`})
                    return ;
                }).then(result=>{
                    song = new Song(result.player_response.videoDetails.title, result.player_response.videoDetails.lengthSeconds, input, channel, username);
                    playlist.push(song);
                });
            } else {
                var searchres = await ytsr(input);
                song = new Song(searchres.videos[0].title, searchres.videos[0].seconds, searchres.videos[0].url, channel,  username);
                playlist.push(song);
            }
        }
        return song;
    } catch (error) {
        return error;
    }

}

function pause() {
    if (audioplayer.state.status == AudioPlayerStatus.Playing || audioplayer.state.status == AudioPlayerStatus.Buffering) {
        audioplayer.pause(true);
    }
}

function resume(delay) {
    if (audioplayer.state.status == AudioPlayerStatus.Paused || audioplayer.state.status == AudioPlayerStatus.AutoPaused) {
        if (delay) {
            setTimeout(() => audioplayer.unpause(), 5_000);
        } else {
            audioplayer.unpause();
        }
    }
}

function setvolume(volume) {
    if (!volume) return;
    volume = Math.min(Math.max(parseInt(volume), 1), 100);
    resource.volume.setVolumeLogarithmic(volume / 100 * 0.50);
    this.volume = volume;
    return volume;
}

function info(Interaction) {
    sendplayback({ Interaction, withElapsed: true });
}

function join(interaction) {
    if (interaction.member.voice.channel.id == null) {
        interaction.reply({ content: "Join a voice channel first" });
        return "No voice channel joined";
    }
    connection = joinVoiceChannel({
        selfDeaf: true,
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
    });
}

function destroy() {
    if (audioplayer && connection) {
        audioplayer.stop();
        connection.destroy();
        playlist = [];
    }
}

module.exports = {
    join,
    play,
    pause,
    resume,
    destroy,
    setvolume,
    skip,
    InputSong,
    sendplayback,
    info,
    playlist,
    connection,
    audioplayer,
    volume
}