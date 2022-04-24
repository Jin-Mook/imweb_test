const { Test2Batch } = require('./model/index');
const schedule = require('node-schedule');

const startBatch = function () {
  const job = schedule.scheduleJob('*/2 * * * * *', async () => {
    console.log('batch service...');
    setTimeout(() => {console.log('setTimeout method is running after 13 seconds...')}, 13000);
    const count = await Test2Batch.count();

    if ( count < 100 ) {
      const newMessage = await Test2Batch.create({
        message: `${new Date().getDate()} 일`,
        count: `${new Date().getSeconds()}`,
      })
      console.log(newMessage.dataValues);
    } 
  })
}

const intervalBatch = function() {
  let cnt = 0;
  const job = schedule.scheduleJob('*/5 * * * * *', () => {
    console.log('start intervalBatch...');
    cnt ++
    console.log(cnt)
    if (cnt == 1) startBatch();

    if (cnt == 3) {
      schedule.gracefulShutdown();
    }
  })
}

module.exports = intervalBatch;