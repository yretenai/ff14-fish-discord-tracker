import _ from 'underscore';
import moment from 'moment';
import twix from 'twix';
import Rx from 'rx';
import dateFns from 'date-fns';

import __p from './localization.js';

const EARTH_TO_EORZEA = 3600 / 175;
const EORZEA_TO_EARTH = 1 / EARTH_TO_EORZEA;

export class EorzeaTime {
  constructor() {
    this.currentBellChanged = Rx.Observable
      .interval(0.75 * EARTH_TO_EORZEA /* ms */)
      .timestamp()
      .map((v) => dateFns.utc.getHours(this.toEorzea(v.timestamp)))
      .distinctUntilChanged()
      .tap((v) => console.log("Current bell is now:", v));
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

export default new EorzeaTime;
