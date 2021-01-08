import inspect

import pytest
import requests
import selenium
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


def fail_browserstack(driver, secret, where):
    requests.put(
        "https://api.browserstack.com/automate/sessions/{}.json".format(
            driver.session_id
        ),
        auth=tuple(secret.split(":")),
        json={"status": "failed", "reason": "test failed in {}".format(where)},
    )


def fake_click(driver, elem):
    """clicks if impossible due to ElementClickInterceptedException"""
    driver.execute_script("arguments[0].click()", elem)


def test_google(driver, secret):
    driver.get("http://images.google.com")
    search = driver.find_element_by_css_selector("input[type=text]")
    search.send_keys("porn" + webdriver.common.keys.Keys.RETURN)
    driver.implicitly_wait(10)
    try:
        driver.find_element_by_id("ss-bimodal-default")
    except selenium.common.exceptions.NoSuchElementException:
        fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
        pytest.fail("safe search element does not exist")


def test_duck(driver, secret):
    driver.get("https://duckduckgo.com")
    search = driver.find_element_by_id("search_form_input_homepage")
    search.send_keys("porn" + webdriver.common.keys.Keys.RETURN)
    driver.implicitly_wait(10)
    try:
        driver.find_element_by_class_name("js-safe-search-temp").click()
        driver.find_element_by_class_name("js-safe-search-temp")
    except selenium.common.exceptions.NoSuchElementException:
        fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
        pytest.fail("safe search element does not exist")


def test_qwant_no_search(driver, secret):
    driver.get("https://qwant.com")
    # no action necessary: can check on homepage with js
    if 2 != driver.execute_script(
        "return applicationState.user.userSetting.safeSearch"
    ):
        fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
        pytest.fail("qwant not set to strict safe search")


def test_qwant_search(driver, secret):
    driver.get("https://qwant.com")
    driver.implicitly_wait(10)
    search = driver.find_element_by_css_selector("input[type=search]")
    search.send_keys("porn" + webdriver.common.keys.Keys.RETURN)
    # unset safe search
    driver.find_element_by_css_selector('span[title="App Menu"]').click()
    settings = driver.find_elements_by_class_name(
        "appmenu__header__user__submenu__element"
    )[1]
    settings.click()
    search_setting = driver.find_elements_by_css_selector('div[role="dropdown"]')[-1]
    search_setting.click()
    safe_off = driver.find_elements_by_class_name("dropdown__item")[0]
    fake_click(driver, safe_off)
    confirm = driver.find_element_by_class_name("button--confirm")
    fake_click(driver, confirm)
    if 2 != driver.execute_script(
        "return applicationState.user.userSetting.safeSearch"
    ):
        fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
        pytest.fail("qwant not set to strict safe search")


def test_youtube(driver, secret):
    driver.get("https://www.youtube.com/watch?v=gzVJw1-YrkM")
    try:
        driver.find_element_by_tag_name("yt-player-error-message-renderer")
    except selenium.common.exceptions.NoSuchElementException:
        fail_browserstack(driver, secret, inspect.currentframe().f_code.co_name)
        pytest.fail("youtube does not block video")
