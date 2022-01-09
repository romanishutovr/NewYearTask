const socket = new WebSocket('wws://vps.yojji.io', 'roman_ishutov');
const switchers = document.querySelectorAll('.container__switcher input');
const levers = [false, false, false, false];
let checkedLever = 1;
let stateValue = true;
const curLever = 0;

const sendQuery = (lever1, lever2, stateId) => {
  const res = {
    action: 'check',
    lever1,
    lever2,
    stateId
  };

  socket.send(JSON.stringify(res));
}

const powerOff = (stateId) => {
  const res = {
    action: 'powerOff',
    stateId
  };

  socket.send(JSON.stringify(res));
}

const checkLeverState = () => levers.every(lever => lever === stateValue);

const switchLever = () => {
  switchers.forEach((switcher, i) => {
    switcher.checked = levers[i];
  });
}

socket.onopen = () => console.log('Connected to Nuclear Power Station');
socket.onclose = () => console.log('Disconnected from NPS');
socket.onmessage = function(event) {
  console.log(event.data);
  const { pulled, stateId, newState, token, same } = JSON.parse(event.data);

  if (pulled >= 0) {
    levers[pulled] = !levers[pulled];
    switchLever();
    sendQuery(curLever, checkedLever, stateId);
  }

  if (newState === 'poweredOn') {
    stateValue = false;
  }

  if (newState === 'poweredOff') {
    console.log('Great!!! Nuclear Machine has stopped! Your token: ', token);
    socket.close();
  }

  if (same) {
    levers[checkedLever] = levers[curLever];
    checkedLever < levers.length - 1 ? checkedLever += 1 : null;
    checkLeverState() ? powerOff(stateId) : null;
  }
};
