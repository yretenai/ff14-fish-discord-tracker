import DATA from './js/app/data.js'
import Fishes from './js/app/fish.js'
import fishWatcher from './js/app/fishwatcher.js'
import __p from './js/app/localization.js'
import eorzeaTime from './js/app/time.js'
import viewModel from './js/app/viewmodel.js'
import weatherService from './js/app/weather.js'

var currentlyLiveFish = new Set();
var notifiedFish = new Set();
var notifiedClosingFish = new Set();

var NotifyFishClosing = (fish) => {
    console.log(`${fish.name} closing soon ${fish.availability.current.duration()}!`);
}

var NotifyFishOpen = (fish) => {
    console.log(`${fish.name} up!`);
}

var NotifyFishSoon = (fish) => {
    console.log(`${fish.name} open soon!`);
}

var first = true;
var check = () => {
    var fishes = viewModel.updateAll();
    if(first) {
        first = false;
        return;
    }
    console.log("Checking fishes");
    for (let fish of fishes) {
        if(fish.alwaysAvailable) continue;
        if(fish.isClosedSoon()) {
            if(notifiedClosingFish.has(fish.id)) return;
            NotifyFishClosing(fish);
            notifiedFish.delete(fish.id);
        }
        else if(fish.isOpen()) {
            if(currentlyLiveFish.has(fish.id)) return;
            NotifyFishOpen(fish);
            notifiedClosingFish.delete(fish.id);
        }
        else if(fish.isOpenSoon()) {
            if(notifiedFish.has(fish.id)) return;
            NotifyFishSoon(fish);
            currentlyLiveFish.delete(fish.id);
        }
    }
}
fishWatcher.updatedFishesObserver.subscribe(check);
