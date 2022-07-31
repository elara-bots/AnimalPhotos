import { verify } from "./verify";
import { InteractionType, InteractionResponseType, MessageFlags, ButtonStyle, ComponentType, APIInteractionResponse, APIButtonComponent } from "discord-api-types/v9";
import { fetchImage } from "./api";

const support = `https://services.elara.workers.dev/support`

interface ImgStatus {
  status: boolean,
  message?: string,
  image?: string
}

function component(components: APIButtonComponent[]) {
  return [{ type: 1, components }]
}

const author = { name: `Elara Services`, icon_url: `https://cdn.elara.workers.dev/d/icons/Elara.png`, url: support }

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  switch (url.pathname) {
    case `/`: return respond({ status: true, message: `boop` });
    case "/support": return Response.redirect(support);
    case `/interactions`: {
      if (
        !req.headers.get('X-Signature-Ed25519') || 
        !req.headers.get('X-Signature-Timestamp')
      ) return Response.redirect(support)
      if (!await verify(req)) return new Response('', { status: 401 })
      const interaction = await req.json() as any;
      if (interaction.type === InteractionType.Ping) return respond({ type: InteractionResponseType.Pong });
      const userId = interaction.member!.user.id ?? interaction.user!.id;
      if (!userId) return error(`❌ Unable to find your user ID`);
      let edit: boolean | null = false,
          name = ``;
      if (interaction.type === InteractionType.MessageComponent) {
          const split = interaction.data.custom_id.split(":");
          name = split[0];
        if (split[1] !== userId) edit = null;
        else edit = true;
      } else name = interaction.data.name.toLowerCase();
      if (!name) return error(`❌ Unable to find the command name.`);
      const add = (name: string, title: string) => int(name, title, edit, userId),
          [ cat, dog ] = [ "🐈", "🐕" ];
      switch (name) {
        case `invite`: return respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            flags: MessageFlags.SuppressEmbeds,
            embeds: [ { title: `Invite`, color: 2409471 } ],
            components: component([
              { style: ButtonStyle.Link, type: ComponentType.Button, label: "Invite", url: `https://discord.com/api/oauth2/authorize?client_id=${interaction.application_id}&scope=applications.commands`, emoji: { id: "841655450512261140" } },
              { style: ButtonStyle.Link, type: ComponentType.Button, label: "Support", url: support, emoji: { id: "847624594717671476" } }
            ])
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
  if (url.pathname.startsWith("/animal/")) {
    const [ , name ] = url.pathname.split("/animal/");
    const res = await fetchImage(name);
    return respond(res);
  }
  return new Response(`request method: ${req.method}`)
}

const error = (message: string, edit?: boolean | null) => respond({
  type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
  data: {
    flags: MessageFlags.Ephemeral,
    embeds: [
      { author, title: `INFO`, description: message, color: 0xFF0000, timestamp: new Date().toISOString() }
    ]
  }
});

const respond = (response: APIInteractionResponse | object) => new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } })
const status = (message: string, status = false) => ({ status, message });
const getPhoto = async (name: string): Promise<ImgStatus> => {
  try {
    const res = await (await fetch(`https://services.elara.workers.dev/api/${name === "panda" ? `special?type=${name}` : `photos/${name ?? `cats`}`}`)).json();
    if (!res!.status) return status(res!.message ?? `No response from the API!`);
    return res;
  } catch (err) {
    return status(`Unable to fetch an image.`);
  }
};

const int = async (name: string, title: string, edit?: boolean | null, userId?: string): Promise<any> => {
  const r = await getPhoto(name);
  if (!r.status || !r.image) return error(r.message || "An error happened, try again later.", edit);
  return image(r.image, title, edit, name, `${userId}`);
};

const image = (img: string, title?: string, edit?: boolean | null, name?: string, userId?: string) => {
  return respond({
    type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [ { author, title, url: img, image: { url: img }, color: 2409471 } ],
      components: component([
        { 
          type: ComponentType.Button, 
          custom_id: `${name}:${userId}`, 
          style: ButtonStyle.Success, 
          emoji: { id: `849713246813945876` } 
        }
      ]),
      flags: edit === null ? MessageFlags.Ephemeral : undefined,
    }
  })
}

const reddit = async (name: string): Promise<ImgStatus> => {
  try {
    const type = Math.random() < 0.50 ? `hot` : `new`;
    const r = await (await fetch(`https://reddit.com/r/${name}/${type}.json?limit=50`)).json();
    const children: { kind: string, data: { permalink: string, url: string } }[] = r.data.children;
    if (!children.length) return status(`Unable to fetch any posts from: ${name}`);
    const random = children[Math.floor(Math.random() * children.length)];
    let image = `https://reddit.com${random.data.permalink}`;
    if (random.data.url.match(/.(jpg|jpeg|png)/gi)) image = random.data.url;
    return { status: true, image };
  } catch (err: Error | any) {
    return status(err!.message ?? `Unknown Error while trying to fetch from the subreddit.`);
  }
};