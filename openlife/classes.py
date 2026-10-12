import json
import random
import time
import copy
import os
import inspect
from lib import cls, div, br, messageBox, weightedRNG
import lib
import data
import pickle

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


researches = [
    ## [id,display name,price,years to develop,function (player object passed to (can leave as None))]
    ["researchLab", "Research Lab", 1000000000, 3, None],
    ["ageDown", "Age Down 20 Years", 15000000000, 1, None],
    ["cureCancer", "Cure To Cancer", 150000000000, 5, None],
    ["isImmortal", "Immortality", 1000000000000, 10, None],
    # ["deStress","0% Stress",150000000,3,None]
]


class Fuse:
    __instance = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
            cls.__instance.__initialized = False
        return cls.__instance

    def __init__(self):
        if self.__initialized:
            return
        self.__initialized = True
        self.__blown = False

    def blow(self):
        self.__blown = True

    @property
    def blown(self):
        return self.__blown

    @classmethod
    def is_blown(cls, fuse):
        return fuse.blown

    def __str__(self):
        return str(self.blown)


class Base:
    """
    Base class used by all classes.
    This class is used as a base for other classes exclusively, and is not called directly.
    Methods:
        __str__():
            Returns the object as a fornatted dict if you use it in print().
        __iter__():
            If you use a Base class object in a for loop, it iterates through every attribute's name instead of their values.
        __len__():
            If you use len() on it, it returns the amount of attributes it has
    """

    __slots__ = ["__weakref__"]

    def __str__(self):
        return pprint_dict(obj_to_dict(self))

    def __iter__(self):
        return iter(sorted(self.__dict__.keys()))

    def __len__(self):
        return len(dir(self))


class Parent(Base):
    # The parent class. Defines data for parents
    def __init__(self):
        self.name = None
        self.age = 0
        self.end = 0
        self.fortune = 0
        self.salary = 0
        self.relationName = ""
        self.didCompliment = False
        self.didConv = False
        self.dead = False

    def info(self, player):
        txt = "\n".join(
            [
                "Age: {}".format(self.age),
                "Net Worth: {}{:,}".format(player.nation.currency, self.fortune),
                "Relation: {}".format(self.relationName),
                "Salary: {}{:,}/Yr.".format(player.nation.currency, self.salary),
            ]
        )
        messageBox(self.name, txt)

    def create(self, gender, surname):
        self.salary = random.randint(25, 55) * 1000
        self.age = random.randint(25, 45)
        self.end = random.randint(65, 85)
        self.gender = gender
        self.fortune = random.randint(0, 256) * random.randint(0, 100000)
        self.relation = random.randint(50, 100) / 100
        self.generosity = random.randint(1, 100) / 100
        if self.gender == 1:
            self.name = random.choice(data.forename_f) + " " + surname
        else:
            self.name = random.choice(data.forename_m) + " " + surname
        self.relationName = "Mother" if gender else "Father"

    def getLines(self):
        if self.gender == 1:
            return f"My father is {self.name}, a {self.age}-year-old."
        else:
            return f"My mother is {self.name}, a {self.age}-year-old."

    def kill(self, player):
        lib.messageBox(
            "RIP",
            "Your {} died aged {}.".format(
                "mother" if self.gender else "father", self.age
            ),
        )
        lib.messageBox(
            "RIP", "You inherited {}{:,}.".format(player.nation.currency, self.fortune)
        )
        player.money += self.fortune
        player.happiness = 0
        self.fortune = 0
        self.dead = True

    def getString(self):
        return "mother" if self.gender else "father"

    def display(self):
        if self.gender == 0:
            g = "Father"
        else:
            g = "Mother"
        return f"{self.name} ({g}) (Age {self.age})\n    {pbar(self.relation)} {int(self.relation*100)}%"

    def age_up(self, player):
        self.age += 1
        self.didCompliment = False
        self.didConv = False
        self.fortune = int(self.fortune * 1.01)
        self.fortune += self.salary
        if self.age == self.end:
            self.kill(player)


    def compliment(self, player):
        appr = 0.5 if self.relation >= 0.35 else 0.25
        txt = "\n".join(
            [
                "You called your {} {}.".format(
                    self.getString(), random.choice(data.compliments)
                ),
                "Appreciation:",
                pbar(appr),
            ]
        )
        messageBox("Compliment", txt)
        if not self.didCompliment:
            if appr == 0.5:
                self.relation += 0.15
                player.happiness += 0.25
            else:
                self.relation += 0.05
                player.happiness -= 0.15
        self.didCompliment = True

    def converse(self, player):
        appr = 0.5 if self.relation >= 0.35 else 0.25
        txt = "\n".join(
            [
                "You had a conversation with your {} about {}.".format(
                    self.getString(), random.choice(data.debates)
                ),
                "Appreciation:",
                pbar(appr),
            ]
        )
        messageBox("Conversation", txt)
        if not self.didConv:
            if appr == 0.5:
                self.relation += 0.15
                player.happiness += 0.25
            else:
                self.relation += 0.05
                player.happiness -= 0.15
        self.didConv = True

    def interact(self, player):
        self.relation = min(1, max(0, self.relation))
        menu = lib.Menu("{} ({})".format(self.name, self.relationName))
        text = "Age: {}\nRelationship: {} {}%".format(
            self.age, pbar(self.relation), int(self.relation * 100)
        )
        menu.add_entry(lib.StringEntry(text))
        menu.add_entry(lib.StringEntry(div(True)))
        menu.add_function("Compliment", lambda: self.compliment(player))
        menu.add_function("Conversation", lambda: self.converse(player))
        menu.add_function("Ask For Money")
        menu.add_function("Give Gift...")
        menu.add_function("Spend Time With")
        menu.add_function("Give Money")
        menu.add_function("View Information", lambda: self.info(player))
        menu.run()


class Job(Base):
    def __init__(self, name, salary=0, minHours=40, minEdu=0, degree=0, nextJob=None):
        self.name = name
        self.salary = salary
        self.hours = minHours
        self.minHours = minHours
        self.performance = 0.5
        self.nextJob = nextJob
        self.yearsSincePromotion = 0
        self.minEdu = minEdu
        self.degree = degree
        self.yearsAtJob = 0
        self.isWarned = False
        self.warnCount = 0

    def age_up(self, player):
        self.yearsAtJob += 1
        player.money += self.getYearlyPay()
        self.calcPerformance()
        # self.promote(player)
        if self.performance <= 0.25 and self.isWarned:
            messageBox(
                "Fired",
                "You have been fired due to consistently inadequate performance.",
            )
            player.job = None
        elif self.performance <= 0.25:
            self.isWarned = True
            self.warnCount += 1
            if self.warnCount >= 3:
                messageBox(
                    "Fired",
                    "Due to repeated warnings, you have been terminated from your position.",
                )
                player.job = None
            else:
                messageBox(
                    "You have been warned",
                    "Your supervisor has warned you that you are at risk of losing your job if you don't put in more work.",
                )
        elif self.performance >= 0.25 and self.isWarned:
            self.isWarned = False

    def request_promotion(self, player):
        p = max(min(self.performance - 0.5, 1), 0)
        messageBox("Request Filed", "You filed a request to get promoted.")
        if pChance(p):
            messageBox("Accepted", "Your request was accepted.")
            self.promote(player, force=True)
        else:
            messageBox("Denied", "Your supervisor told you to get back to work.")

    def check(self, player):
        return bool(
            player.degree >= self.degree
            if self.degree
            else 1 and player.edu_lvl >= self.minEdu
        )

    def getYearlyPay(self):
        return (
            self.salary * self.hours * 48
        )  # Not 52 as most people work around 48wks./yr.

    def calcPerformance(self):
        if self.hours < self.minHours:
            # In a 40-hour week, you could work as few as 34 hours and keep your job.
            self.performance = self.hours * 0.0075
        else:
            self.performance = 0.5 + ((self.hours - self.minHours) * (10 / 3))

    def retire(self, player):
        if self.yearsAtJob >= 20:
            r = Retiree(self.name, self.salary, self.minHours)
            self = r
            messageBox(
                "Retired",
                "You successfully retired.\nYearly Pension: {}{}".format(
                    player.nation.currency, r.getYearlyPay()
                ),
            )
        else:
            messageBox(
                "Too Early",
                "You can only retire after working at this job for 20 years.\nYears to go: {}".format(
                    20 - self.yearsAtJob
                ),
            )

    def resign(self, player):
        messageBox("Goodbye", "You resigned from your position at work.")
        player.job = None

    def adjustHours(self):
        cls()
        div()
        print("How many hours do you want to work?")
        print("Range: 1 to 70")
        print("Expected Hours: {}".format(self.minHours))
        div()
        hrs = input("Hours: ")
        try:
            hrs = int(hrs)
        except:
            messageBox("Error", "You entered an invalid value.\nPlease try again.")
            return
        hrs = max(min(hrs, 70), 1)
        self.hours = hrs
        messageBox("Done", "You now show up for {} hours each week.".format(self.hours))
        if self.hours < self.minHours:
            messageBox(
                "Warning",
                "You are showing up for less than the expected hours each week.\nYou risk losing your job or lowering performance if you do this.\nIf you don't want to take this risk, raise your hours to {}.".format(
                    self.minHours
                ),
            )

    def promote(self, player, force=False):
        prob = self.performance * 1 / 3  # Max performance == 33% chance
        h, p, y = (
            int(self.hours),
            float(self.performance),
            int(self.yearsAtJob),
        )  ## Creates copies of values
        if self.nextJob.salary > self.salary:
            salary = self.nextJob.salary
        else:
            salary = self.salary + (self.salary - self.nextJob.salary)
        if pChance(prob) and self.nextJob or false:
            self = self.nextJob
            self.hours, self.performance, self.yearsAtJob = h, p, y
            messageBox(
                "You have been promoted\nPosition: {}\nSalary: {}{:,}".format(
                    self.nextJob.name,
                    player.nation.currency,
                    self.nextJob.getYearlyPay(),
                )
            )

    def interact(self, player):
        msg = "\n".join(
            [
                self.name,
                div(True),
                "Hours: {}/Wk.".format(self.hours),
                "Min. Hours: {}/Wk.".format(self.minHours),
                div(True),
                "Salary: {}{:,}".format(player.nation.currency, self.getYearlyPay()),
                "Years Worked: {}".format(self.yearsAtJob),
                div(True),
                "Performance: {} {}%".format(
                    pbar(self.performance), int(self.performance * 100)
                ),
            ]
        )
        menu = lib.Menu(msg)
        menu.add_function("Resign", lambda: self.resign(player))
        menu.add_function("Adjust Hours", self.adjustHours)
        menu.add_function("Retire", lambda: self.retire(player))
        menu.add_function("Request Raise")
        if self.nextJob:
            menu.add_function(
                "Request Promotion", lambda: self.request_promotion(player)
            )
        else:
            menu.add_function("Request Promotion")
        menu.add_function("Co-workers...")
        menu.run()


class HigherEducation(Job):
    def __init__(self, name, price=0, length=0, minEdu=1, degree=0):
        super().__init__(name, 0)
        self.minEdu = minEdu
        self.degree = degree
        self.price = price
        self.length = length
        self.yearsLeft = length
        self.complete = False

    def interact(self, player):
        txt = "\n".join(
            [
                "MinEdu: {}".format(self.minEdu),
                "Degree: {}".format(self.degree),
            ]
        )
        messageBox("Interact", txt)

    def check(self, player):
        allowed = True
        if player.edu_lvl < self.minEdu:
            messageBox("Debug", "deny1")
            allowed = False
        if self.degree != 0:
            if self.degree != player.degree:
                messageBox("Debug", "deny2")
                allowed = False
        return allowed

    def pick(self, num):
        self.degree = num

    def pickDegree(self):
        menu = lib.Menu("Select Degree")
        for x in data.degrees:
            i = 0
            menu.add_function(x, lambda i=i: self.pick(i))
            i += 1
        menu.run()

    def apply(self, player):
        allowed = self.check(player)
        blocked = False  # If True, the degree is denied.
        if self.minEdu == 1:
            ## Case for university
            self.pickDegree()
            blocked = not bool(
                self.degree
            )  ## If 0 (AKA Selected "None" option, blocked is True
        if allowed:
            messageBox("Congrats", "You were accepted!")
            player.job = self
        elif blocked:
            messageBox(
                "Error",
                "Your application was denied because it was not filled in.\nNext time, make your mind up and choose a degree.",
            )
        else:
            messageBox("Sorry", "Your application was denied.")

    def playerCheck(self, player):
        return pChance(player.intel)

    def age_up(self, player):
        self.yearsLeft -= 1
        player.money -= int(self.price / self.length)
        if self.yearsLeft <= 0:
            self.complete = True
            messageBox("Completionist", "You have officially graduated.")
            player.edu_lvl = self.minEdu + 1
            player.job = None
            if self.minEdu == 1:
                player.degree = self.degree
            else:
                player.edus.append(self)
            self.complete = True


class Retiree(Job):
    def __init__(self, name, salary, hours):
        super().__init__("Retired " + name, int(2 / 3 * salary), hours)

    def interact(self, player):
        def exitRetirement(player):
            player.job = None
            lib.messageBox(
                "Confirmed",
                "You are no longer retired.\nYou will no longer receive a pension.\nYou are able to work again.",
            )

        menu = lib.Menu("Retirement")
        menu.add_function("Exit Retirement", lambda: exitRetirement(player))
        menu.run()


class Person(Base):
    """
    Person class.
    Used for non-player characters.

    Args:
        None
    Returns:
        A Person object.
        Person objects have randomly-generated:
        - Names
        - Ages
        - Jobs
        - Death ages
        = Etc.
    Methods:
        age_up():
            Increments the age and adds money based on one's salary and hours.
            Also calls age_up_() if it exists.
        reduceLifespan(years):
            Args:
                <int> years: Amount to decrement by
            Decreases how long that person has to live by <years> years.
    """

    def __init__(self, relationName=None):
        self.gender = random.randint(0, 1)
        self.name = (
            random.choice(forename_m) if self.gender == 0 else random.choice(forename_f)
        )
        self.name += " " + random.choice(surnames)
        self.age = random.randint(18, 30)
        self.money = 0
        self.hours = random.randint(40, 50)
        self.salary = random.randint(30, 50)
        self.endAge = random.randint(65, 85)
        self.relation = 0.5
        self.relationName = relationName

    def age_up(self):
        self.money += self.hours * self.salary * 52
        self.age += 1
        try:
            self.age_up_()
        except:
            pass

    def reduceLifespan(self, years):
        self.endAge -= years
        if self.end < self.age:
            self.end = self.age + 1


class Vehicle(Base):
    """
    Vehicle class.
    Base for Car, Boat, and Plane classes.

    This class is used as a base for other classes exclusively, and is not called directly.
    Methods:
        age_up():
            Performs actions to increment the car's age as well as decrease the price and condition.
            Calls age_up_() if it exists.
    """

    def age_up(self):
        self.value = int(self.value * 0.85)
        self.condition = self.condition * 0.85
        self.age += 1
        if not isinstance(self, Vehicle):
            self.age_up_()


class Player(Base):
    """
    This is the main player class.
    It is instantiated when the game creates a life, and is pickled when the game saves or loads.
    Its attrubutes are statistics that are kept by the game, as well as objects pertaining to the player, such as owned vehicles and such.
    """
    def __init__(self, fc=None):
        """
        WARNING: `fc` needs to be an instance of FunctionCapsule() in openlife.py.
        It is needed for the class to work beyond instantiation.
        """
        self.version = [0, 1, 0]
        self.stressMode = False
        self.backup = []
        self.fc = fc
        self.dic = {}
        self.edus = []
        self.funds = [
            IndexFund("S&E 500"),
            IndexFund("GTK Technology Fund"),
            IndexFund("GTK Hospitality Fund"),
            IndexFund("GTK Finance Fund"),
            IndexFund("GTK Automotive Fund"),
            IndexFund("GTK Videogame Fund"),
            IndexFund("GTK Aerospace Fund"),
            IndexFund("International Emerging Markets Fund"),
        ]
        self.stocks = [
            Stock("OpenMotors", "OPMM", 15, 45),
            Stock("Airfruit Inc.", "AIRF", 175),
            Stock("Nanosoft Corp", "NSFT", 330),
            Stock("Woogle", "WOOG", 125),
            Stock("Rainforest Industries", "RFST", 120),
            Stock("Boing Airspace", "BNGA", 747),
            Stock("Airbuss", "ABUS", 320),
            Stock("Doppelsieg Motorworks", "DPSG", 55),
            Stock("OpenLife Studios", "OPEN", 69, 10),
            Stock("Candywriter LLC", "CNDY", 45, 90),
        ]
        self.lotteryWins = 0
        self.behaviour = 0.0
        self.pension = 0
        self.hasDonate = False
        self.droppedOut = False
        self.reassigned = False
        self.version = ["0", "3", "0"]
        self.forename, self.surname = "John", "Smith"
        self.job = None
        self.grades = random.randint(1, 100) / 100
        self.metals = [
            Metal("Gold", 17000, -20, 20),
            Metal("Silver", 23, -10, 25),
            Metal("Copper", 5, -65, 455, 65),
            Metal("Palladium", 2200, -55, 10),
            Metal("Platinum", 3500, -25, 35),
        ]
        self.cheater = Fuse()
        self.gender = 0
        self.age = 0
        self.surgeon = None
        self.freelance = {
            "tutor": False,
        }
        self.money = 0
        self.crypto = [
            Crypto("Xipple", "XXP"),
            Crypto("Botcoin", "BTC"),
            Crypto("ZephyrToken", "ZPH"),
            Crypto("LuminaToken", "LMT"),
            Crypto("QuantumBit", "QBT"),
            Crypto("SolsticeToken", "STK"),
            Crypto("NebulaCash", "NBL"),
            Crypto("SecuCoin", "VLT"),
            Crypto("OpenToken", "OPN"),
            Crypto("Ethereal", "ETL"),
        ]
        random.shuffle(self.crypto)
        self.crypto = self.crypto[3:]
        self.pregnant = False
        self.suable = []
        ### Stats values start

        self.happiness = 1.0
        self.health = 1.0
        self.intel = 1.0
        self.looks = 1.0
        self.ethics = 1
        self.casinoWinnings = 0
        self.criminalRecords = {}
        self.diet = None # Can be an instance of Diet

        ### The stat values are in a range from 0 to 1, representing a %age.

        ### Stat values end
        self.work_e = 0
        self.edu_lvl = 1
        self.work_e_base = 0
        self.degree = 0
        self.work = {
            "hours": 0,
            "salary": 0,
            "partTimeSalary": 0,
            "pension": 0,
        }
        self.fertile = True
        self.disease = {
            "depression": False,
            "anxiety": False,
            "commonCold": False,
            "HBP": False,
            "Cancer": False,
            "postSSRI": False,
            "loneliness": False,
        }
        self.debt, self.savings = 0, 0
        self.current_research = [0, 0]
        self.year = int(time.strftime("%Y"))
        self.b_year = int(time.strftime("%Y"))
        self.stress = 0.0
        self.job_id = 0  # Every job has a job ID, see {} for more info.
        self.job_lvl = 1
        self.parents = []  # Stores the player's parent objects.
        self.vehicles = [[], [], []]  # Cars / Boats / Planes
        self.spouse = None  # Stores spouse object
        self.friends = []
        self.houses = []
        self.exes = []
        self.addictions = {
            "gambling": False,
            "alcohol": False,
            "heroin": False,
            "cannabis": False,
            "morphine": False,
            "LSD": False,
            "cocaine": False,
            "MDMA": False,
        }
        self.years_addicted = 0
        self.children = []
        self.nation = random.choice(nations)
        self.fame = 0.0
        self.wpp = {
            "enrolled": False,
            "oldNames": [],
        }
        self.sentence = 0
        self.extra = None
        self.offences = []
        self.opentube = []  # All OpenTube channels contained here
        self.property = []
        self.inv = []  # Contains all items
        self.flip_profits = 0  # Total profit from selling houses
        self.lottery_wins = 0  # The amount of times you've won the lottery
        self.bonds = []
        self.licenses = {"car": False, "boat": False, "gun": False, "plane": False}
        self.lab = {}
        self.filename = time.strftime("%Y%m%d%H%M%S.oll3")
        for item in researches:
            self.lab[item[0]] = False
        self.pending = [
            0,
            0,
        ]  # Pending Research ID / How many years to go for research : When [1] is 0, self.lab[self.pending[0]] is set to 1
        self.surgeons = []
        self.bandit = 0  # If you've robbed a train, it's set to 1
        self.expenses = 775  # Per month

        # Inheritance
        # The first value [index 0] refers to the inheritance type
        # types: 0 = charity / 1 = equal / 2 = spouse / 3 = child [needs second value]
        # The second is the [optional] person number, such as the child ID.
        self.will = [0, 0]

        self.didGym = False
        self.didLib = False
        self.didBook = False

    def getPeople(self):
        ppl = []
        ppl += [x for x in self.parents if not x.dead]
        ppl += self.friends
        ppl += self.children
        if self.spouse:
            ppl += [self.spouse]
        return ppl

    def genderStr(self):
        return "male" if self.gender == 0 else "female"

    def doScenario(self):
        return None
        ## Child stage
        if self.age > 5 and self.age < 12:
            if pChance(50) and childScenarios != []:
                x = random.choice(childScenarios)
                x.run(self)
                childScenarios.remove(x)

    def calcFame(self):
        x = False
        if (
            self.job_id in [6, 9, 13]
            and self.job_lvl == 3
            or self.job_id in [21, 28]
            and self.job.work_e >= 20
        ):
            self.fame += 0.25
            x = True
        if not self.wpp["enrolled"]:
            self.fame += int(self.money / 1000000) / 100 if self.money >= 1000000 else 0
        if not x:
            self.fame -= random.randint(10, 25) / 100
        if self.fame > 1:
            self.fame = 1.0
        if self.fame < 0:
            self.fame = 0.0

    def calcNetWorth(self):
        nw = 0
        nw += self.money
        nw += self.savings
        nw -= self.debt
        for item in self.crypto:
            nw += int(item.investment * item.price)
        for item in self.bonds:
            nw += item.investment
        for item in self.funds:
            nw += int(item.investment)
        for item in self.metals:
            nw += int(item.investment * item.price)
        for item in self.stocks:
            nw += int(item.investment * item.price)

        for item in self.vehicles:
            for i in item:
                nw += i.value
        for item in self.property:
            if not item.mortgaged:
                nw += item.value
        for item in self.bonds:
            nw += item.investment
        return nw

    def calcStress(self):
        self.stress = 0
        if self.job:
            self.stress += self.job.hours / 100
        if self.happiness < 0.2:
            self.stress *= 2
        if self.stress > 1:
            self.stress = 1
        if self.stress < 0:
            self.stress = 0
        if self.stress > 0.7 and not self.disease["HBP"] and pChance(100 / 3):
            lib.messageBox("Disease", "You are now suffering from High Blood Pressure.")
            self.disease["HBP"] = True
        if self.stress < 0.4 and self.disease["HBP"] and pChance(100 / 3):
            lib.messageBox(
                "Cured", "You are no longer suffering from High Blood pressure."
            )

    def print_backup(self):
        print(f"Age:{self.age}|Money:{self.money}|Debt:{self.debt}")

    def age_up(self):
        cls()
        self.didGym = False
        self.didLib = False
        self.didBook = False
        # self.backup.insert(0, copy.deepcopy(self))
        while len(self.backup) > 20:
            self.backup.pop()
        self.doScenario()
        if self.sentence != 0:
            if random.randint(1, 3) == 1:
                messageBox(
                    "Caught",
                    "You were caught by the authorities!\nYou now face court judgement.",
                )
                self.offences.append(Offence("Felony Escape", self.sentence))
                goToPrison(self)
        self.calcStress()
        if self.surgeon:
            self.surgeon.age_up(self)
        if self.spouse:
            if random.randint(1, 2) == 2:
                self.spouse.relation -= 0.08
            else:
                self.spouse.relation -= 0.12
            if self.spouse.relation <= 0.1:
                if random.randint(1, 2):
                    messageBox(
                        "Insight",
                        "Your spouse mentioned how they want to separate with you.",
                    )
        for item in self.metals:
            item.age_up(self)
        for item in self.stocks:
            item.age_up(self)
        self.money += self.pension
        for item in self.bonds:
            item.age_up(self)
        if self.current_research != Player().current_research:
            self.current_research[1] -= 1
            if self.current_research[1] == 0:
                txt = [
                    "Research Complete.",
                ]
                if self.current_research[0] != "researchLab":
                    txt.append(
                        "To take advantage of your research, go to Activities > My Lab."
                    )

                else:
                    txt.append("You can now begin performing research.")
                messageBox("Research", "\n".join(txt))
                self.lab[self.current_research[0]] = True
                self.current_research = Player().current_research
        for item in self.property:
            item.age_up(self)
        for item in self.funds:
            item.age_up()
        for item in self.crypto:
            item.age_up(self)
        if self.job:
            self.job.age_up(self)
        if self.addictions != Player().addictions:
            exceptions = ["gambling", "caffeine"]
            detc = 7
            mul = 1.05
            self.years_addicted += 1
            for item in self.addictions:
                if item:
                    mul += 0.005
                    if item not in exceptions:
                        detc -= 1
                    if detc < 3:
                        detc = 3
            self.expenses *= mul
            self.expenses = int(self.expenses)
            if random.randint(1, detc) == detc:
                x, y = self.addictions, Player().addictions
                for item in exceptions:
                    try:
                        del x[item]
                    except:
                        pass
                    try:
                        del y[item]
                    except:
                        pass
                if x != y:
                    self.fc.die(self, 9)
        try:
            if (
                self.backup[-1].addictions != self.addictions
                and self.addictions == Player().addictions
            ):
                self.expenses = 775
        except:
            pass
        if self.age >= 18:
            self.money -= 12 * self.expenses
        if self.pregnant:
            cls()
            div()
            self.pregnant = False
            random.randint(1, 5)
            if rng != 5:
                c = Child()
                x = "boyfriend" if self.spouse.gender == 0 else "girlfriend"
                c.create(self)
                txt = []
                if self.gender == 1:
                    txt += "You gave birth to a child!"
                else:
                    txt += f"Your {x} gave birth to a child!"
                txt += f"Name: {c.name}"
                if c.gender == 0:
                    txt += "Male"
                else:
                    txt += "Female"
                self.children.append(c)
            else:
                if self.gender == 1:
                    txt += "You suffered a miscarriage and lost the baby!"
                else:
                    txt += "Your {x} suffered a miscarriage and lost the baby!"
            messageBox("Child", "\n".join(txt))
        self.freelance = Player().freelance
        for item in self.parents:
            item.age_up(self)
        self.happiness += random.randint(-10, 10) / 100
        self.health += random.randint(-10, 10) / 100
        self.intel += random.randint(-10, 10) / 100
        self.looks += random.randint(-10, 10) / 100
        if not self.disease["depression"] and self.happiness <= 0.25:
            messageBox("Depressed", "You are now suffering from Depression.")
            self.disease["depression"] = True
        if self.disease["depression"] and self.happiness >= 0.8:
            messageBox("Cured", "You are no longer suffering from depression.")
            self.disease["depression"] = False
        if self.disease["depression"]:
            self.happiness = (int((self.happiness * 100) / 3)) / 100

        self.hasDonate = False
        for item in self.surgeons:
            item.age_up()
        for item in self.parents:
            item.age_up(self)
        for item in self.vehicles:
            for i in item:
                i.age_up()
        for item in self.children:
            item.age_up()
        if random.randint(1, 3) == 1:
            if random.randint(1, 40) == 39:
                if self.disease["commonCold"] == False:
                    self.disease["commonCold"] = True
                    cls()
                    div()
                    print("You are now suffering from the Common Cold.")
                    br(self.stressMode)
            if random.randint(1, 300) == 2:
                if not self.disease["Cancer"]:
                    self.disease["Cancer"] = True
                    self.happiness = 0
                    cls()
                    div()
                    print("You have been diagnosed with cancer!")
                    br()
        if self.spouse is not None:
            self.spouse.age_up()
        for item in self.opentube:
            item.age_up(self, self.stressMode)
        self.tutor = 0
        if random.randint(1, 400) == 400:
            print("You were struck by lighting!")
            br()
            if random.randint(1, 2) == 1:
                print("You survived.")
                br(self.stressMode)
                self.happiness, self.health, self.looks, self.intel = 1, 1, 1, 1
            else:
                print("You died.")
                br(self.stressMode)
                die(self, 6)
        self.age += 1
        if self.age == 18 and not self.droppedOut:
            self.edu_lvl = 1
        for item in self.vehicles:
            for i in item:
                i.age_up()
        self.year = 1 + int(self.year)
        self.money += self.work["salary"] * self.work["hours"]
        self.savings = int(self.savings * 1.1)
        self.debt = int(self.debt * 1.2)
        self.money -= int(self.debt / 10)
        if (
            self.age >= 123
            or self.age >= 100
            and pChance(50)
            or self.age >= 90
            and pChance(33)
            or self.age >= 80
            and pChance(5)
        ):
            die(self, 1)
        x = self.fame
        self.calcFame()
        #        if x == 0.0 and self.fame > 0:
        #            Scenario("Fame", "You are now famous!").run()
        #        if x > 0 and self.fame == 0.0:
        #            Scenario("Fame", "You are no longer famous.").run()

        if self.diet:
            self.happiness += self.diet.happiness
            self.health += self.diet.health
            self.money -= self.diet.annualCost

        if self.savings < 0:
            self.savings = 0

    def hasAdoptedAttr(self):
        m = self.parents[0]
        f = self.parents[1]
        if m.gender != f.gender:
            return True
        else:
            return False

    def save(self):
        with open(self.filename, "wb") as f:
            pickle.dump(self, f)


class IndexFund(Base):
    def __init__(self, name):
        super().__init__()
        self.name = name
        self.investment = 0

    def age_up(self):
        self.investment = int(self.investment * (1 + random.randint(5, 15) / 100))

    def interact(self, player):
        cls()
        div()
        print(self.name)
        print(f"Invested: {player.nation.currency}{Format(self.investment)}")
        div()
        print(f"[1] Buy {self.name}")
        print(f"[2] Sell {self.name}")
        div()
        try:
            ch = int(input("$"))
        except:
            return None
        if ch == 1:
            cls()
            div()
            try:
                ch = int(input("Amount $"))
            except:
                return None
            if ch > player.money:
                ch = player.money
            if ch < 0:
                ch = 0
            player.money -= ch
            self.investment += ch
            cls()
            div()
            print(f"Invested {player.nation.currency}{Format(ch)} in {self.name}.")
            br()
        elif ch == 2:
            cls()
            div()
            print(f"Invested: {player.nation.currency}{Format(self.investment)}")
            div()
            try:
                ch = int(input("$"))
            except:
                return None
            if ch > self.investment:
                ch = self.investment
            if ch < 0:
                ch = 0
            player.money += ch
            self.investment -= ch
            cls()
            div()
            print(f"Withdrew {player.nation.currency}{Format(ch)} from {self.name}.")
            br()


class Stock(Base):
    def __init__(self, name, symb, price, vol=65):
        super().__init__()
        self.name = name
        self.vol = vol
        self.price = price
        self.symb = symb
        self.investment = 0
        self.lastPrice = self.price

    def age_up(self, player):
        price = self.price

        def simulate_stock_price(initial_price, volatility):
            random_factor = random.uniform(-1, 1)
            price_change = initial_price * (volatility / 100) * random_factor
            stock_price = initial_price + price_change
            return stock_price

        self.price = simulate_stock_price(self.price, self.vol)
        self.price = int(100 * self.price) / 100
        if self.investment > 0:
            cls()
            div()
            print(f"{self.symb}: Financial Report")
            div()
            print(f"Old Price: {player.nation.currency}{price}")
            print(f"Old Price: {player.nation.currency}{self.price}")
            print(f"1Y Price Change: {percentChange(price,self.price)}")
            br()

    def interact(self, player):
        cls()
        div()
        print(f"{self.name} [{self.symb}]")
        print(f"Price: {player.nation.currency}{self.price}")
        print(f"Owned: {Format(self.investment)}")
        div()
        print(f"[1] Buy {self.symb}")
        print(f"[2] Sell {self.symb}")
        div()
        try:
            ch = int(input("$"))
        except:
            return None
        if ch == 1:
            cls()
            div()
            print(f"Can Afford: {Format(int(player.money/self.price))}")
            try:
                ch = int(input("Amount $"))
            except:
                return None
            if ch > int(player.money / self.price):
                ch = int(player.money / self.price)
            if ch < 0:
                ch = 0
            player.money -= int(self.price * ch)
            self.investment += ch
            cls()
            div()
            print(f"Bought {Format(ch)} {self.symb}.")
            br()
        elif ch == 2:
            cls()
            div()
            print(f"Invested: {Format(self.investment)}")
            div()
            try:
                ch = int(input("$"))
            except:
                return None
            if ch > self.investment:
                ch = self.investment
            if ch < 0:
                ch = 0
            player.money += ch
            self.investment -= ch
            cls()
            div()
            print(f"Sold {Format(ch)} {self.symb}.")
            br()


class Metal(Base):
    def __init__(self, name, basePrice, minInc, maxInc, midInc=None):
        super().__init__()
        self.name = name
        self.mid = midInc
        self.price = basePrice
        self.min = minInc
        self.max = maxInc
        self.investment = 0

    def age_up(self, player):
        if self.mid != None:
            mult = 1 + (weightedRNG(self.min, self.mid, self.max) / 100)
        else:
            mult = 1 + (random.randint(self.min, self.max) / 100)
        p = self.price
        self.price = self.price * mult
        self.price *= 100
        self.price = int(self.price) / 100
        if self.investment > 0:
            cls()
            div()
            print(f"Investment Summary: {self.name}")
            div()
            print(f"Old Price: {player.nation.currency}{Format(p)}")
            print(f"New Price: {player.nation.currency}{Format(self.price)}")
            print(f"1Y Return: {percentChange(p,self.price)}%")
            print(
                f"Portfolio Value: {player.nation.currency}{Format(int(self.price * self.investment))}"
            )
            br()

    def interact(self, player):
        cls()
        div()
        print(f"{self.name}")
        print(f"Investment: {Format(self.investment)} lb.")
        print(f"Price per lb.: {player.nation.currency}{format(self.price)}")
        print(
            f"Portfolio Value: {player.nation.currency}{Format(int(self.price*self.investment))}"
        )
        div()
        print(f"[1] Buy {self.name}")
        if self.investment > 0:
            print(f"[2] Sell {self.name}")
        else:
            print(f"[ ] Sell {self.name}")
        div()
        try:
            ch = int(input("$"))
        except:
            return None
        if ch == 1:
            cls()
            div()
            print(f"Price: {player.nation.currency}{Format(self.price)}")
            print(f"Can Afford: {Format(int(player.money/self.price))} lb.")
            div()
            try:
                ch = int(input("Amount $"))
            except:
                return None
            if ch > int(player.money / self.price):
                ch = int(player.money / self.price)
            if ch < 0:
                ch = 0
            cls()
            div()
            print(f"Successfully purchased {Format(ch)} {self.name}.")
            br()
            player.money -= int(ch * self.price)
            self.investment += ch
            self.interact(player)
        elif ch == 2 and self.investment > 0:
            cls()
            div()
            print(f"Price: {player.nation.currency}{Format(self.price)}")
            print(f"Holding: {Format(self.investment)} LB")
            div()
            try:
                ch = int(input("Amount $"))
            except:
                return None
            if ch < 0:
                ch = 0
            if ch > self.investment:
                ch = self.investment
            self.investment -= ch
            x = int(ch * self.price)
            self.money += x
            cls()
            div()
            print(
                f"You sold {Format(ch)} lb. of {self.name} for {player.nation.currency}{Format(x)}."
            )
            br()
            self.interact(player)
        else:
            return None


class Crypto(Base):
    def __init__(self, name, symbol):
        super().__init__()
        self.mode = 0
        self.price = random.randint(1, 100) / 100
        self.name = name
        self.symbol = symbol
        self.investment = 0
        self.lastPrice = self.price
        self.ownCrypto = False

    def age_up(self, player):
        self.lastPrice = self.price
        if self.mode == 0:
            ## Normal mode (-15 to +15 % /Annum)
            mult = random.randint(85, 115) / 100
            self.price *= mult
            if pChance(50):
                self.mode = 0
            else:
                if pChance(50):
                    self.mode = 1
                else:
                    self.mode = 0
        elif self.mode == 1:
            ## Explosion mode (+200 to +500 % /Annum)
            mult = random.randint(2, 5)
            self.price *= mult
            if pChance(60):
                self.mode = 1
            else:
                if pChance(5):
                    self.mode = 0
                else:
                    self.mode = 2
        else:
            ## Crash mode (-30 to -50 % /Annum)
            mult = random.randint(50, 70) / 100
            self.price *= mult
            if pChance(65):
                self.mode = 2
            else:
                if pChance(35):
                    self.mode = 0
                else:
                    self.mode = 1
        self.price = int(self.price * 100) / 100
        if self.price == 0.0:
            cls()
            div()
            print(
                f"The crypto, {self.name} [{self.symbol}] has crashed and will be taken off the market."
            )
            br()
            player.crypto.remove(self)
            return None
        if self.investment > 0:
            cls()
            div()
            print(f"{self.name} [{self.symbol}] Summary")
            div()
            print(f"Old Price: {player.nation.currency}{Format(self.lastPrice)}")
            print(f"New Price: {player.nation.currency}{Format(self.price)}")
            print(f"1Y Price Change: {percentChange(self.lastPrice,self.price)}%")
            br()

    def ownInteract(self, player):
        cls()
        div()
        print(f"{self.name} [{self.symbol}]")
        print(f"Price: {player.nation.currency}{Format(self.price)}")
        print(f"1Y Price Change: {percentChange(self.lastPrice,self.price)}%")
        print(f"Holdings: {Format(self.investment)} {self.symbol}")
        print(
            f"Portfolio Value: {player.nation.currency}{Format(int(self.investment*self.price))}"
        )
        div()
        print("[1] Dump All Coins")
        div()
        try:
            ch = int(input("$"))
        except:
            return None
        if ch == 1:
            cls()
            div()
            print("You performed a pump-and-dump scheme.")
            br()
            player.money += int(self.price * self.investment)
            cls()
            div()
            print(
                f"You made {player.nation.currency}{Format(int(self.price * self.investment))}."
            )
            br()
            cls()
            div()
            print("The coin crashed and was removed from the market.")
            br()
            if pChance(20):
                cls()
                div()
                print("The FCC performed a formal investigation.")
                br()
                cls()
                div()
                print("You were found guilty of fraud.")
                player.offences.append(Offence("Fraud", 30))
                goToPrison(player)
            player.crypto.remove(self)


def pChance(percent):
    if random.randint(1, 100) <= percent:
        return True
    else:
        return False


class Nation(Base):
    """
    Nation class.
    Creates a nation that can be switched to by the player.
    """

    def __init__(
        self,
        name,
        nationId,
        canGamble=True,
        canLottery=True,
        dropOutAge=16,
        deathSentence=False,
        currency="$",
        gunLicense=False,
        freeHealthcare=True,
        uniPrice=25000,
        incomeTaxMul=1,
        houseTaxMul=1,
        openTubeTaxMul=0.85,
    ):
        super().__init__()
        self.name = name
        self.id = nationId
        self.canGamble = canGamble
        self.dropOutAge = dropOutAge
        self.deathSentence = deathSentence
        self.currency = currency
        self.canLottery = canLottery
        self.gunLicense = gunLicense
        self.freeHealth = freeHealthcare
        self.uniPrice = uniPrice
        self.incomeTax = incomeTaxMul
        self.houseTax = houseTaxMul
        self.opentube = openTubeTaxMul


global nations
nations = [
    Nation("OpenLife", 0, openTubeTaxMul=1, currency="£"),
    Nation("United Kingdom", 1, currency="£", incomeTaxMul=0.95, houseTaxMul=0.85),
    Nation(
        "United States of America",
        2,
        gunLicense=True,
        freeHealthcare=False,
        incomeTaxMul=0.95,
        houseTaxMul=0.85,
    ),
    Nation(
        "China",
        3,
        False,
        False,
        19,
        True,
        freeHealthcare=False,
        incomeTaxMul=0.5,
        houseTaxMul=0,
    ),
    Nation(
        "France",
        4,
        currency="€",
        freeHealthcare=False,
        incomeTaxMul=0.95,
        houseTaxMul=0.85,
    ),
    Nation(
        "Germany",
        5,
        currency="€",
        canGamble=False,
        freeHealthcare=False,
        incomeTaxMul=0.95,
        houseTaxMul=0.85,
    ),
    Nation(
        "Poland", 6, currency="€", freeHealthcare=False, incomeTaxMul=0.9, houseTaxMul=0
    ),
    Nation("Turkey", 7, currency="€", freeHealthcare=False, canLottery=False),
    Nation("India", 8, canGamble=False, incomeTaxMul=0.8, houseTaxMul=0.75),
    Nation(
        "Sweden", 9, currency="€", canGamble=False, incomeTaxMul=0.95, houseTaxMul=0.95
    ),
    Nation("Norway", 10, currency="€", incomeTaxMul=0.95, houseTaxMul=0.95),
    Nation("Denmark", 11, currency="€", incomeTaxMul=0.95, houseTaxMul=0.95),
    Nation("UAE", 12, incomeTaxMul=1, houseTaxMul=1, canGamble=False, canLottery=False),
]


class Book(Base):
    def __init__(self, name, author, pageCount, enjoyability=0, intel=0):
        self.name = name
        self.author = author
        self.pageCount = pageCount
        self.enjoyability = enjoyability
        self.intel = intel

    def read(self, player):
        for x in range(1, self.pageCount):
            msg = "\n".join(
                [
                    "Book: {}".format(self.name),
                    "Author: {}".format(self.author),
                    "Page: {} of {}".format(x, self.pageCount),
                ]
            )
            messageBox("Book", msg)
        messageBox(
            "Finished",
            "You finished the book.\nEnjoyability:\n{}".format(pbar(self.enjoyability)),
        )
        player.happiness += self.enjoyability - 0.5
        player.intel += self.intel


class Bookshelf(Base):
    def __init__(self):
        self.shelf = {}

    def add_category(self, name):
        self.shelf[name] = []

    def add_book(self, book, cat):
        self.shelf[cat].append(book)

    def pick_book(self):
        cat = random.choice(self.shelf.values())
        book = random.choice(self.shelf[cat])
        return book

    def pick_books(self, amount=8):
        books = []
        shelf = self.shelf.copy()
        for x in range(amount):
            cat = random.choice(shelf.values())
            book = random.choice(shelf[cat])
            books.append(book)
            shelf[cat].remove(book)
        return books

class Diet(Base):
    def __init__(self, name, health:float, happiness:float, annualCost):
        self.name = name
        self.health = health
        self.happiness = happiness
        self.annualCost = annualCost
