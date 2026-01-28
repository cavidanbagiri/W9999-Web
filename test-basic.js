
// test-500-realistic.js
import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MSIsInVzZXJuYW1lIjoidGVtcDIiLCJ0YXJnZXRfbGFuZ3MiOlsiZXMiXSwibmF0aXZlIjoiRW5nbGlzaCIsImV4cCI6MTc2OTcwODAwNX0.gsuaCCyqC5vbfK687qqqNjtWZIVO9320sSobYCDK8VY";

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp to 100
    { duration: '30s', target: 250 },   // Ramp to 250
    { duration: '30s', target: 400 },   // Ramp to 400
    { duration: '30s', target: 500 },   // Peak at 500 for 30s
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.30'],    // Allow 30% failures for stress test
  },
};

export default function () {
  const response = http.get('https://api.w9999.app/api/words/main/words?language_code=en&limit=10', {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    timeout: '15s',  // Very long timeout
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  
  // Realistic user behavior: 2-5 seconds between requests
  sleep(Math.random() * 3 + 2);
}









// // test-realistic-100.js
// import http from 'k6/http';
// import { check, sleep } from 'k6';

// // REPLACE WITH YOUR ACTUAL TOKEN
// const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MSIsInVzZXJuYW1lIjoidGVtcDIiLCJ0YXJnZXRfbGFuZ3MiOlsiZXMiXSwibmF0aXZlIjoiRW5nbGlzaCIsImV4cCI6MTc2OTcwODAwNX0.gsuaCCyqC5vbfK687qqqNjtWZIVO9320sSobYCDK8VY";

// export const options = {
//   stages: [
//     { duration: '10s', target: 100 },   // Start with 10 users
//     { duration: '20s', target: 300 },   // Increase to 30 users
//     { duration: '30s', target: 500 },   // Increase to 50 users
//     { duration: '10s', target: 0 },    // Ramp down
//   ],
//   thresholds: {
//     http_req_duration: ['p(95)<3000'], // 95% under 3 seconds
//     http_req_failed: ['rate<0.10'],    // Less than 10% failures
//   },
// };
// // User behavior patterns
// const userTypes = [
//   {
//     type: 'casual',
//     actions: ['browse', 'browse', 'learn', 'sleep'],
//     languages: ['en'],
//   },
//   {
//     type: 'serious',
//     actions: ['learn', 'review', 'browse', 'learn', 'review'],
//     languages: ['en', 'es'],
//   },
//   {
//     type: 'polyglot',
//     actions: ['learn', 'switch_language', 'learn', 'switch_language'],
//     languages: ['en', 'es', 'ru', 'tr'],
//   },
// ];



// export default function () {
//   const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
//   const action = userType.actions[Math.floor(Math.random() * userType.actions.length)];
//   const language = userType.languages[Math.floor(Math.random() * userType.languages.length)];
  
//   switch (action) {
//     case 'browse':
//       // Browse random pages
//       const pages = Math.floor(Math.random() * 5) + 1;
//       for (let i = 0; i < pages; i++) {
//         const skip = i * 20;
//         const url = `https://api.w9999.app/api/words/main/words?language_code=${language}&skip=${skip}&limit=20`;
        
//         http.get(url, {
//           headers: { 'Authorization': `Bearer ${TOKEN}` },
//         });
        
//         sleep(0.5); // Quick browsing
//       }
//       break;
      
//     case 'learn':
//       // Study session - multiple requests
//       const studyPages = Math.floor(Math.random() * 3) + 1;
//       for (let i = 0; i < studyPages; i++) {
//         const url = `https://api.w9999.app/api/words/main/words?language_code=${language}&limit=10`;
        
//         const response = http.get(url, {
//           headers: { 'Authorization': `Bearer ${TOKEN}` },
//         });
        
//         // Simulate studying each word
//         if (response.status === 200) {
//           sleep(2); // 2 seconds per word study
//         }
//       }
//       break;
      
//     case 'review':
//       // Review learned words
//       const url = `https://api.w9999.app/api/words/main/words?language_code=${language}&only_learned=true&limit=20`;
      
//       http.get(url, {
//         headers: { 'Authorization': `Bearer ${TOKEN}` },
//       });
      
//       sleep(3); // Review time
//       break;
      
//     case 'switch_language':
//       // Switch between languages
//       const newLang = userType.languages[Math.floor(Math.random() * userType.languages.length)];
//       const testUrl = `https://api.w9999.app/api/words/main/words?language_code=${newLang}&limit=10`;
      
//       http.get(testUrl, {
//         headers: { 'Authorization': `Bearer ${TOKEN}` },
//       });
      
//       sleep(1);
//       break;
      
//     case 'sleep':
//       // User takes a break
//       sleep(Math.random() * 10 + 5);
//       break;
//   }
// }








// export default function () {
//   const url = 'https://api.w9999.app/api/words/main/words?language_code=en&limit=10';
  
//   const response = http.get(url, {
//     headers: { 'Authorization': `Bearer ${TOKEN}` },
//     timeout: '5s',
//   });
  
//   check(response, {
//     'status is 200': (r) => r.status === 200,
//   });
  
//   console.log(`${response.status} in ${response.timings.duration}ms`);
  
//   // Wait 1 second between requests (simulates real user)
//   sleep(1);
// }



























// // test-realistic-users.js
// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//   // Simulate realistic traffic patterns
//   stages: [
//       { duration: '5m', target: 100 },   // Night traffic
//     // { duration: '5m', target: 300 },   // Morning traffic
//     // { duration: '10m', target: 600 },  // Peak hours
//     // { duration: '5m', target: 800 },   // Highest peak
//     // { duration: '10m', target: 400 },  // Evening traffic
//   ],
// };

// const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MSIsInVzZXJuYW1lIjoidGVtcDIiLCJ0YXJnZXRfbGFuZ3MiOlsiZXMiXSwibmF0aXZlIjoiRW5nbGlzaCIsImV4cCI6MTc2OTcwODAwNX0.gsuaCCyqC5vbfK687qqqNjtWZIVO9320sSobYCDK8VY';

// // User behavior patterns
// const userTypes = [
//   {
//     type: 'casual',
//     actions: ['browse', 'browse', 'learn', 'sleep'],
//     languages: ['en'],
//   },
//   {
//     type: 'serious',
//     actions: ['learn', 'review', 'browse', 'learn', 'review'],
//     languages: ['en', 'es'],
//   },
//   {
//     type: 'polyglot',
//     actions: ['learn', 'switch_language', 'learn', 'switch_language'],
//     languages: ['en', 'es', 'ru', 'tr'],
//   },
// ];

// export default function () {
//   const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
//   const action = userType.actions[Math.floor(Math.random() * userType.actions.length)];
//   const language = userType.languages[Math.floor(Math.random() * userType.languages.length)];
  
//   switch (action) {
//     case 'browse':
//       // Browse random pages
//       const pages = Math.floor(Math.random() * 5) + 1;
//       for (let i = 0; i < pages; i++) {
//         const skip = i * 20;
//         const url = `https://api.w9999.app/api/words/main/words?language_code=${language}&skip=${skip}&limit=20`;
        
//         http.get(url, {
//           headers: { 'Authorization': `Bearer ${TOKEN}` },
//         });
        
//         sleep(0.5); // Quick browsing
//       }
//       break;
      
//     case 'learn':
//       // Study session - multiple requests
//       const studyPages = Math.floor(Math.random() * 3) + 1;
//       for (let i = 0; i < studyPages; i++) {
//         const url = `https://api.w9999.app/api/words/main/words?language_code=${language}&limit=10`;
        
//         const response = http.get(url, {
//           headers: { 'Authorization': `Bearer ${TOKEN}` },
//         });
        
//         // Simulate studying each word
//         if (response.status === 200) {
//           sleep(2); // 2 seconds per word study
//         }
//       }
//       break;
      
//     case 'review':
//       // Review learned words
//       const url = `https://api.w9999.app/api/words/main/words?language_code=${language}&only_learned=true&limit=20`;
      
//       http.get(url, {
//         headers: { 'Authorization': `Bearer ${TOKEN}` },
//       });
      
//       sleep(3); // Review time
//       break;
      
//     case 'switch_language':
//       // Switch between languages
//       const newLang = userType.languages[Math.floor(Math.random() * userType.languages.length)];
//       const testUrl = `https://api.w9999.app/api/words/main/words?language_code=${newLang}&limit=10`;
      
//       http.get(testUrl, {
//         headers: { 'Authorization': `Bearer ${TOKEN}` },
//       });
      
//       sleep(1);
//       break;
      
//     case 'sleep':
//       // User takes a break
//       sleep(Math.random() * 10 + 5);
//       break;
//   }
// }



















// // test-basic.js
// import http from 'k6/http';
// import { check, sleep } from 'k6';
// import { Rate } from 'k6/metrics';

// // Custom metrics
// const errorRate = new Rate('errors');

// export const options = {
//   stages: [
//     // Ramp-up to 100 users over 30 seconds
//     { duration: '30s', target: 100 },
//     // Stay at 100 users for 1 minute
//     { duration: '1m', target: 100 },
//     // Ramp-up to 1000 users over 1 minute
//     { duration: '1m', target: 1000 },
//     // Stay at peak load for 3 minutes
//     { duration: '3m', target: 1000 },
//     // Ramp-down to 0 users over 30 seconds
//     { duration: '30s', target: 0 },
//   ],
//   thresholds: {
//     // 95% of requests must finish within 2 seconds
//     http_req_duration: ['p(95)<2000'],
//     // Error rate must be below 1%
//     errors: ['rate<0.01'],
//     // 99% of requests must succeed
//     http_req_failed: ['rate<0.01'],
//   },
// };

// export default function () {
//   const url = 'https://api.w9999.app/api/public/slugs';
  
//   const params = {
//     headers: {
//       'User-Agent': 'k6-load-test',
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//     },
//     tags: {
//       endpoint: 'slugs',
//     },
//   };
  
//   const response = http.get(url, params);
  
//   // Check response
//   const checkRes = check(response, {
//     'status is 200': (r) => r.status === 200,
//     'response has data': (r) => r.body.length > 0,
//     'response time < 500ms': (r) => r.timings.duration < 500,
//     'content type is json': (r) => r.headers['Content-Type'].includes('application/json'),
//   });
  
//   // Record error if check failed
//   errorRate.add(!checkRes);
  
//   // Simulate user think time (between 1-3 seconds)
//   sleep(Math.random() * 2 + 1);
// }