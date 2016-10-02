# take-action
[![build](https://img.shields.io/travis/bakerface/take-action.svg?flat-square)](https://travis-ci.org/bakerface/take-action)
[![npm](https://img.shields.io/npm/v/take-action.svg?flat-square)](https://npmjs.com/package/take-action)
[![downloads](https://img.shields.io/npm/dm/take-action.svg?flat-square)](https://npmjs.com/package/take-action)
[![climate](https://img.shields.io/codeclimate/github/bakerface/take-action.svg?flat-square)](https://codeclimate.com/github/bakerface/take-action)
[![coverage](https://img.shields.io/codeclimate/coverage/github/bakerface/take-action.svg?flat-square)](https://codeclimate.com/github/bakerface/take-action)

### Action.create(action)
Creates an action with the given definition. Returns a function that accepts `jacks` and `props` as arguments, respectively. This function will validate the jacks using `jackTypes` and the props using `propTypes` before performing the action. Additionally, defaults can be supplied by providing `getDefaultJacks` and `getDefaultProps` functions.

``` javascript
var Action = require('take-action');

var createUser = Action.create({
  name: 'createUser',
  description: 'Creates a new user account',

  jackTypes: {
    users: Action.Types.shape({
      add: Action.Types.func.isRequired
    }).isRequired
  },

  propTypes: {
    id: Action.Types.string.isRequired,
    created: Action.Types.date.isRequired,
    email: Action.Types.email.isRequired,
    isAdmin: Action.Types.bool
  }

  getDefaultProps: function () {
    return {
      id: uuid.v4(),
      created: Date.now()
    };
  },

  perform: function (jacks, props) {
    return jacks.users.add(props);
  }
});

// a jack is an interface for external objects
// a plug is an implementation of a jack
var jacks = {
  users: new RedisUserPlug()
};

var props = {
  email: 'john@doe.com'
};

createUser(jacks, props);
```
