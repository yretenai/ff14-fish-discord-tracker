# FFX|V Fish Tracker App
Invokes Discord webhooks when fish are available (and closed availability)

## Development Notes
### Cloning this Repo
This repo makes use of submodules. When cloning, please include the `--recurse-submodules` or `--recursive` option.

```
git clone --recurse-submodules git@github.com:healingbrew/ff14-fish-tracker-app.git
```

### Setup
The management of fish data is done using Python. It's recommended you create a virtual environment.
```
py -m venv pyvirt
pyvirt\Scripts\activate
pip install -r private/python-requirements.txt
```

The webapp itself is completely static. At this time, some of the development environment functions are manually driven. Make sure you've installed NPM and Node.JS first.

* Install the webapp package requirements first: `npm install`
* You need to install sprity-cli globally to get access to the CLI `sprity`.
  * `npm i sprity-cli -g`


## Step-by-step Instructions for Updating Data
Sometimes you forget how to do this after several months... Clearly the TODO list isn't getting done...

* Collect information from the Fish'cord regarding new fishies. Include only those fish with special catch conditions (such as weather or time of day), and all *big fish*. Update the `private/fishData.yaml` with the new additions (or changes).
  * Use the `private/fishDataTemplate.yaml` as a template for adding new records. For new patches, include a comment before the start of the patch additions (for readability-sake, I dunno...).
* Update clone of `SaintCoinach` master branch, then compare with the *my-current* branch for changes.
  * `git diff -U20 my-current`
  * If necessary, update the `saintcoinach-py` project to reflect any recent changes and comment to the local repo there. (Yes, that's right, I ported SaintCoinach to Python!)
  * Switch to the *my-current* branch, and merge the latest changes from *master*: `git merge master` or use the GitDesktop app to make life easier...
* Rebuild the fish data JS file: `python ./private/manageFishData.py rebuild -i ./private/fishData.yaml -o ./js/app/data.js --with-icons`
  * If changes to the SaintCoinach library break the script, fix it, then commit the changes as a separate commit.
  * **NOTE:** Pay attention to the log messages. If the script extracted any new textures, you'll need to update the sprite image.
* Update the *cache buster* in `index.html` for `js/app/data.js`. Use the format: `?${ver}_YYYYMMDD_HHMM`.
* If adding fish for a new patch;
  * Update the `viewModel.filter` definition in `index.html` by adding the patch version. (You'll also need to update the entry in `js/app/viewmodel.js`)
  * Remove the `disabled` class from the new patch version.
    * **NOTE:** If it's a new expansion, well... make sure it looks nice, and set the patch buttons to `disabled` at first.

## TODOs

* See [base branch](https://github.com/icykoneko/ff14-fish-tracker-app#TODOs)

# Contributing

* See [base branch](https://github.com/icykoneko/ff14-fish-tracker-app#Contributing)
