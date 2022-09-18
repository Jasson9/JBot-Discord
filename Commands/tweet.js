const config = require('../Config.json');
const tweeter = require('../lib/Twitter.js');
const { download } = require('../lib/DCDownloader.js');
module.exports = {
    name: 'tweet',
    type: 1,
    description: 'Make an anonymous tweet to the associated twitter account! (NOT AVAILABLE)',
    options: [{
        "name": "text",
        "required": true,
        "description": "The text of the tweet",
        "type": 3
    }, {
        "name": "image",
        "required": false,
        "description": "Additional image for the tweet(Optional)",
        "type": 11
    }],
    async execute(interaction, client) {
        
        if (interaction.isChatInputCommand() && interaction.commandName === this.name) {
            return await interaction.reply({content:"this command not available for public bot"});
            if (config.NoConfirm) {//button implementation will be done later (NoConfirm == without confirmation button)
                try {
                    var text = interaction.options.getString('text');
                    var attachment = interaction.options.getAttachment('image');
                    var attachmentid;
                    if (attachment) {
                        if (attachment["contentType"] !== 'image/jpeg' && attachment["contentType"] !== 'image/png') {
                            await interaction.reply({ content: "Only jpeg and png images are allowed!", ephemeral: true });
                            return;
                        }
                        var imagebuffer = await download(attachment["url"]);
                        await tweeter.uploadpicture(imagebuffer).then(res => {
                            attachmentid = JSON.parse(res)['media_id_string'];
                        });
                    }
                    await tweeter.Tweet(text, attachmentid).then(async function(res) {
                        if (res.errors) {
                            await interaction.reply({ content: "Error: " + res.errors[0].message, ephemeral: true });
                        } else {
                            if(res.status != undefined){
                                await interaction.reply({ content: `Failed with detail: \n\n${res.detail}`, ephemeral: true });
                            }else{
                                var Tweetdata = await tweeter.TweetLookup(res.data.id).catch();
                                Tweetdata = JSON.parse(Tweetdata);
                                interaction.channel.send(`Looks like Someone just tweet something at our twitter account, check it out at https://twitter.com/${Tweetdata.includes.users[0].username}/status/${res.data.id} \n\n${res.data.text}`);
                                await interaction.reply({ content: "Success", ephemeral: true });
                            }
                        }
                    });
                } catch (error) {
                    await interaction.reply({ content: "An Error Occured", ephemeral: true });
                }
            } else {
                await interaction.reply({ content: "Processing...", ephemeral: true });
                //processing here
                await interaction.editReply({ content: "Processing done, ready to tweet?", ephemeral: true, components: [row] });
            }
        }
        if (interaction.isButton() && !config.NoConfirm) {
            if (interaction.customId === 'tweet')
            await interaction.reply({ content: "Processing...", ephemeral: true });
            await interaction.editReply({ content: "Processing done, ready to tweet?", ephemeral: true, components: [row] });
        }
    }
}