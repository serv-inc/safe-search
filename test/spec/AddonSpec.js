describe("Addon", function() {
  describe("should alter search URLs to use safe search", function() {
    it("for Google", function() {
      let uri = "http://google.de/search?q=test";
      
      expect(_alter(uri)).toEqual(uri + "&safe=active&ssui=on");
    });
  });

  describe("should not alter no-search URLs to use safe search", function() {
    it("for Google no search", function() {
      let uri = "http://google.de";
      
      expect(_alter(uri)).toEqual(false);
    });
  });

  describe("should clean duplicate parameters", function() {
    it("for Google", function() {
      let uri = "http://google.de/search?q=test&safe=vss";
      
      expect(_alter(uri)).toEqual(
        "http://google.de/search?q=test&safe=active&ssui=on");
    });

    it("for Google triplicate", function() {
      let uri = "http://google.de/search?q=test&safe=vss&safe=vss";
      
      expect(_alter(uri)).toEqual(
        "http://google.de/search?q=test&safe=active&ssui=on");
    });

    it("for Google triplicate with other stuff in-between", function() {
      let uri = "http://google.de/search?q=test&safe=vss&hello=world&safe=vss";
      
      expect(_alter(uri)).toEqual(
        "http://google.de/search?q=test&safe=active&hello=world&ssui=on");
    });

    it("for Google triplicate with different values", function() {
      let uri = "http://google.de/search?q=test&safe=active&hello=world&safe=off";
      
      expect(_alter(uri)).toEqual(
        "http://google.de/search?q=test&safe=active&hello=world&ssui=on");
    });
  });
});
