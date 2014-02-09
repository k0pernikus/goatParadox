(function(document, $, alertify) {
    "use strict";

    var $document = $(document);

    var GameMaster = {
        doors: null,
        playerHasSelectedDoor: false,
        remainingDoor: false,
        selectedDoor: null,
        jackpotDoor: null,
        stickCounter: null,
        changeCounter: null,
        openAllDoorsExceptSelectedAndRemaing: function() {
            $.each(this.doors, function () {
                if (!this.isSelected ) {

                    this.$el.removeClass('is-selectable');
                }
            });

            this.remainingDoor.$el.addClass('is-selectable');
        },
        bind: function () {
            var self = this;

            $document.on('informAboutDoors', function (event, doors) {
                self.doors = doors;
            });

            $document.on('informAboutJackpotDoor', function (event, jackPotDoor) {
                self.jackpotDoor = jackPotDoor;
            });

            $document.on('doorSelection', function (event, selectedDoor) {
                if (!self.playerHasSelectedDoor) {
                    self.selectedDoor = selectedDoor;
                    self.playerHasSelectedDoor = true;
                    selectedDoor.$el.addClass('selectedByPlayer');

                    self.remainingDoor = self.jackpotDoor;

                    if (self.selectedDoor === self.jackpotDoor) {
                        var randomDoor;
                        do {
                            randomDoor = self.doors[Math.floor(Math.random() * self.doors.length)];
                        } while (randomDoor === self.jackpotDoor && randomDoor.isSelected);
                        self.remainingDoor = randomDoor;
                    }

                    self.openAllDoorsExceptSelectedAndRemaing();
                    $document.trigger('askForChange');
                }
            });

            $document.on('askForChange', function () {
                var message = 'Do you want to stick with your choice?';
                alertify.set({labels:{
                    cancel: "I want to switch!",
                    ok: "I want to stay!"
                }});

                alertify.confirm(message, function(playerWantsToStayOnCurrentChoice) {
                    if (playerWantsToStayOnCurrentChoice) {
                        $document.trigger('stickWithSelectedDoor');
                    } else {
                        $document.trigger('changeToRemainingDoor');
                    }
                });
            });

            $document.on('stickWithSelectedDoor', function () {
                self.stickCounter.isEnabled = true;
                self.changeCounter.isEnabled = false;

                (self.selectedDoor === self.jackpotDoor) ? $document.trigger('player_wins') : $document.trigger('player_loses');
            });

            $document.on('changeToRemainingDoor', function () {
                self.stickCounter.isEnabled = false;
                self.changeCounter.isEnabled = true;
                (self.remainingDoor === self.jackpotDoor) ? $document.trigger('player_wins') : $document.trigger('player_loses');
            });

            $document.on('player_wins', function () {
                alertify.success('a winner is you!');
                self.reset();

                $document.trigger('reset_game');

            });

            $document.on('player_loses', function () {
                alertify.error('a loser is you!');
                self.reset();

                $document.trigger('reset_game');
            });
        },
        reset: function() {
            this.doors = null;
            this.playerHasSelectedDoor = false;
            this.remainingDoor = null;
            this.selectedDoor = null;
            this.jackpotDoor = null;
        },
        init: function(stickCounter, changeCounter) {
            this.changeCounter = changeCounter;
            this.stickCounter = stickCounter;
            this.bind();
        }
    };

    var Door = {
        number: null,
        isSelected: false,
        containsZonk: true,
        $el: null,
        create$el: function () {
            return $('<a>', {
                'class': 'door is-selectable'
            }).clone(true);
        },

        bind: function () {
            var self = this;
            this.$el.on('click tap', function () {
                self.isSelected = true;
                
                $document.trigger('doorSelection', [self]);
            });
        },
        init: function (number) {
            this.number = number;
            this.$el = this.create$el();
            this.$el.html(this.number.toString());

            this.bind();
        }
    };

    var Platform = {
        doors: [],
        jackpotDoor: null,
        bind: function() {
            var self = this;
            $document.on('reset_game', function () {
                self.reset();
            });
        },
        reset: function() {
            this.$el.html(null);
            this.doors = [];

            var fragment = document.createDocumentFragment();
            for (var i = 0; i <= this.doorCount - 1; i++) {
                var door = Object.create(Door);
                door.init(i);
                this.doors.push(door);
                fragment.appendChild(door.$el[0]);
            }

            this.$el[0].appendChild(fragment);

            this.jackpotDoor = this.doors[Math.floor(Math.random()*this.doors.length)];
            this.jackpotDoor.containsZonk = false;

            $document.trigger('informAboutDoors', [this.doors]);
            $document.trigger('informAboutJackpotDoor', [this.jackpotDoor]);  
        },
        init: function ($el, doorCount) {
            this.$el = $el;
            this.doorCount = doorCount;
            this.bind();

            $document.trigger('reset_game');
        }
    };

    var Graph = {
        $el: null,
        $won: null,
        $lost: null,
        setPercentageByWinningPercentage: function(winPercentage) {
            var lostPercentage = 100 - winPercentage;

            this.$won.width(winPercentage.toString() + "%");
            this.$lost.width(lostPercentage.toString() + "%");
        },
        init: function($el) {
            this.$el = $el;
            this.$won = $el.find('.graph_won');
            this.$lost = $el.find('.graph_lost');

            this.$lost.html('losing');
            this.$won.html('winning');
        }
    };

    var Counter = {
        $el: null,
        $lost: null,
        $won: null,
        $percentage: null,
        isEnabled: false,
        loseCount: 0,
        winCount: 0,
        graph: null,
        getAllGames: function() {
            return this.loseCount + this.winCount;
        },
        getWinChance: function() {
            return this.winCount / this.getAllGames() * 100;
        },
        bind: function() {
            var self = this;

            $document.on('player_loses', function() {
                if (self.isEnabled) {
                    self.loseCount++;
                    
                    $document.trigger('update_counter');
                }
            });

            $document.on('player_wins', function() {
                if (self.isEnabled) {
                    self.winCount++;
                    
                    $document.trigger('update_counter');
                }
            });

            $document.on('update_counter', function(){
                if (self.isEnabled) {
                    self.printStatus();
                    
                    self.graph.setPercentageByWinningPercentage(self.getWinChance());
                }
            });

        },
        printStatus: function() {
            this.$won.html(this.winCount);
            this.$lost.html(this.loseCount);
            this.$percentage.html(Math.round( this.getWinChance() * 10 / 10).toString() + "%");
        },
        init: function($el) {
            this.$el = $el;

            this.$won = $el.find(".games_won");
            this.$lost = $el.find(".games_lost");
            this.$percentage = $el.find(".winning_percentage");

            var $graph = $el.find('.graph');
            this.graph = Object.create(Graph);
            this.graph.init($graph);

            this.bind();
        }
    };

    var stickCounter = {
        name: 'stick counter'
    };

    var changeCounter = {
        name: 'change counter'
    };

    $.extend(stickCounter, Counter);
    $.extend(changeCounter, Counter);

    var gameMaster = Object.create(GameMaster);
    var platform = Object.create(Platform);

    gameMaster.init(stickCounter, changeCounter);

    $document.ready(function () {
        var $game = $('.door_game');
        var $changeCounterEl = $('.change_door_counter');
        var $stickCounterEl = $('.stick_door_counter');

        changeCounter.init($changeCounterEl);
        stickCounter.init($stickCounterEl);
        platform.init($game, 3);
    });
})(document, jQuery, alertify);
