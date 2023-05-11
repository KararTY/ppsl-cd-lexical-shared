let component = 'SSR'

try {
  require('react')
  component = require('./Image.jsx')
} catch {}

module.exports = component
