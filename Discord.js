const discord = require("discord.js");
const config = require("./Config.json");
const fs = require('fs');
const client = new discord.Client({ intents: [ discord.GatewayIntentBits.GuildVoiceStates ,discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.MessageContent,discord.GatewayIntentBits.GuildMessageReactions] });
const commandsFile = fs.readdirSync("./Commands").filter(file => file.endsWith(".js"));
const { Registcommands, FetchCommands } = require("./lib/SlashCommands.js");
var commands = [];
process.env.YTDL_NO_UPDATE = true;
var GuildsNotRegisteredList = [];

client.on('ready', () => {
  var guilds = client.guilds;
  guilds.cache.each(Guild=>{
    FetchCommands().then(
      (data) => {
        Registcommands(data,Guild.id,client.user.id).catch(err => {
          GuildsNotRegisteredList.push(Guild.id);
        });
      }
    ).catch(err => console.log(err));
  })
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity({
    name:"Slash commands"
  })
});

for (const File of commandsFile) {
  const command = require(`./commands/${File}`);
  if (command.name) {
    commands.push(command.name);
  }
}

client.on('messageCreate',message=>{
  var args = message.content.split(" ");
  if(args[0].toLowerCase()=="/jbot"||args[0].toLowerCase()==".jbot"||args[0].toLowerCase()==".help"||args[0].toLowerCase()=="/help"){
    if(GuildsNotRegisteredList.includes(message.guild.id)){
      message.channel.send({content:`Jbot no longer support normal message command, but there is a small chance it coming back use slash commands instead\n\nto use slash command for this guild reinvite Jbot again: https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID||config.clientID}&permissions=2184186176&scope=bot%20applications.commands\nmore info: https://discord.com/blog/slash-commands-are-here`});
    }
     message.channel.send({content:"Jbot no longer support normal message command, but there is a small chance it coming back use slash commands instead\nmore info: https://discord.com/blog/slash-commands-are-here"});
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  commandsFile.forEach(command => {
    require(`./Commands/${command}`).execute(interaction, client);
  });
});


client.login(process.env.TOKEN||config.token);