function setSafe() {
  var cookies = document.cookie.split(";");
  var updatedCookie = false;

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.startsWith("s=")) {
      document.cookie = "s=2; " + cookie.substring(2);
      updatedCookie = true;
      break;
    }
  }

  if (!updatedCookie) {
    document.cookie = "s=2";
  }
}

setSafe();
