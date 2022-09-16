"use strict"
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
process.env.VOLUME? null :process.env.VOLUME = config.def_volume;
var playlist = [];

class Song {
    constructor(title, duration, link, channel, username) {
        this.channel = channel;
        this.title = title;
        this.username = username;
        this.duration = duration;
        this.link = link;
    }
}

async function sendplayback({ Interaction, useClient }) {
    var song = playlist[0];
    var timeElapsed = Math.round(audioplayer.state.playbackDuration / 1000);
    var timeElapsedString = `${Math.floor(timeElapsed / 60)}.${(timeElapsed % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
    if (isNaN(timeElapsed)) {
        timeElapsed = Number(0);
        timeElapsedString = "0.00";
    };
    var totalTimestring = `${Math.floor(song.duration / 60)}.${(song.duration % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
    var progressString = String("-").repeat(41).split("");
    progressString[Math.round((timeElapsed / song.duration) * 40)] = "o";
    if (song) {
        var payload = `Now Playing:\n***${song.title}*** \n${timeElapsedString} ${progressString.join("")} ${totalTimestring}\n\nvolume: ${process.env.VOLUME}\nRequest from ***${song.username}***\n${song.link}`;
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
function ErrorCallback(song) {
    song.channel.send({ content: `cannot play ${song.link || song.title}\nmake sure it's not age restricted or violate community guidelines` })
}

function play() {
    try {
        if (playlist[0].link) {
            const stream = ytdl(playlist[0].link, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            });
            stream.on('error', err => {
                console.log(err);
                ErrorCallback(playlist[0])
            })
            resource = createAudioResource(stream, {
                inputType: StreamType.OggOpus,
                inlineVolume: true,
                silencePaddingFrames: 50
            });
            setvolume(process.env.VOLUME);
            connection.subscribe(audioplayer);
            audioplayer.play(resource);
            audioplayer.on('error', error => {
                console.log(error);
                ErrorCallback(playlist[0]);
            });
        }
    } catch (error) {
        console.log(error);
        playlist[0].channel.send({ content: `${playlist[0].link} cannot be played \nmake sure it's not age restricted or violate community guidelines` })
        skip();
    }
}

audioplayer.on(AudioPlayerStatus.Idle, async () => {
    if (playlist[0] && playlist[1]) {
        playlist.shift();
        if (playlist[0].link) {
            await sendplayback({ useClient: true });
            play()};
    } else {
        if (!playlist[1] && playlist[0]) {
            playlist[0].channel.send({ content: "End of playlist" })
        }
    }
});

function skip(index) {
    if (!index) index = 2;
    if (playlist[index - 1]&&index!=1) {
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
    if (argsvolume) process.env.VOLUME= argsvolume;
    try {
        if (playlistPattern.test(input)) {
            var id = playlistPattern.exec(new String(input))[2];
            var list = await ytsr({ listId: id }).catch(err => {
                channel.send({ content: `cannot get ${input} playlist` })
                return
            })
            channel.send(`***${list.videos.length}***🎶 music has been added to the playlist`)
            list.videos.forEach(song => {
                playlist.push(new Song(song.title, song.duration.seconds, `https://youtube.com/watch?v=${song.videoId}`, channel, username));
            });
        } else {
            if (videoPattern.test(input)) {
                await ytdl.getInfo(input).catch(err => {
                    console.log(err);
                    channel.send({ content: `cannot play ${input} make sure the it's not age restricted or violate community guidelines \nelse try another link` })
                    return;
                }).then(result => {
                    song = new Song(result.player_response.videoDetails.title, result.player_response.videoDetails.lengthSeconds, input, channel, username);
                    playlist.push(song);
                });
            } else {
                var searchres = await ytsr(input);
                song = new Song(searchres.videos[0].title, searchres.videos[0].seconds, searchres.videos[0].url, channel, username);
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

function setvolume(inputvolume) {
    if (!inputvolume) return;
    inputvolume = Math.min(Math.max(parseInt(inputvolume), 1), 100);
    resource.volume.setVolumeLogarithmic(inputvolume / 100 * 0.50);
    process.env.VOLUME = inputvolume;
    return inputvolume;
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
        playlist.splice(0,playlist.length);
        audioplayer.stop();
        connection.destroy();
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
}