const express = require('express');

const router = express.Router();

router.get('/input', async (req, res, next) => {
  for (let i=1; i<100000; i++) {
    if (i <= 100000) {
      await Member.create({
        email: `test${i}@naver.com`,
        name: `test${i}`,
        join_date: new Date(2020, 5, 1),
        last_login_time: new Date(2021, 1, 2)
      })
    } else {
      await Member.create({
        email: `test${i}@naver.com`,
        name: `test${i}`,
        join_date: new Date(2020, 1, 1),
        last_login_time: new Date(2022, 1, 2)
      })
    }
    console.log(i);
  }
  return res.json({success: true, message: 'db 데이터 입력 완료'});
})

router.get('/unixtime', (req, res, next) => {
  const d = new Date(2021, 1, 1)
  const unixTime = d.getTime() / 1000
  console.log(unixTime)
  res.json({date: new Date(1612105200*1000)});
})

router.get('/input/unixtime', async (req, res, next) => {
  for (let i=1; i<100000; i++) {
    if (i <= 100000) {
      const d = new Date(2021, 1, 2)
      const unixTime = Math.floor(d.getTime() / 1000)
      await NewMember.create({
        email: `test${i}@naver.com`,
        name: `test${i}`,
        join_date: new Date(2020, 5, 1),
        last_login_time: unixTime
      })
    } else {
      const d = new Date(2022, 1, 2)
      const unixTime = Math.floor(d.getTime() / 1000)
      await NewMember.create({
        email: `test${i}@naver.com`,
        name: `test${i}`,
        join_date: new Date(2020, 1, 1),
        last_login_time: unixTime
      })
    }
    console.log(i);
  }
  return res.json({success: true, message: 'db 데이터 입력 완료'});
})

module.exports = router;