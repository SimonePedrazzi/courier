const { attributes } = require('structure');
const ULID = require('ulid');
const DeviceInfo = require('./deviceInfo');

const Message = attributes({
  uid: {
    type: String,
    default: (instance) => ULID.ulid()
  },
  created: {
    type: Date,
    nullable: true,
    default: (instance) => Date.now()
  },
  accountType: {
    type: String,
    required: true,
    equal: ['customer', 'operator']
  },
  accountId: String,
  content: String,
  deviceInfo: {
    type: DeviceInfo,
    default: (instance) => DeviceInfo()
  },
  previous: {
    type: String,
    nullable: true
  }
})(class Message {});

module.exports = Message;
