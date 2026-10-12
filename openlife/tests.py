import unittest
import openlife


class MainTestCase(unittest.TestCase):
    def checkExitError(self):
        self.assertRaises(openlife.exitGame, openlife.ExitError)
