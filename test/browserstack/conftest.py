import pytest

from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import secret as s

@pytest.fixture
def secret():
    '''string in the form key:token for login to browserstack'''
    return s.LOGIN

@pytest.fixture
def driver(secret):
    url= 'http://{}@hub.browserstack.com:80/wd/hub'.format(secret)
    driver = webdriver.Remote(command_executor=url,
                              desired_capabilities=DesiredCapabilities.FIREFOX)
    yield driver
    driver.quit()
