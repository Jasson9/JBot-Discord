var {FetchCommands} = require("./SlashCommands");
var argsSplitRegex = new RegExp(/"(.*.)"/);
var Commands
FetchCommands().then(res=>{
    Commands = res;
});
// option type 3 string
// option type 4 integer

//still testing and buggy
function getarg(args,index){
    if(argsSplitRegex.test(args)){
        var argsarr = args.split(/(?!=")\s(?="|\d)/);
        //console.log("arr result:" + argsarr[1]);
        return argsarr[index]?.replace('"',"");
    }else{
        return args
    }
}

class Options{
    
    constructor(args,commandName){
        this.args = args.join(" ");
        this.commandName = commandName;
    }

    getInteger(keyword){
        for (let i = 0; i < Commands.length; i++) {
            if(Commands[i].name==this.commandName){
                for(var t = 0; t < Commands[i].options.length; t++){
                    if(Commands[i].options[t].name == keyword && Commands[i].options[t].type == 4){
                        if(!argsSplitRegex.test(this.args))this.args=`"${this.args}"`
                        return getarg(this.args,t);
                    }
                }
            }
        }
    }

    getString(keyword){
        for (let i = 0; i < Commands.length; i++) {
            if(Commands[i].name==this.commandName){
                for(var t = 0; t < Commands[i].options.length; t++){
                    if(Commands[i].options[t].name == keyword && Commands[i].options[t].type == 3){
                        if(!argsSplitRegex.test(this.args))this.args=`"${this.args}"`
                        return getarg(this.args,t);
                    }
                }
            }
        }
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
        this.options = new Options(this.args,this.commandName);
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

    async followUp(MessageComponent){
        if(this.#replyMessage){
            this.#replyMessage =  await this.#replyMessage.reply(MessageComponent);
        }
    }
}


module.exports.Options = Options;
module.exports.MsgInteraction = MsgInteraction;