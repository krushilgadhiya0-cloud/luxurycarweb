import fs from 'fs';

async function testWiki(title) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=50&format=json`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId !== "-1" && pages[pageId].images) {
      let images = pages[pageId].images.filter(img => 
        img.title.toLowerCase().endsWith('.jpg') && 
        !img.title.toLowerCase().includes('logo') &&
        !img.title.toLowerCase().includes('engine') &&
        !img.title.toLowerCase().includes('interior')
      );
      
      if(images.length > 0) {
        // Fetch image URL for the first valid image
        const imgName = images[images.length > 2 ? 1 : 0].title; // Try picking the second image if there are many, often better angle
        const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(imgName)}&prop=imageinfo&iiprop=url&format=json`);
        const imgData = await imgRes.json();
        const imgPages = imgData.query.pages;
        const imgPageId = Object.keys(imgPages)[0];
        
        if (imgPageId !== "-1" && imgPages[imgPageId].imageinfo) {
          console.log(`${title} -> ${imgPages[imgPageId].imageinfo[0].url}`);
          return;
        }
      }
    }
    console.log(`${title} -> FAILED`);
  } catch (e) {
    console.log(`${title} -> ERROR`);
  }
}

async function run() {
  await testWiki('Lamborghini Revuelto');
  await testWiki('Lamborghini Sian FKP 37');
  await testWiki('Ferrari SF90 Stradale');
  await testWiki('Porsche 911 GT3 RS');
}

run();
