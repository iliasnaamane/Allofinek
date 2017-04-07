# Allofinek

[ Allofinek is a free and open source video conference ]

## Features
1. Video conference
2. Invite people using Facebook ( Messenger )
3. Copy Link

## Installation

1. clone the repository

        git clone --recursive https://ci.open-paas.org/stash/scm/meet/meetings.git

2. Install and configure MongoDB

You must install mongoDB. We suggest you to use mongoDB version 2.6.5.

        echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
        apt-get install -y mongodb-org=2.6.5 mongodb-org-server=2.6.5 mongodb-org-shell=2.6.5 mongodb-org-mongos=2.6.5 mongodb-org-tools=2.6.5
        service mongod start

3. install node.js

Please note that your version of node.js must be greater than version 0.10.28 but less than or equal to 0.10.36. We highly recommend that you use [nvm](https://github.com/creationix/nvm) to install a specific version of node.

4. Install Redis

        apt-get install redis-server

5. Copy the sample db.json configuration file and adapt it to your need (especially the mongodb URL if you do not use default parameters from step 2)

        cp config/db.json.sample config/db.json

6. Install the npm dependencies (as an administrator)

        npm install -g mocha grunt-cli bower karma-cli

7. Go into the modules directory and install easyrtc connector module dependecies

        cd modules/hublin-easyrtc-connector
        npm install

8. Go into the project directory and install project dependencies

        cd meetings
        npm install

## Testing

You can check that everything works by launching the test suite:

    grunt

If you want to launch tests from a single test, you can specify the file as command line argument.
For example, you can launch the backend tests on the test/unit-backend/webserver/index.js file like this:

    grunt test-unit-backend --test=test/unit-backend/webserver/index.js

Note: This works for backend and midway tests.

Some specialized Grunt tasks are available :

    grunt linters # launch hinter and linter against the codebase
    grunt test-frontend # only run the fontend unit tests
    grunt test-unit-backend # only run the unit backend tests
    grunt test-midway-bakend # only run the midway backend tests
    grunt test # launch all the testsuite

## Fixtures

Fixtures can be configured in the fixtures folder and injected in the system using grunt:

    grunt fixtures

Note that this will override all the current configuration resources with the fixtures ones.

## Starting the server

Use npm start to start the server !

    npm start


## Develop into Allofinek

Running `grunt dev` will start the server in development mode. Whenever you
make changes to server files, the server will be restarted. Make sure you have
started the mongodb and redis servers beforehand.

In addition, you can run `grunt debug` to start the node-inspector debugger
server. Visit the displayed URL in Chrome or Opera to start the graphical
debugging session. Note that startup takes a while, you must wait until the Hubl.in
webserver starts to do anything meaningful.

### Updating files for distribution

grunt plugins are used to process files and generate distribution.
You will have to follow some rules to not break the distribution generation which are defined here.

#### Frontend

Any project frontend file which is under frontend/js and used in a web page must be placed between generator tags.
For example, in frontend/views/meetings/index.jade:

    // <!--build:js({.tmp,frontend}) meetings.js-->
    script(src='/js/modules/user/user.js')
    ...
    script(src='/js/meetings/app.js')
    // <!--endbuild-->

The files placed between the two comment lines will be used to generate a meetings.js file (concatenate and minify all).

### Backend

All the files from backend are copied into the dist/backend folder without any change.

### Static files

These folders are pushed in the distribution:

- config
- templates

If you need to add more, you will have to change the 'copy:dist' and 'dist-files' tasks in Gruntfile.js

## Create a distribution

To create a distribution with clean environment, minified files and install production dependencies:

    grunt dist-all
    cd dist
    npm install --production

Then you can start the server with 'npm start', 'node server', or your favorite tool (Kudos to forever).


