require("dotenv").config();

const chalk = require('chalk');
const moment = require('moment');
const inquirer = require('inquirer');
const Twitter  = require('twitter');
const Spotify = require('node-spotify-api');
const fs = require('fs');
const request = require('request');

const keys = require('./keys.js');
const spotifyKeys = new Spotify(keys.spotify);
const twitterKeys = new Twitter(keys.twitter);


function mainPrompt(){
   
    inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        {name: 'Spotify', value: spotifyAPI },
        {name: 'Twitter', value: twitterAPI },
        {name: 'OMDB', value: omdbAPI  },
        {name: 'Text from File', value: textFromFile}
      ]
    }])
    .then(input => {
        input.action()
    })
}
mainPrompt();


//
// SPOTIFY
//
function spotifyAPI(){
    inquirer.prompt([
    {
        type: 'input',
        name: 'song',
        message: 'Please, enter a song name.',
    }])
    .then(x => {
        if (x.song === ''){
            spotifyResults('Ace of Base The Sign');
        }
        else {
            spotifyResults(x.song);
        }
    })
}



function spotifyResults(song) {

    spotifyKeys.search({ type: 'track', query: song, limit: 5 }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        
        var songs = data.tracks.items;

        if( !songs.length ) {
            console.log( chalk.bold.red( 'SONG NOT FOUND!!' ));
        }
       
        for (var i = 0; i < songs.length; i++) {
            if(i > 0 && song === 'Ace of Base The Sign') continue;

            console.log(chalk.bold.green('----------------------------------------'));
            console.log( chalk.bold.green('Artist(s): ') + songs[i].artists.map(artist => artist.name) );
            console.log( chalk.bold.green('Song Name: ') + '"' + songs[i].name + '"');
            console.log( chalk.bold.green('Preview: ') + songs[i].preview_url);
            console.log( chalk.bold.green('Album: ') + songs[i].album.name);
            console.log(chalk.bold.green('----------------------------------------'));
        }

        mainPrompt();
    });
}

//
// TWITTER
//
function twitterAPI() {
    var params = { screen_name: 'gioperina' };
    twitterKeys.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) { console.log('Error..', error); }
        
        tweets.map(tweet => {
            const name = tweet.user.name;
            const username = tweet.user.screen_name;
            const text = tweet.text;
            const created_at = tweet.created_at;

            console.log( `${chalk.bold(name)} @${chalk.italic.dim(username)}:` );
            console.log( chalk.dim( moment(created_at).format('MM/DD/YYYY hh:mmA') ) );
            console.log( text  );
            console.log(chalk.cyan('----------------------------------------'));
        })

        mainPrompt();
    });
}

//
// OMDB
//
function omdbAPI() {
    inquirer.prompt([
        {
        type: 'input',
        name: 'movie',
        message: 'Please, enter a movie name.',
    }])
    .then(x => {
        if (x.movie === ''){
            getMovie('Mr. Nobody');
        }
        else {
            getMovie(x.movie);
        }
    })
}

function getMovie(movieTitle) {
    request('http://www.omdbapi.com/?apikey=trilogy&t=' + movieTitle + '&tomatoes=true&r=json', function (error, response, body) {
        if(!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            if( data.Response === 'False' ) {
                console.log( chalk.bold.red('MOVIE NOT FOUND!!') );
                mainPrompt();
                return;
            }

            console.log( chalk.bold.hex('#CE7B41')('----------------------------------------') );
            console.log( chalk.bold.hex('#CE7B41')('Title: ') + data.Title);
            console.log( chalk.bold.hex('#CE7B41')('Year Released: ') + data.Year);
            console.log( chalk.bold.hex('#CE7B41')('IMDb Rating: ') + data.imdbRating);
            console.log( chalk.bold.hex('#CE7B41')('Rotten Tomatoes Rating: ') + data.Ratings[0].Value);
            console.log( chalk.bold.hex('#CE7B41')('Country: ') + data.Country);
            console.log( chalk.bold.hex('#CE7B41')('Language: ') + data.Language);
            console.log( chalk.bold.hex('#CE7B41')('Plot Synopsis: ') + data.Plot);
            console.log( chalk.bold.hex('#CE7B41')('Cast: ') + data.Actors);
            console.log( chalk.bold.hex('#CE7B41')('----------------------------------------') );
        }
    
        mainPrompt();
    });
}

//
// TEXT FROM FILE
//
function textFromFile() {
    fs.readFile('random.txt', 'utf8', function(err, data) {
        spotifyResults( data );
    });
}


//
// COMMANDS
//
var runCommand = function(command, param) {
    switch(command) {
        case 'my-tweets':
            twitterAPI();
            break;
        case 'spotify-this-song':
            spotifyResults(param);
            break;
        case 'movie-this':
            if (param == undefined) {
                getMovie("Mr. Nobody");
            } else {
                getMovie(param);
            }
            break;
        case 'do-what-it-says':
            textFromFile();
            break;
    }
}

var liriBot = function(arg1, arg2) {
    runCommand(arg1, arg2);
};

liriBot(process.argv[2], process.argv[3]);