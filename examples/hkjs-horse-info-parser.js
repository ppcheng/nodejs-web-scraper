const fs      = require('fs');
const cheerio = require('cheerio');

function getHorseAttr(text, html) {
  const result = [];
  const value = html(`font:contains(${text})`)
    .parent()
    .next()
    .text()
    .split(':')[1]
    .trim() || '';

  const temp = text.split('/');
  if (temp.length > 1) {
    const valueArr = value.split('/');
    for (let i = 0; i < temp.length; i++) {
      result.push(valueArr[i].trim());
      console.log(`${temp[i].trim()}: ${valueArr[i].trim()}`);
    }
  } else {
    result.push(value);
    console.log(`${text}: ${value}`);
  }

  return result;
}

function save2xls(headers, records, filename) {
  const writeStream = fs.createWriteStream(filename);

  writeStream.write(`${headers.join(',')}\n`);

  records.forEach((elem) => {
    writeStream.write(`${elem.join(',')}\n`);
  });

  writeStream.on('finish', () => {
    console.log('data has been saved successfully');
    writeStream.close();
  });
}

fs.readFile('example.html', (err, htmlString) => {
  if (err) return console.error(err);

  const headers = [];
  const $       = cheerio.load(htmlString);

  const records   = [];

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

  $('tr > td[class="hsubheader"]').each((i, elem) => {
    const value = $(elem).text().trim();
    headers.push(value);
    process.stdout.write(`${value} `);
  });
  process.stdout.write('\n');

  $('tr[bgcolor="#F8F4EF"], tr[bgcolor="#E7E4DF"]').each((i, elem) => {
    const numColumns = $(elem).children('td').length;

    const row = [];

    for (let index = 0; index < numColumns; index++) {
      const line = $(elem).children('td').eq(index).text();
      if (line !== '') {
        row.push(line.trim());
        process.stdout.write(`${line.trim()} `);
      }
    }
    records.push(row);

    process.stdout.write('\n');
  });

  save2xls(headers, records, 'example.csv');

  return 0;
});

