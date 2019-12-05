const Request = require('request');
var express = require('express');
var EventEmitter = require("events").EventEmitter;
var playlists = new EventEmitter();

var SpotifyWebApi = require('spotify-web-api-node');

const elios_sdk = require('elios-sdk');

const sdk = new elios_sdk.default();

export default class Spotify {
  name: string = '';
  installId: string = '';

  requireVersion: string = '0.0.1';
  showOnStart: boolean = true;

  widget:any;
  it: any;

  constructor() {
    console.log('Spotify constructor.');
  }

  render(playlistURI:string, display:any) {
    var client_id = 'da02d7297d9b48d29e09057eba096d02';
    var client_secret = '0c4800df1dee439b99bee8fb7a6236b1';
    var app = express();

    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      form: {
        grant_type: 'client_credentials',
      },
      json: true
    };

    let widget = this.widget;

    Request.post(authOptions, function(error:any, response:any, body:any) {
      if (!error && response.statusCode === 200) {

        var spotifyApi = new SpotifyWebApi({
          clientId: client_id,
          clientSecret: client_secret,
          redirectUri: ""
        });

        var token = body.access_token;

        spotifyApi.setAccessToken(body.access_token);
        spotifyApi.getPlaylist(playlistURI)
        .then(function(data:any) {
          if (display == 1)
          widget.html('<iframe src="https://open.spotify.com/embed/playlist/' + playlistURI + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
          else if (display == 2)
          widget.html('<iframe src="https://open.spotify.com/embed/playlist/' + playlistURI + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
        });

      }
    });
  }

  start() {
    console.log('Spotify started.');

    let playlistURI = "37i9dQZF1DX1X23oiQRTB5";
    let display = 1;

    this.widget = sdk.createWidget();

    sdk.config().subscribe((config:any) => {
      if (config.playlist)
      playlistURI = config.playlist;
      if (config.display)
      display = config.display;

      this.render(playlistURI, display);
    });

    setInterval(() => {
      this.render(playlistURI, display);
    }, 3600000);

  }
}

const spotify = new Spotify();

spotify.start();
