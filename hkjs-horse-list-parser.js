const cheerio    = require('cheerio');
const Promise    = require('bluebird');
const fs         = require('fs');
const redis      = require('redis');

const HttpClient = require('./util/HttpClient');
const XlsWriter  = require('./util/XlsWriter');

Promise.promisifyAll(fs);
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

// const client = redis.createClient();

function getHorseInfoURL(id) {
  return `http://www.hkjc.com/chinese/racing/horse.asp?HorseNo=${id}&Option=1#htop`;
}

async function horseListParser(htmlFile) {
  let records = [];
  let targets = [];

  try {
    const file = await fs.readFileAsync(htmlFile);
    const $    = cheerio.load(file);

    $('tr[style="font-family:細明體_HKSCS"] ~ tr:nth-child(n+2)').each((i, elem) => {
      const numColumns = $(elem).children('td').length;

      if (numColumns > 0) {
        let row = [];

        for (let index = 0; index < numColumns; index++) {
          const line = $(elem).children('td').eq(index).text();
          row.push(line);
          // process.stdout.write(`${line.trim()} `);

          if (index === 5 || index === 11) {
            row.push(getHorseInfoURL(row[2]));

            targets.push({
              url: row[6],
              filename: `${__dirname}/downloads/horses/html/${row[2]}.html`
            });
            // process.stdout.write(getHorseInfoURL(row[2]));

            if (row[1].trim() !== '') {
              records
                .push(row
                  .filter((value, pos) => pos !== 5)
                  .map((value, pos) => {
                    if (pos === 4 && value.trim() === '') {
                      return 0;
                    }
                    return value;
                  })
                );
            }
            row = [];
            // process.stdout.write('\n');
          }
        }
      }
    });

    XlsWriter.save2csv([], records,  `${__dirname}/downloads/list.csv`);

    for (let val of targets) {
      await Promise.all([
        HttpClient.getNdownloadAsync(val.url, val.filename),
        timeout(Math.floor(Math.random() * (5000 - 3000)) + 3000)
      ]);
    }
  } catch (err) {
    console.error(err);
  }
  return records;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// horseListParser('horserating.html');

(async function main() {
  const response = await horseListParser(`${__dirname}/examples/horserating.html`);
  // console.dir(response);
}());
