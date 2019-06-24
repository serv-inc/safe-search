const URI_WITH = "https://www.google.com/search?q=test&safe=active&ssui=on";
const URI_WITHOUT = "https://www.google.com/search?q=test";

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

  describe("should use _meta_add correctly", function() {
    it("for uri containing correct params", function() {
      expect(_meta_add(URI_WITH, ["ssui"], ["on"])).toEqual(false);
      expect(_meta_add(URI_WITH, ["safe"], ["active"])).toEqual(false);
      expect(_meta_add(URI_WITH, ["ssui", "safe"], ["on", "active"])).toEqual(false);
    });
    it("for uri not containing correct params", function() {
      expect(_meta_add(URI_WITHOUT, ["safe", "ssui"], ["active", "on"])).toEqual(URI_WITH);
    });
  });

  describe("should detect google search URLs", function() {
    it("for searches above", function() {
      expect(isGoogle(new URL(URI_WITH))).toEqual(true);
      expect(isGoogle(new URL(URI_WITHOUT))).toEqual(true);
    });
    it("for live URL", function() {
      expect(isGoogle(new URL('https://www.google.com/search?tbm=isch&source=hp&biw=1050&bih=714&ei=YqEPXYbDBIbPwAK4z4OgBg&q=porn&oq=porn&gs_l=img.3...3333.3580..3593...0.0..0.68.396.8......0....1..gws-wiz-img.....0..0.UehEPMi_-34&safe=active&ssui=on#imgrc=qLfN9H5CSrJQsM:'))).toEqual(true);
    });
    it("should not detect ducky as a google URL", function() {
      expect(isGoogle(new URL("http://duckduckgo.com"))).toEqual(false);
    });
    it("should not detect google maps as a search URL", function() {
      expect(true).toEqual(false);  // not implemented
    });
  });
});
