describe('Smoke Test', () => {
  it('loads the app', () => {
    cy.visit('/')
    // Check the page actually rendered something visible
    cy.get('body').should('be.visible')
    cy.get('#root').should('exist')
  })
})

describe('localStorage Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test for a clean state
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('localStorage is accessible and writable', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('test_key', 'test_value')
      expect(win.localStorage.getItem('test_key')).to.eq('test_value')
    })
  })

  it('data written to localStorage persists after page reload', () => {
    // Write test data
    cy.window().then((win) => {
      win.localStorage.setItem('lostfound_test', JSON.stringify({ id: 1, title: 'Test Item' }))
    })

    // Reload and verify data is still there
    cy.reload()

    cy.window().then((win) => {
      const stored = win.localStorage.getItem('lostfound_test')
      expect(stored).to.not.be.null
      const parsed = JSON.parse(stored)
      expect(parsed.title).to.eq('Test Item')
    })
  })

  it('localStorage can be cleared', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('lostfound_test', 'some_data')
      win.localStorage.removeItem('lostfound_test')
      expect(win.localStorage.getItem('lostfound_test')).to.be.null
    })
  })
})
