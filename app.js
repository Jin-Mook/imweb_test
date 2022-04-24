const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const {sequelize, sequelize2} = require('./model');
const test5Router = require('./routes/test5Router');
const test3Router = require('./routes/test3Router');
const intervalBatch = require('./batchService');
const writeLogFileMiddleware = require('./middleware/writeLogFileMiddleware');


try {
  const isExists = fs.existsSync('./connection.log')
  if (!isExists) {
    fs.writeFileSync('./connection.log', '');
  }
} catch (error) {
  console.log(error);
}


const app = express();
app.use(morgan('dev'));

intervalBatch();
// 처음 batch를 진행하고 gracefullShutdown을 통해 멈춰준다
// 이후 setInterval을 이용해 다시 진행해주는 방식을 이용했다.
setInterval(() => {intervalBatch()}, 30000);

sequelize.sync();
sequelize2.sync();

app.use(writeLogFileMiddleware);
app.use('/test5', test5Router);
app.use('/test3', test3Router);


app.listen(3000, () => {
  console.log('test 준비');
})