import platform
import os
import random


def weightedRNG(a, b, c):
    """
    Has a 2/3 Chance of returning random.randint(a,b) and a 1/3 chance of random.randint(a,c)
    """
    if random.randint(1, 3) != 3:
        return random.randint(a, b)
    else:
        return random.randint(a, c)


def div(returnMode=False):
    s = "--------------------"
    if returnMode:
        return s
    print(s)


def br(skip=False):
    if not skip:
        div()
        input("Press ENTER to continue.")
    cls()


def cls():
    res = platform.uname()
    os.system("cls" if res[0] == "Windows" else "clear")


class Entry:
    def __init__(self, text, function=None, args=(), num=1):
        self.text = text
        self.function = function
        self.args = args
        self.num = num


class StringEntry:
    def __init__(self, text):
        self.text = text


class Divider(StringEntry):
    def __init__(self):
        super().__init__("--------------------")


class Menu:
    def __init__(self, name=""):
        self.name = name
        self.entries = []

    def add_function(self, text, function=None, args=(), pinned=False):
        pinned = False  # Temporarily addresses a weird bug where the pinned entry is always selected if you don't pick any option
        entries = [x for x in self.entries if isinstance(x, Entry)]
        isPinned = bool([x for x in entries if x.num == 0])
        i = len(entries) + 1
        if isPinned:
            pinned = False
        entry = Entry(text, function, args, 0 if pinned else i)
        self.entries.append(entry)

    def add_entry(self, entry):
        if isinstance(entry, Entry):
            raise TypeError(
                "Cannot create an Entry and add it; use add_function() method instead."
            )
        self.entries.append(entry)

    def run(self):
        self.entries = [x for x in self.entries if type(x) in [Entry, StringEntry]]
        options = []
        cls()
        if self.name:
            div()
            print(self.name)
        div()
        for entry in self.entries:
            if isinstance(entry, Entry):
                options.append(entry)
            elif isinstance(entry, StringEntry):
                print(entry.text)
            else:
                raise TypeError("Cannot accept {} as an entry type".format(type(entry)))
        i = 1
        for option in options:
            print(
                "[{}] {}".format(
                    option.num if callable(option.function) else " ", option.text
                )
            )
        div()
        try:
            opt = int(input("$"))
        except:
            opt = 0
        valid = [x for x in options if x.num == opt]
        for v in valid:
            if callable(v.function):
                v.function(*v.args)


def messageBox(title, message):
    cls()
    div()
    print(title)
    div()
    print(message)
    br()
