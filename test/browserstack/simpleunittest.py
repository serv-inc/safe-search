import inspect

import requests
import selenium
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

def fail_browserstack(driver, secret, where):
  requests.put(
    "https://api.browserstack.com/automate/sessions/{}.json".format(driver.session_id),
    auth=tuple(secret.split(":")),
    json={"status": "failed", "reason": "test failed in {}".format(where)})  


def test_google(driver, secret):
  driver.get('http://images.google.com')
  (driver
   .find_element_by_css_selector("input[type=text]")
   .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
  driver.implicitly_wait(10)
  try:
    driver.find_element_by_id("ss-bimodal-default")
  except selenium.common.exceptions.NoSuchElementException:
    fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
    pytest.fail("safe search element does not exist")

def test_duck(driver, secret):
  driver.get("https://duckduckgo.com")
  (driver.find_element_by_id("search_form_input_homepage")
   .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
  driver.implicitly_wait(10)
  try:
    driver.find_element_by_class_name("js-safe-search-temp").click()
    driver.find_element_by_class_name("js-safe-search-temp")
  except selenium.common.exceptions.NoSuchElementException:
    fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
    assert False, "safe search element does not exist"
