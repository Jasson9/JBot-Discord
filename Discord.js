const discord = require("discord.js");
const config = require("./Config.json");
const fs = require('fs');
const {MsgInteraction,Options} = require("./lib/MessageAsInteraction.js");
const client = new discord.Client({ intents: [discord.GatewayIntentBits.GuildVoiceStates, discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildMessageReactions] });
const commandsFile = fs.readdirSync("./Commands").filter(file => file.endsWith(".js"));
const { Registcommands, FetchCommands } = require("./lib/SlashCommands.js");
var commands = [];
process.env.YTDL_NO_UPDATE = true;
var GuildsNotRegisteredList = [];

client.on('ready', () => {
  var guilds = client.guilds;
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity({
    name: "Slash commands and ."
  })
  FetchCommands().then((data) => {
    guilds.cache.each(Guild => {
      Registcommands(data, Guild.id, client.user.id).catch(err => {
        GuildsNotRegisteredList.push(Guild.id);
      });
    })
  }
  ).catch(err => console.log(err));
});

for (const File of commandsFile) {
  const command = require(`${process.cwd()}/Commands/${File}`);
  if (command.name) {
    commands.push(command.name);
  }
}

client.on("guildCreate", res => {
  FetchCommands().then((data) => {
    Registcommands(data, res.id, client.user.id).catch(err => {
      GuildsNotRegisteredList.push(res.id);
    });
  })
})

client.on('messageCreate', message => {
  var args = new String(message.content).split(" ");
  if (args[0][0] == "." && args[0].length > 1){ 
    if(commands.includes(args.shift().replace(".","").toLowerCase())){
      require(`${process.cwd()}/Commands/${commandName}`).execute(
        new MsgInteraction(message), client);
      }
    }

  /**
  if (args[0].toLowerCase() == "/jbot" || args[0].toLowerCase() == ".jbot" || args[0].toLowerCase() == ".help" || args[0].toLowerCase() == "/help") {
    if (GuildsNotRegisteredList.includes(message.guild.id)) {
      message.channel.send({ content: `Jbot no longer support normal message command, use slash commands instead\n\nto use slash command for this guild reinvite Jbot again: https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID || config.clientID}&permissions=2184186176&scope=bot%20applications.commands\nmore info: https://discord.com/blog/slash-commands-are-here` });
    }
    message.channel.send({ content: "Jbot no longer support normal message command, use slash commands instead\nmore info: https://discord.com/blog/slash-commands-are-here" });
  } */
})

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand().valueOf()) require(`${process.cwd()}/Commands/${interaction.commandName}`).execute(interaction, client);
});


client.login(process.env['clientoken'] || config.token);