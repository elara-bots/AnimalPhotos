import { verify } from "./verify";
import { InteractionType, InteractionResponseType, APIInteractionResponse, APIApplicationCommandInteraction } from "discord-api-types/v9";
import { APIPingInteraction } from 'discord-api-types/payloads/v9/_interactions/ping'

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  switch(url.pathname) {
      case "/interactions": {
        if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return Response.redirect('https://discord.com')
        if (!await verify(request)) return new Response('', { status: 401 })
        const interaction = await request.json() as APIPingInteraction | APIApplicationCommandInteraction;
        if (interaction.type === InteractionType.Ping) return respond({ type: InteractionResponseType.Pong });
        const name: string = interaction.data.name.toLowerCase();
        if (!name) return respond({ 
          type: InteractionResponseType.ChannelMessageWithSource, 
          data: {
            content: `❌ Unable to find the command name.`,
            flags: 1 << 6
          } 
        });

        switch (name) {
          case "cat": return int("cats", "photos", "🐈 Cat!");
          case "dog": return int("dogs", "photos", "🐕 Dog!");
          case "fox": return int("fox", "photos", "🦊 Fox!");
          case "panda": return int("panda", "photos", "🐼 Panda!");
          case "penguin": return int("penguin", "photos", "🐧 Penguin!");
          case "otter": return int("otter", "photos", "🦦 Otter!");
          case "bird": return int("bird", "photos", "🐦 Birb!");
          case "bunny": return int("bunny", "photos", "🐇 Bunny!");
          case "duck": return int("duck", "photos", "🦆 Quack!");
          case "redpanda": return int("redpanda", "photos", "<:RedPanda:849665956761305200> Red Panda!");
          case "shibe": return int("shibe", "photos", "Shiba!");
          case "pj": return int("pj", "special", "🐈 PJ!")
          case "tiggy": return int("tiggy", "special", "🐈 Tiggy!")
          case "sylvester": return int("sylvester", "special", "🐈 Sylvester!")
        }

        return respond({ 
          type: InteractionResponseType.ChannelMessageWithSource, 
          data: {
            content: "❌ The command you tried is a work in progress.",
            flags: 1 << 6
          } 
        })
      }
  };
  return new Response(`request method: ${request.method}`)
}

const respond = (response: APIInteractionResponse) => new Response(JSON.stringify(response), {headers: {'content-type': 'application/json'}})
const status = (message: string, status = false) => ({ status, message });
const getPhoto = async (type: string, name: string): Promise<{ status: boolean, message?: string, image?: string }> => {
    try {
      const ending = type ?? "photos";
      const res = await (await fetch(`https://my.elara.services/api/${ending}${ending === "special" ? `?type=${name}` : `/${name ?? "cats"}`}`)).json();
      if (!res!.status) return status(res!.message ?? "No response from the API!");
      return res;
    } catch (err) {
      return status(`Unable to fetch an image.`);
    }
};

const int = async (name: string, type: string, title: string): Promise<any> => {
    const r = await getPhoto(type, name);
    if (!r.status || !r.image) return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `❌ ${r.message}`,
        flags: 1 << 6
      }
    });
    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        embeds: [
          {
            title,
            url: r.image,
            image: { url: r.image },
            color: 11701759
          }
        ],
        // components: [
        //   { type: 1, components: [
        //     { type: 2, style: 5, url: r.image, emoji: { id: "858375669418950666" } }
        //   ] }
        // ]
      }
    })
}