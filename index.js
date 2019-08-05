import fishWatcher from './js/app/fishwatcher.js'
import viewModel from './js/app/viewmodel.js'

fishWatcher.updateFishes();

var all = viewModel.updateAll();
for(var fish of all) {
    if(!fish.alwaysAvailable) {
        console.log(fish.availability.upcoming().date());
        // boo
    }
}

