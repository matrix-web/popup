const taxDeductionButton = document.querySelector('#tax-deduction-button')
const popupOverlay = document.querySelector('#popup-overlay')
const popup = document.querySelector('#popup')
const popupInfo = document.querySelector('#popup-info')
const salaryInput = document.querySelector('#salary')
const calculateButton = document.querySelector('#calculate-button')

let errorObject = {}
let closing = false

taxDeductionButton.addEventListener('click', openPopup)
popup.addEventListener('click', closePopup)
popupOverlay.addEventListener('click', closePopup)
document.addEventListener('keyup', closePopup)

salaryInput.addEventListener('input', salaryUpdate)
salaryInput.addEventListener('keydown', salaryUpdate)
salaryInput.addEventListener('change', event => {
  const inputField = event.target
  errorObject = validateFeild(inputField)

  setTimeout(() => {
    renderError (errorObject, {
      whereSelector: '#salary-label',
      position: 'beforeend',
      inputField
    })
  }, 0)
})

calculateButton.addEventListener('click', () => {
  errorObject = validateFeild(salaryInput)

  if (!errorObject.invalid) {
    const taxDeductions = calculationTaxDeduction()

    renderTaxDeductionContainer({
      where: calculateButton,
      position: 'afterend'
    })

    setTimeout(() => {
      const taxDeductionContainer = document.querySelector('#tax-deductions-container')
      const taxDeductionContainerIsExists = document.body.contains(taxDeductionContainer)

      if (window.matchMedia("(max-width: 340px)").matches && taxDeductionContainerIsExists) {
        popupInfo.style.marginBottom = '3.33rem'
      }
    }, 0)

    renderTaxDeductionItem({
      taxDeductions,
      where: document.querySelector('#tax-deduction-list'),
      position: 'beforeend',
      formatSalary,
      declineEndings
    })

  } else {
    renderError (errorObject, {
      whereSelector: '#salary-label',
      position: 'beforeend',
      inputField: salaryInput
    })
  }
})

window.addEventListener('resize', () => {
  const taxDeductionContainer = document.querySelector('#tax-deductions-container')
  const taxDeductionContainerIsExists = document.body.contains(taxDeductionContainer)
  if ((window.matchMedia('(min-width: 400px)').matches && !taxDeductionContainerIsExists) || window.matchMedia('max-width: 340px') && taxDeductionContainerIsExists) {
    popupInfo.style.marginBottom = '2.86rem'
  } else {
    popupInfo.style.marginBottom = '12.7rem'
  }
})

function calculationTaxDeduction () {
  if (!errorObject.errors.length && !errorObject.invalid) {
    const monthSalary = +salaryInput.value.trim().replaceAll(/\D/g, '')

    const maxDeductionAmount = 260000
    
    let totalTaxDeduction = 0
    let year = 1
    const taxDeductions = []

    while (totalTaxDeduction < maxDeductionAmount) {
      let taxDeductionPerYear = (monthSalary * 12) * .13
      totalTaxDeduction += taxDeductionPerYear

      if (totalTaxDeduction < maxDeductionAmount) {
        taxDeductions.push({
          amountPerYear: taxDeductionPerYear,
          year: year++
        })
      } else {
        taxDeductionPerYear = maxDeductionAmount - (totalTaxDeduction - taxDeductionPerYear)
        taxDeductions.push({
          amountPerYear: taxDeductionPerYear,
          year: year++
        })
      }
    }

    return taxDeductions
  }
}

function validateFeild (field) {
  const monthSalary = +field.value.trim().replaceAll(/\D/g, '')
  const MROT = 12800
  const required = val => !!val
  const minValue = num => val => num >= val
  const errors = []

  if (!required(monthSalary)) {
    errors.push({
      type: 'empty',
      error: 'Поле обязательно для заполнения'
    })
  } else if (!minValue(monthSalary)(MROT)) {
    errors.push({
      type: 'invalid',
      error: 'Введите значение больше или равное МРОТ 12 800 рублей'
    })
  }

  return errors.length ? {errors, invalid: true} : {errors, invalid: false}
}

function clearElement (selector) {
  const deleteElement = document.querySelector(selector)

  deleteElement && deleteElement.remove()
}

function renderTaxDeductionContainer (options) {
  clearElement('#tax-deductions-container')

  const deductionContainer = `<div id="tax-deductions-container" class="tax-deductions popup__tax-deductions">
      <p>Итого можете внести в качестве досрочных:</p>
      <ul id="tax-deduction-list" class="tax-deductions-list"></ul>
    </div>`

  options.where.insertAdjacentHTML(options.position, deductionContainer)
}

function renderTaxDeductionItem (options) {
  if (options.hasOwnProperty('taxDeductions')) {
    options.taxDeductions.forEach(item => {
      const taxDeductionItem = `
      <li class="tax-deductions-list__item">
          <label class="checkbox">
            <input class="checkbox__real"  type="checkbox">
            <span class="checkbox__custom"></span>
            ${options.formatSalary(item.amountPerYear, 'ru-RU', {minimumFractionDigits: 0})} рублей в 
            <span class="grey-text">${item.year}-${options.declineEndings(item.year)} год</span>
          </label>
        </li>`

      options.where.insertAdjacentHTML(options.position, taxDeductionItem)
    })
  }
}

function renderError (errorObj, options) {
  const whereElement = document.querySelector(options.whereSelector)
  const helperTextElement = document.querySelector('#helper-text')

  if (whereElement.contains(helperTextElement)) {
    helperTextElement.remove()
  }

  if (errorObj.errors.length && errorObj.invalid) {
    errorObj.errors.forEach(error => {
      const errorElement = `<span id="helper-text" class="helper-text">${error.error}</span>`

      whereElement.insertAdjacentHTML(options.position, errorElement)
    })

    options.inputField.classList.add('input--invalid')
  } else {
    options.inputField.classList.remove('input--invalid')
  }
}

function declineEndings (number) {
  const unit = number % 10
  const dec = Math.floor(number / 10) % 10

  if (unit === 3 && (dec < 1 || dec >= 2)) {
    return 'ий'
  } else if ((dec < 1 || dec >= 2) && unit > 0 && (unit === 2 || unit === 6 || unit === 7 || unit === 8)) {
    return 'ой'
  } else if (dec === 1 && dec <= 2 && unit !== 3) {
    return 'ый'
  }

  return 'ый'
}

function salaryUpdate (event) {
  const val = event.target.value.trim().replaceAll(/\D/g, '')
  const length = val.length

  let formatted = formatSalary(val, 'ru-RU', {
    style: 'currency',
    minimumFractionDigits: 0,
    currency: 'RUB'
  })

  if (event?.code?.toLowerCase() === 'backspace') {
    val.substring(0, length - 1)
    event.target.value = val
  } else {
    event.target.value = formatted
  }
}

function formatSalary (value, locale, formatOptions) { 
  return new Intl.NumberFormat(locale, formatOptions).format(+value)
}

function removeClass (element, cssClass) {
  element.classList.remove(cssClass)
}

function addClass (element, cssClass) {
  element.classList.add(cssClass)
}

function openPopup () {
  addClass(popupOverlay, 'active')
  addClass(popup, 'active')
}

function closePopup (event) {
  const target = event.target
  const ANIMATION_SPEED = 300

  if (target.dataset.action === 'close') {
    removeClass(popupOverlay, 'active')
    removeClass(popup, 'active')
    closing = true
  }

  if (target.classList.contains('popup-overlay')) {
    removeClass(popupOverlay, 'active')
    removeClass(popup, 'active')
    closing = true
  }

  if (event?.code?.toLowerCase() === 'escape' && 
      popup.classList.contains('active') && 
      popupOverlay.classList.contains('active')) {
    removeClass(popupOverlay, 'active')
    removeClass(popup, 'active')
    closing = true
  }

  if (closing) {
    salaryInput.value = ''
    clearElement('#tax-deductions-container')
    window.matchMedia("(max-width: 340px)").matches && (popupInfo.style.marginBottom = '12.7rem')
  }

  setTimeout(() => {
    closing = false
  }, ANIMATION_SPEED)
}