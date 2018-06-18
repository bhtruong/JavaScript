(function() {
	var Question = function(question, choices, answer) {
		this.question = question;
		this.choices = choices;
		this.answer = answer;
	};

	Question.prototype.askQuestion = function() {
		console.log(this.question);

		for (var i = 0; i < this.choices.length; i++) {
			console.log(i + ": " + this.choices[i]);
		}
	};

	Question.prototype.checkAnswer = function(selectedAnswer) {
		var points = 0;

		if (this.answer === parseInt(selectedAnswer)) {
			console.log("Correct answer!");
			points = 1;
		} else {
			console.log("Wrong Answer. Try again");
		}

		return points;
	};

	var Game = function(questions) {
		this.questions = questions;
	};

	Game.prototype.promptUser = (function() {
		var score = 0;

		return function() {
			var index = Math.floor(Math.random() * this.questions.length);

			this.questions[index].askQuestion();
			var selectedAnswer = window.prompt("Please select the correct answer (just type the number).");
			score += questions[index].checkAnswer(selectedAnswer);

			console.log("Your current score is: " + score);
			console.log("-------------------------")

			return selectedAnswer;
		};
	})();

	var questions = [];

	questions.push(new Question("Where are you?", ["San Francisco", "New York", "Los Angeles"], 0));
	questions.push(new Question("Where is Gamora?!", ["Who is Gamora?!", "WHY is Gamora?!"], 1));

	var game = new Game(questions);

	while (game.promptUser() !== 'exit') {
	}
})();
