'''read cookies from browser extension file example code'''
from http import cookiejar
c = cookiejar.MozillaCookieJar()
c.load("/home/web/Downloads/cookies.txt")
