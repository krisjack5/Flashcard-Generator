var BasicFlashcard = require('./BasicCard.js');

var ClozeFlashcard = require('./ClozeCard.js');

var inquirer = require('inquirer');

var fs = require('fs');

inquirer.prompt([{
    name: 'command',
    message: 'What would you like to do?',
    type: 'list',
    choices: [{
        name: 'add card'
    }, {
        name: 'show cards'
    }]
}]).then(function(answer) {
    if (answer.command === 'add card') {
        addCard();
    } else if (answer.command === 'show cards') {
        showCards();
    }
});

var addCard = function() {
    inquirer.prompt([{
        name: 'cardType',
        message: 'What kind of flashcard do you want to make?',
        type: 'list',
        choices: [{
            name: 'basic-flashcard'
        }, {
            name: 'cloze-flashcard'
        }]
   
    }]).then(function(answer) {
        if (answer.cardType === 'basic-flashcard') {
            inquirer.prompt([{
                name: 'front',
                message: 'What is the question?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide a question');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'back',
                message: 'What is the answer?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide an answer');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var newBasic = new BasicFlashcard(answer.front, answer.back);
                newBasic.create();
                whatsNext();
            });
        } else if (answer.cardType === 'cloze-flashcard') {
            inquirer.prompt([{
                name: 'text',
                message: 'What is the full text?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide the full text');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'cloze',
                message: 'What is the cloze portion?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide the cloze portion');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var text = answer.text;
                var cloze = answer.cloze;
                if (text.includes(cloze)) {
                    var newCloze = new ClozeFlashcard(text, cloze);
                    newCloze.create();
                    whatsNext();
                } else {
                    console.log('The cloze portion you provided cannot be found. Please try again.');
                    addCard();
                }
            });
        }
    });
};

var whatsNext = function() {
    inquirer.prompt([{
        name: 'nextAction',
        message: 'What would you like to do next?',
        type: 'list',
        choices: [{
            name: 'create card'
        }, {
            name: 'show cards'
        }, {
            name: 'nothing'
        }]
    
    }]).then(function(answer) {
        if (answer.nextAction === 'create card') {
            addCard();
        } else if (answer.nextAction === 'show cards') {
            showCards();
        } else if (answer.nextAction === 'nothing') {
            return;
        }
    });
};

var showCards = function() {
    // Get info from log.txt file
    fs.readFile('./log.txt', 'utf8', function(error, data) {
        
        if (error) {
            console.log('Error occurred: ' + error);
        }
        var questions = data.split(';');
        var notBlank = function(value) {
            return value;
        };
        questions = questions.filter(notBlank);
        var count = 0;
        showQuestion(questions, count);
    });
};

var showQuestion = function(array, index) {
    question = array[index];
    var parsedQuestion = JSON.parse(question);
    var questionText;
    var correctReponse;
    if (parsedQuestion.type === 'basic') {
        questionText = parsedQuestion.front;
        correctReponse = parsedQuestion.back;
    } else if (parsedQuestion.type === 'cloze') {
        questionText = parsedQuestion.clozeDeleted;
        correctReponse = parsedQuestion.cloze;
    }
    inquirer.prompt([{
        name: 'response',
        message: questionText
    }]).then(function(answer) {
        if (answer.response === correctReponse) {
            console.log('Correct!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        } else {
            console.log('Wrong!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        }
    });
};