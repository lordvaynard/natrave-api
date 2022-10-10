import Router from '@koa/router'

import  * as users  from './users/index.js'
import  * as tips  from './tips/index.js'
import  * as games  from './games/index.js'

export const router = new Router()

router.post('/users', users.create)
router.get('/login', users.login)

router.post('/tips', tips.create)

router.get('/games', games.list)

router.get('/:username', users.tips)