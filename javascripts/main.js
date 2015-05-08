OAuth.initialize('jHrufi9H76VNKJWURzgAblGiZc8');

//Using popup
OAuth.popup('github')
  .done(function(result) {
    var oAuth_Token = result.access_token;

    //redirectURL = "http://example.com?oAuth_Token=" + oAuth_Token;
    //setTimeout(callback(redirectURL), 500);
    if (oAuth_Token != '') {
      var github = new Github({
        token: oAuth_Token,
        auth: "oauth"
      });

      var repo = github.getRepo('markusschaden', 'MLTM');

      repo.read('master', 'stylesheets/mltm.css', function(err, data) {
        $(function () {
          $('<style>')
            .attr('type', 'text/css')
            .text(data)
            .appendTo('head');
        })
      });

      repo.read("master", 'javascripts/main.js', function(err, data) {
        $(function () {
          $('<script>')
            .attr('type', 'text/javascript')
            .text(data)
            .appendTo('head');
        })
      });
    }
  }).fail(function(err) {
    console.log(err);
  });
