const Promise   = require('bluebird');
const fs        = require('fs');
const url       = require('url');
const path      = require('path');
const cheerio   = require('cheerio');

const XlsWriter = require('./util/XlsWriter');

Promise.promisifyAll(fs);

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
    result.push(value.replace(',', ''));
    console.log(`${text}: ${value}`);
  }

  return result;
}

function parseLink2Id(link) {
  return url.parse(link).pathname.split('/').slice(-1).pop();
}

async function HorseInfoParser(file) {
  const headers = [];
  const records = [];

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

  try {
    const html = await fs.readFileAsync(file);
    const $    = cheerio.load(html);

    const title = $('title').text().split('-')[0].trim();
    records.push(['馬名', title]);
    console.log(`馬名: ${title}`);

    const horseId = parseLink2Id($('font:contains("賽績易")').parent().attr('href'));
    records.push(['ID', horseId]);
    console.log(`ID: ${horseId}`);

    records.push(['圖片', `www.hkjc.com/images/horse/${horseId}_s.jpg`]);

    basicInfo.forEach((item) => {
      const resp = getHorseAttr(item, $);
      if (item.split('/').length > 1) {
        item.split('/').forEach((val, index) => {
          records.push([`${val.trim()}`, `${resp[index]}`]);
        });
      } else {
        records.push([`${item}`, resp]);
      }
    });

    headers.push('烙號');
    process.stdout.write('烙號 ');

    $('tr > td[class="hsubheader"]').each((i, elem) => {
      const value = $(elem).text().trim();
      headers.push(value);
      process.stdout.write(`${value} `);
    });
    process.stdout.write('\n');
    records.push(headers);

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

      row[row.length - 8] = `'${row[row.length - 8]}'`;
      records.push(row);

      process.stdout.write('\n');
    });

    XlsWriter.save2csv([], records, `${__dirname}/data/csv/${horseId}.csv`);
  } catch (err) {
    console.error(err);
  }
  return true;
}

exports.HorseInfoParser = HorseInfoParser;

(async function parseDataDir() {
  const dir = `${__dirname}/downloads/horses/html/`;
  try {
    const files = await fs.readdirAsync(dir);

    for (let i = 0; i < files.length; i++) {
      console.log(await HorseInfoParser(dir + files[i]));
    }
  } catch (err) {
    console.error(err);
  }
}());
