import fs from 'fs';
import { cars } from './src/data/cars.js';

async function fetchWiki(title) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1200`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== "-1" && pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
      return pages[pageId].thumbnail.source;
    }
  } catch (e) {}
  return null;
}

async function run() {
  let content = fs.readFileSync('./src/data/cars.js', 'utf8');
  console.log("Fixing the 5 specific cars...");

  const corrections = [
    { targetName: "Continental GT Speed", wikiTitle: "Bentley Continental GT" },
    { targetName: "Bacalar", wikiTitle: "Bentley Mulliner Bacalar" },
    { targetName: "Batur", wikiTitle: "Bentley Mulliner Batur" },
    { targetName: "750S", wikiTitle: "McLaren 750S" }, // test direct first
    { targetName: "765LT", wikiTitle: "McLaren 765LT" }
  ];

  for (const c of corrections) {
    let imgObj = await fetchWiki(c.wikiTitle);
    
    // Fallbacks if Wikipedia has no image explicitly
    if (!imgObj && c.targetName === "750S") imgObj = await fetchWiki("McLaren 720S");
    if (!imgObj && c.targetName === "Bacalar") imgObj = await fetchWiki("Bentley EXP 100 GT"); // Closest concept visually
    if (!imgObj && c.targetName === "Batur") imgObj = await fetchWiki("Bentley Continental GT"); // fallback

    const car = cars.find(car => car.name === c.targetName);
    if (car && imgObj) {
      content = content.replace(car.image, imgObj);
      console.log(`[FIXED] ${c.targetName} -> ${imgObj}`);
    } else {
      console.log(`[FAILED] ${c.targetName}`);
    }
  }

  fs.writeFileSync('./src/data/cars.js', content, 'utf8');
  console.log("Done.");
}

run();
