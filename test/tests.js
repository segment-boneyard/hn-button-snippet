describe('hn-button-snippet', function () {

  var snippet = require('hn-button-snippet')
    , assert = require('component-assert')
    , type = require('component-type');

  describe('full', function () {
    it('should expose a full template', function () {
      assert(type(snippet) === 'function');
    });
  });

  describe('button', function () {
    it('should expose a button template', function () {
      assert(type(snippet.button) === 'function');
    });

    it('should return the right default button template', function () {
      assert(snippet.button() === '<a href="https://news.ycombinator.com/submit" class="hn-button">Vote on HN</a>');
    });

    it('should allow for an optional button title', function () {
      assert(snippet.button({ title : 'Test' }) === '<a href="https://news.ycombinator.com/submit" class="hn-button" data-title="Test">Vote on HN</a>');
    });

    it('should allow for an optional button url', function () {
      assert(snippet.button({ url : 'https://segment.io' }) === '<a href="https://news.ycombinator.com/submit" class="hn-button" data-url="https://segment.io">Vote on HN</a>');
    });

    it('should allow for an optional button count', function () {
      assert(snippet.button({ count : 'vertical' }) === '<a href="https://news.ycombinator.com/submit" class="hn-button" data-count="vertical">Vote on HN</a>');
    });

    it('should allow for an optional everything', function () {
      assert(snippet.button({
        title : 'Test',
        url : 'https://segment.io',
        count : 'vertical'
      }) === '<a href="https://news.ycombinator.com/submit" class="hn-button" data-title="Test" data-url="https://segment.io" data-count="vertical">Vote on HN</a>');
    });
  });

  describe('script', function () {
    it('should expose a script template', function () {
      assert(type(snippet.script) === 'function');
    });

    it('should return the right script string', function () {
      assert(snippet.script() === '<script type="text/javascript">var HN=[];HN.factory=function(e){return function(){HN.push([e].concat(Array.prototype.slice.call(arguments,0)))};},HN.on=HN.factory("on"),HN.once=HN.factory("once"),HN.off=HN.factory("off"),HN.emit=HN.factory("emit"),HN.load=function(){var e="hn-button.js";if(document.getElementById(e))return;var t=document.createElement("script");t.id=e,t.src="//hn-button.herokuapp.com/hn-button.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)},HN.load();</script>');
    });
  });

});