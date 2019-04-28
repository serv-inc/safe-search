import os
import unittest
from selenium import webdriver

os.environ['PATH'] = os.environ['PATH'] + ":."


# local testing, remove before CI
PROXY='127.0.0.1:8080'
webdriver.DesiredCapabilities.FIREFOX['proxy'] = {
    "httpProxy":PROXY,
    "ftpProxy":PROXY,
    "sslProxy":PROXY,
    "noProxy":[],
    "proxyType":"MANUAL"
}

class DuckDuckGoTestCase(unittest.TestCase):

    def setUp(self):
        profile = webdriver.FirefoxProfile()
        profile.add_extension(extension="../addon/")
        self.browser = webdriver.Firefox(firefox_profile=profile)

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

    def tearDown(self):
        self.browser.close()


if __name__ == "__main__":
    unittest.main()
