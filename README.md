# Ecobot

A barebones Node.js app using [Express 4](http://expressjs.com/) that converts searches for waste items into Slack-friendly messages about how to dispose of them safely.

This application was originally created from the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) starter project.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/dzoltok/ecobot.git # or clone your own fork
$ cd ecobot
$ npm install
$ npm start
```

Your app should now be running on [localhost:6500](http://localhost:6500/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```

or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
