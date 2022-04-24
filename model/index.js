const { Sequelize, DataTypes, Model } = require('sequelize');

const sequelize = new Sequelize('mysql://root:password@localhost:3306/test5');
const sequelize2 = new Sequelize('mysql://root:password@localhost:3306/test3');
const db ={};

// member 테이블
class Member extends Model {};

Member.init({
  email: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  join_date: {
    type: DataTypes.DATE,
  },
  last_login_time: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Member',
  tableName: 'member',
  createdAt: false,
  updatedAt: false,
  indexes: [
    {
      fields: ['last_login_time']
    }
  ]
})

// unconnected_member 테이블
class UnconnectedMember extends Model {};

UnconnectedMember.init({
  email: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  join_date: {
    type: DataTypes.DATE,
  },
  last_login_time: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'UnconnectedMember',
  tableName: 'unconnected_member',
  createdAt: false,
  updatedAt: false,
  indexes: [
    {
      fields: ['last_login_time']
    }
  ]
})

// 비교를 위한 new_member 테이블
class NewMember extends Model {};

NewMember.init({
  email: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  join_date: {
    type: DataTypes.DATE,
  },
  last_login_time: {
    type: DataTypes.INTEGER.UNSIGNED,
    
  }
}, {
  sequelize,
  modelName: 'NewMember',
  tableName: 'new_member',
  createdAt: false,
  updatedAt: false,
  indexes: [
    {
      fields: ['last_login_time']
    }
  ]
})

// 비교를 위한 new_unconnected_member 테이블
class NewUnconnectedMember extends Model {};

NewUnconnectedMember.init({
  email: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  join_date: {
    type: DataTypes.DATE,
  },
  last_login_time: {
    type: DataTypes.INTEGER.UNSIGNED,
  }
}, {
  sequelize,
  modelName: 'NewUnconnectedMember',
  tableName: 'new_unconnected_member',
  createdAt: false,
  updatedAt: false,
  indexes: [
    {
      fields: ['last_login_time']
    }
  ]
})

// 2번 문제를 위한 테이블
class Test2Batch extends Model {};

Test2Batch.init({
  message: {
    type: DataTypes.STRING,
  },
  count: {
    type: DataTypes.INTEGER,
  }
}, {
  sequelize,
  modelName: 'Test2Batch',
  tableName: 'test2_batch',
  createdAt: false,
})


// test3번 레디스를 이용한 db 중복 방지
class Contacts extends Model {};

Contacts.init({
  first_name: {
    type: DataTypes.STRING
  },
  last_name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  }
}, {
  sequelize: sequelize2,
  modelName: 'Contacts',
  tableName: 'contacts',
  createdAt: false,
  updatedAt: false,
})


db.sequelize = sequelize;
db.sequelize2 = sequelize2;
db.Member = Member;
db.UnconnectedMember = UnconnectedMember;
db.NewMember = NewMember;
db.NewUnconnectedMember = NewUnconnectedMember;
db.Test2Batch = Test2Batch;
db.Contacts = Contacts;


module.exports = db;