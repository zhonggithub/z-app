import test from 'ava';
import request from '../helpers/request';
import fetchMock from 'fetch-mock';

test.afterEach.always(() => {
  fetchMock.restore();
});

// let account = null;
// // test.before(async (t) => {
// //   const res = await request.post('/group/accounts').send(mockAccount);
// //   if (res.status >= 400) console.log(res.text);
// //   t.is(res.status, 201);
// //   account = res.body;
// //   //console.log(order);
// // });
//
// test.serial('POST /group/accounts ok', async(t) => {
//   fetchMock.mock('^http://service.local/hms-account-service:3000',
//    {
//     body: {
//       code: 0,
//       message: 'success',
//       data: {
//         id: '57de55213e442a17287ecd67',
//         UserName: 'zz',
//         TrueName: 'zz',
//         Extend: {},
//         UserPwd: '',
//         Roles: [],
//         LastLoginTime: 1473386516,
//         LastLoginIp: '192.167.12.23',
//         CreateAt: 1473326516,
//         UpdatedAt: 1473326516
//       }
//     },
//     status: 201
//   });
//   const res = await request.post('/group/accounts').send(mockAccount);
//   if (res.status >= 400) console.log(res.text);
//   t.is(res.status, 201);
//   //console.log(res.body);
// });
//
test.serial('POST /group/api/login ok', async (t) => {
  fetchMock.mock('^http://service.local/hms-account-service',
    {
      status: 200,
      body: {
        code: 0,
        message: 'success',
        data: {
          id: '57de55213e442a17287ecd67',
          UserName: 'zz0',
          UserPwd: '',
          TrueName: 'zz0',
          Extend: {},
          Roles: [],
          LastLoginTime: 1473386516,
          LastLoginIp: '192.167.12.23',
          CreateAt: 1473326516,
          UpdatedAt: 1473326516,
          TID: '12564',
        },
      },
    });
  const res = await request.post('/group/api/login').send(mockAccount);
  // console.log(res.body);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
});
