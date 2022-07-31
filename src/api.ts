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
      tigger: `${photosBase}/tigger/%RANDOM%.png`,
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
    tigger: 132,
    pokes: 9,
    mischief: 69,
    chase: 23,
};