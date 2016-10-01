/**
 * Copyright (c) 2016 Chris Baker <mail.chris.baker@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

const assert = require('assert');
const Action = require('..');

Object.defineProperty(Object.prototype, 'ignored', {
  value: 'ignored',
  enumerable: true,
  writable: true
});

describe('creating an action', function () {
  let action;
  let jacks;
  let props;

  function create() {
    return Action.create(action);
  }

  function perform() {
    return create()(jacks, props);
  }

  function error() {
    try {
      perform();
      assert(false, 'Creating the action should throw an error');
    }
    catch (err) {
      return err;
    }
  }

  beforeEach(function () {
    action = {
      name: 'CreateUser',
      description: 'Creates a new user account',
      jackTypes: { },
      propTypes: { },
      perform: function () { }
    };

    jacks = { };
    props = { };
  });

  it('should return a function', function () {
    assert.equal(typeof create(), 'function');
  });

  describe('without an action', function () {
    beforeEach(function () {
      action = undefined;
    });

    it('should throw an ActionCreateError', function () {
      assert.equal(error().name, 'ActionCreateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'An action is required');
    });
  });

  describe('without a name', function () {
    beforeEach(function () {
      action.name = undefined;
    });

    it('should throw an ActionCreateError', function () {
      assert.equal(error().name, 'ActionCreateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'An action name is required');
    });
  });

  describe('without a description', function () {
    beforeEach(function () {
      action.description = undefined;
    });

    it('should throw an ActionCreateError', function () {
      assert.equal(error().name, 'ActionCreateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'An action description is required');
    });
  });

  describe('without jack types', function () {
    beforeEach(function () {
      action.jackTypes = undefined;
    });

    it('should throw an ActionCreateError', function () {
      assert.equal(error().name, 'ActionCreateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'The action jack types are required');
    });
  });

  describe('without prop types', function () {
    beforeEach(function () {
      action.propTypes = undefined;
    });

    it('should throw an ActionCreateError', function () {
      assert.equal(error().name, 'ActionCreateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'The action prop types are required');
    });
  });

  describe('without a perform function', function () {
    beforeEach(function () {
      action.perform = undefined;
    });

    it('should throw an ActionCreateError', function () {
      assert.equal(error().name, 'ActionCreateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'An action perform function is required');
    });
  });

  describe('with an optional property', function () {
    beforeEach(function () {
      action.propTypes.s = Action.Types.string;

      action.perform = function (jacks, props) {
        return props.s;
      };

      props.s = 's';
    });

    it('should perform the action', function () {
      assert.equal(perform(), 's');
    });
  });

  describe('without an optional property', function () {
    beforeEach(function () {
      action.propTypes.s = Action.Types.string;

      action.perform = function (jacks, props) {
        return props.s;
      };
    });

    it('should perform the action', function () {
      assert.equal(perform(), undefined);
    });
  });

  describe('with a required property', function () {
    beforeEach(function () {
      action.propTypes.s = Action.Types.string.isRequired;

      action.perform = function (jacks, props) {
        return props.s;
      };

      props.s = 's';
    });

    it('should perform the action', function () {
      assert.equal(perform(), 's');
    });
  });

  describe('without a required property', function () {
    beforeEach(function () {
      action.propTypes.s = Action.Types.string.isRequired;

      action.perform = function (jacks, props) {
        return props.s;
      };
    });

    it('should throw an ActionValidateError', function () {
      assert.equal(error().name, 'ActionValidateError');
    });

    it('should have a message', function () {
      assert.equal(error().message, 'The action could not be validated');
    });

    it('should have the errors', function () {
      assert.equal(error().errors.props.s, 'Required');
    });
  });

  describe('with a string', function () {
    beforeEach(function () {
      action.propTypes.s = Action.Types.string;

      action.perform = function (jacks, props) {
        return props.s;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.s = 's';
      });

      it('should perform the action', function () {
        assert.equal(perform(), 's');
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.s = 0;
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.s,
          'Expected type to be "string" but found "number"');
      });
    });
  });

  describe('with a date', function () {
    beforeEach(function () {
      action.propTypes.d = Action.Types.date;

      action.perform = function (jacks, props) {
        return props.d;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.d = '2000-01-01';
      });

      it('should perform the action', function () {
        assert.equal(perform().toISOString(), '2000-01-01T00:00:00.000Z');
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.d = 'foo';
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.d,
          'Expected type to be "date" but found "string"');
      });
    });
  });

  describe('with a number', function () {
    beforeEach(function () {
      action.propTypes.n = Action.Types.number;

      action.perform = function (jacks, props) {
        return props.n;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.n = 0;
      });

      it('should perform the action', function () {
        assert.equal(perform(), 0);
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.n = '';
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.n,
          'Expected type to be "number" but found "string"');
      });
    });
  });

  describe('with a function', function () {
    beforeEach(function () {
      action.propTypes.f = Action.Types.func;

      action.perform = function (jacks, props) {
        return props.f;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.f = function () {
          return 'foo';
        };
      });

      it('should perform the action', function () {
        assert.equal(perform()(), 'foo');
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.f = '';
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.f,
          'Expected type to be "function" but found "string"');
      });
    });
  });

  describe('with a shape', function () {
    beforeEach(function () {
      action.propTypes.o = Action.Types.shape({
        s: Action.Types.string.isRequired,
        n: Action.Types.number.isRequired
      });

      action.perform = function (jacks, props) {
        return props.o;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.o = {
          s: '',
          n: 0
        };
      });

      it('should perform the action', function () {
        assert.equal(perform().s, '');
        assert.equal(perform().n, 0);
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.o = '';
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.o,
          'Expected type to be "object" but found "string"');
      });
    });
  });

  describe('with a boolean', function () {
    beforeEach(function () {
      action.propTypes.b = Action.Types.bool;

      action.perform = function (jacks, props) {
        return props.b;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.b = true;
      });

      it('should perform the action', function () {
        assert.equal(perform(), true);
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.b = '';
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.b,
          'Expected type to be "boolean" but found "string"');
      });
    });
  });

  describe('with an array', function () {
    beforeEach(function () {
      action.propTypes.a = Action.Types.array;

      action.perform = function (jacks, props) {
        return props.a;
      };
    });

    describe('that is valid', function () {
      beforeEach(function () {
        props.a = [];
      });

      it('should perform the action', function () {
        assert.deepEqual(perform(), []);
      });
    });

    describe('that is invalid', function () {
      beforeEach(function () {
        props.a = '';
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.a,
          'Expected type to be "array" but found "string"');
      });
    });
  });

  describe('with a custom validator', function () {
    beforeEach(function () {
      action.propTypes.n = Action.Types.number.optional(function (n) {
        if (n & 1) {
          throw new Error('Expected number to be even');
        }

        return n / 2;
      });

      action.perform = function (jacks, props) {
        return props.n;
      };
    });

    describe('that passes', function () {
      beforeEach(function () {
        props.n = 6;
      });

      it('should return the result', function () {
        assert.equal(perform(), 3);
      });
    });

    describe('that fails', function () {
      beforeEach(function () {
        props.n = 7;
      });

      it('should throw an ActionValidateError', function () {
        assert.equal(error().name, 'ActionValidateError');
      });

      it('should have a message', function () {
        assert.equal(error().message, 'The action could not be validated');
      });

      it('should have the errors', function () {
        assert.equal(error().errors.props.n, 'Expected number to be even');
      });
    });
  });

  describe('without a default jack', function () {
    beforeEach(function () {
      action.jackTypes.n = Action.Types.number.isRequired;

      action.getDefaultJacks = function () {
        return { n: 42 };
      };

      action.perform = function (jacks) {
        return jacks.n;
      };
    });

    it('should use the default', function () {
      assert.deepEqual(perform(), 42);
    });
  });

  describe('with a default jack', function () {
    beforeEach(function () {
      action.jackTypes.n = Action.Types.number.isRequired;

      action.getDefaultJacks = function () {
        return { n: 42 };
      };

      action.perform = function (jacks) {
        return jacks.n;
      };

      jacks.n = 13;
    });

    it('should use the supplied value', function () {
      assert.deepEqual(perform(), 13);
    });
  });

  describe('without a default prop', function () {
    beforeEach(function () {
      action.propTypes.n = Action.Types.number.isRequired;

      action.getDefaultProps = function () {
        return { n: 42 };
      };

      action.perform = function (jacks, props) {
        return props.n;
      };
    });

    it('should use the default', function () {
      assert.deepEqual(perform(), 42);
    });
  });

  describe('with a default prop', function () {
    beforeEach(function () {
      action.propTypes.n = Action.Types.number.isRequired;

      action.getDefaultProps = function () {
        return { n: 42 };
      };

      action.perform = function (jacks, props) {
        return props.n;
      };

      props.n = 13;
    });

    it('should use the supplied value', function () {
      assert.deepEqual(perform(), 13);
    });
  });

  describe('without jacks', function () {
    beforeEach(function () {
      jacks = undefined;

      action.perform = function (jacks) {
        return jacks;
      };
    });

    it('should default to an empty object', function () {
      assert.deepEqual(perform(), { });
    });
  });

  describe('without props', function () {
    beforeEach(function () {
      props = undefined;

      action.perform = function (jacks, props) {
        return props;
      };
    });

    it('should default to an empty object', function () {
      assert.deepEqual(perform(), { });
    });
  });
});
