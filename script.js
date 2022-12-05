'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-12-03T17:01:17.194Z',
    '2022-12-04T23:36:17.929Z',
    '2022-12-05T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return `today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ``;
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? `deposit` : `withdrawal`;
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementsDate(date, acc.locale);
    const formattedMovements = formatCur(mov, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMovements}</div>
    </div>`;
    containerMovements.insertAdjacentHTML(`afterbegin`, html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedMovements = formatCur(acc.balance, acc.locale, acc.currency);

  labelBalance.textContent = `${formattedMovements}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((mov, cur) => mov + cur, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((mov, cur) => mov + cur, 0);
  labelSumOut.textContent = formatCur(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((interest, i, arr) => interest >= 1)
    .reduce((mov, int) => mov + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(` `)
      .map(name => name[0])
      .join(``);
  });
};
createUsernames(accounts);
const updateUi = function (acc) {
  //display movement
  displayMovements(acc);
  //display balance
  calcDisplayBalance(acc);
  //display sumary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  //set time to 5minutes
  let time = 300;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // in each call, print the remining time to Ui
    labelTimer.textContent = `${min}:${sec}`;
    // when timer expires, stop timer and log user out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    //decrease 1 sec
    time--;
  };

  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
//////////////////////////////////////////////////
//event handlers
let currentAccount, timer;

//fake always logged in
// currentAccount = account1;
// updateUi(currentAccount);
// containerApp.style.opacity = 100;

//experimenting with api

btnLogin.addEventListener(`click`, function (e) {
  // prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    //display ui and a welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(` `)[0]
    }`;
    containerApp.style.opacity = 100;

    //current date and time
    const now = new Date();
    const options = {
      hour: `numeric`,
      minute: `numeric`,
      day: `numeric`,
      month: `numeric`,
      year: `numeric`,
      // weekday: `short`,
    };

    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minute = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = ``;
    inputLoginUsername.blur();
    inputLoginPin.blur();

    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    //update ui
    updateUi(currentAccount);
  }
});
btnTransfer.addEventListener(`click`, function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = ``;

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // add transfer dates

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //updateUI
    updateUi(currentAccount);

    // reset timer
    clearInterval(timer);
    startLogOutTimer();
  }
});

btnLoan.addEventListener(`click`, function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);
      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      //update UI
      updateUi(currentAccount);
    }, 2.5 * 1000);
    // reset timer
    clearInterval(timer);
    startLogOutTimer();
  }
  inputLoanAmount.value = ``;
});

btnClose.addEventListener(`click`, function (e) {
  e.preventDefault();
  //clear fields

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    //delete account
    accounts.splice(index, 1);

    //hide ui
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = ``;
});

let sorted = false;

btnSort.addEventListener(`click`, function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/*
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(23 === 23.0);

// base 10 = 0 to 9

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

//conversion 
console.log(Number(`23`));
console.log(+`23`);
//parsing

console.log(Number.parseInt(`30px`, 10));
console.log(Number.parseInt(`kl20`, 10));

console.log(Number.parseInt(`   2.5rem  `));
console.log(Number.parseFloat(`    2.5rem  `));

// console.log(parseFloat(`   2.5rem   `));
// checking if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN(`20`));
console.log(Number.isNaN(+`20px`));
console.log(Number.isNaN(23 / 0));

// CHECKING IF A  value is a number
console.log(Number.isFinite(20));
console.log(Number.isFinite(`20`));
console.log(Number.isFinite(+`20px`));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0)); 
console.log(Math.sqrt(25));

console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 12, 32, 54, 72, 2, 3));
console.log(Math.max(5, 12, 32, 54, `72`, 222, 3));
console.log(Math.max(5, 12, 32, 54, `72`, `222px`, 3));

console.log(Math.min(5, 12, 32, 54, `72`, 3));

// formula for calculating area of a circle
console.log(Math.PI * Number.parseFloat(`10px`) ** 2);

//creating a random dice roll
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;

console.log(randomInt(10, 20));

//rounding integers
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(`23.9`));

console.log(Math.trunc(23.3));
console.log(Math.trunc(23.9));

console.log(Math.trunc(-23.3));
console.log(Math.trunc(-23.9));

console.log(Math.floor(-23.3));
console.log(Math.floor(-`23.9`));

// rounding decimals

console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2));

console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); //8 = 2 * 3 + 2

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(2));
console.log(isEven(8));
console.log(isEven(2453));

labelBalance.addEventListener(`click`, function () {
  [...document.querySelectorAll(`.movements__row`)].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = `orangeRed`;
    if (i % 3 === 0) row.style.backgroundColor = `blue`;
  });
});  

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(234546767676767676767676767676767569780780585481247826n);
console.log(BigInt(2345467676));

//operations

console.log(10000n + 10000n);
console.log(
  1134523589666766666666666666676767676767676767676767676n * 26879633332n
);
// console.log(Math.sqrt(16n));
const huge = 200000067893256782364725647842n;
const num = 23;
console.log(huge + BigInt(num));

//exceptions
console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == `20`);

console.log(huge + ` is really big`);

// divisons
console.log(10n / 3n);
console.log(10 / 3); 

// create a date
const now = new Date();
console.log(now);

console.log(new Date(`Dec 05 2022 15:41:06`));
console.log(new Date(`Dec 24, 2015`));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31, 15, 23, 5));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

// working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
// console.log(future.getYear()); // Do not use this
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142235380000));

console.log(Date.now());

future.setFullYear(2040);

console.log(future); 

const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1); 

const num = 22232898.34;

const options = {
  style: `currency`,
  // unit: `miles-per-hour`,
  // unit: `celsius`,
  // unit: `percent`,
  currency: `eur`,
  // useGrouping: false,
};
console.log(
  `US:         `,
  new Intl.NumberFormat(`en-us`, options).format(num)
);
console.log(
  `Germany:       `,
  new Intl.NumberFormat(`de-DE`, options).format(num)
);
console.log(
  `Syria:       `,
  new Intl.NumberFormat(`ar-SY`, options).format(num)
);
console.log(
  `Browser:       `,
  new Intl.NumberFormat(navigator.language, options).format(num)
); 

// set timeout
const ingredients = [`olives`, `spinach`];
const pizzaTimeout = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
console.log(`waiting`);

if (ingredients.includes(`spinach`)) clearTimeout(pizzaTimeout);

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);

setInterval(function () {
  const now = new Date();
  const nowSeconds = `${now.getSeconds()}`.padStart(2, 0);
  const nowMinute = `${now.getMinutes()}`.padStart(2, 0);
  const nowHours = `${now.getHours()}`.padStart(2, 0);
  console.log(`${nowHours}:${nowMinute}:${nowSeconds}`);
}, 1000); */
