#! /usr/bin/env python3
import os
import unittest

from selenium import webdriver

# __file__ = os.getcwd() + "/"  # paste this if by hand
DIR = os.path.dirname(__file__)
ADDON_DIR = os.path.abspath(os.path.join(DIR, "..", ".."))
os.environ["PATH"] = os.environ["PATH"] + ":" + DIR


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
        (
            self.browser.find_element_by_id("search_form_input_homepage").send_keys(
                "porn" + webdriver.common.keys.Keys.RETURN
            )
        )
        # click to disable temporarily, then wait, then see if available
        self.browser.implicitly_wait(10)
        self.browser.find_element_by_class_name("js-safe-search-temp").click()
        # assert that browser.find_element_by_class_name("js-safe-search-temp") still exists, else throws exception
        self.browser.find_element_by_class_name("js-safe-search-temp")


class GoogleMixin(object):
    def testGoo(self):
        self.browser.get("https://google.com")
        (
            self.browser.find_element_by_css_selector("input[type=text]").send_keys(
                "porn" + webdriver.common.keys.Keys.RETURN
            )
        )
        self.browser.implicitly_wait(2)
        try:
            self.browser.find_element_by_class_name("ab_ctl")
        except:
            self.fail("safe search message not found")


class QwantMixin(object):
    def testQwant(self):
        self.browser.get("https://qwant.com")
        self.assertEqual(
            2,
            browser.execute_script(
                "return applicationState.user.userSetting.safeSearch"
            ),
        )


class VimeoMixin(object):
    def testVimeo(self):
        self.browser.get("https://vimeo.com")
        self.browser.implicitly_wait(10)
        # search
        self.browser.fullscreen_window()  # only visibile in above normal res
        (self.browser.find_element_by_css_selector("div[role=search]>button").click())
        (
            self.browser.switch_to_active_element().send_keys(
                "porn" + webdriver.common.keys.Keys.RETURN
            )
        )
        # unset filter
        (self.browser.find_element_by_class_name("js-edit_mature_settings").click())
        self.browser.execute_script(
            "arguments[0].click()",
            self.browser.find_element_by_id("contentrating_showall"),
        )
        self.browser.find_element_by_css_selector("input[type=submit]").click()
        # check
        self.browser.find_element_by_class_name("js-edit_mature_settings")


#### run the tests, one case for each browser, with mixins for each site
class FirefoxTestCase(
    unittest.TestCase, DuckMixin, QwantMixin, VimeoMixin, GoogleMixin
):
    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.install_addon(os.path.join(ADDON_DIR, "safe.xpi"), temporary=True)

    def tearDown(self):
        self.browser.close()


class ChromiumTestCase(
    unittest.TestCase, DuckMixin, QwantMixin, VimeoMixin, GoogleMixin
):
    def setUp(self):
        profile = webdriver.chrome.options.Options()
        profile.add_extension(extension=os.path.join(DIR, "..", "..", "safe.zip"))
        self.browser = webdriver.Chrome(options=profile)

    def tearDown(self):
        self.browser.close()


if __name__ == "__main__":
    unittest.main()
