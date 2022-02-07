let str = `# **Animal Photos**

## [Invite](https://discord.com/api/oauth2/authorize?client_id=907969268660973609&scope=applications.commands)

### What is it?
It's a slash commands bot to post photos of animals, simple.

## Commands
`;


import path from 'path';
import fs from 'fs/promises';
import { SlashCommands } from "../slash.js";
import simpleGit from 'simple-git';

// We want it to be ran from root not readme
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
    let list = [
        `| Name | Description |`,
        `| ----------- | ----------- |`
    ]
    for (const slash of SlashCommands) {
        list.push(`| \`/${slash.name}\` | ${slash.description} |`);
    }
    await fs.writeFile(path.resolve('README.md'), [ str, ...list ].join("\n"));
    return null;
}

async function tryAndPush(files, commitMessage) {
  try {
    // const result = await git.status();
    // if (result.files.length === 0) {
    //   console.log('No changes to commit');
    //   return;
    // }

    // await git.add(files);
    // await git.commit(commitMessage);
    // await git.push('origin', 'main');
  } catch(e) {
    console.error(e);
  }
}

run();