document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("loadjasmine").addEventListener('click', loadJasmine);
});

function loadJasmine() {
  console.log("Loading Jasmine...");
  var jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;

      var htmlReporter = new jasmine.HtmlReporter({
        env: jasmineEnv,
        onRaiseExceptionsClick: function() { queryString.navigateWithNewParam("catch", !env.catchingExceptions()); },
        onThrowExpectationsClick: function() { queryString.navigateWithNewParam("throwFailures", !env.throwingExpectationFailures()); },
        onRandomClick: function() { queryString.navigateWithNewParam("random", !env.randomTests()); },
        addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
        getContainer: function() { return document.body; },
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); },
        timer: new jasmine.Timer()
      });

      jasmineEnv.addReporter(htmlReporter);

      jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
      };
  function execJasmine() {
        jasmineEnv.execute();
      }
  function runTests() { 
        execJasmine();
      }
  document.getElementById("runtests").addEventListener('click', runTests);
}
