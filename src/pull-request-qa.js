// # Description:
// #   A script that respons to Github webhooks for pull_requests and posts a markdown file as a comment
// 
// # Dependencies:
// #   "require": "~"
//     "githubhot": "~"
// #
// # Configuration:
// #   HUBOT_GITHUB_TOKEN
//     GITHUB_USERNAME
//     URL_TO_RAW_MARKDOWN
// #
// #
// # Notes:
// #   
// #
// # Author:
// #   haffmaestro
// 
var request = require('request');
var github = require('githubot');

module.exports = qaBot;

var callback = function (robot) {
  return function(error, response, body){
    robot.logger.info('===================POST GIST=======================');
    robot.logger.info(body);
    robot.logger.info(response);
    robot.logger.info(error);
  }
}

function getAndPostGist(robot, rawPostback){
  request.get(process.env.URL_TO_RAW_MARKDOWN, {
    'auth': {
      'user':process.env.GITHUB_USERNAME,
      'pass':process.env.HUBOT_GITHUB_TOKEN
    }
  }, function(err, resp, body){
    robot.logger.info("==============GET GIST===========");
    robot.logger.info();
    rawPostback({
      "body":resp.body
    })
  })
} 

function closeRequest(res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Thanks\n');
}

function getTypeOfEvent(req){
  var event = req.headers['x-github-event'];
  if(event.match(/issue/)){
    return 'issue';
  } else if(event.match(/pull/)){
    return 'pull_request';
  }
}

function qaBot(robot){
  var githubot = github(robot);

  robot.router.post("/hubot/qa-bot", function(req, res){
    robot.logger.info("============INITIAL============");
    robot.logger.info(req);

    var typeofEvent = getTypeOfEvent(req);
    closeRequest(res);

    
    if(typeofEvent === 'pull_request' && req.body.action === 'opened'){
      var commentsUrl = req.body[typeofEvent]['comments_url'];
      getAndPostGist(robot, function(comment){
        githubot.post(commentsUrl, comment, callback(robot));
      })
    }

  });
}
