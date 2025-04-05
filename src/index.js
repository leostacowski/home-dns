import { isPrimary } from 'cluster'
import { Boss, Worker } from './modules/process/index.js'

import configs from './config.js'

configs.setup()

if (isPrimary) {
  new Boss()
} else {
  new Worker()
}
