## imweb_test
- 테스트 코드에 사용한 mysql과 redis는 도커 이미지를 이용하여 진행하였습니다.
- 문제 5번을 위해 test5 데이터베이스를 이용하였고 문제 3번을 위해 test3 데이터베이스를 이용했습니다.

---
### 1. Batch Service로 타 서비스(A)와 운영중인 서비스(B)간 API통신을 통해 데이터를 송수신하고 있다.이때 통신두절 및 오류발생 등 예상치 못한 문제가 발생하여 데이터 송수신이 정상적으로 이뤄지지 않은경우 어떻게 처리할지 또는 서비스 장애로 이어지지 않게 하기 위한 설계 방안을 기술하시오
1. 운영 스케줄에 따라 자동으로 실행되게 서비스를 구현하고 따로 수동으로 실행 가능한 로직도 구현해 만약의 상황에 대비할 수 있도록 설계합니다.
2. 한번에 많은 양의 데이터를 송수신 하는 것이 아니라 조금씩 나눠서 통신이 진행될 수 있도록 설계합니다.
3. 배치 서비스가 비정상적이게 될 대 담당자에게 경보를 울려 대처할 수 있도록 설계합니다. ex) api 통신이 실패할 때 경고창이 발생하게 한다.
4. 서비스의 중요한 기능이 영향을 받지 않도록 배치 서비스를 통해 데이터를 송수신 하는 범위를 좁힙니다. ex) 결제 시스템이 있다면 결제 시스템을 배치 서비스를 통해 진행하는 것이 아니라
결제 완료된 목록을 넘기는 부분을 배치 서비스로 설계한다면 서비스의 메인 기능에 에러가 생기는 경우를 막을 수 있을 것 같습니다.
---

### 2. Batch Service를 만들려고 할때 1분미만의 반복동작되는 Batch Service를 어떻게 만들수 있을지 작성하시오
**2가지 경우의 상황을 생각했습니다.**

**1. 반복동작이 batch 서비스의 주기보다 작은 경우**
=> node-schedule 패키지를 이용해 주기적으로 서비스를 반복하도록 설정합니다.

**2. 만약 1분 미만의 반복 주기보다 서비스가 실행되는 시간이 더 긴 경우**
=> 이 경우 지속적으로 batch 서비스를 실행하는 것이 아니라 몇 번으로 나누어 마무리 하지 못한 작업을 마무리 하고 다음 주기로 넘어가도록 코드를 구현했습니다.

- 마찬가지로 node-schedule 패키지를 이용하였고 주기적으로 배치 서비스를 실행하기 위해 setInterval 함수를 이용했습니다.
- 작성한 예시 코드는 /batchService.js 파일에서 확인할 수 있습니다.
- startBatch 함수의 경우 실제 batch 서비스가 진행되는 동작에 대한 함수입니다. 문제에서는 1분 미만이었지만 테스트를 위해 2초마다 db작업을 진행하도록 설정하였습니다.
- 이때 setTimeout을 13초로 설정하여 2초의 주기보다 더 길게 작동이 마무리 되도록 조건을 주었습니다.
- 다음으로 intervalBatch 함수에서는 위에서 정의한 startBatch 함수를 5초 마다 실행하도록 설정하였습니다. 이때 cnt가 1인 경우만 startBatch 함수를 실행하고 cnt가 3이 될때
지금까지 정의된 배치 함수들을 마무리하며 더이상 진행하지 않도록 설정했습니다.
- 마지막으로 app.js에서 setInterval을 통해 30초마다 intervalBatch 함수를 호출하였기 때문에 startBatch의 setTimeout을 걸어준 부분이 마무리 된 후 새로운 batch 서비스를
진행할 수 있도록 코드를 작성하여 배치 주기보다 넘어가는 서비스 로직이 진행되더라도 3번씩 작동하고 이후 남아있던 로직을 모두 처리한 후 다시 배치 서비스를 실행하도록 구현했습니다.

```js
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
```
---

### 3. DataBase, Api, Page Load 등에서 동일한 결과가 표시되는 데이터들이 존재할때, 어떤기술들을 이용하여 해당 데이터들을 최적화 할 수 있을지 작성하시오
**1. 데이터베이스에서 처리**

** model/index.js 에서 Contacts 클래스를 이용해 test3 데이터베이스의 contacts 테이블에서 테스트를 진행했습니다.**
- 가장 먼저 주기적으로 중복된 데이터를 제거하는 방법을 생각했습니다.
- 이때 사용한 중복된 데이터를 제거하는 쿼리는 다음과 같습니다.
- 해당 쿼리를 주기적으로 사용하여 테이블의 중복된 값들을 제거하여 중복을 방지할 수 있을것 같습니다.
```sql
delete t1 from contacts as t1
	join contacts as t2
	on t1.email = t2.email
where t1.id > t2.id
```

**2. API에서 처리**
- 중복된 데이터를 전달하는 api를 하나로 합쳐 재사용하도록 할 수 있습니다.
- 또한 동일한 쿼리를 이용하는 부분을 따로 하나의 단계로 빼내어 이를 여러 컨트롤러에 이용하는 구조를 사용하여 데이터베이스와 연동하는 쿼리의 중복 작성을 방지할 수 있을것 같습니다.

**3. Redis 이용**
- 반복되는 값을 레디스에 저장하는 방법을 통해 중복을 줄일 수 있을것 같습니다.
- 처음 요청이 들어오면 레디스에 해당하는 값이 있는지 먼저 확인하고 있다면 해당 값을 응답으로 보내주고 만약 없다면 데이터베이스에 작업 이후 이를 레디스에 저장하고 응답으로 보내줍니다.
- 즉, 요청이 오면 먼저 레디스에서 확인 하는 과정을 거친 후 다음 작업으로 넘어갑니다.
- 작성한 코드에서는 /routes/test3Router.js 부분에서 확인할 수 있습니다.
- checkRedisMiddleware 에서는 레디스에 원하는 데이터가 있는지 확인하고 다음으로 넘기거나 응답을 보내주는 미들웨어입니다.
- 요청을 받게되면 해당 미들웨어를 거치고 값이 없다면 데이터베이스를 조회하는 것을 확인할 수 있습니다. 이후 레디스에 해당 데이터들을 저장하고 응답으로 보내줍니다.

```js
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
```

- 레디스에 데이터가 없는 경우 약 30ms의 시간이 걸렸지만 이후의 요청에는 훨씬 적은 시간이 걸린것을 확인할 수 있습니다.
![image](https://user-images.githubusercontent.com/91299082/164984317-c9a425a2-3722-456a-938e-0a2b8875d40b.png)

---

### 4. 대량의 공격성 접속문제로 서비스가 중단되는 상황이 발생될때, 서비스가 중단되는 원인 확인 및 해결방법에 대해 작성하시오(서비스 구성은 : linux, nginx, php-fpm, mysql로 구성되어있다고 가정함)
**1. 로그 작성을 통해 원인 파악**
- 원인 확인을 위해 공격성 접속을 시도하는 ip 주소를 파악해야 한다고 생각했습니다.
- 따라서 요청에 따른 ip 로그 파일을 작성하여 관리하고 서비스가 중단되었을때 해당 로그 파일을 확인하여 다량의 접속이 기록된 로그를 찾아 원인이 되는 ip를 찾아야 할 것 같습니다.
- php-fpm 을 시간 관계상 공부를 제대로 하지 못하여 node.js 로 백엔드 서버가 구성되어 있다고 가정하고 진행했습니다.

- 먼저 요청 ip 마다 로그를 작성해주는 미들웨어를 만들었습니다. 아래 코드는 /middleware/writeLogFileMiddleware.js 파일입니다.
- 요청이 들어오면 ip를 찾고 해당 ip를 요청 시간과 함께 connection.log 파일에 작성하도록 코드를 구현했습니다.
```js
module.exports = (req, res, next) => {
  const ip = req.header["x-forwarded-for"] || req.connection.remoteAddress;

  const now = new Date();
  const convertNow = now.toDateString() + ' ' + now.toTimeString();

  const filePath = path.join(__dirname, '../connection.log');

  fs.appendFileSync(filePath, `ip: ${ip}, time: ${convertNow} \n`);

  next();
}
```
**2. nginx 설정을 통해 해당 ip 요청 차단**
- 악성 공격이 들어왔을 때 작성된 로그파일을 통해 nginx의 ip 차단 목록을 작성해 줍니다.
- 이후 nginx 설정을 통해 해당 ip를 차단시켜 줍니다.
```
/etc/nginx/blacklist.conf

deny 111.111.111.11;
deny 111.111.111.12;
allow all;

/etc/nginx/nginx.conf
server {
	listen 80;
	include /etc/nginx/blacklist.conf;
	
	server_name localhost:80
	
	location / {
		...

	}
}
```
---
### 5. member 테이블에서 장기간 미접속한 회원들을 unconnected_member 테이블로 이전시키고자 한다, 가장 호율적으로 이전시킬 수 있는 방법을 코딩하시오
**60만개의 미접속한 회원 데이터를 빠르게 찾는것이 가장 중요하다고 생각하였습니다.**
- 따라서 미접속한 회원들을 찾기 위해 last_login_time 속성을 이용하였는데 이때 datetime 타입 보다는 unixtime 으로 정수형 타입을 사용하는게 훨씬 빠르게 찾을것이라고 생각했습니다.
- 추가로 last_login_time 속성에 index를 추가하여 검색을 빠르게 할 수 있도록 설정하였습니다.



















