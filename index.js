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

var ActionCreateError = exports.ActionCreateError = function (message) {
  Error.call(this);

  this.name = 'ActionCreateError';
  this.message = message;
};

var ActionValidateError = exports.ActionValidateError = function (errors) {
  Error.call(this);

  this.name = 'ActionValidateError';
  this.message = 'The action could not be validated';
  this.errors = errors;
};

function createTypeError(actual, expected) {
  return new ActionValidateError('Expected type to be "' + expected +
    '" but found "' + actual + '"');
}

function extend(target, values) {
  for (var key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      target[key] = values[key];
    }
  }

  return target;
}

function identity(x) {
  return x;
}

function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
}

function defineGetter(target, name, get) {
  Object.defineProperty(target, name, { get: get });
}

function ActionTypes(validate) {
  this.validate = validate || identity;

  defineGetter(this, 'string', function () {
    return this.typeOf('string');
  });

  defineGetter(this, 'object', function () {
    return this.typeOf('object');
  });

  defineGetter(this, 'bool', function () {
    return this.typeOf('boolean');
  });

  defineGetter(this, 'number', function () {
    return this.typeOf('number');
  });

  defineGetter(this, 'func', function () {
    return this.typeOf('function');
  });

  defineGetter(this, 'date', function () {
    return this.optional(function (value) {
      var date = new Date(value);
      var time = date.getTime();

      if (isNaN(time)) {
        throw createTypeError(typeof value, 'date');
      }

      return date;
    });
  });

  defineGetter(this, 'array', function () {
    return this.optional(function (value) {
      if (Array.isArray(value)) {
        return value;
      }

      throw createTypeError(typeof value, 'array');
    });
  });

  defineGetter(this, 'isRequired', function () {
    return this.compose(function (value) {
      if (typeof value === 'undefined') {
        throw new ActionValidateError('Required');
      }

      return value;
    });
  });
}

ActionTypes.prototype.compose = function (validate) {
  return new ActionTypes(compose(validate, this.validate));
};

ActionTypes.prototype.optional = function (validate) {
  return this.compose(function (value) {
    if (typeof value !== 'undefined') {
      return validate(value);
    }
  });
};

ActionTypes.prototype.typeOf = function (expected) {
  return this.optional(function (value) {
    var actual = typeof value;

    if (actual !== expected) {
      throw createTypeError(actual, expected);
    }

    return value;
  });
};

ActionTypes.prototype.shape = function (shape) {
  return this.object.optional(function (value) {
    var sanitized = { };
    var errors = { };
    var isError = false;

    for (var key in shape) {
      if (Object.prototype.hasOwnProperty.call(shape, key)) {
        try {
          sanitized[key] = shape[key].validate(value[key]);
        }
        catch (err) {
          if (err instanceof ActionValidateError) {
            errors[key] = err.errors;
          }
          else {
            errors[key] = err.message;
          }

          isError = true;
        }
      }
    }

    if (isError) {
      throw new ActionValidateError(errors);
    }

    return sanitized;
  });
};

exports.Types = new ActionTypes();

exports.create = function (action) {
  if (typeof action !== 'object') {
    throw new ActionCreateError('An action is required');
  }

  if (typeof action.name !== 'string') {
    throw new ActionCreateError('An action name is required');
  }

  if (typeof action.description !== 'string') {
    throw new ActionCreateError('An action description is required');
  }

  if (typeof action.jackTypes !== 'object') {
    throw new ActionCreateError('The action jack types are required');
  }

  if (typeof action.propTypes !== 'object') {
    throw new ActionCreateError('The action prop types are required');
  }

  if (typeof action.perform !== 'function') {
    throw new ActionCreateError('An action perform function is required');
  }

  return function (jacks, props) {
    var shape = new ActionTypes().shape({
      jacks: new ActionTypes().shape(action.jackTypes),
      props: new ActionTypes().shape(action.propTypes)
    });

    var j = (action.getDefaultJacks) ? action.getDefaultJacks() : { };
    var p = (action.getDefaultProps) ? action.getDefaultProps() : { };

    var sanitized = shape.validate({
      jacks: extend(j, jacks || { }),
      props: extend(p, props || { })
    });

    return action.perform(sanitized.jacks, sanitized.props);
  };
};
