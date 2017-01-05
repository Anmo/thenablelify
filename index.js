const privateRegex = /^_/
function defaultObjFilter (name, target) {
  return typeof name === 'string' &&
    typeof target[name] === 'function' &&
    !privateRegex.test(name)
}
function defaultClassFilter (name, target) {
  return name !== 'constructor' &&
    defaultObjFilter(name, target)
}

const thenablelify = (target) => {
  let isPromiseRunning = false
  const nextPromise = []

  let realPromise = null

  function returnThen (thenCb, catchCb) {
    let _resolve
    let _reject

    const returnedPromise = new Promise(function (resolve, reject) {
      _resolve = resolve
      _reject = reject
    }).then(thenCb, catchCb)

    realPromise = (e, args) => e ? _reject(e) : _resolve(args)

    return returnedPromise
  }
  function returnCatch (cb) {
    let _resolve
    let _reject

    const returnedPromise = new Promise(function (resolve, reject) {
      _resolve = resolve
      _reject = reject
    }).catch(cb)

    realPromise = (e, args) => e ? _reject(e) : _resolve(args)

    return returnedPromise
  }

  function _then (args) {
    const _nextPromise = nextPromise.shift()

    if (_nextPromise) {
      return Promise.resolve(args)
        .then(_nextPromise)
        .then(_then, _catch)
    }

    callRealPromise(null, args)
  }
  function _catch (e) {
    nextPromise.length = 0

    callRealPromise(e)
  }
  function callRealPromise (e, args) {
    isPromiseRunning = false

    let _realPromise = realPromise

    realPromise = null

    _realPromise && _realPromise(e, args)
  }

  function thenablelifyHandler (target, name) {
    function thenablelifyHandlerTarget (name) {
      const originalMethod = target[name].bind(target)

      target[name] = function chained (args) {
        if (isPromiseRunning) {
          nextPromise.push(originalMethod.bind(null, args))
        } else {
          isPromiseRunning = true

          Promise.resolve(args)
            .then(originalMethod)
            .then(_then, _catch)
        }

        return target
      }
    }

    if (!name) { return thenablelifyHandlerTarget }

    thenablelifyHandlerTarget(name)
  }

  return {
    thenablelifyHandler: target ? thenablelifyHandler(target) : thenablelifyHandler,
    returnThen,
    returnCatch
  }
}

export function thenablelifyObj (obj, filter = defaultObjFilter) {
  const thenablelifyHandlerTargeted = thenablelify(obj)

  Object.keys(obj)
    .filter((name) => filter(name, obj))
    .forEach(thenablelifyHandlerTargeted.thenablelifyHandler)

  obj.then = thenablelifyHandlerTargeted.returnThen
  obj.catch = thenablelifyHandlerTargeted.returnCatch

  return obj
}

export function thenablelifyInstance (instance, filter = defaultClassFilter, depth = false) {
  const thenablelifyHandlerTargeted = thenablelify(instance)

  let methods = Object.getOwnPropertyNames(instance)
  let proto = Object.getPrototypeOf(instance)

  do {
    methods = methods.concat(Object.getOwnPropertyNames(proto))
  } while (depth && depth-- && (proto = Object.getPrototypeOf(proto)))

  methods.filter((name) => filter(name, instance))
    .forEach(thenablelifyHandlerTargeted.thenablelifyHandler)

  instance.then = thenablelifyHandlerTargeted.returnThen
  instance.catch = thenablelifyHandlerTargeted.returnCatch

  return instance
}

export default thenablelify
