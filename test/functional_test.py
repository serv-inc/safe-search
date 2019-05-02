#! /usr/bin/env python2
import os
import unittest

from selenium import webdriver

DIR = os.path.dirname(__file__)

os.environ['PATH'] = os.environ['PATH'] + ":" + DIR


# local testing, remove / comment out before CI
PROXY='127.0.0.1:8080'
POBJ = {
    "httpProxy":PROXY,
    "ftpProxy":PROXY,
    "sslProxy":PROXY,
    "noProxy":[],
    "proxyType":"MANUAL"
}
webdriver.DesiredCapabilities.CHROME['proxy'] = POBJ
webdriver.DesiredCapabilities.FIREFOX['proxy'] = POBJ

class DuckMixin(object):
    def testDuckLoads(self):
        self.browser.get("https://duckduckgo.com")
        self.assertIn("duckduckgo", self.browser.title.lower())

    def testDuckSafe(self):
        self.browser.get("https://duckduckgo.com")
        (self.browser
         .find_element_by_id("search_form_input_homepage")
         .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
        # click to disable temporarily, then wait, then see if available
        self.browser.implicitly_wait(10)
        self.browser.find_element_by_class_name("js-safe-search-temp").click()
        # assert that browser.find_element_by_class_name("js-safe-search-temp") still exists, else throws exception
        self.browser.find_element_by_class_name("js-safe-search-temp")


class DuckDuckGoTestCaseFirefox(unittest.TestCase, DuckMixin):
    def setUp(self):
        profile = webdriver.FirefoxProfile()
        profile.add_extension(extension=os.path.join(DIR, "..", "addon"))
        self.browser = webdriver.Firefox(firefox_profile=profile)

    def tearDown(self):
        self.browser.close()

class DuckDuckGoTestCaseChromium(unittest.TestCase, DuckMixin):
    def setUp(self):
        profile = webdriver.chrome.options.Options()
        profile.add_extension(extension=os.path.join(DIR, "..", "safe.zip"))
        self.browser = webdriver.Chrome(chrome_options=profile)

    def tearDown(self):
        self.browser.close()
        


if __name__ == "__main__":
    unittest.main()
