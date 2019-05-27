import os
import sys

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

try:
    USERNAME = os.environ.get('BROWSERSTACK_USERNAME') or sys.argv[1]
    BROWSERSTACK_ACCESS_KEY = os.environ.get('BROWSERSTACK_ACCESS_KEY') or sys.argv[2]
except IndexError:
    print("Please provide the username and browserstack access key as command line arguments.")
    sys.exit(1)


desired_cap = {
    'browser': 'Chrome',
    'browser_version': '62.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1024x768',
    'name': 'Bstack-[Python] Sample Test',
    'httpProxy': 'http://127.0.0.1:8080',
    'sslProxy':  'http://127.0.0.1:8080'
}

opt = webdriver.chrome.options.Options()
opt.add_extension(extension=os.path.join(
    os.path.dirname(__file__), "..", "addon"))
desired_cap.update(opt.to_capabilities())

driver = webdriver.Remote(
    command_executor='https://%s:%s@hub.browserstack.com/wd/hub' % (
        USERNAME, BROWSERSTACK_ACCESS_KEY
    ),
    desired_capabilities=desired_cap)

driver.get("https://duckduckgo.com")
(driver
 .find_element_by_id("search_form_input_homepage")
 .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
driver.implicitly_wait(10)
try:
    driver.find_element_by_class_name("js-safe-search-temp").click()
    driver.find_element_by_class_name("js-safe-search-temp")
except NoSuchElementException:
    raise Exception("failed")
driver.quit()
