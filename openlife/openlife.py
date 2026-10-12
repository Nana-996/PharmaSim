#!/usr/bin/env python
# OpenLife: Open-Source Life Simulator

import pickle
import json
import copy
import json
import os
import random
import platform
import copy
import inspect
import json

from classes import * 
import lib
import data
import code

if not os.path.isdir("saves"):
    os.mkdir("saves")
os.chdir("saves")


class FunctionCapsule:
    """
    This class contains functions in the main source file, so that other source files can use those functions.
    """

    def __init__(self):
        self.die = die
        self.div = div
        self.br = br
        self.cls = cls
        self.pprint = pprint
        self.pprint_dict = pprint_dict
        self.obj_to_dict = obj_to_dict


def pprint_dict(dic):
    ## Takes a dictionary and returns it as a string with indentation
    return json.dumps(dic, indent=4)


def pprint(obj):
    print(pprint_dict(obj_to_dict(obj)))


def obj_to_dict(obj, addItemType=True):
    """
    Recursively convert an object and all its attributes to a dictionary.
    """
    if isinstance(obj, (int, float, bool, str)):
        return obj
    if isinstance(obj, Fuse):
        return obj.blown
    if inspect.isclass(obj):
        return {"__class__": obj.__name__}

    if isinstance(obj, (tuple, list)):
        return [obj_to_dict(x) for x in obj]

    if isinstance(obj, dict):
        if addItemType:
            obj2 = {"@itemType": type({}).__name__}
        obj2.update(obj)
        obj = obj2
        return {key: obj_to_dict(value) for key, value in obj.items()}
    obj_dict = {}
    if addItemType:
        obj_dict["@itemType"] = type(obj).__name__
    for attr in dir(obj):
        if attr.startswith("__") and attr.endswith("__"):
            continue
        if attr == "dic":
            continue
        if attr == "extra" and getattr(obj, attr) != None:
            value = getattr(obj, attr)
            obj_dict["extra"] = f"<attribute value hidden: length={len(value)}>"
        if attr == "backup" and isinstance(obj, Player):
            value = getattr(obj, attr)
            obj_dict["backup"] = f"<attribute value hidden: length={len(value)}>"
            continue
        if getattr(obj, attr) is None:
            obj_dict[attr] = "<class 'none'>"
            continue
        if callable(getattr(obj, attr)):
            obj_dict[attr] = f"<function '{attr}'>"
            continue
        value = getattr(obj, attr)
        obj_dict[attr] = obj_to_dict(value)
    return obj_dict


def cls():
    res = platform.uname()
    os.system("cls" if res[0] == "Windows" else "clear")


class ExitError(Exception):
    ## Called when exiting game
    ## Used to destroy game
    pass


def div(returnMode=False):
    t = "--------------------"
    if returnMode == True:
        return t
    print(t)


def br(skip=False):
    if not skip:
        div()
        input("Press ENTER to continue.")
    cls()


def pbar(percent):
    global alt_ui
    if percent > 1:
        percent = 1
    if percent < 0:
        percent = 0
    percent *= 100
    bar = "["
    hash = percent / 5
    global alt_ui
    hash = int(hash)
    dot = 20 - hash
    for i in range(hash):
        bar += "#"
    for i in range(dot):
        bar += " "
    bar += "]"
    return bar


def exitGame():
    raise ExitError


def showCredits():
    msg = "\n".join(
        [
            "Git Repository: https://codeberg.org/WinFan3672/OpenLife",
            "Website: https://openlife.codeberg.page/",
        ]
    )
    lib.messageBox("Credits", msg)


def jobInterview():
    global accepted
    accepted = False

    def yes():
        global accepted
        accepted = True

    def no():
        pass

    interviews = [
        [
            "Which Harry Potter character do you relate to most?",
            "Harry Potter",
            "Dobby",
            "Hagrid",
            "Draco Malfoy",
            [2, 3],
        ],
        ["Tea or coffee?", "Tea", "Coffee", "Both", "Neither", [1, 2]],
        [
            "Team Edward or Team Jacob?",
            "Team Edward",
            "Team Jacob",
            "I don't care",
            "What is that?",
            [1, 2],
        ],
        [
            "Do you prefer to call or text?",
            "Call",
            "Text",
            "Either one's fine",
            "I prefer to talk in person",
            [1, 2],
        ],
        [
            "What are your weaknesses?",
            "Where do I start?",
            "I'm a perfectionist",
            "I feel horny at work",
            "I don't have any",
            [2],
        ],
        [
            "Any more questions?",
            "When do I start?",
            "What is the company culture like?",
            "What is the pay?",
            "How inclusive is the company?",
            [2, 4],
        ],
        [
            "What do you want to see in a workplace?",
            "Collaboration",
            "Cute female employees",
            "Good Pay",
            "Diversity",
            [1, 4],
        ],
    ]
    q = random.choice(interviews)
    menu = lib.Menu(q[0])
    i = 1
    for i in [1, 2, 3, 4]:
        menu.add_function(q[i], yes if i in q[5] else no)
    menu.run()
    return accepted


def showDebugLog(player):
    log = pprint_dict(obj_to_dict(player))
    lib.messageBox("Debug Log", log)


def aboutGame():
    m = "\n".join(
        [
            "OpenLife is an open-source BitLife clone.",
            "Developed By Gordinator <gordinator@gordinator.org",
            div(True),
        ]
    )
    lib.messageBox("About", m)


def exitMenu():
    def cancel():
        pass

    menu = lib.Menu("Confirm Exit?")
    menu.add_function("Yes", startScreen)
    menu.add_function("No", cancel)
    menu.run()


def runConsole(player):
    player.cheater.blow()
    glob = globals()
    glob.update({"player": player})
    code.interact(local=glob, banner="WARNING! This is a FULL Python console. If you don't know what you're doing, run 'exit()' or press CTRL+D.")


def pauseMenu(player):
    menu = lib.Menu("Pause Menu")
    menu.add_function("Save Game", player.save)
    menu.add_function("Load Game")
    menu.add_function("Exit Game", exitMenu)
    menu.add_function("Debug Menu", lambda: debugMenu(player))
    menu.add_function("Console", lambda: runConsole(player))
    menu.add_function("Debug Log", lambda: showDebugLog(player))
    menu.run()


def eduMenu(player):
    menu = lib.Menu("Education")
    for x in data.higherEdu:
        d = data.higherEdu[x]
        if not d.complete:
            menu.add_function(d.name, lambda: d.apply(player))
        else:
            menu.add_function(d.name)
    menu.run()


def occupationMenu(player):
    menu = lib.Menu("Occupation")
    menu.add_function("Education", lambda: eduMenu(player))
    if player.job:
        menu.add_function(player.job.name, lambda: player.job.interact(player))
    elif isinstance(player.job, Retiree):
        menu.add_function("Retirement", lambda: player.job.interact(player))
    else:
        menu.add_function("No Job")
    menu.add_function("Part-Time Work")
    menu.add_function("Freelance Work")
    if not isinstance(player.job, Retiree) and player.age > 17:
        menu.add_function("Get Job", lambda: getJob(player))
    else:
        menu.add_function("Get Job")
    menu.add_function("Special Careers")
    menu.run()


def giveJob(player, job):
    if jobInterview():
        messageBox("Success", "You got the job!")
        player.job = job
    else:
        messageBox("Better try next time", "You did not get the job.")


def getJob(player):
    """
    Function that defines the jobs and also their requirements/salaries.
    Any selected job is passed to giveJob() instead.
    """
    jobs = [
        Job("Amazon Delivery Driver", 5),
        Job(
            "Jr Translator",
            10,
            minEdu=2,
            degree=15,
            nextJob=Job("Translator", 15, nextJob=Job("Sr Translator", 20)),
        ),
        Job(
            "Jr Accountant",
            30,
            minEdu=2,
            degree=5,
            nextJob=Job("Accountant", 40, nextJob=Job("Sr Accountant", 60)),
        ),
        Job("Exorcist", 10),
        Job(
            "Jr Game Developer",
            40,
            minEdu=2,
            degree=3,
            nextJob=Job("Game Developer", 45, nextJob=Job("Sr Game Developer", 50)),
        ),
        Job("Jr Lawyer", 60, minEdu=2, degree=32),
        Job("App Developer", 45, minEdu=2, degree=3),
        Job("Jr Banker", 45, minEdu=2, degree=1),
        Job("Monk", 15),
        Job(
            "Wedding Planner",
            25,
            nextJob=Job("Sr Wedding Planner", 35),
        ),
        Job(
            "Engineer I",
            55,
            minEdu=2,
            degree=9,
            nextJob=Job("Engineer II", 75, nextJob=Job("Engineer III", 95)),
        ),
        Job("Data Scientist", 75, minEdu=2, degree=13),
        Job("Cashier", 10),
        Job("College Lecturer", minEdu=2, degree=0),
        Job(
            "Jr Edutor",
            25,
            minEdu=2,
            degree=2,
            nextJob=Job("Editor", 35, nextJob=Job("Sr Editor", 65)),
        ),
        Job("Flight Attendant", 25),
        Job("Apprentice Hairdresser", 25, nextJob=Job("Hairdresser", 35)),
        Job("Librarian", 25),
        Job("Nun", 10),
        Job("Stockbroker", 45, minEdu=2, degree=1),
        Job(
            "Social Media Manager",
            35,
            minEdu=2,
            degree=16,
            nextJob=Job("PR Manager", 55, nextJob=Job("Head of Marketing", 70)),
        ),
    ]
    jobs = [x for x in jobs if x.check(player)]
    jobs = sorted(jobs, key=lambda x: x.getYearlyPay(), reverse=True)
    menu = lib.Menu("Select Job")
    for j in jobs:
        pay = j.getYearlyPay()
        menu.add_function(
            "{} ({}{:,}/Yr.)".format(j.name, player.nation.currency, pay),
            lambda j=j: giveJob(player, j),
        )
    menu.run()


def debugMenu(player):
    def degreeList():
        i = 0
        msg = []
        for x in data.degrees:
            msg.append("{}: {}".format(i, x))
            i += 1
        messageBox("Degree List (ID: Name)", "\n".join(msg))

    menu = lib.Menu("Debug Menu")
    menu.add_function("Exit", lambda: main(player))
    menu.add_function("Degree List", degreeList)
    while True:
        menu.run()


def showStats(player):
    diseases = []
    for d in player.disease:
        if player.disease[d]:
            diseases.append(d)
    diseases = [data.diseases[x]["name"] for x in diseases]
    if player.job:
        pay = player.job.getYearlyPay()
    else:
        pay = 0
    text = "\n".join(
        [
            "Years Played: {}".format(player.age),
            div(True),
            "Money Accrued",
            div(True),
            "Money: {}{:,}".format(player.nation.currency, player.money),
            "Debt: {}{:,}".format(player.nation.currency, player.debt),
            "Savings: {}{:,}".format(player.nation.currency, player.savings),
            "Net Worth: {}{:,}".format(player.nation.currency, player.calcNetWorth()),
            div(True),
            "Money Flow",
            div(True),
            "Salary: {}{:,}/Yr.".format(player.nation.currency, pay),
            "Expenses: {}{:,}/Yr.".format(player.nation.currency, player.expenses * 12),
            "Overall Flow: {}{:,}/Yr.".format(
                player.nation.currency, pay - player.expenses * 12
            ),
            div(True),
            "Education",
            div(True),
            "Education: {}".format(
                ["None", "School", "University", "Graduate School"][player.edu_lvl]
            ),
            "Degree: {}".format(data.degrees[player.degree]),
            div(True),
            "Other",
            div(True),
            "Diseases: {}".format(
                "; ".join([x for x in diseases]) if diseases else "None"
            ),
        ]
    )
    messageBox("Statistics", text)


def savingsMenu(player):
    menu = lib.Menu("Savings")
    menu.add_entry(
        lib.StringEntry(
            "Money: {}{:,}\nSavings: {}{:,}\n{}".format(
                player.nation.currency,
                player.money,
                player.nation.currency,
                player.savings,
                div(True),
            )
        )
    )
    menu.add_function("View Account")
    menu.add_function("Deposit")
    menu.add_function("Withdraw")
    menu.run()


def loanMenu(player):
    menu = lib.Menu("Loan")
    menu.add_entry(
        lib.StringEntry(
            "Money: {}{:,}\nDebt: {}{:,}\n{}".format(
                player.nation.currency,
                player.money,
                player.nation.currency,
                player.debt,
                div(True),
            )
        )
    )
    menu.add_function("Borrow Money")
    menu.add_function("Pay Off Debt")
    menu.add_function("Withdraw")
    menu.run()

def propertyMenu(player):
    menu = lib.Menu("Property")
    menu.add_function("Cars")
    menu.add_function("Boats")
    menu.add_function("Planes")
    menu.add_function("Owned Cars")
    menu.add_function("Owned Boats")
    menu.add_function("Owned Planes")
    menu.run()

def assetMenu(player):
    menu = lib.Menu("Assets/Stats")
    txt = "\n".join(
        [
            "Money: {}{:,}".format(player.nation.currency, player.money),
            "Debt: {}{:,}".format(player.nation.currency, player.debt),
            "Savings: {}{:,}".format(player.nation.currency, player.savings),
            div(True),
        ]
    )
    menu.add_entry(lib.StringEntry(txt))
    menu.add_function("Statistics", lambda: showStats(player))
    menu.add_function("Shopping")
    menu.add_function("Loan", lambda: loanMenu(player))
    menu.add_function("Savings", lambda: savingsMenu(player))
    menu.add_function("Social Media")
    menu.add_function("Property", lambda: propertyMenu(player))
    menu.add_function("Investments")
    menu.run()


def immortalMessage(player):
    lib.messageBox("Uh-Oh", "Suddenly, you feel a jolt as your vision moves upwards.")
    lib.messageBox("Uh-Oh!", "You see your limp body lie on the floor.")
    lib.messageBox(
        "Phew",
        "As soon as you begin panicking, your vision returns into your body.\nYou realise you've just died, and was saved by your immortality.",
    )


def die(player, reason=0):
    def respawn(player):
        player.cheater.blow()
        main(player)

    r = data.reasons[reason]
    text = r["desc"]
    d = {
        "%name": "{} {}".format(player.forename, player.surname),
        "%age": str(player.age),
        "%pn": "she" if player.gender else "he",
        "%Pn": "She" if player.gender else "He",
    }
    for x in d:
        text = text.replace(x, d[x])
    menu = lib.Menu("Death ({})".format(r["name"]))
    menu.add_entry(lib.StringEntry(text))
    menu.add_entry(lib.StringEntry(div(True)))
    menu.add_function("Exit to Main Menu", startScreen)
    menu.add_function("Respawn [Disables Achievements]", lambda: respawn(player))
    if len(player.backup):
        menu.add_function("Time Travel")
    else:
        menu.add_function("Time Travel")
    menu.add_function("View Ribbons")
    while True:
        menu.run()


def surrender(player):
    def nothing():
        pass

    menu = lib.Menu("Confirm?")
    menu.add_function("Yes", lambda: die(player, 0))
    menu.add_function("No", nothing)
    menu.run()


def goToGym(player):
    messageBox("Gym", "You went to the gym.\nEnjoyment:\n{}".format(pbar(1)))
    if not player.didGym:
        player.happiness += 0.45
        player.health += 0.15
    player.didGym = True


def readBook(player):
    def read(player, book):
        cls()
        for x in range(1, book["pageCount"] + 1):
            print("({}/{}) Reading...".format(x, book["pageCount"]), end="\r")
            time.sleep(1 / 64)
        msg = "\n".join(
            [
                "You finished '{}'.".format(book["name"]),
                "Happiness:                {}".format(pbar(book["happiness"] + 0.5)),
                "Intellectual Stimulation: {}".format(pbar(book["intel"] + 0.5)),
            ]
        )
        messageBox("Success", msg)
        player.happiness += book["happiness"]
        player.intel += book["intel"]

    def nothing():
        pass

    section = random.choice(list(data.books.keys()))
    book = random.choice(data.books[section])
    title = "\n".join(
        [
            "Title: {}".format(book["name"]),
            "Author: {}".format(book["author"]),
            "{} Pages".format(book["pageCount"]),
        ]
    )
    menu = lib.Menu(title)
    menu.add_function("Read", lambda: read(player, book))
    menu.add_function("Cancel", nothing)
    menu.run()


def dietMenu(player):
    def setDiet(player, diet):
        player.diet = diet
    menu = lib.Menu("Choose A Diet")
    menu.add_function("No Diet", lambda: setDiet(player, None))
    for d in data.diets:
        diet = Diet(d, data.diets[d]["health"], data.diets[d]["happiness"], data.diets[d]["annualCost"])
        menu.add_function(d, lambda diet=diet: setDiet(player, diet))
    menu.run()

def mindAndBody(player):
    def meditate(player):
        messageBox("Meditation", "You meditated for 15 minutes.")
        player.happiness += 0.05
        player.health += 0.05
        player.stress -= 0.05
    menu = lib.Menu("Mind and Body")
    menu.add_function("Gym", lambda: goToGym(player))
    menu.add_function("Read Book", lambda: readBook(player))
    menu.add_function("Diet", lambda: dietMenu(player))
    menu.add_function("Instruments")
    menu.add_function("Martial Arts")
    menu.add_function("Meditate", lambda: meditate(player))
    menu.add_function("Walk")
    menu.run()


def goBankrupt(player):
    def yes(player):
        txt = "\n".join(
            [
                "Your debt was cleared.",
                "You now have no money or savings.",
                "You are jobless.",
                "All property has already been repossessed.",
                "Your social media accounts have been deleted.",
            ]
        )
        if player.fame:
            txt.append("You are no longer famous.")
        player.money = 0
        player.savings = 0
        player.debt = 0
        player.job = None
        messageBox("Done", txt)

    def no():
        pass

    menu = Menu("Confirm?")
    menu.add_function("Yes", lambda: yes(player))
    menu.add_function("No", no)
    menu.run()


def crimeMenu(player):
    menu = lib.Menu("Crime")
    menu.add_function("Bank Robbery")
    menu.add_function("Burglary")
    menu.add_function("Grand Theft Auto")
    menu.add_function("Hitman")
    menu.add_function("Mischief")
    menu.add_function("Murder")
    menu.add_function("Pickpocket")
    menu.add_function("Shoplift")
    menu.add_function("Train Robbery")
    menu.run()


def activityMenu(player):
    menu = lib.Menu("Activities")
    menu.add_function("Mind and Body", lambda: mindAndBody(player))
    menu.add_function("Doctor")
    menu.add_function("Surrender", lambda: surrender(player))
    menu.add_function("Time Travel")
    menu.add_function("Crime", lambda: crimeMenu(player))
    menu.add_function("Adoption")
    menu.add_function("Hired Services")
    menu.add_function("Casino")
    menu.add_function("Identity")
    menu.add_function("Licenses")
    menu.add_function("Lawsuit")
    menu.add_function("Lottery")
    menu.add_function("Love")
    menu.add_function("Movies")
    menu.add_function("Nightlife")
    menu.add_function("Vacation")
    menu.add_function("Last Will")
    menu.add_function("Fertility")
    menu.add_function("Witness Protection")
    if player.debt > (player.money + player.savings) * 2:
        menu.add_function("Go Bankrupt", lambda: goBankrupt(player))
    else:
        menu.add_function("Go Bankrupt")
    menu.add_function("Research Lab")
    menu.add_function("Researches")
    menu.add_function("Emigrate")
    menu.run()


def relationsMenu(player):
    menu = lib.Menu("Relationships")
    ppl = player.getPeople()
    if ppl:
        for x in ppl:
            if x.relationName:
                relString = " ({})".format(x.relationName)
            else:
                relString = ""
            if "interact" in dir(x):
                menu.add_function(
                    "{}{}".format(x.name, relString), lambda x=x: x.interact(player)
                )
            else:
                menu.add_function("{}{}".format(x.name, relString))
        menu.run()
    else:
        messageBox("Error", "You have no relations to interact with.")


def main(player):
    while True:
        player.happiness = max(min(player.happiness, 1), 0)
        player.health = max(min(player.health, 1), 0)
        player.intel = max(min(player.intel, 1), 0)
        player.looks = max(min(player.looks, 1), 0)
        menu = lib.Menu()
        name = "{} {}".format(player.forename, player.surname)
        menu.add_entry(
            lib.StringEntry(
                "{} [{}]".format(name, "Female" if player.gender else "Male")
            )
        )
        if isinstance(player.job, HigherEducation):
            menu.add_entry(lib.StringEntry(player.job.name + " Student"))
        elif player.job:
            menu.add_entry(lib.StringEntry(player.job.name))
        else:
            menu.add_entry(lib.StringEntry("Unemployed"))
        menu.add_entry(lib.StringEntry("Nation: {}".format(player.nation.name)))
        menu.add_entry(lib.StringEntry(div(True)))
        menu.add_entry(lib.StringEntry("Age: {}".format(player.age)))
        menu.add_entry(
            lib.StringEntry(
                "{}{}".format(player.nation.currency, "{:,}".format(player.money))
            )
        )
        menu.add_entry(lib.StringEntry(div(True)))
        menu.add_entry(
            lib.StringEntry(
                "Happiness: {} {}%".format(
                    pbar(player.happiness), int(player.happiness * 100)
                )
            )
        )
        menu.add_entry(
            lib.StringEntry(
                "Health:    {} {}%".format(
                    pbar(player.health), int(player.health * 100)
                )
            )
        )
        menu.add_entry(
            lib.StringEntry(
                "Smarts:    {} {}%".format(pbar(player.intel), int(player.intel * 100))
            )
        )
        menu.add_entry(
            lib.StringEntry(
                "Looks:     {} {}%".format(pbar(player.looks), int(player.looks * 100))
            )
        )
        menu.add_entry(lib.StringEntry(div(True)))
        if player.age >= 18:
            menu.add_function("Occupation", lambda: occupationMenu(player))
        elif player.age >= 12:
            menu.add_function("Secondary School")
        elif player.age >= 5:
            menu.add_function("Primary School")
        else:
            menu.add_function("Infant")
        if player.age >= 5:
            menu.add_function("Assets/Stats", lambda: assetMenu(player))
        else:
            menu.add_function("Assets/Stats")
        menu.add_function("Age Up", player.age_up)
        menu.add_function("Relationships", lambda: relationsMenu(player))
        if player.age >= 5:
            menu.add_function("Activities", lambda: activityMenu(player))
        else:
            menu.add_function("Activities")
        menu.add_function("Pause Menu", lambda: pauseMenu(player))
        menu.run()


def newGameWizard(skipMenu=False):
    global gender
    gender = random.randint(0, 1)

    def setMale():
        global gender
        gender = 0

    def setFemale():
        global gender
        gender = 1

    menu = lib.Menu("Pick Gender (ENTER for random)")
    menu.add_function("Male", setMale)
    menu.add_function("Female", setFemale)
    if not skipMenu:
        menu.run()
    fc = FunctionCapsule()
    p = Player(fc)
    p.gender = gender
    p.forename, p.surname = random.choice(
        data.forename_f if gender else data.forename_m
    ), random.choice(data.surnames)
    p.happiness = random.randint(1, 100) / 100
    p.health = random.randint(1, 100) / 100
    p.intel = random.randint(1, 100) / 100
    p.looks = random.randint(1, 100) / 100
    if skipMenu:
        p.age = 18
    mother, father = Parent(), Parent()
    mother.create(1, p.surname)
    father.create(0, p.surname)
    p.parents = [mother, father]
    main(p)


def viewChangeLog():
    txt = "\n".join(
        [
            "* Major code improvements:",
            "   * Rewrote all UI code.",
            "   * Rewrote most game logic.",
            "   * These changes do not break backwards compatibility.",
            "* Temporarily removed OpenTube for rebalancing purposes.",
        ]
    )

    messageBox("Changelog (v0.3.0)", txt)


def startScreen():
    menu = lib.Menu()
    menu.add_entry(lib.StringEntry("\n".join(data.logo)))
    menu.add_entry(lib.StringEntry(div(True)))
    menu.add_function("New Life", newGameWizard)
    menu.add_function("Load Life")
    menu.add_function("Credits", showCredits)
    menu.add_function("Changelog", viewChangeLog)
    menu.add_function("Quick Create Life", lambda: newGameWizard(True))
    menu.add_function("Exit", exitGame)
    menu.add_function("About OpenLife", aboutGame)
    while True:
        cls()
        menu.run()


try:
    if __name__ == "__main__":
        startScreen()
except ExitError:
    pass
