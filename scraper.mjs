import fs from 'fs';
import { cars } from './src/data/cars.js';

async function getWikiOgImage(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const html = await res.text();
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {}
  return null;
}

async function run() {
  let content = fs.readFileSync('./src/data/cars.js', 'utf8');

  const updates = [
    { name: "Continental GT Speed", url: "https://en.wikipedia.org/wiki/Bentley_Continental_GT" },
    { name: "Bacalar", url: "https://en.wikipedia.org/wiki/Bentley_Bacalar" },
    { name: "Batur", url: "https://en.wikipedia.org/wiki/Bentley_Batur" },
    { name: "750S", url: "https://en.wikipedia.org/wiki/McLaren_750S" },
    { name: "765LT", url: "https://en.wikipedia.org/wiki/McLaren_765LT" }
  ];

  for (const update of updates) {
    let img = await getWikiOgImage(update.url);
    if (!img && update.name === "Bacalar") img = await getWikiOgImage("https://en.wikipedia.org/wiki/Bentley_Mulliner_Bacalar");
    if (!img && update.name === "750S") img = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/McLaren_750S_Spider_at_Goodwood_Festival_of_Speed_2023.jpg/1200px-McLaren_750S_Spider_at_Goodwood_Festival_of_Speed_2023.jpg";
    if (!img && update.name === "765LT") img = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/McLaren_765_LT_%2849925345717%29.jpg/1200px-McLaren_765_LT_%2849925345717%29.jpg";
    
    if (img) {
      const car = cars.find(c => c.name === update.name);
      if (car) {
        content = content.replace(car.image, img);
        console.log(`[FIXED] ${update.name} -> ${img}`);
      }
    } else {
      console.log(`[FAILED] ${update.name}`);
    }
  }

  fs.writeFileSync('./src/data/cars.js', content, 'utf8');
}

run();
