angular.module('mean.directives', [])
  .directive('player', function (){
    return {
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
        // scope.colors = ['#7CE4E8', '#FFFFa5', '#FC575E', '#F2ADFF', '#398EC4', '#8CFF95'];
        scope.colors = [
          '#64b5f6', '#fbe9e7', '#b2dfdb', '#ff5252', '#8cbcff', '#4febf2',
          '#f57c00', '#b2ebf2', '#4db6ac', '#82b1ff', '#dce775', '#e040fb'
        ];
      }
    };
  }).directive('answers', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/answers.html',
      link: function(scope, elem, attr) {

        scope.$watch('game.state', function() {
          if (scope.game.state === 'winner has been chosen') {
            var curQ = scope.game.curQuestion;
            var curQuestionArr = curQ.text.split('_');
            var startStyle = "<span style='color: "+scope.colors[scope.game.players[scope.game.winningCardPlayer].color]+"'>";
            var endStyle = "</span>";
            var shouldRemoveQuestionPunctuation = false;
            var removePunctuation = function(cardIndex) {
              var cardText = scope.game.table[scope.game.winningCard].card[cardIndex].text;
              if (cardText.indexOf('.',cardText.length-2) === cardText.length-1) {
                cardText = cardText.slice(0,cardText.length-1);
              } else if ((cardText.indexOf('!',cardText.length-2) === cardText.length-1 ||
                cardText.indexOf('?',cardText.length-2) === cardText.length-1) &&
                cardIndex === curQ.numAnswers-1) {
                shouldRemoveQuestionPunctuation = true;
              }
              return cardText;
            };
            if (curQuestionArr.length > 1) {
              var cardText = removePunctuation(0);
              curQuestionArr.splice(1,0,startStyle+cardText+endStyle);
              if (curQ.numAnswers === 2) {
                cardText = removePunctuation(1);
                curQuestionArr.splice(3,0,startStyle+cardText+endStyle);
              }
              curQ.text = curQuestionArr.join("");
              // Clean up the last punctuation mark in the question if there already is one in the answer
              if (shouldRemoveQuestionPunctuation) {
                if (curQ.text.indexOf('.',curQ.text.length-2) === curQ.text.length-1) {
                  curQ.text = curQ.text.slice(0,curQ.text.length-2);
                }
              }
            } else {
              curQ.text += ' '+startStyle+scope.game.table[scope.game.winningCard].card[0].text+endStyle;
            }
          }
        });
      }
    };
  }).directive('question', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/question.html',
      link: function(scope, elem, attr) {}
    };
  })
  .directive('timer', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/timer.html',
      link: function(scope, elem, attr){}
    };
  }).directive('landing', function() {
    return {
      restrict: 'EA',
      link: function(scope, elem, attr) {
        scope.showOptions = true;

        if (scope.$$childHead.global.authenticated === true) {
          scope.showOptions = false;
        }
      }
    };
  }).directive('leaderboard', ['$http', $http => ({
    restrict: 'EA',
    link: (scope) => {
      $http.get('/api/leaderboard')
        .success((response) => {
          scope.leaderboard = response;
        });
    },
    template:
    `
    <div class="no-data" ng-show="leaderboard.length === 0">
      No leader board yet.
    </div>
    <div class= "leader-board" ng-show="leaderboard.length>0" >
    <table class="table table-inverse dashboard-table highlight bordered">
      <thead>
        <tr>
          <th> Rank </th>
          <th class="bordered"> Player </th>
          <th class="bordered"> Number of Wins </th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="player in leaderboard track by $index">
          <td> {{$index + 1}} </td>
          <td> {{player.name}} </td>
          <td> {{player.gamesWon}} </td>
         </tr>
      </tbody>
    </table>
    </div>
    `,
  })]).directive('history', ['$http', '$window', ($http, $window) => ({
   restrict: 'EA',
   link: (scope) => {
     const userName = $window.user.name;
     $http.get('/api/games/history')
       .success((response) => {
         scope.gameHistory = response;
       });
   },
   template:
   `
   <div class="no-data" ng-show="gameHistory.length === 0">
     You have not Played any game yet.
   </div>
   <div class="leader-board">
   <div class="game-history" ng-repeat="game in gameHistory">
         <table class="table dashboard-table game-table">
           <thead>
             <tr>
               <th>Game ID</th>
               <th> Date Played</th>
               <th class="bordered"> Game Initiator </th>
               <th class="bordered"> Game Players</th>
                <th class="bordered"> Game Winner</th>
             </tr>
           </thead>
           <tbody>
             <tr>
             <td>
             <p id="game-id"> {{game.gameID}} </p>
             </td>
             <td>  <p id="game-date">
               <i class="fa fa-calendar"></i>
               {{game.dateplayed.split('T')[0]}}
               </p></td>
               <td>
               <p id="game-initiator"> {{game.owner.name}} </p>
               </td>
               <td>
                 <p  class= "players" ng-repeat="player in game.players track by $index">
                   {{player.name}} : {{player.points}}
                 </p>
               </td>
               <td> {{game.winner.name}} </td>
             </tr>
           </tbody>
         </table>
    </div>
   </div>

      `,
 })]).directive('donations', ['$http', '$window', ($http, $window) => ({
   restrict: 'EA',
   link: ($scope) => {
     const userName = $window.user.name;
     $http.get('/api/donations')
       .success((response) => {
         $scope.userDonations = response;
       });
   },
   template:
   `
   <div class="no-data" ng-show="userDonations.length === 0">
     No Donations Yet!
   </div>
   <div class="leader-board">
   <table class="table dashboard-table" ng-show="userDonations.length > 0">
     <thead>
       <tr>
         <th>
           Donor
         </th>
         <th class="bordered">
           Donation Count
         </th>
       </tr>
     </thead>
     <tbody>
       <tr ng-repeat="player in userDonations">
         <td>{{player.name}}</td>
         <td>{{player.donations[0]}}</td>
        </tr>
     </tbody>
   </table>
   </div>

   `,
 })]);
