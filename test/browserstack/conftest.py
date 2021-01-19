import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import dotenv

dotenv.load_dotenv()

desired_cap = {"browser": "Chrome", "name": "Chrome random Safe Search Tests"}
#    'browser_version': '62.0',
#    'os': 'Windows',
#    'os_version': '10',
#    'resolution': '1024x768',

# __file__ = os.getcwd() + "/"  # paste this if by hand
opt = webdriver.chrome.options.Options()
opt.add_extension(
    extension=os.path.join(os.path.dirname(__file__), "..", "..", "safe.zip")
)
desired_cap.update(opt.to_capabilities())


@pytest.fixture(scope="session")
def secret():
    """string in the form key:token for login to browserstack"""
    return os.environ["BROWSERSTACK_LOGIN"]


@pytest.fixture(scope="session")
def driver(secret):
    url = "http://{}@hub.browserstack.com:80/wd/hub".format(secret)
    driver = webdriver.Remote(command_executor=url, desired_capabilities=desired_cap)
    yield driver
    driver.quit()
