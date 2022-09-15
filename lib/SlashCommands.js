const config = require("../Config.json");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord.js");
const fs = require('fs');
const path = require('path');


async function FetchCommands() {
  const cmdpath = path.join(__dirname, '..', 'Commands');
  var commands = [];
  var commandfiles = fs.readdirSync(cmdpath).filter(file => file.endsWith(".js"));
  commandfiles.forEach(async file => {
    try {
      var command = require(`../Commands/${file}`);
      commands.push({
        "name": command.name,
        "description": command.description,
        "type": command.type,
        "options": command.options
      })
    } catch (error) {
      throw error;
    }
  })
  return commands
}
const rest = new REST({ version: '10' }).setToken(config.token);

//console.log(data);
async function Registcommands(commands,guildId,clientId) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    ).then(res => {
      return res
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  Registcommands,
  FetchCommands
}
