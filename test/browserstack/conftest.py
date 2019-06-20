import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import secret as s

desired_cap = {
    'browser': 'Chrome',
    'browser_version': '62.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1024x768',
    'name': 'Bstack Tests'
}
opt = webdriver.chrome.options.Options()
opt.add_extension(extension=os.path.join(
    os.path.dirname(__file__), "..", "..", "safe.zip"))
desired_cap.update(opt.to_capabilities())


@pytest.fixture
def secret():
    '''string in the form key:token for login to browserstack'''
    return s.LOGIN

@pytest.fixture
def driver(secret):
    url = 'http://{}@hub.browserstack.com:80/wd/hub'.format(secret)
    driver = webdriver.Remote(command_executor=url,
                              desired_capabilities=desired_cap)
    yield driver
    driver.quit()
