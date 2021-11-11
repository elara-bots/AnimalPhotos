import { verify } from "./verify";
import { InteractionType, InteractionResponseType, APIInteractionResponse, APIApplicationCommandInteraction, APIButtonComponent } from "discord-api-types/v9";
import { APIPingInteraction } from 'discord-api-types/payloads/v9/_interactions/ping'

interface ImgStatus {
  status: boolean,
  message?: string,
  image?: string
}

function component(components: APIButtonComponent[]) {
  return [ { type: 1, components } ]
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  switch(url.pathname) {
      case "/interactions": {
        if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return Response.redirect('https://discord.com')
        if (!await verify(request)) return new Response('', { status: 401 })
        const interaction = await request.json() as APIPingInteraction | APIApplicationCommandInteraction | any;
        if (interaction.type === InteractionType.Ping) return respond({ type: InteractionResponseType.Pong });
        const userId = interaction.member!.user.id ?? interaction.user!.id;
        if (!userId) return error(`❌ Unable to find your user ID`);
        let edit = false,
            name = "";
        if (interaction.type === InteractionType.MessageComponent) {
          name = interaction.data.custom_id.split(":")[0];
          edit = true;
          if (interaction.data.custom_id.split(":")[1] !== userId) return error(`❌ You didn't run this command!`, false);
        } else name = interaction.data.name.toLowerCase();
        if (!name) return respond({ 
          type: InteractionResponseType.ChannelMessageWithSource, 
          data: {
            content: `❌ Unable to find the command name.`,
            flags: 1 << 6
          } 
        });
        switch (name) {
          case "invite": return respond({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              embeds: [
                {
                  title: "Invite",
                  description: "Press the button below to invite me to a server!",
                  color: 2409471,
                  timestamp: new Date().toISOString()
                }
              ],
              components: [
                {
                  type: 1, components: [
                    { style: 5, label: "Invite", emoji: { id: "841655450512261140" }, type: 2, url: `https://discord.com/api/oauth2/authorize?client_id=${interaction.application_id}&scope=applications.commands` }
                  ]
                }
              ]
            }
          });
          case "cat": case "cats": return int("cats", "photos", "🐈 Cat!", edit, userId);
          case "dog": case "dogs": return int("dogs", "photos", "🐕 Dog!", edit, userId);
          case "fox": return int("fox", "photos", "🦊 Fox!", edit, userId);
          case "pandas": return int("pandas", "photos", "🐼 Panda!", edit, userId);
          case "panda": return int("panda", "special", "🐈 Panda!", edit, userId);
          case "penguin": return int("penguin", "photos", "🐧 Penguin!", edit, userId);
          case "otter": return int("otter", "photos", "🦦 Otter!", edit, userId);
          case "bird": return int("bird", "photos", "🐦 Birb!", edit, userId);
          case "bunny": return int("bunny", "photos", "🐇 Bunny!", edit, userId);
          case "duck": return int("duck", "photos", "🦆 Quack!", edit, userId);
          case "redpanda": return int("redpanda", "photos", "<:RedPanda:849665956761305200> Red Panda!", edit, userId);
          case "shibe": return int("shibe", "photos", "Shiba!", edit, userId);
          case "pj": return int("pj", "special", "🐈 PJ!", edit, userId);
          case "tiggy": return int("tiggy", "special", "🐈 Tiggy!", edit, userId);
          case "sylvester": return int("sylvester", "special", "🐈 Sylvester!", edit, userId);
          case "husky": return int("husky", "photos", "🐕 Husky!", edit, userId);
          case "pug": return int("pug", "photos", "🐕 Pug!", edit, userId);
          case "aww": {
            const res = await reddit("aww");
            if (!res.status || !res.image) return error(res!.message ?? "Unknown Issue while trying to fetch the subreddit.", edit);
            return respond({ 
              type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource, 
              data: {
                content: res.image,
                components: component([ { type: 2, custom_id: `aww:${userId}`, style: 3, emoji: { id: "849713246813945876" } } ])
              } 
            })
          }
        }
        return error(`❌ The command you tried is a work in progress.`, edit);
      }
  }
  return new Response(`request method: ${request.method}`)
}

const error = (message: string, edit?: boolean) => respond({
  type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
  data: {
    embeds: [
      {
        title: "INFO",
        description: message,
        color: 0xFF0000,
        timestamp: new Date().toISOString()
      }
    ],
    flags: 1 << 6
  }
});

const respond = (response: APIInteractionResponse) => new Response(JSON.stringify(response), {headers: {'content-type': 'application/json'}})
const status = (message: string, status = false) => ({ status, message });
const getPhoto = async (type: string, name: string): Promise<ImgStatus> => {
    try {
      const ending = type ?? "photos";
      const res = await (await fetch(`https://my.elara.services/api/${ending}${ending === "special" ? `?type=${name}` : `/${name ?? "cats"}`}`)).json();
      if (!res!.status) return status(res!.message ?? "No response from the API!");
      return res;
    } catch (err) {
      return status(`Unable to fetch an image.`);
    }
};

const int = async (name: string, type: string, title: string, edit?: boolean, userId?: string): Promise<any> => {
    const r = await getPhoto(type, name);
    if (!r.status || !r.image) return respond({
      type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `❌ ${r.message}`,
        flags: 1 << 6
      }
    });
    return image(r.image, title, edit, name, `${userId}`);
};

const image = (img: string, title?: string, edit?: boolean, name?: string, userId?: string) => {
  return respond({
    type: edit ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [
        {
          title,
          url: img,
          image: { url: img },
          color: 2409471
        }
      ],
      components: component([ { type: 2, custom_id: `${name}:${userId}`, style: 3, emoji: { id: "849713246813945876" } } ])
    }
  })
}

const reddit = async (name: string): Promise<ImgStatus> => {
    try {
      // NOTE: Use 'hot' and 'new' 50% of the time.
      const type = Math.random() < 0.50 ? "hot" : "new";
      const r = await (await fetch(`https://reddit.com/r/${name}/${type}.json?limit=50`)).json();
      const children = r.data.children as { kind: string, data: { permalink: string, url: string } }[];
      if (!children.length) return status(`Unable to fetch any posts from: ${name}`);
      const random = children[Math.floor(Math.random() * children.length)];
      let image = `https://reddit.com${random.data.permalink}`;
      if (random.data.url.match(/.(jpg|jpeg|png)/gi)) image = random.data.url;
      return { status: true, image };
    } catch (err: Error|any) {
      return status(err!.message ?? "Unknown Error while trying to fetch from the subreddit.");
    }
};