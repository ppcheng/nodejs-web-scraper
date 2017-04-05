const fs = require('fs');

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

exports.save2csv = save2csv;
