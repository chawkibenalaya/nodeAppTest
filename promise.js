const p1 = new Promise(resolve => {
  setTimeout(() => {
    resolve(1);
  }, 6000);
});

const p2 = new Promise(resolve => {
  setTimeout(() => {
    resolve(2);
  }, 1000);
});

Promise.race([p1, p2])
  .then(result => console.log(result))
  .catch(err => console.log(err.message));

const f1 = new Promise(resolve => {
  setTimeout(() => {
    resolve('getF1');
  }, 3000);
});
const f2 = new Promise(resolve => {
  setTimeout(() => {
    resolve('getF2');
  }, 4000);
});

async function getAsyncFunction() {
  const f = await f1;
  console.log('f1');
  const g = await f2;
  console.log('f2');
  const p = await p1;
  console.log('f3');
  const p3 = await p2;
  console.log('f4');
  console.log(f, g, p, p3);
}
getAsyncFunction();
