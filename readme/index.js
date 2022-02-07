let str = `# Animal Photos 
### What is it?
It's a slash commands bot to post photos of animals, simple.

[You can invite it](https://discord.com/api/oauth2/authorize?client_id=907969268660973609&scope=applications.commands)

## Commands

| Name | Description |
| ----------- | ----------- |`;


import path from 'path';
import fs from 'fs/promises';
import SlashCommands from "../json/slash.json";
import simpleGit from 'simple-git';

// We want it to be ran from root not scripts
const git = simpleGit({ baseDir: path.resolve('..') });

async function run() {
  console.log('Fetching...');
  await writeTesting();
  console.log('Pushing!');
  const commitMessage = `Keep the readme file up to date`;
  await tryAndPush([ 'README.md' ], commitMessage);

  console.log('Done! :)');
}

async function writeTesting() {
    for (const slash of SlashCommands) {
        str += `| \`/${slash.name}\` | ${slash.description} |`;
    }

    await fs.writeFile(path.resolve('../README.md'), str);
    return null;
}

async function tryAndPush(files, commitMessage) {
  try {
    const result = await git.status();
    if (result.files.length === 0) {
      console.log('No changes to commit');
      return;
    }

    await git.add(files);
    await git.commit(commitMessage);
    await git.push('origin', 'main');
  } catch(e) {
    console.error(e);
  }
}

run();