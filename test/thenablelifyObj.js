import test from 'ava'
import sinon from 'sinon'

import { thenablelifyObj } from '../index'

test.beforeEach(t => {
  t.context.obj = {
    methodA: () => 42,
    methodB: function () { return this._methodB() },
    _methodB: sinon.spy(() => 42),
    _methodC: () => 42,
    varD: 42,
    objE: {},
    arrF: []
  }
})

test('Normal object called each method', t => {
  t.is(t.context.obj.methodA(), 42)
  t.is(t.context.obj._methodB.callCount, 0)
  t.is(t.context.obj.methodB(), 42)
  t.is(t.context.obj._methodB.callCount, 1)
  t.is(t.context.obj._methodC(), 42)
  t.is(t.context.obj.varD, 42)
  t.deepEqual(t.context.obj.objE, {})
  t.deepEqual(t.context.obj.arrF, [])
})

test('thenablelifyObj with default object filter', async t => {
  const {
    methodA,
    methodB,
    _methodB,
    _methodC,
    varD,
    objE,
    arrF
  } = t.context.obj

  thenablelifyObj(t.context.obj)

  t.not(t.context.obj.methodA, methodA)
  t.not(t.context.obj.methodB, methodB)
  t.is(t.context.obj._methodB, _methodB)
  t.is(t.context.obj._methodC, _methodC)
  t.is(t.context.obj.varD, varD)
  t.is(t.context.obj.objE, objE)
  t.is(t.context.obj.arrF, arrF)

  t.is(await t.context.obj.methodA(), 42)
  t.is(t.context.obj._methodB.callCount, 0)
  t.is(await t.context.obj.methodB(), 42)
  t.is(t.context.obj._methodB.callCount, 1)
  t.is(t.context.obj._methodC(), 42)
  t.is(t.context.obj.varD, 42)
  t.deepEqual(t.context.obj.objE, {})
  t.deepEqual(t.context.obj.arrF, [])
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
  } = t.context.obj

  thenablelifyObj(t.context.obj, (name) => name === '_methodB')

  t.is(t.context.obj.methodA, methodA)
  t.is(t.context.obj.methodB, methodB)
  t.not(t.context.obj._methodB, _methodB)
  t.is(t.context.obj._methodC, _methodC)
  t.is(t.context.obj.varD, varD)
  t.is(t.context.obj.objE, objE)
  t.is(t.context.obj.arrF, arrF)

  t.is(t.context.obj.methodA(), 42)
  t.is(_methodB.callCount, 0)
  t.is(await t.context.obj.methodB(), 42)
  t.is(_methodB.callCount, 1)
  t.is(t.context.obj._methodC(), 42)
  t.is(t.context.obj.varD, 42)
  t.deepEqual(t.context.obj.objE, {})
  t.deepEqual(t.context.obj.arrF, [])
})
