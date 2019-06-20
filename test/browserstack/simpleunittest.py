from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

def test_run(secret):
  url= 'http://{}@hub.browserstack.com:80/wd/hub'.format(secret)
  driver = webdriver.Remote(command_executor=url, desired_capabilities=DesiredCapabilities.FIREFOX)
  driver.get('http://www.google.com')
  if not "Google" in driver.title:
    raise Exception("Are you not on google? How come!")
  elem = driver.find_element_by_name("q")
  elem.send_keys("selenium")
  elem.submit()
  driver.quit()
