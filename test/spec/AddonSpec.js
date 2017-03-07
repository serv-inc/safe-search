describe("Addon", function() {
    describe("should alter search URLs to use safe search", function() {
        it("for Google", function() {
            let uri = "google.de/q=test";
        
            expect(_alter(uri)).toEqual(uri + "&safe=strict");
        });
    });

    describe("should not alter no-search URLs to use safe search", function() {
        it("for Google no search", function() {
            let uri = "google.de";
        
            expect(_alter(uri)).toEqual(false);
        });
    });
});
