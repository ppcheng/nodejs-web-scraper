const cheerio   = require('cheerio');
const Promise   = require('bluebird');
const fs        = require('fs');

const fsPromise = Promise.promisifyAll(fs);

function save2csv(headers, records, filename) {
  const writeStream = fs.createWriteStream(filename);

  if (JSON.stringify(headers) !== '[]') {
    writeStream.write(`${headers.join(',')}\n`);
  }

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

function getHorseInfoURL(id) {
  return `http://www.hkjc.com/chinese/racing/horse.asp?HorseNo=${id}&Option=1#htop`;
}

async function horseListParser(htmlFile) {
  let records = [];
  try {
    const file = await fsPromise.readFileAsync(htmlFile);
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

    save2csv([], records, 'list.csv');
  } catch (err) {
    console.error(err);
  }
  return records;
}

// horseListParser('horserating.html');

(async function main() {
  const response = await horseListParser('horserating.html');
  console.dir(response);
}());
