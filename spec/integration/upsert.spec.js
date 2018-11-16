/* eslint-disable no-return-assign */
const fs = require('fs');
const sinon = require('sinon');
const upsert = require('../../lib/actions/upsert');
const {messages} = require('elasticio-node');
const chai = require('chai');
const {expect} = chai;

describe('upsert', function() {
  this.timeout(5000);

  let message;
  let lastCall;
  let configuration;

  beforeEach(async () => {
    lastCall.reset();
  });

  before(async () => {
    if (fs.existsSync('.env')) {
      require('dotenv').config();
    }

    lastCall = sinon.stub(messages, 'newMessageWithBody')
        .returns(Promise.resolve());

    configuration =
        {
          apiVersion: '39.0',
          oauth: {
            issued_at: '1541510572760',
            token_type: 'Bearer',
            id: 'https://login.salesforce.com/id/00DE0000000dwKcMAI/005440000092zqdAAA',
            instance_url: 'https://na38.salesforce.com',
            id_token: 'eyJraWQiOiIyMTYiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiRnNuSmp4RzlFY2RMNE05SWR3ekJoQSIsInN1YiI6Imh0dHBzOi8vbG9naW4uc2FsZXNmb3JjZS5jb20vaWQvMDBERTAwMDAwMDBkd0tjTUFJLzAwNTQ0MDAwMDA5MnpxZEFBQSIsImF1ZCI6IjNNVkc5eTZ4MDM1N0hsZWZiWFhrQmZySjJ0eG05bTZTYjVOWmxWQkZtTmZ6TlFXeTZyYUowX25LYW5XNFNnYU9qN0VKTUlJX0hMUHM5bWJCMEp4RTUiLCJpc3MiOiJodHRwczovL2xvZ2luLnNhbGVzZm9yY2UuY29tIiwiZXhwIjoxNTQxNTEwNjkyLCJpYXQiOjE1NDE1MTA1NzJ9.EZK6x7G9oF5vrpoL7v7Offg-9RR8txUUCjYmjQBUW_dBC7ZhMNwgKD2tN36Rf3avCbAyVd_B6FrVPiX7L8BCOnA-rEvFrzPKIXalo-Pm3qPM8L96fT3qp_7-bClO7wQtAmBaOmm6Td2OFKX-C6fP3yoAf3yp5MHZf_LKgYJA5AlQ8qtskwE5ZUyZpNnkQIfKG-gnxJTBU2njRazgIMGN_XRzNNU-JfAEvFvJ_mrHb6BiuvA3Qfc3nDXEALkzEacTzP1JLO22TT46xbLQGmcYvw_JP1ZTzyfzMhHGl_M8aJYkI3s-VHetAdoqQCXgSr02j1W-sECYOnZXODqt2Jd1a4LlpNvbrt6nEkArTFfX38s6z3jtpK8UiFjjYL5sfLRG9vnhu2yZIegZ5a_Lxr_Hw_m3oeZyoX3lS_wzoNaWzZ2bA438gRqvOH64Tn9--hDzHQLQFDKYuOvSWvmBf5bxo-dNDBGwGPQF0tlxnNGZ5SMKmVfQGxeUo_k4Ifg_zBsbBAFsZkLBeTm504YhJtnv1MQrA-k5MkZ78Zc8uW9cmPEbg6HEh57yOub1M5O9utJiU67cwXUI8-5C2NAbUW62-dEYEt_k5hdS_jtJ0e4gh5Mu2UK0ALlTs6TskMb_nTtC8DGJyFWjP7z0vRmQ2iyz5TOdMK7So3Iwdg2TNSrNkaQ',
            scope: 'refresh_token full',
            signature: 'C/X6deO0sSZVW9WCtrT4oFo741IpGtmGzSf8gNg8cnM=',
            refresh_token: process.env.REFRESH_TOKEN,
            access_token: process.env.ACCESS_TOKEN,
          },
          prodEnv: 'login',
          sobject: 'Contact',
          _account: '5be195b7c99b61001068e1d0',
          lookupField: 'AccountId',
        };
    message = {
      body: {
        Id: '0034400001zyzMsAAI',
        MobilePhone: '+3805077777',
        extID__c: '777777777777',
      },
    };
  });

  after(async () => {
    messages.newMessageWithBody.restore();
  });

  const emitter = {
    emit: sinon.spy(),
  };

  it('upsert Contact by Id ', async () => {
    await upsert.process.call(emitter, message, configuration).then(() => {
      expect(lastCall.lastCall.args[0].MobilePhone)
          .to
          .eql(message.body.MobilePhone);
    });
  });

  it('upsert Contact by ExternalId ', async () => {
    const message = {
      body: {
        MobilePhone: '+38050888888',
        extID__c: '777777777777',
      },
    };
    configuration.extIdField = 'extID__c';
    await upsert.process.call(emitter, message, configuration).then(() => {
      expect(lastCall.lastCall.args[0].MobilePhone)
          .to
          .eql(message.body.MobilePhone);
    });
  });

});