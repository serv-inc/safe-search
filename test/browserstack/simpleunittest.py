import inspect

import requests

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

def test_run(driver, secret):
  driver.get('http://www.google.com')
  if not "Google" in driver.title:
    fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)    
    raise Exception("Are you not on google? How come!")
  elem = driver.find_element_by_name("q")
  elem.send_keys("selenium")
  elem.submit()

# def test_fail(driver, secret):
#   fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
#   raise Exception("failed test, should fail")

def fail_browserstack(driver, secret, where):
  requests.put(
    "https://api.browserstack.com/automate/sessions/{}.json".format(driver.session_id),
    auth=tuple(secret.split(":")),
    json={"status": "failed", "reason": "test failed in {}".format(where)})  
