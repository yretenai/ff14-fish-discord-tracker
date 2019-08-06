from PIL import Image, ImageFont, ImageDraw
import os.path
from itertools import islice
import yaml
try:
    from yaml import CLoader as Loader
except ImportError:
    from yaml import Loader
try:
    from yaml import CDumper as Dumper
except ImportError:
    from yaml import Dumper

try:
    _SCRIPT_PATH = os.path.abspath(__path__)
except:
    _SCRIPT_PATH = os.path.abspath(os.path.dirname(__file__))

fishes = yaml.load(open(os.path.join(_SCRIPT_PATH, 'fishData.yaml'), 'r'), Loader=Loader)
name_map = yaml.load(open(os.path.join(_SCRIPT_PATH, 'itemNames.yaml'), 'r'), Loader=Loader)
SPEARFISHING_NODES = yaml.load(open(os.path.join(_SCRIPT_PATH, 'spearfishingNodes.yaml'), 'r'), Loader=Loader)
FISHING_NODES = yaml.load(open(os.path.join(_SCRIPT_PATH, 'fishingNodes.yaml'), 'r'), Loader=Loader)

FONT = ImageFont.truetype('seguisym.ttf', 32)
FONT_1 = ImageFont.truetype('seguisym.ttf', 16)
FONT_2 = ImageFont.truetype('segoeui.ttf', 16)
FONT_3 = ImageFont.truetype('segoeui.ttf', 20)
FONT_4 = ImageFont.truetype('segoeui.ttf', 32)
ARROW_RIGHT = '▶'
ARROW_RIGHT_SIZE = FONT.getsize(ARROW_RIGHT)[0]
ARROW_RIGHT_SIZE_1 = FONT_1.getsize(ARROW_RIGHT)[0]
TIMES = '✕'
TIMES_SIZE = FONT.getsize(TIMES)[0]
TIMES_SIZE_1 = FONT_1.getsize(TIMES)[0]
STATE_SNAG = Image.open(os.path.join(_SCRIPT_PATH, 'images', 'status', 'snagging.png'))
STATE_INTU = Image.open(os.path.join(_SCRIPT_PATH, 'images', 'status', 'intuition.png'))
STATE_EYES = Image.open(os.path.join(_SCRIPT_PATH, 'images', 'status', 'fish_eyes.png'))
FOLKLORE = Image.open(os.path.join(_SCRIPT_PATH, 'images', 'folklore.png'))
BASE_IMAGE = os.path.join(_SCRIPT_PATH, 'images', 'fish_n_tackle')
BASE_INFO = os.path.join(_SCRIPT_PATH, 'images', 'infographic')
    
if not os.path.exists(BASE_INFO):
    os.makedirs(BASE_INFO)

max_sz = 0

def nth(iterable, n, default=None):
    """Returns the nth item or a default value"""
    return next(islice(iterable, n, None), default)

def lookup_fishing_spot_by_name(name):
    #if more than 1 instance is available in raw data, take the first one
    if isinstance(name, list):
        name = name[0]
    if name is None:
        return "???"
    result = nth(filter(lambda item: item[1]['name_en'] == name,
                        FISHING_NODES.items()), 0)
    if result is None:
        # HOLD ON, Clorifex says SE f's this up a lot... and can sometimes turn
        # the first letter of place names to lowercase... Seriously SE?
        result = nth(filter(lambda item: item[1]['name_en'].lower() == name.lower(),
                            FISHING_NODES.items()), 0)
        if result is None:
            raise ValueError(name)
    return result[1]["name_en"]

def lookup_spearfishing_spot_by_name(name):
    #if more than 1 instance is available in raw data, take the first one
    if isinstance(name, list):
        name = name[0]
    if name is None:
        return "???"
    if isinstance(name, int):
        return "???"
    result = nth(filter(lambda item: item[1]['name_en'] == name,
                        SPEARFISHING_NODES.items()), 0)
    if result is None:
        raise ValueError(name)
    return result[1]["name_en"]

def create_image(fish):
    global name_map
    global max_sz
    print('Creating image for %s' % (fish["name"]))
    img = Image.new("RGB", (1024, 1024), 0x3f3936)
    draw = ImageDraw.Draw(img)
    icon = Image.open(os.path.join(BASE_IMAGE, '%s.png' % name_map[fish["name"]]))
    img.paste(icon, (12, 12), icon)
    STARTX = 64;
    try:
        if fish["folklore"]:
            img.paste(FOLKLORE, (STARTX, 12), FOLKLORE)
            STARTX += 25
    except KeyError: pass
    draw.text((STARTX, 6), fish["name"], font=FONT_3)
    location = fish["location"]
    if fish["gig"] is not None:
        location = lookup_spearfishing_spot_by_name(fish['location'])
    else:
        location = lookup_fishing_spot_by_name(fish['location'])
    draw.text((STARTX, 30), location, font=FONT_2)
    STARTX += max(FONT_3.getsize(fish["name"])[0], FONT_2.getsize(location)[0]) + 12
    STARTY = 64
    draw.text((STARTX, 8), ARROW_RIGHT, font=FONT)
    STARTX += int(ARROW_RIGHT_SIZE * 1.5)
    if fish["snagging"] == True:
        img.paste(STATE_SNAG, (STARTX, 18), STATE_SNAG)
        STARTX += 32
    if fish["fishEyes"] == True:
        img.paste(STATE_EYES, (STARTX, 18), STATE_EYES)
        STARTX += 32
    if fish["predators"] != None and len(fish["predators"]) > 0:
        img.paste(STATE_INTU, (STARTX, 18), STATE_EYES)
        STARTX += 32
    bait_len = len(fish["bestCatchPath"] or [])
    if bait_len > 0:
        last = fish["bestCatchPath"][-1]
        for bait in fish["bestCatchPath"]:
            icon = Image.open(os.path.join(BASE_IMAGE, '%s.png' % name_map[bait]))
            img.paste(icon, (STARTX, 12), icon)
            STARTX += 52
            if bait != last:
                draw.text((STARTX, 20), ARROW_RIGHT, font=FONT_1)
                STARTX += int(ARROW_RIGHT_SIZE_1 * 1.5)
    OSTARTX = STARTX
    if fish["predators"] != None and len(fish["predators"]) > 0:
        last = list(fish["predators"].keys())[-1]
        for predator in fish["predators"]:
            count = fish["predators"][predator]
            STARTX = 32
            draw.text((STARTX, STARTY), str(count), font=FONT_4)
            STARTX += FONT_4.getsize(str(count))[0] + 4;
            draw.text((STARTX, STARTY+11), TIMES, font=FONT_1)
            STARTX += int(TIMES_SIZE_1 * 1.3)
            predator_img = Image.open(os.path.join(BASE_INFO, '%s.png' % name_map[predator]))
            img.paste(predator_img, (STARTX, STARTY-12))
            STARTX += predator_img.width + 12
            OSTARTX = max(STARTX, OSTARTX)
            STARTY += 48 + 12
            if predator == last:
                STARTY -= 12
    max_sz = max(max_sz, OSTARTX)
    img.crop((0,0, OSTARTX, STARTY)).save(os.path.join(BASE_INFO, '%s.png' % name_map[fish["name"]]))
    max_sz = max(max_sz, STARTX)

for fish in [fish for fish in fishes if fish != None and len(fish["predators"] or []) == 0]:
    create_image(fish)
for fish in [fish for fish in fishes if fish != None and len(fish["predators"] or []) > 0]:
    create_image(fish)
print("Max width %d" % max_sz)
