import DATA from './js/app/data.js'
import Fishes from './js/app/fish.js'
import fishWatcher from './js/app/fishwatcher.js'
import __p from './js/app/localization.js'
import eorzeaTime from './js/app/time.js'
import viewModel from './js/app/viewmodel.js'
import weatherService from './js/app/weather.js'
import webhook from 'webhook-discord'

var hook = new webhook.Webhook(process.argv[2])

var currentlyLiveFish = new Set();
var notifiedFish = new Set();
var notifiedClosingFish = new Set();

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var getXivApiIcon = (fish) => {
    var icon_id = fish.icon.toString();
    if(icon_id.length >= 6)
        icon_id = pad(icon_id, 5)
    else
        icon_id = '0' + pad(icon_id, 5)

        var folder_id = icon_id;
    if(icon_id.length >= 6)
        folder_id = icon_id[0] + icon_id[1] + icon_id[2] + '000';
    else
        folder_id = 0 + icon_id[1] + icon_id[2] + '000';

        console.log(`https://xivapi.com/i/${folder_id}/${icon_id}.png`);

    return `https://xivapi.com/i/${folder_id}/${icon_id}.png`;
}

var NotifyFishClosing = (fish) => {
    console.log(`${fish.name} gone`);
    const msg = new webhook.MessageBuilder()
                .setText("https://ff14fish.carbuncleplushy.com")
                .setName("Intense Fish Aficionado")
                .setTitle("Fish leaving!")
                .setColor("#FF4040") // ooh coral red!
                .setDescription(`${fish.name} ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
                .setImage(getXivApiIcon(fish))
                .setTime();
                hook.send(msg);
}

var NotifyFishOpen = (fish) => {
    console.log(`${fish.name} open`);
    const msg = new webhook.MessageBuilder()
                .setText("https://ff14fish.carbuncleplushy.com")
                .setName("Intense Fish Aficionado")
                .setTitle("Fish sighted!")
                .setColor("#00FF7F") // ooh spring green!
                .setDescription(`${fish.name} ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
                .setImage(getXivApiIcon(fish))
                .setTime();
                hook.send(msg);
}

var NotifyFishSoon = (fish) => {
    console.log(`${fish.name} soon`);
    const msg = new webhook.MessageBuilder()
                .setText("https://ff14fish.carbuncleplushy.com")
                .setName("Intense Fish Aficionado")
                .setTitle("Fish is approaching!")
                .setColor("#FFA07A") // ooh light salmon!
                .setDescription(`${fish.name} opening ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
                .setImage(getXivApiIcon(fish))
                .setTime();
                hook.send(msg);
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
        if(fish.alwaysAvailable || fish.uptime() > 0.03) continue;
        if(fish.isClosedSoon()) {
            if(notifiedClosingFish.has(fish.id)) return;
            NotifyFishClosing(fish);
            
            notifiedFish.delete(fish.id);

            notifiedClosingFish.add(fish.id);
        }
        else if(fish.isOpen()) {
            if(currentlyLiveFish.has(fish.id)) return;
            NotifyFishOpen(fish);

            notifiedClosingFish.delete(fish.id);

            currentlyLiveFish.add(fish.id);
        }
        else if(fish.isOpenSoon()) {
            if(notifiedFish.has(fish.id)) return;
            NotifyFishSoon(fish);

            currentlyLiveFish.delete(fish.id);

            notifiedFish.add(fish.id);
        }
    }
}
fishWatcher.updatedFishesObserver.subscribe(check);
