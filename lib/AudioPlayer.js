"use strict"
const { VoiceConnectionStatus, StreamType, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');
const { ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const ytdl = require("ytdl-core");
const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
const playlistPattern = /^.*(list=)([^#\&\?]*).*/;
const ytsr = require("yt-search");
const config = require("../Config.json");
const {SearchKeyword} = require("../lib/SearchYoutubeAPI")
process.env.VOLUME ? null : config.def_volume ? process.env.VOLUME = config.def_volume : 50;

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
        this.songs = [];
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
    async skip(){
        this.songs[0].collector?.stop();
        if (this.songs[0] && this.songs[1]) {
            //this.audioplayer.stop(true)
            this.songs.shift();
            if (this.songs[0].link) {
                play(this.GuildId);
                await sendplayback({ useClient: true, guildId: this.GuildId });
            };
        } else {
            if (!this.songs[1] && this.songs[0]) {
                this.songs[0].channel.send({ content: "End of playlist" });
                this.songs.shift();
                setTimeout(() => {
                    if (this.audioplayer.state.status == AudioPlayerStatus.Idle) {
                        destroy(this.GuildId);
                    }
                }, 30000);
            }
        }
    }
    createAudioPlayer() {
        this.audioplayer = createAudioPlayer();

        this.audioplayer.on(AudioPlayerStatus.Idle, async () => {
            this.skip()
        });

        this.audioplayer.on('error', async (err) => {
            console.log(err);
            //this.songs[0].channel.send({ content: "An Error Occured" })
            //this.skip();
        });
    }
    createResource(stream) {
        this.resource = createAudioResource(stream, {
            inputType: StreamType.OggOpus,
            inlineVolume: true,
            silencePaddingFrames: 50
        });
    }
}

async function sendplayback({ Interaction, useClient, guildId }) {
    if (!guildId) {
        var guildId = Interaction.guildId;
    }
    var song = guilds[guildId]?.songs[0];
    if(song?.collector){
        song.collector.stop();
    }
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
                    { name: `${guilds[guildId].muted ? "muted 🔇" : `Volume: ${guilds[guildId].volume}`}`, value: `${guilds[guildId].songs.length - 1 == 0 ? "⚠️ Last song!" : `${guilds[guildId].songs.length - 1} songs left`}` }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp()
                .setFooter({ text: `Requested by ${song.username} • Updated at :` })
        }
        if (Interaction) {
            var Channel = await Interaction.channel;
            if(Interaction.deferred || Interaction.replied){
                await Interaction.editReply({ ephemeral: false, embeds: [embedmsg()], components: [row] });
            }else{
                await Interaction.reply({ ephemeral: false, embeds: [embedmsg()], components: [row] });
            }
        }
        if (useClient) {
            var Channel = await song.channel;
            var Message = await song.channel.send({ content: "", ephemeral: false, embeds: [embedmsg()], components: [row] });
        }
        const collector = Channel.createMessageComponentCollector()
        guilds[guildId].songs[0].collector = collector;
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
                        await interaction.update({ content: `${res ? res : `skipped!`}`, embeds: [embedmsg()], components: [] })
                        var res = await skip(interaction);
                        if(!res)collector.stop();
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
        collector.on('end', async () => {
            if (Interaction) {
                await Interaction.editReply({ content: ``, embeds: [embedmsg()], components: [] });
            }
            if (useClient) {
                await Message.edit({ content: ``, embeds: [embedmsg()], components: [] });
            }
            //await interaction.update({ content: ``, embeds: [embedmsg()] , components:[] })
        })
    } else {
        return "No song currently";
    }
}


function play(GuildId) {
    if (!guilds[GuildId].audioplayer) {
        guilds[GuildId].createAudioPlayer();
    }
    try {
        if (guilds[GuildId].songs[0].link) {
            const stream = ytdl(guilds[GuildId].songs[0].link, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            });
            stream.on('error', err => {
                console.log(err);
                guilds[GuildId].songs[0].channel.send({ content: `cannot play ${guilds[GuildId].songs[0].link || guilds[GuildId].songs[0].title}\nmake sure it's not age restricted or violate community guidelines` })
                stream._destroy();
                //guilds[GuildId].skip();
                
                //ErrorCallback(guilds[GuildId].songs[0])
            })
            guilds[GuildId].createResource(stream);
            setvolume(guilds[GuildId].volume, { "guildId": GuildId }, guilds[GuildId].muted);
            guilds[GuildId].connection.subscribe(guilds[GuildId].audioplayer);
            guilds[GuildId].audioplayer.play(guilds[GuildId].resource);
            guilds[GuildId].audioplayer.on('error', error => {
                console.log(error);
            });
        }
    } catch (error) {
        console.log(error);
        //guilds[GuildId].songs[0].channel.send({ content: `${guilds[GuildId].songs[0].link} cannot be played \nmake sure it's not age or region restricted or violate community guidelines` })
        return error;
    }
}


async function skip(interaction, index) {
    if (!guilds[interaction.guildId]) {
        guilds[interaction.guildId] = new Guild(interaction.guildId);
    }
    if (!index) index = 2;
    if (guilds[interaction.guildId].songs[index - 1]?.title && index != 1) {
        guilds[interaction.guildId].songs[0]?.collector?.stop();
        guilds[interaction.guildId].songs.splice(0, index - 1);
        guilds[interaction.guildId].audioplayer.pause()
        play(interaction.guildId);
        await sendplayback({ Interaction: interaction });
        return null;
    } else {
        return `There is no song at playlist no.${index}`
    }
}

async function InputSong(input, channel, username, interaction) {
    if (!guilds[channel.guildId]) guilds[channel.guildId] = new Guild(channel.guildId);
    var song;
    try {
        if (playlistPattern.test(input)) {
            var id = playlistPattern.exec(new String(input))[2];
            var list = await ytsr({ listId: id }).catch(err => {
                console.log(err);
                channel.send({ content: `cannot get ${input} playlist` })
                return
            })
            list.videos.forEach(song => {
                song = new Song(song.title, song.duration.seconds, `https://youtube.com/watch?v=${song.videoId}`, channel, username, song.thumbnail)
                guilds[channel.guildId].songs.push(song);
            });
            await interaction.editReply({ content: `***${list.videos.length}***🎶 music has been added to the playlist\n${guilds[channel.guildId].songs.length} songs in playlist` })
            return null
        } else {
            if (videoPattern.test(input)) {
                await ytdl.getInfo(input).catch(err => {
                    console.log(err);
                    channel.send({ content: `cannot play ${input} make sure the it's not age restricted or violate community guidelines \nelse try another link` })
                    return;
                }).then(result => {
                    song = new Song(result.player_response.videoDetails.title, result.player_response.videoDetails.lengthSeconds, input, channel, username, result.thumbnail_url)
                    guilds[channel.guildId].songs.push(song);
                    return song;
                });
            } else {
                var searchres = await SearchKeyword(input).catch(err => {
                    channel.send({ content: `cannot search for ${input}` })
                    return
                });
                song = new Song(searchres[0].title, searchres[0].duration, searchres[0].url, channel, username, searchres[0].thumbnail);
                guilds[channel.guildId].songs.push(song);
                return song;
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
            setTimeout(() => guilds[interaction.guildId].audioplayer.unpause(), delay);
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
    if(guilds[interaction.guildId].connection){
        guilds[interaction.guildId].connection.configureNetworking();
    }else{
        guilds[interaction.guildId].createConnection(interaction.member.voice.channel, interaction.guild);
    }
}

function destroy(guildId) {
    if (!guilds[guildId]) {
        guilds[guildId] = new Guild(guildId);
    }
    if (guilds[guildId]?.audioplayer && guilds[guildId]?.connection) {
        if(guilds[guildId].songs[0]?.collector){
            guilds[guildId].songs[0].collector.stop();
        }
        guilds[guildId].songs.splice(0,guilds[guildId].songs.length);
        guilds[guildId].audioplayer.stop();
        if (guilds[guildId].connection.state.status != VoiceConnectionStatus.Destroyed) {
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