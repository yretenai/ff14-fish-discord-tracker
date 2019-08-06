const _ = require('underscore');
const moment = require('moment');
const twix = require('twix');
const Rx = require('rx');
const dateFns = require('date-fns');

const __p = require('./localization.js');

const EARTH_TO_EORZEA = 3600 / 175;
const EORZEA_TO_EARTH = 1 / EARTH_TO_EORZEA;

class EorzeaTime {
  constructor() {
    this.currentBellChanged = Rx.Observable
      .interval(0.75 * EARTH_TO_EORZEA /* ms */)
      .timestamp()
      .map((v) => dateFns.utc.getHours(this.toEorzea(v.timestamp)))
      .distinctUntilChanged();
  }


  getCurrentEorzeaDate() {
    return this.toEorzea(Date.now());
  }

  toEorzea(earthDate) {
    return +earthDate * EARTH_TO_EORZEA;
  }

  toEarth(eorzeaDate) {
    return Math.ceil(+eorzeaDate * EORZEA_TO_EARTH);
  }
}

module.exports = new EorzeaTime;
