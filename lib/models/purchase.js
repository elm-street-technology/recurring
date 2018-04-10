'use strict'

const RecurlyData = require('../recurly-data')
const handleRecurlyError = require('../util').handleRecurlyError
const data2xml = require('data2xml')({
  undefined: 'empty',
  null: 'closed'
})

class Purchase extends RecurlyData {
  constructor(recurring) {
    super({
      recurring,
      properties: [
        'account',
        'adjustments',
        'collection_method',
        'currency',
        'po_number',
        'net_terms',
        'gift_card',
        'coupon_codes',
        'subscriptions',
        'customer_notes',
        'terms_and_conditions',
        'vat_reverse_charge_notes',
        'shipping_address_id'
      ],
      idField: 'uuid',
      plural: 'purchases',
      singular: 'purchase',
      enumerable: true
    })
  }

  static get SINGULAR() {
    return 'purchase'
  }

  static get PLURAL() {
    return 'purchases'
  }

  static get ENDPOINT() {
    return `${RecurlyData.ENDPOINT}${Purchase.PLURAL}`
  }

  create(options, callback) {
    if (!options.account) {
      throw (new Error('purchase must include "account" information'))
    }
    if (!options.subscriptions && !options.adjustments) {
      throw (new Error('purchase must include either "subscriptions" or "adjustments"'))
    }
    if (options.adjustments && !options.currency) {
      throw (new Error('purchase must include "currency" parameter when "adjustments" exist'))
    }

    const body = data2xml(Purchase.SINGULAR, options)
    this.post(Purchase.ENDPOINT, body, (err, response, payload) => {
      const error = handleRecurlyError(err, response, payload, [ 200, 201, 204 ])
      if (error) {
        return callback(error)
      }

      this.inflate(payload)
      callback(null, this)
    })
  }

  preview(options, callback) {
    const href = `${Purchase.ENDPOINT}/preview`

    if (!options.account) {
      throw (new Error('preview must include "account" information'))
    }
    if (!options.subscriptions && !options.adjustments) {
      throw (new Error('preview must include either "subscriptions" or "adjustments"'))
    }
    if (options.adjustments && !options.currency) {
      throw (new Error('preview must include "currency" parameter when "adjustments" exist'))
    }

    const body = data2xml(Purchase.SINGULAR, options)
    this.post(href, body, (err, response, payload) => {
      const error = handleRecurlyError(err, response, payload, [ 200, 201, 204 ])
      if (error) {
        return callback(error)
      }

      this.inflate(payload)
      callback(null, this)
    })
  }

}

module.exports = Purchase
