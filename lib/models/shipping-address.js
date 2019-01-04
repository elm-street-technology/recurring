'use strict'

const Account = require('./account')
const RecurlyData = require('../recurly-data')
const handleRecurlyError = require('../util').handleRecurlyError
const data2xml = require('data2xml')({
  undefined: 'empty',
  null: 'closed'
})

class ShippingAddress extends RecurlyData {
  constructor(recurring) {
    super({
      recurring,
      properties: [
        'id',
        'account',
        'nickname',
        'first_name',
        'last_name',
        'company',
        'phone',
        'email',
        'vat_number',
        'address1',
        'address2',
        'city',
        'state',
        'zip',
        'country',
        'created_at',
        'updated_at'
      ],
      idField: 'id',
      plural: 'shipping_addresses',
      singular: 'shipping_address',
      enumerable: true
    })

    this.__defineGetter__('account_code', () => {
      if (this._account_code) {
        return this._account_code
      }
      if (!this._resources.account) {
        return undefined
      }

      // The account property points to a hash with an href that can be used to fetch
      // the account, but sometimes I want the id.
      this._account_code = this._resources.account.match(/\/([^\/]*)$/)[1]
      return this._account_code
    })

    this.__defineSetter__('account_code', id => {
      this._account_code = id
    })

    // Override the default href getter to accommodate the nested ID path
    this.__defineGetter__('href', function() {
      if (this._href) {
        return this._href
      }

      if (!this.account_code) {
        throw (new Error('shipping addresses require an account_code'))
      }

      this._href = [Account.ENDPOINT, this.account_code, 'shipping_addresses', this.id].join('/')
      return this._href
    })
  }

  static get SINGULAR() {
    return 'shipping_address'
  }

  static get PLURAL() {
    return 'shipping_addresses'
  }

  static get ENDPOINT() {
    throw new Error('Shipping Address does not have a static endpoint')
  }

  create(options, callback) {
    if (!options.first_name) {
      throw (new Error('shipping address must include "first_name" parameter'))
    }

    if (!options.last_name) {
      throw (new Error('shipping address must include "last_name" parameter'))
    }

    if (!options.address1) {
      throw (new Error('shipping address must include "address1" parameter'))
    }

    if (!options.city) {
      throw (new Error('shipping address must include "city" parameter'))
    }

    if (!options.state) {
      throw (new Error('shipping address must include "state" parameter'))
    }

    if (!options.zip) {
      throw (new Error('shipping address must include "zip" parameter'))
    }

    if (!options.country || options.country.length !== 2) {
      throw (new Error('shipping address must include 2 letter ISO "country" parameter'))
    }

    const body = data2xml(ShippingAddress.SINGULAR, options)
    this.post(this.href, body, (err, response, payload) => {
      const error = handleRecurlyError(err, response, payload, [ 201 ])
      if (error) {
        return callback(error)
      }

      this.inflate(payload)
      callback(null, this)
    })
  }

  update(options, callback) {
    if (!this.id) {
      throw (new Error('shipping address must have an "id" property'))
    }

    const body = data2xml(ShippingAddress.SINGULAR, options)

    this.put(this.href, body, (err, response, payload) => {
      const error = handleRecurlyError(err, response, payload, [ 200 ])
      if (error) {
        return callback(error)
      }

      this.inflate(payload)
      callback(null, this)
    })
  }
}

module.exports = ShippingAddress
