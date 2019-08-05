import _ from 'underscore';
import moment from 'moment';
import twix from 'twix';
import dateFns from 'date-fns';

import __p from './localization.js';
import Fishes from './fish.js';
import eorzeaTime from './time.js';

class CompletionManager {
  constructor() {
    this.completed = [];
    this.pinned = [];
  }

  isFishCaught(fish_id) {
    return _(this.completed).contains(fish_id);
  }

  isFishPinned(fish_id) {
    return _(this.pinned).contains(fish_id);
  }

  toggleCaughtState(fish_id) {
    if (this.isFishCaught(fish_id)) {
      this.completed = _(this.completed).without(fish_id);
    } else {
      this.completed.push(fish_id);
    }
  }

  togglePinnedState(fish_id) {
    if (this.isFishPinned(fish_id)) {
      this.pinned = _(this.pinned).without(fish_id);
    } else {
      this.pinned.push(fish_id);
    }
  }

  validateArray(newCompletion) {
    if (!Array.isArray(newCompletion)) {
      return false;
    } else {
      return true;
    }
  }
}


class ViewModel {
  constructor() {
    this.filter = {
      completion: 'all',
      patch: [2, 2.1, 2.2, 2.3, 2.4, 2.5,
              3, 3.1, 3.2, 3.3, 3.4, 3.5,
              4, 4.1, 4.2, 4.3, 4.4, 4.5,
              5],
    };
    this.completionManager = new CompletionManager;
    this.theFish = Fishes;
    this.showUpcomingWindowFromNow = false;
    this.subscriptions = [];
    this.sortingType = "windowPeriods";

    this.fishEntryTemplate = () => "";
    this.fishIntuitionEntryTemplate = () => "";
  }

  updateAll() {

    var fishes = Fishes;

    this.theFish = _(fishes).map((x) => {
      // Make sure localization is up-to-date.
      x.applyLocalization();
      // Add in view-specific fields.
      return _(x).extend({
        caught: this.completionManager.isFishCaught(x.id),
        pinned: this.completionManager.isFishPinned(x.id),
        timerState: () => { return x.isCatchable() ? 'fish-active' : '' },
        nextAvailBin: () => {
          var crs = x.catchableRanges;
          if (crs.length > 0) {
            if (dateFns.isFuture(eorzeaTime.toEarth(+crs[0].start()))) {
              var minutesUntilUp = dateFns.differenceInMinutes(eorzeaTime.toEarth(+crs[0].start()), Date.now());
              if (minutesUntilUp < 15) {
                return 'fish-bin-15';
              }
            }
          }
          return '';
        },
        availability: {
          current: {
            duration: () => {
              var crs = x.catchableRanges;
              if (crs.length > 0) {
                if (dateFns.isFuture(eorzeaTime.toEarth(+crs[0].start()))) {
                  return "in " + dateFns.distanceInWordsStrict(Date.now(), eorzeaTime.toEarth(+crs[0].start()));
                } else {
                  return "closes in " + dateFns.distanceInWordsStrict(Date.now(), eorzeaTime.toEarth(+crs[0].end()));
                }
              }
              return "unknown";
            },
            date: () => {
              var crs = x.catchableRanges;
              if (crs.length > 0) {
                if (dateFns.isFuture(eorzeaTime.toEarth(+crs[0].start()))) {
                  return eorzeaTime.toEarth(+crs[0].start());
                } else {
                  return eorzeaTime.toEarth(+crs[0].end());
                }
              }
            }
          },
          upcoming: (i=1) => {
            if (i < 1) {
              console.error("Upcoming interval must be greater than 1");
            }
            return {
              duration: () => {
                var crs = x.catchableRanges;
                if (crs.length > i) {
                  return this.formatDurationUntilNextWindowFromNow(
                    eorzeaTime.toEarth(+crs[i].start()));
                }
                return "unknown";
              },
              date: () => {
                var crs = x.catchableRanges;
                if (crs.length > i) {
                  return eorzeaTime.toEarth(+crs[i].start());
                }
              },
              downtime: () => {
                // Calculates the downtime between the upcoming window and the
                // previous window.
                var crs = x.catchableRanges;
                if (crs.length > i) {
                  return this.formatDurationUntilNextWindow(
                    eorzeaTime.toEarth(+crs[i-1].end()),
                    eorzeaTime.toEarth(+crs[i].start()));
                }
                return "unknown";
              },
              prevdate: () => {
                var crs = x.catchableRanges;
                if (crs.length > i) {
                  return eorzeaTime.toEarth(+crs[i-1].end());
                }
              }
            };
          },
          upcomingWindows: () => {
            var crs = x.catchableRanges;
            if (crs.length > 0) {
              return _(crs).map((cr, idx) => {
                var start = eorzeaTime.toEarth(+cr.start());
                var end = eorzeaTime.toEarth(+cr.end());
                var downtime = "";
                if (idx + 1 < crs.length) {
                  downtime = dateFns.distanceInWordsStrict(end, eorzeaTime.toEarth(+crs[idx+1].start()));
                }
                return {
                  start: start,
                  end: end,
                  duration: dateFns.distanceInWordsStrict(start, end),
                  downtime: downtime
                };
              });
            } else {
              return [];
            }
          }
        },
        fishEyesDuration: () => {
          if (x.fishEyes === false) {
            console.error("This fish does not require Fish Eyes");
            return "";
          }
          else if (x.fishEyes === true) {
            console.warn("This fish does not have a known Fish Eyes buff duration");
            return "";
          }
          // If the buff is more than 60s, display in fractional minutes.
          if (x.fishEyes > 60) {
            var mins = Math.floor(x.fishEyes / 60);
            var secs = x.fishEyes % 60;
            var result = "" + mins + "m";
            if (secs != 0) {
              result += " " + secs + "s";
            }
            return result;
          } else {
            return "" + x.fishEyes + "s";
          }
        }
      });
    });

    return this.theFish;
  }

  formatDurationUntilNextWindowFromNow(upcomingStart) {
    return "in " + dateFns.distanceInWordsStrict(Date.now(), upcomingStart);
  }

  formatDurationUntilNextWindow(prevEnd, upcomingStart) {
    return dateFns.distanceInWordsStrict(prevEnd, upcomingStart) + " later";
  }
}

export default new ViewModel