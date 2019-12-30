const redis = require('redis');  // default settings, localhost and port 6379
const redisClient = redis.createClient();
const moment = require('moment');

// this entire thing gets exported from this file
module.exports = (request, response, next) => {
    // check if record exists
    redisClient.exists(request.header('user'), (err, reply) => {
      if(err) {
        console.log("Redis not working...");
        system.exit(0);
      }
      else if(reply == 1) {
        // time to check a few other things
        // get the proper value back
        redisClient.get(request.header('user'), (err, reply) => {
          let data = JSON.parse(reply);
          let currentTime = moment().unix();

          // data has sub-field
          let difference = (currentTime - data.startTime)/60;

          if(difference > 1) {
            // time to refresh cache entry
            let body = {
              'count': 1,
              'startTime': moment().unix()
            }
            redisClient.set(request.header('user'), JSON.stringify(body), redis.pprint);
            next();
          }

          if(difference < 1) {
            if(data.count > 3) {
              return response.json({"error": 1, "message": "throttled limit exceeded..."});
            }

            data.count++;
            redisClient.set(request.header('user'), JSON.stringify(data), redis.print);
            // allow request
            next();
          }

        });
      } else {          // this case is easy, add a new record with count value of 1
        let body = {
          'count': 1,
          'startTime': moment().unix()
        }
        redisClient.set(request.header('user'), JSON.stringify(body), redis.print);
        next();
      }
    });
}
