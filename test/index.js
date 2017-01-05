import test from 'ava'

import thenablelify, { thenablelifyObj, thenablelifyInstance } from '../index'

test('module typeof\'s', t => {
  t.is(typeof thenablelify, 'function')
  t.is(typeof thenablelifyObj, 'function')
  t.is(typeof thenablelifyInstance, 'function')
})

test('default module typeof', t => {
  const _thenablelify = thenablelify()

  t.is(typeof _thenablelify, 'object')
  t.is(typeof _thenablelify.thenablelifyHandler, 'function')
  t.is(typeof _thenablelify.thenablelifyHandler({}), 'function')
  t.is(typeof _thenablelify.returnThen, 'function')
  t.is(typeof _thenablelify.returnCatch, 'function')
})

test('default module typeof (pre targeted)', t => {
  const _thenablelify = thenablelify({})

  t.is(typeof _thenablelify, 'object')
  t.is(typeof _thenablelify.thenablelifyHandler, 'function')
  t.is(typeof _thenablelify.returnThen, 'function')
  t.is(typeof _thenablelify.returnCatch, 'function')
})
