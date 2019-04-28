from selenium import webdriver

# local testing, remove before CI
PROXY='127.0.0.1:8080'
webdriver.DesiredCapabilities.FIREFOX['proxy'] = {
    "httpProxy":PROXY,
    "ftpProxy":PROXY,
    "sslProxy":PROXY,
    "noProxy":[],
    "proxyType":"MANUAL"
 }

# setup addon
profile = webdriver.FirefoxProfile()
profile.add_extension(extension="./addon/")
browser = webdriver.Firefox(firefox_profile=profile)

# load ddg
browser.get("https://duckduckgo.com")
assert "duckduckgo" in browser.title.lower()
# search porn
(browser
 .find_element_by_id("search_form_input_homepage")
 .send_keys("porn" + webdriver.common.keys.Keys.RETURN))
# click to disable temporarily, then wait, then see if available
browser.find_element_by_class_name("js-safe-search-temp").click()
# assert that browser.find_element_by_class_name("js-safe-search-temp") still exists
browser.find_element_by_class_name("js-safe-search-temp")

