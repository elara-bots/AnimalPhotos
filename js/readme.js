const { resolve } = require("node:path"),
      { writeFile } = require("node:fs/promises"),
      { SlashCommands } = require("./slash");
let str = `# **Animal Photos**\n\n# [Invite](https://discord.com/api/oauth2/authorize?client_id=907969268660973609&scope=applications.commands)\n\n**Q)** What is it?<br>**A)** It's a slash commands bot to post photos of animals, simple.\n\n## Commands`;
async function run() {
    console.log('[README]: Updating, one moment.');
    let list = [
        `| Name | Description |`,
        `| ----------- | ----------- |`
    ]
    for (const slash of SlashCommands) {
        list.push(`| \`/${slash.name}\` | ${slash.description} |`);
    };
    console.log(`Writing (${SlashCommands.length}) Slash commands to the README.md file.`);
    await writeFile(resolve('README.md'), [str, ...list].join("\n"));
    console.log('[README]: Finished!');
}

run();