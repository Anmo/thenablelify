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

test.beforeEach(t => {
  t.context.class = new C()
})

test('Normal object ', t => {
  t.is(t.context.class.methodA(), 42)
  t.is(t.context.class._methodB.callCount, 0)
  t.is(t.context.class.methodB(), 42)
  t.is(t.context.class._methodB.callCount, 1)
  t.is(t.context.class._methodC(), 42)
  t.is(t.context.class.varD, 42)
  t.deepEqual(t.context.class.objE, {})
  t.deepEqual(t.context.class.arrF, [])
})

test('cenas', async t => {
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

test('thenablelifyObj with custom object filter', async t => {
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
