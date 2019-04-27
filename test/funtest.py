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

profile = webdriver.FirefoxProfile()
profile.add_extension(extension="./addon/")
driver = webdriver.Firefox(firefox_profile=profile) 
