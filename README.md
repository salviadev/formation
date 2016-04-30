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

### Retrieve the source code from Git

`git clone https://github.com/salviadev/formation`

## Install third-party libraries

```
cd  formation
npm install
bower install
```

## Compile

`grunt`

## Start the server

`node app`
