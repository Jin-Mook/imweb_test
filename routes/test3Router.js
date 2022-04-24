const express = require('express');
const redis = require('redis');
const { Contacts } = require('../model/index');

const router = express.Router();

const client = redis.createClient({
  url: 'redis://localhost:6379',
});

const checkRedisMiddleware = async function (req, res, next){
  try {
    await client.connect()
    const cacheDatabase = await client.get('key2')
    
    await client.disconnect()

    const result = JSON.parse(cacheDatabase)
    if (cacheDatabase) {
      console.log('redis에 데이터가 있는경우')
      res.json({result})
    } else {
      console.log('redis에 데이터가 없는 경우')
      next()
    }
  } catch(error) {
    await client.disconnect()
    console.error(error)
    next()
  }
}

router.get('/', checkRedisMiddleware, async (req, res, next) => {
  try {
    const contacts = await Contacts.findAll()

    client.connect()

    const storedContacts = JSON.stringify(contacts)

    await client.set('key2', storedContacts)
    console.log('redis에 데이터 저장')
    const result = JSON.parse(await client.get('key2'))

    await client.disconnect()
    res.json({result})

  } catch(err) {
    await client.disconnect()
    res.json({message: '서버 내부 에러'})
  }
})

module.exports = router;