const DATA = require('./js/app/data.js');
const Fishes = require('./js/app/fish.js');
const fishWatcher = require('./js/app/fishwatcher.js');
const __p = require('./js/app/localization.js');
const eorzeaTime = require('./js/app/time.js');
const viewModel = require('./js/app/viewmodel.js');
const weatherService = require('./js/app/weather.js');

const DiscordFishing = require('./botbrain.js');
const FishImage = require('./fishImage.js');

let args = process.argv;

if(process.argv[0].endsWith('node') || process.argv[0].endsWith('.exe')) {
    args = process.argv.slice(1);
}

if(args.length < 3) {
    console.log(`Usage: ${args[0]} ownerId token`);
    process.exit(1);
}

const DiscordFish = new DiscordFishing({
    ownerId: args[1],
    prefix: '!'
}, viewModel);

const currentlyLiveFish = new Set();
const notifiedFish = new Set();
const notifiedClosingFish = new Set();

const NotifyFishClosing = (fish) => {
    // const msg = new webhook.MessageBuilder()
    //             .setText("https://ff14fish.carbuncleplushy.com")
    //             .setName("Intense Fish Aficionado")
    //             .setTitle("Fish leaving!")
    //             .setColor("#FF4040") // ooh coral red!
    //             .setDescription(`${fish.name} ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
    //             .setImage(getXivApiIcon(fish))
    //             .setTime();
    //             hook.send(msg);
}

const NotifyFishOpen = (fish) => {
    // const msg = new webhook.MessageBuilder()
    //             .setText("https://ff14fish.carbuncleplushy.com")
    //             .setName("Intense Fish Aficionado")
    //             .setTitle("Fish sighted!")
    //             .setColor("#00FF7F") // ooh spring green!
    //             .setDescription(`${fish.name} ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
    //             .setImage(getXivApiIcon(fish))
    //             .setTime();
    //             hook.send(msg);
}

const NotifyFishSoon = (fish) => {
    // const msg = new webhook.MessageBuilder()
    //             .setText("https://ff14fish.carbuncleplushy.com")
    //             .setName("Intense Fish Aficionado")
    //             .setTitle("Fish is approaching!")
    //             .setColor("#FFA07A") // ooh light salmon!
    //             .setDescription(`${fish.name} opening ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
    //             .setImage(getXivApiIcon(fish))
    //             .setTime();
    //             hook.send(msg);
}

const NotifyFishClosed = (fish) => {
    // const msg = new webhook.MessageBuilder()
    //             .setText("https://ff14fish.carbuncleplushy.com")
    //             .setName("Intense Fish Aficionado")
    //             .setTitle("Fish is approaching!")
    //             .setColor("#FFA07A") // ooh light salmon!
    //             .setDescription(`${fish.name} opening ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
    //             .setImage(getXivApiIcon(fish))
    //             .setTime();
    //             hook.send(msg);
}
DiscordFish.login(args[2]).then(() => {
    let first = true;
    const check = () => {
        const fishes = viewModel.updateAll();
        if(first) {
            first = false;
            return;
        }
        for (let fish of fishes) {
            if(fish.alwaysAvailable) continue;
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
            } else if(currentlyLiveFish.has(fish.id)) {
                NotifyFishClosed(fish);
                currentlyLiveFish.delete(fish.id);
            }
        }
    }
    fishWatcher.updatedFishesObserver.subscribe(check);
});
