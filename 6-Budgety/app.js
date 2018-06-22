var budgetController = (function() {

	var Expense = function Expense(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function Income(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function calculateTotal(type) {
		var sum = 0;

		data.allItems[type].forEach(function(current, index, array) {
			sum += current.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: (function() {
			var ID = 0;

			return function addItem(type, des, val) {
				var newItem;

				if (type === 'exp') {
					newItem = new Expense(ID, des, val);
				} else if (type === 'inc') {
					newItem = new Income(ID, des, val);
				}

				ID++;

				data.allItems[type].push(newItem);

				return newItem;
			};
		})(),
		calculateBudget: function calculateBudget() {
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;
			
			data.percentage = data.totals.inc > 0 ? Math.round(data.totals.exp / data.totals.inc * 100) : -1;
		},
		getBudget: function getBudget() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		logData: function() {
			console.log(data);
		}
	}

})();

var UIController = (function() {

	var DOMSelectors = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage'
	}

	return {
		getInput: function getInput() {
			return {
				type: document.querySelector(DOMSelectors.inputType).value,
				description: document.querySelector(DOMSelectors.inputDescription).value,
				value: parseFloat(document.querySelector(DOMSelectors.inputValue).value)
			}
		},
		addListItem: function addListItem(obj, type) {

			var template, html, element;

			if (type === 'inc') {
				element = DOMSelectors.incomeContainer;

				template = `<div class="item clearfix" id="income-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
			} else if (type === 'exp') {
				element = DOMSelectors.expenseContainer;

				template = `<div class="item clearfix" id="expense-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
			}

			html = template.replace('%id%', obj.id)
							.replace('%description%', obj.description)
							.replace('%value%', obj.value);

			document.querySelector(element).insertAdjacentHTML('beforeend', html);
			
		},
		clearFields: function clearFields() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMSelectors.inputDescription + ', ' + DOMSelectors.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			});

			fieldsArr[0].focus();
		},
		displayBudget: function displayBudget(obj) {
			document.querySelector(DOMSelectors.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMSelectors.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMSelectors.expensesLabel).textContent = obj.totalExp;

			if (obj.percentage > 0) {
				document.querySelector(DOMSelectors.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMSelectors.percentageLabel).textContent = '---';
			}
		},
		getDOMSelectors: function getDOMSelectors() {
			return DOMSelectors;
		}
	};
})();

var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function setupEventListeners() {

		var DOMSelectors = UICtrl.getDOMSelectors();

		document.querySelector(DOMSelectors.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
	};

	var updateBudget = function updateBudget() {
		budgetCtrl.calculateBudget();

		var budget = budgetCtrl.getBudget();

		UICtrl.displayBudget(budget);
	};

	var ctrlAddItem = function ctrlAddItem() {
		var input, newItem;

		input = UICtrl.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			UICtrl.addListItem(newItem, input.type);

			UICtrl.clearFields();

			updateBudget();
		}
	};

	return {
		init: function init() {
			setupEventListeners();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
		}
	};

})(budgetController, UIController);

controller.init();