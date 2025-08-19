const AtlasApp = {
  // --- Configuration ---
  config: {
    budget: {
      '🏡 Housing': ['Mortgage/Rent', 'Property Tax', 'Repairs'],
      '💡 Utilities': ['Electricity', 'Water', 'Gas', 'Internet'],
      '🛒 Food': ['Groceries', 'Dining Out'],
      '🚗 Transportation': [
        'Car Payment',
        'Gas/Fuel',
        'Public Transit',
        'Insurance',
      ],
      '⚕️ Healthcare': ['Health Insurance', 'Medications', 'Appointments'],
      '👨‍👩‍👧 Personal': ['Clothing', 'Education', 'Subscriptions', 'Hobbies'],
      '💰 Savings': ['Emergency Fund', 'Retirement', 'Investments'],
      '🎉 Entertainment': ['Events', 'Streaming', 'Vacations'],
      '🎁 Miscellaneous': ['Gifts', 'Donations'],
    },
    NECESSARY_CATEGORIES: [
      '🏡 Housing',
      '💡 Utilities',
      '🛒 Food',
      '🚗 Transportation',
      '⚕️ Healthcare',
    ],
  },

  // --- State ---
  state: {
    budgetChart: null,
  },

  // --- Cached DOM Elements ---
  elements: {},

  // --- Initialization ---
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.cacheDOMElements()
      this.setupEventListeners()
      this.handleNavigation()

      if (this.elements.budgetForm) {
        this.renderBudgetForm()
        this.loadData()
      }
      this.renderTransactions()
    })
  },

  cacheDOMElements() {
    this.elements.navLinks = document.querySelectorAll('.nav-link')
    this.elements.pages = document.querySelectorAll('.page')
    this.elements.budgetForm = document.getElementById('budgetForm')
    this.elements.expensesContainer =
      document.getElementById('expensesContainer')
    this.elements.resultsSection = document.getElementById('results')
    this.elements.budgetTypeRadios = document.querySelectorAll(
      'input[name="budgetFor"]'
    )
    this.elements.canvas = document.getElementById('budgetChart')
    this.elements.summaryCard = document.getElementById('summaryCard')
    this.elements.insightsCard = document.getElementById('insightsCard')
    this.elements.transactionList = document.querySelector(
      '#dashboard .transaction-list'
    )
  },

  // --- Event Handling ---
  setupEventListeners() {
    this.elements.navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault()
        this.handleNavigation(link.getAttribute('href'))
      })
    })

    if (this.elements.budgetForm) {
      this.elements.budgetTypeRadios.forEach((radio) =>
        radio.addEventListener('change', () => this.toggleCoupleMode())
      )
      this.elements.budgetForm.addEventListener('submit', (e) =>
        this.handleBudgetSubmit(e)
      )
    }
  },

  handleBudgetSubmit(event) {
    event.preventDefault()
    const formData = new FormData(this.elements.budgetForm)
    const dataToSave = Object.fromEntries(formData.entries())
    const results = this.calculateBudget(dataToSave)

    this.saveData(dataToSave)
    this.saveTransactions(dataToSave)

    this.displayResults(results)
    this.renderTransactions()
  },

  // --- Navigation ---
  handleNavigation(hash) {
    const targetId = hash || window.location.hash || '#dashboard'
    window.location.hash = targetId

    this.elements.pages.forEach((page) => {
      page.classList.toggle('active', '#' + page.id === targetId)
    })

    this.elements.navLinks.forEach((navLink) => {
      navLink.classList.toggle(
        'active',
        navLink.getAttribute('href') === targetId
      )
    })
  },

  // --- Budget Planner ---
  renderBudgetForm() {
    if (!this.elements.expensesContainer) return
    let html = ''
    for (const category in this.config.budget) {
      html += `<div class="category-grid"><h4 class="category-title">${category}</h4>`
      this.config.budget[category].forEach((item) => {
        const id = item.toLowerCase().replace(/[^a-z0-9]/g, '')
        html += `
                    <div class="input-grid">
                        <label for="${id}">${item}</label>
                        <div class="form-group user-input">
                            <input type="number" id="${id}" name="${id}" min="0" step="10" placeholder="$0" data-category="${category}">
                        </div>
                        <div class="form-group partner-input hidden">
                            <input type="number" id="${id}Partner" name="${id}Partner" min="0" step="10" placeholder="$0" data-category="${category}">
                        </div>
                    </div>`
      })
      html += `</div>`
    }
    this.elements.expensesContainer.innerHTML = html
  },

  toggleCoupleMode() {
    const isCouple =
      document.querySelector('input[name="budgetFor"]:checked').value ===
      'couple'
    document
      .querySelectorAll('.partner-input')
      .forEach((el) => el.classList.toggle('hidden', !isCouple))
  },

  calculateBudget(data) {
    const isCouple = data.budgetFor === 'couple'
    const results = {
      user: {
        income: +data.userIncome || 0,
        expenses: 0,
        necessary: 0,
        discretionary: 0,
      },
      partner: {
        income: +data.partnerIncome || 0,
        expenses: 0,
        necessary: 0,
        discretionary: 0,
      },
      categoryTotals: {},
    }

    for (const key in data) {
      if (['budgetFor', 'userIncome', 'partnerIncome'].includes(key)) continue
      const amount = +data[key] || 0
      if (amount === 0) continue

      const element = this.elements.budgetForm.elements[key]
      if (!element || !element.dataset) continue

      const category = element.dataset.category
      results.categoryTotals[category] =
        (results.categoryTotals[category] || 0) + amount
      const isNecessary = this.config.NECESSARY_CATEGORIES.includes(category)

      if (key.includes('Partner')) {
        results.partner.expenses += amount
        results.partner[isNecessary ? 'necessary' : 'discretionary'] += amount
      } else {
        results.user.expenses += amount
        results.user[isNecessary ? 'necessary' : 'discretionary'] += amount
      }
    }

    results.totalIncome =
      results.user.income + (isCouple ? results.partner.income : 0)
    results.totalExpenses =
      results.user.expenses + (isCouple ? results.partner.expenses : 0)
    results.surplus = results.totalIncome - results.totalExpenses
    return results
  },

  // --- Display & Rendering ---
  displayResults(results) {
    this.renderSummaryCard(results)
    this.renderInsightsCard(results)
    this.renderChart(results.categoryTotals)

    this.elements.resultsSection.classList.remove('hidden')
    this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' })
  },

  renderSummaryCard(results) {
    const currency = (val) =>
      val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    this.elements.summaryCard.innerHTML = `
            <h3>Summary</h3>
            <p><span>Total Income:</span> <span>${currency(results.totalIncome)}</span></p>
            <p><span>Total Expenses:</span> <span>${currency(results.totalExpenses)}</span></p>
            <hr>
            <p><strong>Final Balance:</strong> <strong class="${results.surplus >= 0 ? 'surplus' : 'deficit'}">${currency(results.surplus)}</strong></p>`
  },

  renderInsightsCard(results) {
    let insightsHTML = ''
    if (results.surplus > 0)
      insightsHTML += `<p>Great job! You have a surplus. Consider allocating more to savings or investments.</p>`
    else if (results.surplus < 0)
      insightsHTML += `<p>You're in a deficit. Review your discretionary spending to find areas to cut back.</p>`
    else
      insightsHTML += `<p>Your budget is balanced. Aim to create a surplus for unexpected costs.</p>`

    const userDiscretionaryPercent =
      results.user.expenses > 0
        ? ((results.user.discretionary / results.user.expenses) * 100).toFixed(
            0
          )
        : 0
    insightsHTML += `<p>Your discretionary spending makes up <strong>${userDiscretionaryPercent}%</strong> of your expenses.</p>`

    const isCouple =
      document.querySelector('input[name="budgetFor"]:checked').value ===
      'couple'
    if (isCouple && results.partner.expenses > 0) {
      const partnerDiscretionaryPercent = (
        (results.partner.discretionary / results.partner.expenses) *
        100
      ).toFixed(0)
      insightsHTML += `<p>Your partner's discretionary spending is <strong>${partnerDiscretionaryPercent}%</strong> of their expenses.</p>`
    }
    this.elements.insightsCard.innerHTML = `<h3>Financial Insights 💡</h3>${insightsHTML}`
  },

  renderChart(categoryData) {
    if (this.state.budgetChart) this.state.budgetChart.destroy()

    this.state.budgetChart = new Chart(this.elements.canvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryData),
        datasets: [
          {
            label: 'Expenses by Category',
            data: Object.values(categoryData),
            backgroundColor: [
              '#4A90E2',
              '#50E3C2',
              '#F5A623',
              '#F8E71C',
              '#BD10E0',
              '#7ED321',
              '#9013FE',
              '#B8E986',
              '#417505',
              '#E94E77',
            ],
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.label || ''}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed)}`,
            },
          },
        },
      },
    })
  },

  // --- Data Persistence & Transactions ---
  saveData(data) {
    localStorage.setItem('atlasBudget', JSON.stringify(data))
  },

  saveTransactions(data) {
    let transactions =
      JSON.parse(localStorage.getItem('atlasTransactions')) || []
    const newTransactions = []

    const itemToCategoryMap = {}
    for (const category in this.config.budget) {
      this.config.budget[category].forEach((item) => {
        const id = item.toLowerCase().replace(/[^a-z0-9]/g, '')
        itemToCategoryMap[id] = category
        itemToCategoryMap[id + 'Partner'] = category
      })
    }

    if (+data.userIncome > 0) {
      newTransactions.push({
        description: 'Your Income',
        category: 'Income',
        amount: +data.userIncome,
      })
    }
    if (+data.partnerIncome > 0) {
      newTransactions.push({
        description: "Partner's Income",
        category: 'Income',
        amount: +data.partnerIncome,
      })
    }

    for (const key in data) {
      const amount = +data[key] || 0
      if (
        amount > 0 &&
        !['budgetFor', 'userIncome', 'partnerIncome'].includes(key)
      ) {
        const element = this.elements.budgetForm.elements[key]
        const description = element
          .closest('.input-grid')
          .querySelector('label').textContent
        newTransactions.push({
          description: description,
          category: itemToCategoryMap[key] || 'Miscellaneous',
          amount: -amount,
        })
      }
    }

    transactions = [...newTransactions, ...transactions]
    if (transactions.length > 10) {
      transactions = transactions.slice(0, 10)
    }
    localStorage.setItem('atlasTransactions', JSON.stringify(transactions))
  },

  renderTransactions() {
    if (!this.elements.transactionList) return

    const transactions =
      JSON.parse(localStorage.getItem('atlasTransactions')) || []
    this.elements.transactionList.innerHTML = ''

    if (transactions.length === 0) {
      this.elements.transactionList.innerHTML =
        '<li class="transaction-item"><div class="transaction-info"><div class="description">No recent transactions.</div></div></li>'
      return
    }

    const currency = (val) =>
      val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    transactions.forEach((tx) => {
      const item = document.createElement('li')
      item.className = 'transaction-item'

      const amountClass = tx.amount >= 0 ? 'positive' : ''
      const sign = tx.amount >= 0 ? '+' : '-'

      item.innerHTML = `
                <div class="transaction-info">
                    <div class="description">${tx.description}</div>
                    <div class="category">${tx.category}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${sign}${currency(Math.abs(tx.amount))}
                </div>
            `
      this.elements.transactionList.appendChild(item)
    })
  },

  loadData() {
    const savedDataJSON = localStorage.getItem('atlasBudget')
    if (!savedDataJSON) return

    try {
      const savedData = JSON.parse(savedDataJSON)
      let hasValues = false

      for (const key in savedData) {
        const value = savedData[key]
        if (value && key !== 'budgetFor') hasValues = true
        const element = this.elements.budgetForm.elements[key]
        if (!element) continue
        if (element instanceof RadioNodeList) {
          for (const radio of element) {
            if (radio.value === value) radio.checked = true
          }
        } else {
          element.value = value
        }
      }

      this.toggleCoupleMode()

      if (hasValues) {
        this.elements.budgetForm.dispatchEvent(
          new Event('submit', { cancelable: true })
        )
      }
    } catch (e) {
      console.error('Failed to load or parse saved budget data.', e)
      localStorage.removeItem('atlasBudget')
    }
  },
}

AtlasApp.init()
