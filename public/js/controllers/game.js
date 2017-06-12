angular.module('mean.system')
.controller('GameController', ['$scope', 'game', '$timeout',
  '$location', 'MakeAWishFactsService', '$dialog', '$http',
  ($scope, game, $timeout, $location, MakeAWishFactsService,
      $dialog, $http) => {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.pickedCards = [];
    $scope.checkedBoxCount = 0;
    $scope.enableSendGuestInvite = false;
    const makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();

    const windw = this;

  // get the chat input tag from the DOM
    $scope.inputMessage = $('.inputMessage');

  // displays chat messages on client side
    const displayChatMessage = (senderName, senderAvatar,
    chatMessage, timeSent, self) => {
      const chatHtml = $.parseHTML(chatMessage);
      if (chatMessage === '') {
        return null;
      }
      let chatbox;
      if (self) {
        chatbox = 'row self';
      } else {
        chatbox = 'row other';
      }
      $('ul.messages').append(
        $(`<ul class="${chatbox}">`).append(
          $('<li class="col s2">').append(
            $('<img>').attr('src', `${senderAvatar}`)
          )
        ).append(
          $('<li class="col s10">').append(
            $('<div>').append(
              $('<p>').text(senderName)
            ).append(
              $('<span>').text(timeSent)
            )
          ).append(
            $('<p>').append(chatHtml)
          )
        )
      );
    };

    $.fn.followTo = function (pos) {
      const $this = this,
        $window = $(windw);

      $window.scroll((e) => {
        if ($window.scrollTop() > pos) {
          $this.css({
            position: 'absolute',
            bottom: -20
          });
        } else {
          $this.css({
            position: 'fixed',
            bottom: 10
          });
        }
      });
    };
    $('.tooltipped').tooltip({ delay: 50 });
    $(() => {
      $('.button-collapse').sideNav();
      $('.chat-header').on('click', () => {
        $('.chat-body').slideToggle();
        $('span.right').find('i').toggleClass('fa-caret-down fa-caret-up');
      });
      $('.fixed-card').followTo(80);

      // Initialise emojis on chat input element
      $scope.inputMessage.emojioneArea({
        hideSource: true,
        events: {
          keyup(editor, event) {
            const keyCode = event.keyCode;
            const el = event.target;
            const message = el.innerHTML;
            if (keyCode === 13 && message.length >= 1) {
              const timeSent = new Date(new Date().getTime())
              .toLocaleTimeString();
              const sender = game.players[game.playerIndex];
              const senderAvatar = sender.avatar;
              const senderName = sender.username;
              el.innerHTML = '';
              $scope.chatStatus = '';
              game.sendChatMessage(senderAvatar, message, timeSent, senderName);
              displayChatMessage(senderName, senderAvatar, message,
              timeSent, true);
            } else if ((keyCode === 13 && message.length === 0)
              || message.length === 0) {
              $scope.chatStatus = '';
            } else {
              const userName = game.players[game.playerIndex].username;
              $scope.chatStatus = 'You are typing...';
              game.sendChatMessage(userName, 'is typing...');
            }
          },
        }
      });
    });
      $scope.setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

$scope.getCookie = (cname) => {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
  }

$scope.checkCookie = () => {
  var user = $scope.getCookie("username");
      if (user === '') {
          $scope.setCookie("username", 'user', 365);
          setTimeout(function(){
            var intro = introJs();
          intro.setOptions({
            steps: [
              {
                intro: "Hi, I'm Jade. I'm super excited to be onboarding you to this game. Click Next to get Started. You can end the tour anytime by clicking Skip."
              },
              {
                element: document.querySelector('#startGame'),
                intro: "Questions will appear here"
              },
              {
                element: document.querySelector('#questions-bg'),
                intro: "Answer cards will appear here. Choose the best answer for the given question",
                position: 'top'
              },
              {
                element: document.querySelector('#time-wrap'),
                intro: "You'll have 20 seconds per question. Your time will appear here."
              },
              {
                element: document.querySelector('#click-tag'),
                intro: "Use this link to invite users who HAVE CFH accounts"
              },
              {
                element: document.querySelector('#click-tag2'),
                intro: "Use this link to invite users who DO NOT HAVE CFH accounts"
              },
              {
                element: document.querySelector('#player-bg'),
                intro: "This panel shows you the players in the game and the number of questions answered by each player. A player who answers 5 questions correctly WINS."
              },
              {
                element: document.querySelectorAll('#step2')[0],
                intro: "Ready? Get Started by inviting at least 3 players. Maximum number of players is 12",
                position: 'right'
              }
            ]
          });
          intro.start();
        }, 1000);
      } 
  }
    $scope.pickCard = (card) => {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&

          $scope.pickedCards.length === 2) {
          // delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = () => {
      if ($scope.isCzar() &&
      $scope.game.state === 'waiting for czar to decide') {
        return { cursor: 'pointer' };
      }
      return {};
    };


  /**
   * Search through a list of uers based on the input of the user
   * @function searchUser
   * @returns {object} - user
   */
    $scope.searchUser = () => {
      const searchString = $scope.searchString || ' ';
      $http.get(`http://localhost:3000/api/search/users/${searchString}/`)
    .success((response) => {
      $scope.users = response;
    });
    };
  /**
   * Counts the number of box checked by the user and
   * and returns the length
   * @function countCheckedBox
   * @returns {int} - No of checked box
   */
    $scope.countCheckedBox = () => {
      const userDetails = $scope.users.filter(user => (
      user.selected
    ));
      $scope.checkedBoxCount = userDetails.length;
    };

  /**
   * Check the typed email of guest to see if
   * it is valid
   * @function checkEmail
   * @returns {boolean}
   */
    $scope.checkEmail = () => {
      const filter = /^[\w\-.+]+@[a-zA-Z0-9.-]+\.[a-zA-z0-9]{2,4}$/;
      if (filter.test($scope.guestEmail)) $scope.enableSendGuestInvite = true;
    };

  /**
   * Send an email to the email added by the user
   * @function emailGuests
   * @returns {any} - Sends email
   */

  $scope.emailGuests = () => {
    const details = JSON.stringify(
      { name: 'Guest',
        email: $scope.guestEmail,
        url: `${encodeURIComponent(window.location.href)}` });
    $http.get(`http://localhost:3000/api/sendmail/${details}`);
    $scope.guestEmail = '';
  };

  /**
   * Send bulk invite emails to users
   * @function emailUsers
   * @returns {any} - send mail
   */
    $scope.emailUsers = () => {
      const userDetails = $scope.users.filter(user => (
      user.selected
    ));
      userDetails.forEach((email) => {
        const details = JSON.stringify(
          { name: email.name,
            email: email.email,
            url: `${encodeURIComponent(window.location.href)}` });
        $http.get(`http://localhost:3000/api/sendmail/${details}`);
      });
    };

    $scope.sendPickedCards = () => {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      }
      return false;
    };

    $scope.cardIsSecondSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      }
      return false;
    };

    $scope.firstAnswer = ($index) => {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.secondAnswer = ($index) => {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.showFirst = card => (
    game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id
  );

    $scope.showSecond = card => (
    game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id
  );

    $scope.isCzar = () => (
    game.czar === game.playerIndex
  );

    $scope.isPlayer = $index => (
    $index === game.playerIndex
  );

    $scope.isCustomGame = () => (
    !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players'
  );

    $scope.isPremium = $index => (
    game.players[$index].premium
  );

    $scope.currentCzar = $index => (
    $index === game.czar
  );

    $scope.winningColor = ($index) => {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      }
      return '#f9f9f9';
    };

    $scope.pickWinning = (winningSet) => {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = () => (
    game.winningCard !== -1
  );

    $scope.startGame = () => {
      game.startGame();
    };

    $scope.abandonGame = () => {
      game.leaveGame();
      $location.path('/');
    };

  // SHUFFLE CARD ANIMATION
  $scope.shuffleCards = () => {
      const card = $(`#${event.target.id}`);
      card.addClass('animated flipOutY');
      setTimeout(() => {
        $scope.startNextRound();
        card.removeClass('animated flipOutY');
        $('#shuffleModal').modal('close');
      }, 500);
    };

    $scope.startNextRound = () => {
      if ($scope.isCzar()) {
        game.startNextRound();
      }
    };

  // Catches changes to round to update when no players pick card
  // (because game.state remains the same)
    $scope.$watch('game.round', () => {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

  // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', () => {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }
      // AUDAX EDITTED HERE
    if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
             $('#shuffleModal').modal({
               dismissible: false
             });
             $('#shuffleModal').modal('open');
             // displayMessage('', '#card-modal');
           }
           if (game.state === 'game dissolved') {
             $('#shuffleModal').modal('close');
           }
           if ($scope.isCzar() === false && game.state === 'czar pick card'
             && game.state !== 'game dissolved'
             && game.state !== 'awaiting players' && game.table.length === 0) {
             $scope.czarHasDrawn = 'Wait! Czar is drawing Card';
           }
           if (game.state !== 'czar pick card'
             && game.state !== 'awaiting players'
             && game.state !== 'game dissolve') {
             $scope.czarHasDrawn = '';
           }
    });

  // Set watch on chat data from users on different sockets
    $scope.$watch('game.chat', () => {
      const chat = game.chat.data;
      if (chat !== undefined) {
        if (chat.message === 'is typing...') {
          $scope.chatStatus = `${chat.user}  ${chat.message}`;
        } else if (chat !== {}) {
          displayChatMessage(chat.senderName, chat.user,
        chat.message, chat.timeSent);
          $scope.chatStatus = '';
        } else {
          $scope.chatStatus = '';
        }
      }
    });


  });
  /**
   * Opens modal when share button is clicked
   * @function showModal1
   * @returns {any} - opens modal
   */
    $scope.showModal1 = () => {
      $('.modal').modal();
      $('#modal1').modal('open');
    };


   /**
   * Opens modal when share button is clicked
   * @function showModal2
   * @returns {any} - opens modal
   */
    $scope.showModal2 = () => {
      $('.modal').modal();
      $('#modal2').modal('open');
    };

    $scope.$watch('game.gameID', () => {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {

        // If the player didn't successfully enter the request room,
        // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
        // Once the game ID is set,
        // update the URL if this is a game with friends,
        // where the link is meant to be shared.
          $location.search({ game: game.gameID });
          if (!$scope.modalShown) {
            setTimeout(() => {
              const txt = '<i class="material-icons">insert_chart</i>';
              $('#lobby-how-to-play').hide();
              $('#oh-el').hide();
              $('#share-link')
            .css({ 'text-align': 'left', display: 'block' });
              $('#copy-link').text(txt);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }
  }]);
