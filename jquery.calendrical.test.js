var jQuery = require('jquery')
require('./jquery.calendrical')()

describe('calendrical plugin', () => {
	var node

	beforeEach(() => {
		node = jQuery('<div></div>')
	})

	it('adds calendricalDate function', () => {
		expect(node.calendricalDate).toBeInstanceOf(Function)
	})

	it('adds calendricalDateRange function', () => {
		expect(node.calendricalDateRange).toBeInstanceOf(Function)
	})

	it('adds calendricalTime function', () => {
		expect(node.calendricalTime).toBeInstanceOf(Function)
	})

	it('adds calendricalTimeRange function', () => {
		expect(node.calendricalTimeRange).toBeInstanceOf(Function)
	})

	it('adds calendricalDateTimeRange function', () => {
		expect(node.calendricalDateTimeRange).toBeInstanceOf(Function)
	})
})