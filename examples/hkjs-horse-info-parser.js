const fs      = require('fs');
const cheerio = require('cheerio');

function getHorseAttr(text, html) {
  const result = html(`font:contains(${text})`)
    .parent()
    .next()
    .text()
    .split(':')[1]
    .trim() || '';

  console.log(`${text}: ${result}`);
  return result;
}

fs.readFile('example.html', (err, htmlString) => {
  if (err) return console.error(err);

  const $ = cheerio.load(htmlString);

  const title = $('title').text().split('-')[0].trim();
  console.log(`馬名: ${title}`);

  const birth                     = getHorseAttr('出生地 / 馬齡', $);
  const trainer                   = getHorseAttr('練馬師', $);
  const sex                       = getHorseAttr('毛色 / 性別', $);
  const owner                     = getHorseAttr('馬主', $);
  const type                      = getHorseAttr('進口類別', $);
  const currentRating             = getHorseAttr('現時評分', $);
  const startofSeasonRating       = getHorseAttr('季初評分', $);
  const seasonStakes              = getHorseAttr('今季獎金*', $);
  const totalStakes               = getHorseAttr('總獎金*', $);
  const stats                     = getHorseAttr('冠-亞-季-總出賽次數*', $);
  const numOver10PastRaceMeetings = getHorseAttr('最近十個賽馬日出賽場數', $);

  $('tr[bgcolor="#F8F4EF"], tr[bgcolor="#E7E4DF"]').each((i, elem) => {
    const numColumns = $(elem).children('td').length;

    for (let index = 0; index < numColumns; index++) {
      const line = $(elem).children('td').eq(index).text();
      if (line !== '') {
        process.stdout.write(`${line.trim()} `);
      }
    }
    process.stdout.write('\n');
  });

  return 0;
});
