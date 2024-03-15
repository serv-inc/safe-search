function setSafe() {
  var cookies = document.cookie.split(";"); // Récupérer tous les cookies existants
  var updatedCookie = false;

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.startsWith("s=")) {
      // Mettre à jour le cookie "s" en remplaçant sa valeur par "2"
      document.cookie = "s=2; " + cookie.substring(2);
      updatedCookie = true;
      break;
    }
  }

  // Si le cookie "s" n'existe pas, le créer avec la valeur "2"
  if (!updatedCookie) {
    document.cookie = "s=2";
  }
}

setSafe();
