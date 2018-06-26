var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentages = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		data.totals[type] = 0;

		data.allItems[type].forEach(function(current, index, array) {
			data.totals[type] += current.value;
		});
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

			return function(type, des, val) {
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
		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;
			
			data.percentage = data.totals.inc > 0 ? Math.round(data.totals.exp / data.totals.inc * 100) : -1;
		},
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentages(data.totals.inc);
			});
		},
		getPercentages: function() {
			return data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
		},
		getBudget: function() {
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
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	}

	var formatNumber = function(num, type) {
		var numSplit, inc, dec, sign;

		num = Math.abs(num).toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
		}

		dec = numSplit[1];

		sign = type === 'exp' ? '-' : '+';

		return sign + ' ' + int + '.' + dec;
	};

	var nodeListForEach = function(nodeList, callback) {
		for (var i = 0; i < nodeList.length; i++) {
			callback(nodeList[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMSelectors.inputType).value,
				description: document.querySelector(DOMSelectors.inputDescription).value,
				value: parseFloat(document.querySelector(DOMSelectors.inputValue).value)
			}
		},
		addListItem: function(obj, type) {

			var template, html, element;

			if (type === 'inc') {
				element = DOMSelectors.incomeContainer;

				template = `<div class="item clearfix" id="inc-%id%">
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

				template = `<div class="item clearfix" id="exp-%id%">
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
							.replace('%value%', formatNumber(obj.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', html);
			
		},
		deleteListItem: function(selectorID) {
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},
		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMSelectors.inputDescription + ', ' + DOMSelectors.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			});

			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type = obj.budget >= 0 ? 'inc' : 'exp';

			document.querySelector(DOMSelectors.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMSelectors.incomeLabel).textContent = formatNumber(obj.totalInc, type);
			document.querySelector(DOMSelectors.expensesLabel).textContent = formatNumber(obj.totalExp, type);

			if (obj.percentage > 0) {
				document.querySelector(DOMSelectors.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMSelectors.percentageLabel).textContent = '---';
			}
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMSelectors.expensesPercLabel);

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		displayDate: function() {
			var months = ['Januray', 'February', 'March', 'April',
							'May', 'June', 'July', 'August',
							'September', 'Octoboer', 'November', 'December'];

			var now = new Date();

			document.querySelector(DOMSelectors.dateLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();
		},
		changedType: function() {
			var selectors, fields;

			selectors = DOMSelectors.inputType + ', ' + DOMSelectors.inputDescription + ', ' + DOMSelectors.inputValue;

			fields = document.querySelectorAll(selectors);

			nodeListForEach(fields, function(current) {
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMSelectors.inputBtn).classList.toggle('red');
		},
		getDOMSelectors: function() {
			return DOMSelectors;
		}
	};
})();

var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {

		var DOMSelectors = UICtrl.getDOMSelectors();

		document.querySelector(DOMSelectors.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOMSelectors.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOMSelectors.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {
		budgetCtrl.calculateBudget();

		var budget = budgetCtrl.getBudget();

		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		budgetCtrl.calculatePercentages();
		var percentages = budgetCtrl.getPercentages();
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;

		input = UICtrl.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			UICtrl.addListItem(newItem, input.type);

			UICtrl.clearFields();

			updateBudget();

			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			budgetCtrl.deleteItem(type, ID);

			UICtrl.deleteListItem(itemID);

			updateBudget();
		}
	};

	return {
		init: function() {
			setupEventListeners();
			UICtrl.displayDate();
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