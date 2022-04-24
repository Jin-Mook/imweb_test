const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  const ip = req.header["x-forwarded-for"] || req.connection.remoteAddress;

  const now = new Date();
  const convertNow = now.toDateString() + ' ' + now.toTimeString();

  const filePath = path.join(__dirname, '../connection.log');

  fs.appendFileSync(filePath, `ip: ${ip}, time: ${convertNow} \n`);

  next();
}