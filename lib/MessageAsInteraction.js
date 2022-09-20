var {Message} = require("discord.js");
var {FetchCommands} = require("./SlashCommands");
var Commands
FetchCommands().then(res=>{
    Commands = res;
});
// option type 3 string
// option type 4 integer

//still testing

//subcet to change will add args separate feature with " " 
class Options{
    constructor(args){
        this.args = args;
    }
    getInteger(){
        return this.args.join(" ");
    }
    getString(){
        return this.args.join(" ");
    }
}

class MsgInteraction{
    #Message;
    #replyMessage;
    constructor(message){
        this.OriginInteraction = false;
        this.content = message.content
        this.args = message.content.split(" ")
        this.commandName = this.args.shift().replace(".","").toLowerCase();;
        this.#replyMessage = null;
        this.#Message = message;
        this.guildId = message.guildId;
        this.guild = message.guild;
        this.channel = message.channel;
        this.member = message.member;
        this.channelId = message.channelId;
        this.options = new Options(this.args);
        //console.log(this.content)
    }
    isChatInputCommand(){
        return true
    }
    async reply(MessageComponent){
        if(!this.#replyMessage){
            this.#replyMessage =  await this.#Message.reply(MessageComponent);
        }else{
            this.#replyMessage =  await this.#replyMessage.edit(MessageComponent);
        }
    }

    async deferReply(){
        if(!this.#replyMessage){
            this.#replyMessage =  await this.#Message.reply({content:"Jbot is thinking..."});
        }
    }

    async editReply(MessageComponent){
        if(this.#replyMessage){
            this.#replyMessage =  await this.#replyMessage.edit(MessageComponent);
        }else{
            this.#replyMessage = await this.#Message.reply(MessageComponent);
        }
    }

}


module.exports.Options = Options;
module.exports.MsgInteraction = MsgInteraction;