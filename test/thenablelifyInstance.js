import test from 'ava'
import sinon from 'sinon'

import { thenablelifyInstance } from '../index'

const objE = {}
const arrF = []

class C {
  constructor () {
    this._methodB = sinon.spy(() => 42)
  }
  methodA () { return 42 }
  methodB () { return this._methodB() }
  _methodC () { return 42 }
  get varD () { return 42 }
  get objE () { return objE }
  get arrF () { return arrF }
}

class C_ extends C {
  methodB_ () { return this._methodB() }
}

test.beforeEach(t => {
  t.context.class = new C()
  t.context.class_ = new C_()
})

test('Normal object methods calls and values', t => {
  t.is(t.context.class.methodA(), 42)
  t.is(t.context.class._methodB.callCount, 0)
  t.is(t.context.class.methodB(), 42)
  t.is(t.context.class._methodB.callCount, 1)
  t.is(t.context.class._methodC(), 42)
  t.is(t.context.class.varD, 42)
  t.deepEqual(t.context.class.objE, {})
  t.deepEqual(t.context.class.arrF, [])
})

test('Use thenablelify to transform a methods form a instance into a chain method that acts as a Promise', async t => {
  const {
    methodA,
    methodB,
    _methodB,
    _methodC,
    varD,
    objE,
    arrF
  } = t.context.class

  thenablelifyInstance(t.context.class)

  t.not(t.context.class.methodA, methodA)
  t.not(t.context.class.methodB, methodB)
  t.is(t.context.class._methodB, _methodB)
  t.is(t.context.class._methodC, _methodC)
  t.is(t.context.class.varD, varD)
  t.is(t.context.class.objE, objE)
  t.is(t.context.class.arrF, arrF)

  t.is(await t.context.class.methodA(), 42)
  t.is(t.context.class._methodB.callCount, 0)
  t.is(await t.context.class.methodB(), 42)
  t.is(t.context.class._methodB.callCount, 1)
  t.is(t.context.class._methodC(), 42)
  t.is(t.context.class.varD, 42)
  t.deepEqual(t.context.class.objE, {})
  t.deepEqual(t.context.class.arrF, [])
})

test('Use thenablelify to transform a methods, using a custom object filter, form a instance into a chain method that acts as a Promise', async t => {
  const {
    methodA,
    methodB,
    _methodB,
    _methodC,
    varD,
    objE,
    arrF
  } = t.context.class

  thenablelifyInstance(t.context.class, (name) => name === '_methodB')

  t.is(t.context.class.methodA, methodA)
  t.is(t.context.class.methodB, methodB)
  t.not(t.context.class._methodB, _methodB)
  t.is(t.context.class._methodC, _methodC)
  t.is(t.context.class.varD, varD)
  t.is(t.context.class.objE, objE)
  t.is(t.context.class.arrF, arrF)

  t.is(t.context.class.methodA(), 42)
  t.is(_methodB.callCount, 0)
  t.is(await t.context.class.methodB(), 42)
  t.is(_methodB.callCount, 1)
  t.is(t.context.class._methodC(), 42)
  t.is(t.context.class.varD, 42)
  t.deepEqual(t.context.class.objE, {})
  t.deepEqual(t.context.class.arrF, [])
})

test('Use thenablelify to transform only own methods form a instance (extended) into a chain method that acts as a Promise', async t => {
  const {
    methodA,
    methodB,
    methodB_,
    _methodB,
    _methodC,
    varD,
    objE,
    arrF
  } = t.context.class_

  thenablelifyInstance(t.context.class_)

  t.is(t.context.class_.methodA, methodA)
  t.is(t.context.class_.methodB, methodB)
  t.not(t.context.class_.methodB_, methodB_)
  t.is(t.context.class_._methodB, _methodB)
  t.is(t.context.class_._methodC, _methodC)
  t.is(t.context.class_.varD, varD)
  t.is(t.context.class_.objE, objE)
  t.is(t.context.class_.arrF, arrF)

  t.is(t.context.class_.methodA(), 42)
  t.is(t.context.class_._methodB.callCount, 0)
  t.is(t.context.class_.methodB(), 42)
  t.is(t.context.class_._methodB.callCount, 1)
  t.is(await t.context.class_.methodB_(), 42)
  t.is(t.context.class_._methodB.callCount, 2)
  t.is(t.context.class_._methodC(), 42)
  t.is(t.context.class_.varD, 42)
  t.deepEqual(t.context.class_.objE, {})
  t.deepEqual(t.context.class_.arrF, [])
})

test('Use thenablelify to transform own and parent methods form a instance (extended) into a chain method that acts as a Promise', async t => {
  const {
    methodA,
    methodB,
    methodB_,
    _methodB,
    _methodC,
    varD,
    objE,
    arrF
  } = t.context.class_

  thenablelifyInstance(t.context.class_, undefined, 1)

  t.not(t.context.class_.methodA, methodA)
  t.not(t.context.class_.methodB, methodB)
  t.not(t.context.class_.methodB_, methodB_)
  t.is(t.context.class_._methodB, _methodB)
  t.is(t.context.class_._methodC, _methodC)
  t.is(t.context.class_.varD, varD)
  t.is(t.context.class_.objE, objE)
  t.is(t.context.class_.arrF, arrF)

  t.is(await t.context.class_.methodA(), 42)
  t.is(t.context.class_._methodB.callCount, 0)
  t.is(await t.context.class_.methodB(), 42)
  t.is(t.context.class_._methodB.callCount, 1)
  t.is(await t.context.class_.methodB_(), 42)
  t.is(t.context.class_._methodB.callCount, 2)
  t.is(t.context.class_._methodC(), 42)
  t.is(t.context.class_.varD, 42)
  t.deepEqual(t.context.class_.objE, {})
  t.deepEqual(t.context.class_.arrF, [])
})
