"use strict"
const { VoiceConnectionStatus, StreamType, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');
const { ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const ytdl = require("ytdl-core");
const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
const playlistPattern = /^.*(list=)([^#\&\?]*).*/;
const ytsr = require("yt-search");
const config = require("../Config.json");
//const buttons = require("./Buttons.js");
process.env.VOLUME ? null : config.def_volume ? process.env.VOLUME = config.def_volume : 50;

//var playlist = {};
var guilds = {};
class Song {
    constructor(title, duration, link, channel, username, thumbnail) {
        this.channel = channel;
        this.title = title;
        this.username = username;
        this.duration = duration;
        this.link = link;
        this.thumbnail = thumbnail;
        this.collector = null;
    }
}

class Guild {
    constructor(guildId) {
        this.volume = process.env.VOLUME;
        this.GuildId = guildId;
        this.connection = null;
        this.audioplayer = null;
        this.resource = null;
        this.playlist = null;
        this.muted = false;
    }
    createConnection(channel, guild) {
        this.connection = joinVoiceChannel({
            selfDeaf: true,
            channelId: channel.id,
            guildId: this.GuildId,
            adapterCreator: guild.voiceAdapterCreator,
        });
    }
    createAudioPlayer() {
        this.audioplayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        this.audioplayer.on(AudioPlayerStatus.Idle, async () => {
            guilds[this.GuildId].playlist.songs[0].collector.stop();
            if (this.playlist.songs[0] && this.playlist.songs[1]) {
                this.playlist.songs.shift();
                if (this.playlist.songs[0].link) {
                    await sendplayback({ useClient: true, guildId: this.GuildId });
                    play(this.GuildId);
                };
            } else {
                if (!this.playlist.songs[1] && this.playlist.songs[0]) {
                    this.playlist.songs[0].channel.send({ content: "End of playlist" });
                    this.playlist.songs.shift();
                    setTimeout(() => {
                        if (this.audioplayer.state.status == AudioPlayerStatus.Idle) {
                            destroy(this.GuildId);
                        }
                    }, 30000);
                }
            }
        });
    }
    createResource(stream) {
        this.resource = createAudioResource(stream, {
            inputType: StreamType.OggOpus,
            inlineVolume: true,
            silencePaddingFrames: 50
        });
    }
    addPlaylist(playlist) {
        this.playlist = playlist;
    }
}
class Playlist extends Guild {
    constructor(GuildId) {
        super(GuildId);
        this.songs = [];
    }
    addSong(song) {
        this.song.push(song)
    }
    removeSong(index, length) {
        this.song.splice(index, length);
    }
    songs() {
        return this.song;
    }
    clearAllSongs() {
        this.song.splice(0, this.song.length);
    }
}

async function sendplayback({ Interaction, useClient, guildId }) {
    if (!guildId) {
        var guildId = Interaction.guildId;
    }
    var song = guilds[guildId]?.playlist?.songs[0];
    if (song) {
        const row = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId('pauseButton')
                    .setLabel('⏯️')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('skipButton')
                    .setLabel('⏭️')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('muteButton')
                    .setLabel('🔇')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('volumeUp')
                    .setLabel('🔊')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('volumeDown')
                    .setLabel('🔉')
                    .setStyle(ButtonStyle.Success)
            ])
        var totalTimestring = `${Math.floor(song.duration / 60)}.${(song.duration % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
        function embedmsg() {
            var progressString = String("-").repeat(41).split("");
            var timeElapsed = Math.min(Math.max(Math.round(guilds[guildId].audioplayer.state.playbackDuration / 1000), 0), song.duration);
            var timeElapsedString = `${Math.floor(timeElapsed / 60)}.${(timeElapsed % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
            if (isNaN(timeElapsed)) {
                timeElapsed = Number(0);
                timeElapsedString = "0.00";
            };
            progressString[Math.round((timeElapsed / song.duration) * 40)] = "o";
            return new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(song.title)
                .setURL(song.link)
                .setDescription(`${timeElapsedString} ${progressString.join("")} ${totalTimestring}`)
                .setAuthor({ name: 'Music Player', iconURL: 'https://www.freepnglogos.com/uploads/youtube-play-red-logo-png-transparent-background-6.png', url: song.link })
                .addFields(
                    { name: `${guilds[guildId].muted ? "muted 🔇" : `Volume: ${guilds[guildId].volume}`}`, value: `${guilds[guildId].playlist.songs.length - 1 == 0 ? "⚠️ Last song!" : `${guilds[guildId].playlist.songs.length - 1} songs left`}` }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp()
                .setFooter({ text: `Requested by ${song.username} • Updated at :` })
        }
        if (Interaction) {
            var Channel = await Interaction.channel;
            await Interaction.editReply({ ephemeral: true, embeds: [embedmsg()], components: [row] });
        }
        if (useClient) {
            var Channel = await song.channel
            var Message = song.channel.send({ content: "", ephemeral: true, embeds: [embedmsg()], components: [row] });
        }
        const collector = Channel.createMessageComponentCollector()

        //{ time: song.duration * 1000 }
        guilds[guildId].playlist.songs[0].collector = collector;
        collector.on('collect', async interaction => {
            try {
                switch (interaction.customId) {
                    case "pauseButton":
                        if (guilds[interaction.guildId]?.audioplayer?.state.status == AudioPlayerStatus.Paused || guilds[interaction.guildId]?.audioplayer?.state.status == AudioPlayerStatus.AutoPaused) {
                            resume(interaction);
                            await interaction.update({ content: `***Music Resumed***`, embeds: [embedmsg()], components: [row] })
                        } else {
                            if (guilds[interaction.guildId]?.audioplayer?.state.status == AudioPlayerStatus.Buffering || guilds[interaction.guildId]?.audioplayer?.state.status == AudioPlayerStatus.Playing) {
                                pause(interaction);
                                await interaction.update({ content: `***Music Paused***`, embeds: [embedmsg()], components: [row] })
                            }
                        }
                        break;
                    case "skipButton":
                        var res = skip(interaction);
                        await interaction.update({ content: `${res ? res : `skipped!`}`, embeds: [embedmsg()], components: [] })
                        collector.stop();
                        break;
                    case "volumeUp":
                        setvolume(guilds[guildId].volume + 5, interaction);
                        //var res = skip(interaction);
                        await interaction.update({ content: ``, embeds: [embedmsg()], components: [row] })
                        break;
                    case "volumeDown":
                        setvolume(guilds[guildId].volume - 5, interaction);
                        await interaction.update({ content: ``, embeds: [embedmsg()], components: [row] })
                        //buttons.volumeDown(Interaction, { "channel": Interaction.channel })
                        break;
                    case "muteButton":
                        if (guilds[guildId].muted) {
                            setvolume(guilds[guildId].volume, interaction, false);
                        } else {
                            setvolume(guilds[guildId].volume, interaction, true);
                        }
                        await interaction.update({ content: ``, embeds: [embedmsg()], components: [row] })
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.log(error)
            }
            //await buttons[res.customId](res, { "channel": res.channel });
        });
        collector.on('end', async collected => {
            if (Interaction) {
                await Interaction.editReply({ content: ``, embeds: [embedmsg()], components: [] });
            }
            if (useClient) {
                Message.edit({ content: ``, embeds: [embedmsg()], components: [] });
            }
            //await interaction.update({ content: ``, embeds: [embedmsg()] , components:[] })
        })
    } else {
        return "No song currently";
    }
}
function ErrorCallback(song) {
    song.channel.send({ content: `cannot play ${song.link || song.title}\nmake sure it's not age restricted or violate community guidelines` })
}

function play(GuildId) {
    if (!guilds[GuildId].audioplayer) {
        guilds[GuildId].createAudioPlayer();
    }
    try {
        if (guilds[GuildId].playlist.songs[0].link) {
            const stream = ytdl(guilds[GuildId].playlist.songs[0].link, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            });
            stream.on('error', err => {
                console.log(err);
                ErrorCallback(guilds[GuildId].playlist.songs[0])
            })
            guilds[GuildId].createResource(stream);
            setvolume(guilds[GuildId].volume, { "guildId": GuildId }, guilds[GuildId].muted);
            guilds[GuildId].connection.subscribe(guilds[GuildId].audioplayer);
            guilds[GuildId].audioplayer.play(guilds[GuildId].resource);
            guilds[GuildId].audioplayer.on('error', error => {
                console.log(error);
                ErrorCallback(guilds[GuildId].playlist.songs[0]);
            });
        }
    } catch (error) {
        console.log(error);
        guilds[GuildId].playlist.songs[0].channel.send({ content: `${guilds[GuildId].playlist.songs[0].link} cannot be played \nmake sure it's not age restricted or violate community guidelines` })
        skip(guilds[GuildId].volume, { "guildId": GuildId });
    }
}


function skip(interaction, index) {
    if (!guilds[interaction.guildId]) {
        guilds[interaction.guildId] = new Guild(interaction.guildId);
    }
    if (!guilds[interaction.guildId].playlist || guilds[interaction.guildId].playlist.length == 0) {
        guilds[interaction.guildId].playlist = new Playlist();
    }
    if (!index) index = 2;
    if (guilds[interaction.guildId].playlist[index - 1] && index != 1) {
        guilds[interaction.guildId].playlist.splice(0, index - 1);
        sendplayback({ Interaction: interaction });
        play(interaction.guildId);
    } else {
        guilds[interaction.guildId].audioplayer.stop();
        return `There is no song at playlist no.${index}`
    }
}

async function InputSong(input, channel, username) {
    if (!guilds[channel.guildId]) guilds[channel.guildId] = new Guild(channel.guildId);
    if (!guilds[channel.guildId].playlist || guilds[channel.guildId].playlist.length == 0) {
        guilds[channel.guildId].playlist = new Playlist();
    }
    var song;
    try {
        if (playlistPattern.test(input)) {
            var id = playlistPattern.exec(new String(input))[2];
            var list = await ytsr({ listId: id }).catch(err => {
                console.log(err);
                channel.send({ content: `cannot get ${input} playlist` })
                return
            })
            interaction.editReply({ content: `***${list.videos.length}***🎶 music has been added to the playlist\n${guilds[channel.guildId].playlist.songs.length} songs in playlist` })
            list.videos.forEach(song => {
                song = new Song(song.title, song.duration.seconds, `https://youtube.com/watch?v=${song.videoId}`, channel, username, song.thumbnail)
                guilds[channel.guildId].playlist.songs.push(song);
            });
        } else {
            if (videoPattern.test(input)) {
                await ytdl.getInfo(input).catch(err => {
                    console.log(err);
                    channel.send({ content: `cannot play ${input} make sure the it's not age restricted or violate community guidelines \nelse try another link` })
                    return;
                }).then(result => {
                    song = new Song(result.player_response.videoDetails.title, result.player_response.videoDetails.lengthSeconds, input, channel, username, result.thumbnail_url)
                    guilds[channel.guildId].playlist.songs.push(song);
                });
            } else {
                var searchres = await ytsr({ query: input }).catch(err => {
                    channel.send({ content: `cannot search for ${input}` })
                    return
                });
                song = new Song(searchres.videos[0].title, searchres.videos[0].seconds, searchres.videos[0].url, channel, username, searchres.videos[0].thumbnail);
                guilds[channel.guildId].playlist.songs.push(song);
            }
        }
        return song;
    } catch (error) {
        console.log(error);
        return error;
    }

}

function pause(interaction) {
    if (!guilds[interaction.guildId]) {
        guilds[interaction.guildId] = new Guild(interaction.guildId)
    }
    if (guilds[interaction.guildId].audioplayer.state.status == AudioPlayerStatus.Playing || guilds[interaction.guildId].audioplayer.state.status == AudioPlayerStatus.Buffering) {
        guilds[interaction.guildId].audioplayer.pause(true);
    }
}

function resume(interaction, delay) {
    if (!guilds[interaction.guildId]) {
        guilds[interaction.guildId] = new Guild(interaction.guildId)
    }
    if (guilds[interaction.guildId].audioplayer.state.status == AudioPlayerStatus.Paused || guilds[interaction.guildId].audioplayer.state.status == AudioPlayerStatus.AutoPaused) {
        if (delay) {
            setTimeout(() => guilds[interaction.guildId].audioplayer.unpause(), 5_000);
        } else {
            guilds[interaction.guildId].audioplayer.unpause();
        }
    }
}

function setvolume(inputvolume, interaction, mute) {
    if (!guilds[interaction.guildId]) {
        guilds[interaction.guildId] = new Guild(interaction.guildId)
    }
    if (!inputvolume) inputvolume = guilds[interaction.guildId].volume;
    if (mute) {
        guilds[interaction.guildId].resource?.volume?.setVolumeLogarithmic(0)
        guilds[interaction.guildId].muted = true;
        return 0;
    } else {
        guilds[interaction.guildId].muted = false;
        inputvolume = Math.min(Math.max(parseInt(inputvolume), 1), 100);
        guilds[interaction.guildId].resource?.volume?.setVolumeLogarithmic(inputvolume / 100 * 0.50);
        guilds[interaction.guildId].volume = inputvolume;
        return inputvolume;
    }
}

function info(Interaction) {
    if (!guilds[Interaction.guildId]) {
        guilds[Interaction.guildId] = new Guild(Interaction.guildId);
    }
    sendplayback({ Interaction, withElapsed: true });
}

function join(interaction) {
    if (interaction.member.voice.channel.id == null) {
        interaction.editReply({ content: "Join a voice channel first" });
        return "No voice channel joined";
    }
    //var guild = getGuilds(interaction.channelId);
    if (!guilds[interaction.guildId]) {
        guilds[interaction.guildId] = new Guild(interaction.guildId);
    }
    if (!guilds[interaction.guildId].playlist || guilds[interaction.guildId].playlist.length == 0) {
        guilds[interaction.guildId].playlist = new Playlist();
    }
    guilds[interaction.guildId].createConnection(interaction.member.voice.channel, interaction.guild);
}

function destroy(guildId) {
    if (!guilds[guildId]) {
        guilds[guildId] = new Guild(guildId);
    }
    if (guilds[guildId]?.audioplayer && guilds[guildId]?.connection) {
        //playlist.splice(0,playlist.length);
        guilds[guildId].audioplayer.stop();
        if (guilds[guildId].connection.state != VoiceConnectionStatus.Destroyed) {
            guilds[guildId].connection.destroy();
        }
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
    guilds,
}