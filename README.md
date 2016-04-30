#Get started

## Install 

### Download and install [Git](https://git-for-windows.github.io/)

### Tell git to use https instead of git protocol (Many corporate firewalls blocks the git protocol)

`git config --global url."https://".insteadOf git://`

### Download and install [Nodejs](https://nodejs.org/)

### Install [Grunt](http://gruntjs.com/)

`npm install -g grunt-cli`

### Install [Bower](http://bower.io/).

`npm install -g bower`

### Install Less.

`npm install -g less`

### Install [Typescript](http://www.typescriptlang.org/)

`npm install -g typescript`

## Configure Git to store user and password [once]

### Tell Git to store your credentials permanently

From command line run: 

`git config --global credential.helper store`


### Create a personal access token for your Visual Studio Online account :

* Sign in to your Visual Studio Online account (http://salvia.visualstudio.com).
* Go to your team project's home page and open your profile (right corner click on user and my profile).
* Go to in the security tab (left corner)
* Create a new personal access token 

### Retrieve the source code from Git

If user and password for salvia.visualstudio.com are already stored run: 

`git clone https://salvia.visualstudio.com/DefaultCollection/PhenixJS/_git/phoenix-seed`

If user and password for salvia.visualstudio.com are not already stored run:

`git clone https://username:token@salvia.visualstudio.com/DefaultCollection/PhenixJS/_git/phoenix-seed`

## Install third-party libraries

```
cd  demo
npm install
bower install
```

## Compile

### Compile all modules

`grunt`

### Compile one module

`grunt -module demo`

### Deploy

`grunt -deploy`

## Start the server

`node app`