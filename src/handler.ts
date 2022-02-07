import { verify } from "./verify";
import { InteractionType, InteractionResponseType, APIInteractionResponse, APIApplicationCommandInteraction, APIButtonComponent, APIEmbedAuthor } from "discord-api-types/v9";
import { APIPingInteraction } from "discord-api-types/payloads/v9/_interactions/ping"

interface ImgStatus {
  status: boolean,
  message?: string,
  image?: string
}

function component(components: APIButtonComponent[]) {
  return [{ type: 1, components }]
}

const author: APIEmbedAuthor = { name: `Elara Services`, icon_url: `https://cdn.superchiefyt.xyz/d/icons/Elara.png`, url: `https://my.elara.services/support` }

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  switch (url.pathname) {

    case `/`: {
      return respond({ status: true, message: `boop` })
    }

    case `/interactions`: {
      if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return Response.redirect('https://discord.com')
      if (!await verify(request)) return new Response('', { status: 401 })
      const interaction = await request.json() as APIPingInteraction | APIApplicationCommandInteraction | any;
      if (interaction.type === InteractionType.Ping) return respond({ type: InteractionResponseType.Pong });
      const userId = interaction.member!.user.id ?? interaction.user!.id;
      if (!userId) return error(`❌ Unable to find your user ID`);
      let edit: boolean | null = false,
        name = ``;
      if (interaction.type === InteractionType.MessageComponent) {
        name = interaction.data.custom_id.split(`:`)[0];
        if (interaction.data.custom_id.split(`:`)[1] !== userId) edit = null;
        else edit = true;
      } else name = interaction.data.name.toLowerCase();
      if (!name) return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `❌ Unable to find the command name.`,
          flags: 1 << 6
        }
      });

      const add = (name: string, title: string) => int(name, title, edit, userId),
        { cat, dog } = {
          cat: `🐈`,
          dog: `🐕`
        }

      switch (name) {
        case `invite`: return respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            embeds: [
              {
                title: `Invite`,
                description: `Press the button below to invite me to a server!`,
                color: 2409471,
                timestamp: new Date().toISOString()
              }
            ],
            components: [
              {
                type: 1, components: [
                  { style: 5, label: `Invite`, emoji: { id: `841655450512261140` }, type: 2, url: `https://discord.com/api/oauth2/authorize?client_id=${interaction.application_id}&scope=applications.commands` }
                ]
              }
            ]
          }
        });

        case `cat`: case `cats`: return add(`cats`, `${cat} Cat!`);
        case `dog`: case `dogs`: return add(`dogs`, `${dog} Dog!`);
        case `koala`: return add(name, `🐨 Koala!`);
        case `raccoon`: return add(name, `🦝 Raccoon!`);
        case `fox`: return add(name, `🦊 Fox!`);
        case `ollie`: return add(name, `${cat} Ollie!`);
        case `amber`: return add(name, `${cat} Amber!`);
        case `chase`: return add(name, `${dog} Chase!`);
        case `mischief`: return add(name, `${cat} Mischief!`);
        case `pandas`: return add(name, `🐼 Panda!`);
        case `panda`: return add(name, `${cat} Panda!`);
        case `penguin`: return add(name, `🐧 Penguin!`);
        case `otter`: return add(name, `🦦 Otter!`);
        case `bird`: return add(name, `🐦 Birb!`);
        case `bunny`: return add(name, `🐇 Bunny!`);
        case `duck`: return add(name, `🦆 Quack!`);
        case `redpanda`: return add(name, `<:RedPanda:849665956761305200> Red Panda!`);
        case `shibe`: return add(name, `Shiba!`);
        case `pj`: return add(name, `${cat} PJ!`);
        case `tiggy`: return add(name, `${cat} Tiggy!`);
        case `sylvester`: return add(name, `${cat} Sylvester!`);
        case `husky`: return add(name, `${dog} Husky!`);
        case `pug`: return add(name, `${dog} Pug!`);
        case `aww`: {
          const res = await reddit(`aww`);
          if (!res.status || !res.image) return error(res!.message ?? `Unknown Issue while trying to fetch the subreddit.`, edit);
          return respond({
            type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: res.image,
              components: component([{ type: 2, custom_id: `aww:${userId}`, style: 3, emoji: { id: `849713246813945876` } }])
            }
          })
        }
      }
      return error(`❌ The command you tried is a work in progress.`, edit);
    }
  }
  return new Response(`request method: ${request.method}`)
}

const error = (message: string, edit?: boolean | null) => respond({
  type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
  data: {
    embeds: [
      {
        author,
        title: `INFO`,
        description: message,
        color: 0xFF0000,
        timestamp: new Date().toISOString()
      }
    ],
    flags: 1 << 6
  }
});

const respond = (response: APIInteractionResponse | object) => new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } })
const status = (message: string, status = false) => ({ status, message });
const getPhoto = async (name: string): Promise<ImgStatus> => {
  try {
    const res = await (await fetch(`https://my.elara.services/api/photos/${name ?? `cats`}`)).json();
    if (!res!.status) return status(res!.message ?? `No response from the API!`);
    return res;
  } catch (err) {
    return status(`Unable to fetch an image.`);
  }
};

const int = async (name: string, title: string, edit?: boolean | null, userId?: string): Promise<any> => {
  const r = await getPhoto(name);
  if (!r.status || !r.image) return respond({
    type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `❌ ${r.message}`,
      flags: 1 << 6
    }
  });
  return image(r.image, title, edit, name, `${userId}`);
};

const image = (img: string, title?: string, edit?: boolean | null, name?: string, userId?: string) => {
  return respond({
    type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [
        {
          author,
          title,
          url: img,
          image: { url: img },
          color: 2409471
        }
      ],
      components: component([{ type: 2, custom_id: `${name}:${userId}`, style: 3, emoji: { id: `849713246813945876` } }]),
      flags: edit === null ? 1 << 6 : undefined,
    }
  })
}

const reddit = async (name: string): Promise<ImgStatus> => {
  try {
    // NOTE: Use 'hot' and 'new' 50% of the time.
    const type = Math.random() < 0.50 ? `hot` : `new`;
    const r = await (await fetch(`https://reddit.com/r/${name}/${type}.json?limit=50`)).json();
    const children = r.data.children as { kind: string, data: { permalink: string, url: string } }[];
    if (!children.length) return status(`Unable to fetch any posts from: ${name}`);
    const random = children[Math.floor(Math.random() * children.length)];
    let image = `https://reddit.com${random.data.permalink}`;
    if (random.data.url.match(/.(jpg|jpeg|png)/gi)) image = random.data.url;
    return { status: true, image };
  } catch (err: Error | any) {
    return status(err!.message ?? `Unknown Error while trying to fetch from the subreddit.`);
  }
};