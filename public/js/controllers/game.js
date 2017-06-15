angular.module('mean.system')
  .controller('GameController', ['$scope', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', '$http', ($scope, game, $timeout,
    $location, MakeAWishFactsService, $dialog, $http) => {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.userFriends = [];
    $scope.pickedCards = [];
    $scope.checkedBoxCount = 0;
    $scope.enableSendGuestInvite = false;
    const makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();

    let windw = this;

    $.fn.followTo = function (pos) {
      let $this = this,
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
    });

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
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
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
        {
          name: 'Guest',
          email: $scope.guestEmail,
          url: `${encodeURIComponent(window.location.href)}`
        });
      $http.get(`http://localhost:3000/api/sendmail/${details}`);
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
          {
            name: email.name,
            email: email.email,
            url: `${encodeURIComponent(window.location.href)}`
          });
        $http.get(`http://localhost:3000/api/sendmail/${details}`);
      });
    };

    $scope.getFriends = () => {
      if ($scope.searchText === '') {
        $scope.userFriends = [];
      } else {
        $http.get('/friends', { params: { searchText: $scope.searchText, userId: window.user._id } })
          .success((response) => {
            $scope.userFriends = response;
          }, (error) => {
            console.log(error);
          }
          );
      }
    };

    $scope.addFriend = (friend, button) => {
      const userId = window.user._id;
      const url = button.target.baseURI;
      $http.post('/friends',
        {
          userId,
          friend,
          url
        })
        .success((response) => {
          if (response.succ === 'Successful') {
            setTimeout(() => {
              $scope.$apply(() => {
                if (response.action === 'addfriend') {
                  $scope.userFriends.push(response.friendId);
                } else {
                  const resultId = response.friendId;
                  const index = $scope.userFriends.indexOf(resultId);
                  if (index !== -1) {
                    $scope.userFriends.splice(index, 1);
                  }
                }
              });
            }, 100);
          }
        });
    };

    $scope.sendInvite = (friendId, event) => {
      const url = event.target.baseURI;
      const userName = { userName: window.user.name, userId: window.user._id };
      $http.post('/notify',
        {
          userName,
          friendId,
          url
        })
        .success((response) => {
          $scope.inviteMessage = response.status;
        });
    };
    $scope.deleteFriend = (friend, event) => {
      event.preventDefault();
      $http.get('/delete/friend', { params: { friend, userId: window.user._id } }).success((res) => {
        if (res === 'success') {
          let friendIndex = null;
          $scope.userFriends.forEach((friendId, index) => {
            if (friendId.userId === friend.userId) {
              friendIndex = index;
            } else {
              friendIndex = -1;
            }
          });
          if (friendIndex !== -1) {
            $scope.userFriends.splice(friendIndex, 1);
          }
        }
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

    /**
     * Opens modal when share button is clicked
     * @function showModal2
     * @returns {any} - opens modal
     */
    $scope.showModal3 = () => {
      $('.modal').modal();
      $('#modal3').modal('open');
      $scope.userFriends = [];
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
              let txt = '<i class="material-icons">insert_chart</i>';
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
      console.log('joining custom game');
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }
  }]);
