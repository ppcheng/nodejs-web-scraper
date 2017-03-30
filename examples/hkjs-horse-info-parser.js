const fs      = require('fs');
const url     = require('url');
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

  for (let i = 0; i <= records.length; i++) {
    if (i === records.length) {
      writeStream.end();
    } else {
      writeStream.write(`${records[i].join(',')}\n`);
    }
  }

  writeStream.on('finish', () => {
    console.log('data has been saved successfully');
    writeStream.close();
  });
}

function parseLink2Id(link) {
  return url.parse(link).pathname.split('/').slice(-1).pop();
}

fs.readFile('example.html', (err, htmlString) => {
  if (err) return console.error(err);

  const headers = [];
  const records = [];
  const $       = cheerio.load(htmlString);

  const basicInfo = [
    '出生地 / 馬齡',
    '練馬師',
    '毛色 / 性別',
    '馬主', '進口類別',
    '現時評分',
    '季初評分',
    '今季獎金',
    '總獎金',
    '冠-亞-季-總出賽次數*',
    '最近十個賽馬日出賽場數'
  ];

  const title = $('title').text().split('-')[0].trim();
  console.log(`馬名: ${title}`);

  const horseId = parseLink2Id($('font:contains("賽績易")').parent().attr('href'));
  console.log(`ID: ${horseId}`);

  basicInfo.forEach((item) => {
    getHorseAttr(item, $);
  });

  headers.push('烙號');
  process.stdout.write('烙號 ');
  $('tr > td[class="hsubheader"]').each((i, elem) => {
    const value = $(elem).text().trim();
    headers.push(value);
    process.stdout.write(`${value} `);
  });
  process.stdout.write('\n');

  $('tr[bgcolor="#F8F4EF"], tr[bgcolor="#E7E4DF"]').each((i, elem) => {
    const numColumns = $(elem).children('td').length;

    const row = [];

    row.push(horseId);
    process.stdout.write(`${horseId} `);
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

  save2xls(headers, records, `${title}.csv`);

  return 0;
});

