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
    def testDuckSafe(self):
        self.browser.get("https://duckduckgo.com")
        self.search_porn()

    def testDuckPOSTSafe(self):
        self.browser.get("https://duckduckgo.com")
        # failed to change settings by hand,
        # self.browser.get("https://duckduckgo.com/settings")
        # self.browser.find_element_by_id("setting_kg")
        # so just set cookie
        self.browser.add_cookie({"name": "g", "value": "p"})
        self.search_porn()

    def search_porn(self):
        (self.browser
         .find_element_by_id("search_form_input_homepage")
         .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
        # click to disable temporarily, then wait, then see if available
        self.browser.implicitly_wait(10)
        self.browser.find_element_by_class_name("js-safe-search-temp").click()
        # assert that browser.find_element_by_class_name("js-safe-search-temp") still exists, else throws exception
        self.browser.find_element_by_class_name("js-safe-search-temp")


class QwantMixin(object):
    def testQwant(self):
        self.browser.get("https://qwant.com")
        self.browser.implicitly_wait(10)
        (self.browser
         .find_element_by_css_selector("input[type=search]")
         .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
        self.browser.find_element_by_class_name("no_result")


#### run the tests, one case for each browser, with mixins for each site
class FirefoxTestCase(unittest.TestCase, DuckMixin, QwantMixin):
    def setUp(self):
        profile = webdriver.FirefoxProfile()
        profile.add_extension(extension=os.path.join(DIR, "..", "addon"))
        self.browser = webdriver.Firefox(firefox_profile=profile)

    def tearDown(self):
        self.browser.close()


class ChromiumTestCase(unittest.TestCase, DuckMixin, QwantMixin):
    def setUp(self):
        profile = webdriver.chrome.options.Options()
        profile.add_extension(extension=os.path.join(DIR, "..", "safe.zip"))
        self.browser = webdriver.Chrome(chrome_options=profile)

    def tearDown(self):
        self.browser.close()


if __name__ == "__main__":
    unittest.main()
