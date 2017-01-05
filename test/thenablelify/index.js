import test from 'ava'
import sinon from 'sinon'

import thenablelify from '../../index'

sinon.stub(Math, 'random')
  .onCall(0).returns(0.2)
  .onCall(1).returns(0.8)
  .onCall(2).returns(0.8)
  .onCall(3).returns(0.2)

test.beforeEach(t => {
  t.context.obj = {
    methodA: () => 42,
    methodB: () => new Promise((resolve, reject) => {
      setTimeout(resolve, 1000, 24)
    }),
    methodC: () => {
      const rnd = Math.random()

      if (rnd <= 0.5) {
        return rnd
      }

      return new Promise((resolve, reject) => setTimeout(resolve, rnd * 1000, rnd))
    },
    methodD: () => { throw new Error('Something went wrong') }
  }

  t.context.thenablelify = thenablelify()
})

test('Having a function call directly', t => {
  t.is(t.context.obj.methodA(), 42)
})

test('Use thenablelify to transform a function into a chain method that acts as a Promise', async t => {
  t.context.thenablelify.thenablelifyHandler(t.context.obj, 'methodA')
  t.context.obj.then = t.context.thenablelify.returnThen

  t.is(t.context.obj.methodA(), t.context.obj)
  t.is(await t.context.obj.methodA(), 42)
})

test('Having a function, that returns a Promise, call directly', async t => {
  t.is(await t.context.obj.methodB(), 24)
})

test('Use thenablelify to transform a function, that returns a Promise, into a chain method that acts as a Promise', async t => {
  t.context.thenablelify.thenablelifyHandler(t.context.obj, 'methodB')
  t.context.obj.then = t.context.thenablelify.returnThen

  t.is(t.context.obj.methodB(), t.context.obj)
  t.is(await t.context.obj.methodB(), 24)
})

test.serial('Having a function, that randomly can return a Promise, call directly', async t => {
  t.is(t.context.obj.methodC(), 0.2)
  t.is(await t.context.obj.methodC(), 0.8)
})

test.serial('Use thenablelify to transform a function, that randomly can return a Promise, into a chain method that acts as a Promise', async t => {
  t.context.thenablelify.thenablelifyHandler(t.context.obj, 'methodC')
  t.context.obj.then = t.context.thenablelify.returnThen

  const prom = t.context.obj.methodC()

  t.is(prom, t.context.obj)
  t.is(await prom, 0.8)
  t.is(await t.context.obj.methodC(), 0.2)
})

test('Having a function, that throws an Error, call directly', async t => {
  t.throws(t.context.obj.methodD, Error, 'Something went wrong')
})

test('Use thenablelify to transform a function, that throws an Error, into a chain method that acts as a Promise', async t => {
  t.context.thenablelify.thenablelifyHandler(t.context.obj, 'methodD')
  t.context.obj.then = t.context.thenablelify.returnThen
  t.context.obj.catch = t.context.thenablelify.returnCatch

  const prom = t.context.obj.methodD()

  t.is(prom, t.context.obj)
  t.throws(prom, Error, 'Something went wrong')
})
