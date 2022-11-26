const { SearchKeyword } = require("../lib/SearchYoutubeAPI");
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder ,ButtonStyle} = require("discord.js")
const {execute} = require("./play")

class Options{
    constructor(args){
        this.args = args
    }
    getString(){
        return this.args
    }
    getInteger(){
        return null
    }
}

module.exports = {
    name: 'search',
    type: 1,
    description: 'Search song from youtube and return the results',
    options: [{
        "name": "title-or-with-artist",
        "required": true,
        "description": "keyword",
        "type": 3
    }],
    async execute(interaction, client) {
        if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
            try {
                var keyword = interaction.options.getString("title-or-with-artist");
                await interaction.reply({ content: `Searching ${keyword}` });
                var videos = await SearchKeyword(keyword);
                var resString = [];
                for (var i = 0; i < videos.length && i < 5; i++) {
                    resString.push(`${i + 1}. ${videos[i].title} (${Math.floor(videos[i].duration / 60)}.${(videos[i].duration % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })})\n`)
                }
                
                console.log(resString)
                console.log(videos)
                var responsemsg = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Search result for: ${keyword}`)
                    .setURL( `https://www.youtube.com/results?search_query=${keyword.split(' ').join('+')}&sp=EgIQAQ%253D%253D`)
                    .setDescription(`${videos ? resString.join('') : "No music/video found"}`)
                    .setAuthor({ name: 'Music Player', iconURL: 'https://www.freepnglogos.com/uploads/youtube-play-red-logo-png-transparent-background-6.png', url: `https://www.youtube.com/results?search_query=${keyword.split(' ').join('+')}&sp=EgIQAQ%253D%253D` })
                    .setTimestamp()
                    .setFooter({ text: `Searched by ${interaction.member.user.username}` })

                var row = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('1')
                            .setLabel('1️⃣')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('2')
                            .setLabel('2️⃣')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('3')
                            .setLabel('3️⃣')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('4')
                            .setLabel('4️⃣')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('5')
                            .setLabel('5️⃣')
                            .setStyle(ButtonStyle.Primary)
                    ])
                //row.data.Id = interaction.guildId.concat(String(Math.floor(Math.random() * 1000000)));
                console.log("replying")
                await interaction.editReply({
                    content:"",embeds: [responsemsg], components: videos?[row]:[]
                })
                const collector = interaction.channel.createMessageComponentCollector();
                console.log(interaction.id)
                collector.on('collect', async (btninteraction) => {
                    if(btninteraction.message.interaction.id == interaction.id){
                    var index = parseInt(btninteraction.customId) - 1;
                    if(videos[index]){
                        btninteraction.fromSearch = true;
                        btninteraction.options = new Options(videos[index].url);
                        await btninteraction.update({
                            content:"",embeds: [responsemsg], components: []
                        })
                        btninteraction.replied = true;
                        await execute(btninteraction,client);
                        collector.stop();
                    }else{
                        await btninteraction.update({content:`No music/video at number ${index+1}`})
                        collector.stop();
                    }
                }
                })
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