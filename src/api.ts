const useExternal = false;
const photosBase = `https://cdn.elara.workers.dev/api/photos`;

export const apis = {
  photos: {
    patpat: `${photosBase.replace("photos", "bot")}/patpat.png`,
    cards: `${photosBase}/Cards`,
    cats: `${photosBase}/cats/`,
    dogs: `${photosBase}/dogs/%RANDOM%.png`,
    boops: `${photosBase}/${useExternal ? "B" : "b"}oops/%RANDOM%.gif`,
    pandas: `${photosBase}/pandas/%RANDOM%.png`,
    redpandas: `${photosBase}/redpandas/%RANDOM%.png`,
    penguins: `${photosBase}/penguins/${useExternal ? "penguin" : ""}%RANDOM%.png`,
    husky: `${photosBase}/huskys/%RANDOM%.png`,
    hugs: `${photosBase}/Hugs/%RANDOM%.gif`,
    pugs: `${photosBase}/pugs/%RANDOM%.png`,
    cookies: `${photosBase}/${useExternal ? "C" : "c"}ookies/%RANDOM%.gif`,
    memes: `${photosBase}/memes/%RANDOM%.png`,
    pokes: `${photosBase}/pokes/%RANDOM%.gif`,

  },
  special: {
    ollie: `${photosBase}/ollie/%RANDOM%.png`, // 18
    amber: `${photosBase}/${useExternal ? "A" : "a"}mber/%RANDOM%.png`, // 9
    sylvester: `${photosBase}/sylvester/%RANDOM%.png`, // 56
    pj: `${photosBase}/PJ/%RANDOM%.png`,
    tiggy: `${photosBase}/tiggy/%RANDOM%.png`,
    mischief: `${photosBase}/mischief/%RANDOM%.png`,
    chase: `${photosBase}/chase/%RANDOM%.png`,
    panda: `${photosBase}/panda/%RANDOM%.png`
  }
};

export const limits = {
  memes: 100,
  cats: {
    gif: 2,
    png: 97
  },
  dogs: 101,
  boops: 5,
  ollie: 18,
  hugs: 41,
  cookies: 8,
  pugs: 72,
  pandas: 40,
  penguins: 178,
  panda: 185,
  redpandas: 251,
  amber: 9,
  sylvester: 56,
  husky: 67,
  pj: 113,
  tiggy: 132,
  pokes: 9,
  mischief: 69,
  chase: 23,
};

export const fetchImage = async (type: any) => {
  const random = (num: number) => Math.floor(Math.random() * num),
        // @ts-expect-error
        getImage = (image: any, photoType = "photos") => ({ status: true, image: apis[photoType][image].replace("%RANDOM%", random(limits[image])) });
  switch (type.toLowerCase()) {
    case "cats": case "cat": {
      if (Math.random() <= 0.40) {
        const R = await GET(`https://api.thecatapi.com/v1/images/search`)
        if (Array.isArray(R) && R.length) {
          const rr = R[0];
          if (rr && rr.url) return { status: true, image: rr.url };
        }
      }
      const randomCat = () => {
        const types = ["gif", "gif", "png", "png", "png", "png", "png", "png"], 
              type = types[Math.floor(Math.random() * types.length)];
          let num = 0;
          // @ts-expect-error
          num = random(limits.cats[type.toLowerCase()]);
        return `${apis.photos.cats}${type}/${num}.${type}`;
      };
      return { status: true, image: randomCat() };
    }
    case "dogs": case "dog": return getImage("dogs");
    case "pugs": case "pug": return getImage("pugs");
    case "penguins": case "penguin": return getImage('penguins');
    case "pandas": return getImage('pandas');
    case "otter": case "otters": return { status: true, image: `https://otter.bruhmomentlol.repl.co/index/${Math.floor(Math.random() * 3116)}` };
    case "hugs": case "hug": return getImage('hugs');
    case "husky": case "huskys": return getImage('husky');
    case "bird": case "birb": {
      const body = await GET(`https://some-random-api.ml/animal/bird`);
      if (!body) return status(`I was unable to fetch a bird image.`);
      return { status: true, image: body.image };
    }

    case "raccoon": case "raccoons": {
      const body = await GET(`https://some-random-api.ml/animal/raccoon`);
      if (!body) return status(`I was unable to fetch a raccoon image.`);
      return { status: true, image: body.image }
    }
    case "koala": case "koalas": {
      const body = await GET(`https://some-random-api.ml/animal/koala`);
      if (!body) return status(`I was unable to fetch a koala image.`);
      return { status: true, image: body.image };
    }

    case "bunny": case "bunnies": {
      const body = await GET(`https://api.bunnies.io/v2/loop/random/?media=gif,png`)
      if (!body || !body.media || !body.media.gif) return status(`I was unable to fetch a bunny image.`);
      return { status: true, image: body.media.gif };
    }
    case "duck": case "ducks": {
      const body = await GET(`https://random-d.uk/api/v2/quack`)
      if (!body) return status(`I was unable to fetch a duck image.`);
      return { status: true, image: body.url };
    }

    case "shibe": {
      const body = await GET(`https://shibe.online/api/shibes?count=1`)
      if (!body) return status(`I was unable to fetch a shibe image.`);
      return { status: true, image: body[0] };
    }

    case "fox": case "foxes": {
      const body = await GET(`https://randomfox.ca/floof/`);
      if (!body) return status(`I was unable to fetch a fox image.`);
      return { status: true, image: body.image };
    }

    case "redpanda": return getImage(`redpandas`);
    default: {
      // @ts-expect-error
      if (apis.special[type]) return getImage(type.toLowerCase(), "special");
      return status(`I was unable to find ${type}`);
    }
  }
}

export const status = (message: string, status = false) => ({ status, message });

export const GET = async (url: string) => {
  const res = await fetch(url);
  if (res.status !== 200) return null;
  return await res.json();
};