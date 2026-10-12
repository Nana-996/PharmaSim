from lib import div, br, cls
from classes import *
import pickle
import os


class ConsoleCommand:
    def __init__(self, desc, function, needsCheats=False):
        self.desc = desc
        self.function = function
        self.needsCheats = needsCheats


class Console:
    def __init__(self, elev=False):
        self.commands = {}
        self.running = False
        self.elevated = bool(elev)
        self.default_elevated = bool(elev)

    def add_command(self, cmd, desc, function, cheats=False):
        self.commands[cmd] = ConsoleCommand(desc, function, cheats)

    def add_alias(self, alias, command):
        self.commands[alias] = self.commands[command]

    def help(self):
        div()
        print("Commands List")
        div()
        for x in self.commands:
            if self.commands[x].needsCheats and not self.elevated:
                continue
            print("{}: {}".format(x, self.commands[x].desc))
        div()

    def stop(self):
        self.running = False
        self.elevated = self.default_elevated

    def enable_cheats(self):
        self.elevated = True

    def run(self):
        self.running = True
        while self.running:
            cmd = input("console $" if not self.elevated else "elev-console $")
            parts = cmd.split(" ")
            args = parts[1:]
            cmd = parts[0]
            try:
                command = self.commands[cmd]
                if command.needsCheats and not self.elevated:
                    print("ERROR: This command requires cheats, which are not enabled.")
                else:
                    command.function()
            except:
                print("ERROR: Invalid console command.")


def console(player, elev=0):
    def is_cheats(console):
        print(console.elevated)

    def debug(player):
        log = pprint_dict(obj_to_dict(player))
        messageBox("Debug Log", log)

    def stat(player):
        d = {
            "happiness": player.happiness,
            "health": player.health,
            "intel": player.intel,
            "looks": player.looks,
        }
        print(pprint_dict(d))

    def maxStat(player):
        player.happiness = 1.0
        player.health = 1.0
        player.intel = 1.0
        player.looks = 1.0

    def minStat(player):
        player.happiness = 0.0
        player.health = 0.0
        player.intel = 0.0
        player.looks = 0.0

    def randStat(player):
        player.happiness = random.randint(0, 100) / 100
        player.health = random.randint(0, 100) / 100
        player.intel = random.randint(0, 100) / 100
        player.looks = random.randint(0, 100) / 100

    def fund():
        d = {}
        fund = IndexFund("Test Index Fund")
        fund.investment = 100
        for x in range(1, 257):
            d[x] = fund.investment
            fund.age_up()
        for x in d:
            print("Y{} = ${:,}".format(x, d[x]))

    console = Console(bool(elev))
    console.add_command("help", "Lists all commands and what they do.", console.help)

    console.add_command(
        "cheats", "Prints if cheats are enabled.", lambda: is_cheats(console)
    )
    console.add_command("cheats on", "Enables cheats.", console.enable_cheats)
    console.add_command("dlog", "Shows a debug log.", lambda: debug(player))

    console.add_command("cls", "Clears the terminal.", cls)
    console.add_alias("clear", "cls")

    console.add_command("stat", "Displays raw player stats.", lambda: stat(player))
    console.add_command(
        "stat max", "Sets all stats to 100%.", lambda: maxStat(player), cheats=True
    )
    console.add_command(
        "stat min", "Sets all stats to 0%.", lambda: minStat(player), cheats=True
    )
    console.add_command(
        "stat rand", "Randomises all stats.", lambda: randStat(player), cheats=True
    )

    console.add_command(
        "fund", "Simulates an index fund and displays the result.", fund
    )

    console.add_command("exit", "Exits the console.", console.stop)
    console.add_alias("quit", "exit")
    console.run()


"""
def console(player, elev=0):
    if elev == 1:
        text = input("elev-console $")
    else:
        text = input("console $")
    if text == "exit":
        return None
    else:
        consoleBase(player, elev, text)
"""


def console(player, elev=0):
    if elev:
        cmd = input("elevated-console $")
    else:
        cmd = input("console $")

    if cmd == "exit":
        return
    else:
        consoleBase(player, elev, cmd)


def consoleBase(player, elev, text):
    import json

    ch = text
    if text == "":
        console(player, elev)
    elif text == "elevate" or text == "elev":
        player.cheater.blow()
        elev = 1
        console(player, elev)
    elif text == "help":
        div()
        print("help - this menu")
        print("echo <text> - prints <text> to the terminal")
        # print("pref - shows saved preferences")
        # print("dlog - Prints a debug log")
        # print("save - Saves current life")
        # print("load - loads a life (exits terminal)")
        print("cls - Clears console")
        # print("stat - prints out all stats as a dictionary")
        # print("nation - prints information about all nations")
        # print(
        #    "opentube - simulates an OpenTube channel for 256 years and dumps data to a JSON file"
        # )
        # print("achid - lists all achievements and their ID's")
        print("fund - simulates an index fund for 256 years")
        div()
        print("size - prints estimated size of the save file")
        print("dump - dumps player object to JSON file")
        # print("healthc - reports potentially broken attrubutes")
        # print("compare - shows default state of missing attributes")
        # print("healthd - shows default state of potentially broken attributes")
        print('pyclock - shows the "clock speed" of Python\'s operatin in hz')
        print(
            'pybm - generates a JSON file that shows Python\'s "clock speed"(Takes 10s)'
        )
        if elev == 1:
            print(
                "balloon - inflates the save file size by filling it with junk data [USE AT OWN RISK]"
            )
        div()
        # print(
        #    "sv_cheats <0/1> - enables/disables cheats (warning: this disables achievements!)"
        # )
        if elev == 1:
            div()
            print("god - enter the god menu")
            print("cdebt - clears debt")
            print("rich <int> - sets your money to <int>")
            print("max lab - maxxes out lab")
            print("max license - gives you all licenses")
            print("max stat - 100% for all stats")
            print("max addict - You gain all addictions")
            print("max job - allows you to get any job")
            print("forgive - Forgive prison sentence")
            print("sentence <int> - sets you to prison for <int> years")
            print("killp - forces your parents to die when you age up")
            print("age <age> - sets your age to <age>")
            print("sweep - opens a game of Minesweeper")
            print("cargen - adds a randomly-generated car")
            print(
                "unichance - shows the probability of the player's parents paying for uni"
            )
            div()
            print("edu - lists all edu levels")
            print("edu <int> - set edu level to <int>")
            print("degree - lists all degrees")
            print("degree <int> - sets degree to <int>")
            print("makep - adds a freshly-generated parent")
            print("makes - adds a freshly-generated spouse")
            print("witch - gives you all diseases")
            print("unwitch - cures all diseases")
            div()
            print("depress - make your player depressed")
            print("faux - age up, then decrement your age")
            print("stress - perform a stress test (also creates a report file)")
            div()
        print("version - prints app/console version")
        print("exit - return to main screen")
        div()
        console(player, elev)
    elif text == "nation":
        pprint(nations)
        console(player, elev)
    elif text == "opentube":
        z = 256
        o = OpenTube("")
        v = 0
        s = 0
        d = {}
        print("Calculating...")
        for i in range(z):
            xv, l = o.calcViews()
            o.subscribers = s
            v += xv
            s += o.calcSubs(xv, l)
            if s > 8000000000:
                s = 8000000000
            d[i] = {"viewsGained": xv, "totalViews": v, "subs": s}
            o.videoCount += 1
            if i % 10 == 0:
                xPbar(i, z)
        with open("openTube.json", "w") as f:
            import json

            json.dump(d, f)
        div()
        print('Dumped to "openTube.json".')
        div()
        console(player, elev)
    elif text == "fund":
        fund = IndexFund("Console Fund")
        fund.investment = 1000
        z = {}
        for i in range(256):
            z[i] = fund.investment
            fund.age_up()
        with open("fund.json", "w") as f:
            json.dump(z, f)
        div()
        print('Dumped to "fund.json".')
        div()
        console(player, elev)
    elif text == "achid":
        for item in achievements:
            if item != "version":
                print([item, achievements[item].title, achievements[item].desc])
        console(player, elev)
    elif text.startswith("degree "):
        text = text[7:]
        try:
            text = int(text)
            if not text in range(len(degrees)):
                raise Exception
        except:
            print(f"Error: cannot set degree #{text}")
        player.edu_lvl = 2 if text != 0 else 1
        player.degree = text
        console(player, elev)
    elif text == "degree":
        i = 0
        for item in degrees:
            print(f"{i} {item}")
            i += 1
        console(player, elev)
    elif text == "unichance":
        x = 0
        for item in player.parents:
            x += item.generosity * item.relation
        print(f"P: {x}")
        console(player, elev)
    elif text == "cargen":
        x = []
        for i in range(100000):
            x.append(Car())
        console(player, elev)
    elif text == "speedTest" and elev == 1:
        d = {}
        l = [
            ["initPlayer", Player],
            ["initChild", Child],
            ["initParent", Parent],
            ["makePbar", lambda: pbar(1)],
            ["cleanTT", lambda: cleanTT(player)],
        ]
        import time

        for item in l:
            x = time.time()
            y = item[1]()
            z = time.time()
            d[item[0]] = z - x
        pprint(d)
        console(player, elev)
    elif text == "max lab" and elev == 1:
        player.lab = invertDict(player.lab)
        console(player, elev)
    elif text == "inflate" and elev == 1:
        ascii_chars = "".join([chr(i) for i in range(128)])
        for i in range(2**16 - 1):
            c = ""
            c2 = ""
            for x in rang(1, 64):
                c += choice(list(ascii_chars))
                c2 += choice(list(ascii_chars))
            player.dic[c] = c2
            if i % 1000 == 0 or i >= 2**16:
                xPbar(i, 2**16 - 1)
        console(player, elev)
    elif text == "clean":
        player = cleanTT(player)
        player.extra = None
        console(player, elev)
    elif text == "max job" and elev == 1:
        player.job_lvl = -1
        console(player, elev)
    elif text == "witch" and elev == 1:
        player.disease = invertDict(Player().disease)
        console(player, elev)
    elif text == "unwitch" and elev == 1:
        player.disease = Player().disease
        console(player, elev)
    elif text == "pybm":
        z = {}
        z2 = []
        print("Starting Benchmark...")
        for i in range(10):
            print("({}/10) Running benchmark...".format(i), end="\r")
            import time

            x = time.time()
            y = 0
            while time.time() - x < 1:
                y += 1
            z[i] = y
            z2.append(y)
        z3 = 0
        for item in z2:
            z3 += i
        z["average"] = z3 // 60
        print("Data written to benchMark.json")
        import json

        with open("benchMark.json", "w") as f:
            json.dump(z, f)
        console(player, elev)
    elif text == "balloon" and elev == 1:
        print("Begin operation...")
        try:
            del player.extra.extra
        except:
            pass
        if player.extra != None:
            print("Error: Already run operation.")
            console(player, elev)
        for i in range(256):
            print("\033[F", end="")
            print("-->" + str(i + 1) + "/256<--")
            try:
                player.extra = obj_to_dict(player)
                try:
                    del player.extra.extra
                except:
                    pass
            except:
                pass
        print("Finished operation.")
        console(player, elev)
    elif text == "pyclock":
        import time

        x = time.time()
        y = 0
        while time.time() - x < 1:
            y += 1
        print("{:,}".format(y))
        console(player, elev)
    elif text == "makesue" and elev == 1:
        player.suable.append([Suable(), ""])
        console(player, elev)
    elif text == "stress" and elev == 1:
        stressTest(player)
        console(player, elev)
    elif text == "forgive" and elev == 1:
        player.sentence = 0
        player.offences = []
        console(player, elev)
    elif text == "healthc":
        print(get_invalid_attributes(player))
        console(player, elev)
    elif text == "compare":
        x = obj_to_dict(player)
        y = obj_to_dict(Player())
        z = diff_dict(x, y)
        pprint(z)
        console(player, elev)
    elif text == "makech" and elev == 1:
        o = OpenTube("Console Test")
        o.monetised = True
        o.verified = True
        o.videoCount = 1
        o.schedule = 365
        player.opentube.append(o)
        console(player, elev)
    elif text == "healthd":
        x = obj_to_dict(player)
        y = get_invalid_attributes(player)
        z = {}
        for item in x:
            if item in y:
                z[item] = obj_to_dict(Player())[item]
        pprint(z)
        console(player, elev)
    elif text == "max license" and elev == 1:
        player.licenses = invertDict(Player().licenses)
        console(player, elev)
    elif text == "max addict" and elev == 1:
        player.addictions = invertDict(Player().addictions)
        console(player, elev)
    elif ch.startswith("stress ") and elev == 1:
        try:
            ch = int(ch[7:])
            stressTest(player, ch)
        except:
            pass
        console(player, elev)
    elif text == "size":
        print("{:,}K".format(len(pickle.dumps(player)) / 1000))
        console(player, elev)
    elif text.startswith("sentence ") and elev == 1:
        player.offences.append(Offence("Game Cheating", int(ch[9:])))
        goToPrison(player)
        console(elev)
    elif text == "dump":
        import json

        x = obj_to_dict(player)
        x["platfomInformation"] = get_platform_info()
        with open("player.json", "w") as f:
            json.dump(x, f)
        print("Dump successful.")
        print("To view, access the 'player.json' file in your save directory.")
        console(player, elev)
    elif text == "makec" and elev == 1:
        ch = Child()
        ch.create(player)
        player.children.append(ch)
        console(player, elev)
    elif text == "faux" and elev == 1:
        b = player.backup
        player.age_up()
        player.age -= 1
        player.backup = b
        console(player, elev)
    elif text == "makes" and elev == 1:
        sp = Spouse(1 if player.gender == 0 else 0)
        if player.gender == 0:
            sp.create(
                f"{choice(forename_f)} {choice(surnames)}",
                player.age,
                rng(65, 85),
                0,
                0,
            )
            sp.gender = 1
        else:
            sp.create(
                f"{choice(forename_m)} {choice(surnames)}",
                player.age,
                rng(65, 85),
                0,
                0,
            )
            sp.gender = 0
        player.spouse = sp
        console(player, elev)
    elif text == "god" and elev == 1:
        godMenu(player)
        console(player, elev)
    elif text == "makep" and elev == 1:
        pa = Parent()
        pa.create(rng(0, 1), player.surname)
        player.parents.append(pa)
        console(player, elev)
    elif text == "stat":
        pprint(statDict(player))
        console(player, elev)
    elif text == "depress" and elev == 1:
        player.disease["depression"] = True
        console(player, elev)
    elif text.startswith("jid "):
        ch = text[4:]
        try:
            player.job_id = int(ch)
        except:
            print("InvalidSyntax")
        console(player, elev)
    elif text.startswith("jlvl "):
        try:
            player.job_lvl = int(text[5:])
        except:
            print("InvalidSyntax")
        console(player, elev)
    elif text == "edu":
        print("0 - none")
        print("1 - high school")
        print("2 - degree")
        console(player, elev)
    elif text.startswith("edu "):
        try:
            text = int(text[4:])
            player.edu_lvl = text
        except:
            print("InvalidLVL")
        console(player, elev)
    elif text == "pref":
        print(pprint_dict(prefs))
        console(player, elev)
    elif text == "dbgoff":
        prefs["allowDebug"] = False
        console(player, elev)
    elif text == "sweep":
        print(play_minesweeper())
        console(player, elev)
    elif text == "killp" and elev == 1:
        m = player.parents[0]
        f = player.parents[1]
        m.end = m.age + 1
        f.end = f.age + 1
        player.parents = [m, f]
        console(player, elev)
    elif text == "dlog":
        print(player.debug())
        console(player, elev)
    elif ch == "max stat" and elev == 1:
        player.intel, player.looks, player.health, player.happiness, player.ethics = (
            1,
            1,
            1,
            1,
            0,
        )
        console(player, elev)
    elif text == "cdebt" and elev == 1:
        player.debt = 0
        console(player, elev)
    elif text.startswith("rich ") and elev == 1:
        ch = text[5:]
        try:
            player.money = int(ch)
        except:
            print("[ERROR] Invalid Val")
        console(player, elev)
    elif ch == "load":
        loadGame()
    elif text.startswith("echo "):
        print(text[5:])
        console(player, elev)
    elif text == "save":
        saveGame(player)
        console(player, elev)
    elif text == "cls":
        cls()
        console(player, elev)
    elif ch == "version":
        div()
        print(f"game {app_version[0]}.{app_version[1]}.{app_version[2]}")
        print("console 2.0.0")
        div()
        console(player, elev)
    elif ch == "sv_cheats 1":
        print("Warning! This will enable cheats.")
        print("Enabling cheats will disable achievements for the player.")
        print(
            'If you accept the consequences, type "I know what I am doing" into the terminal.'
        )
        ch = input("Confirm? $")
        if ch == "I know what I am doing":
            player.cheater.blow()
            console(player, 1)
        else:
            console(player)
    elif ch == "sv_cheats 0":
        print("[WARNING] Achievements will not be re-enabled.")
        console(player)
    elif ch.startswith("age ") and elev == 1:
        try:
            player.age = int(ch[4:])
        except Exception as e:
            print(str(e))
        console(player, elev)
    elif ch == "exit":
        return None
    else:
        print("InvalidConsoleCommandError: the Console Command is not valid.")
        console(player, elev)
