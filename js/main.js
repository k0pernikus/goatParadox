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

                    this.$el.removeClass('selectable');
                }
            });

            this.remainingDoor.$el.addClass('selectable')
        },
        bind: function () {
            var that = this;

            $document.on('informAboutDoors', function (event, doors) {
                that.doors = doors;
            });

            $document.on('informAboutJackpotDoor', function (event, jackPotDoor) {
                that.jackpotDoor = jackPotDoor;
            });

            $document.on('doorSelection', function (event, selectedDoor) {
                if (!that.playerHasSelectedDoor) {
                    that.selectedDoor = selectedDoor;
                    that.playerHasSelectedDoor = true;
                    selectedDoor.$el.addClass('selectedByPlayer');

                    that.remainingDoor = that.jackpotDoor;

                    if (that.selectedDoor === that.jackpotDoor) {
                        var randomDoor;
                        do {
                            randomDoor = that.doors[Math.floor(Math.random() * that.doors.length)];
                        } while (randomDoor === that.jackpotDoor && randomDoor.isSelected);
                        that.remainingDoor = randomDoor;
                    }

                    that.openAllDoorsExceptSelectedAndRemaing();
                    $document.trigger('askForChange');
                }
            });

            $document.on('askForChange', function () {
                var message = 'Do you want to stick with your choice?';
                alertify.set({labels:{
                    cancel: "No!",
                    ok: "Yes!"
                }})

                alertify.confirm(message, function(playerDoesStick) {
                    if (playerDoesStick) {
                        $document.trigger('stickWithSelectedDoor');
                    } else {
                        $document.trigger('changeToRemainingDoor');
                    }
                });
            });

            $document.on('stickWithSelectedDoor', function () {
                that.stickCounter.isEnabled = true;
                that.changeCounter.isEnabled = false;

                (that.selectedDoor === that.jackpotDoor) ? $document.trigger('player_wins') : $document.trigger('player_loses');
            });

            $document.on('changeToRemainingDoor', function () {
                that.stickCounter.isEnabled = false;
                that.changeCounter.isEnabled = true;
                (that.remainingDoor === that.jackpotDoor) ? $document.trigger('player_wins') : $document.trigger('player_loses');
            });

            $document.on('player_wins', function () {
                alertify.success('a winner is you!');
                that.reset();

                $document.trigger('reset_game');

            });

            $document.on('player_loses', function () {
                alertify.error('a loser is you!');
                that.reset();

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
    }

    var Door = {
        number: null,
        isSelected: false,
        containsZonk: true,
        $el: null,
        create$el: function () {
            return $('<a>', {
                'class': 'door selectable'
            }).clone(true);
        },

        bind: function () {
            var that = this;
            this.$el.on('click tap', function () {
                that.isSelected = true;
                $document.trigger('doorSelection', [that]);
            });
        },
        init: function (number) {
            this.number = number;
            this.$el = this.create$el();
            this.$el.html(this.number.toString());

            this.bind();
        }
    }

    var Platform = {
        doors: [],
        jackpotDoor: null,
        bind: function() {
            var that = this;
            $document.on('reset_game', function () {
                that.$el.html(null);
                that.doors = [];

                var fragment = document.createDocumentFragment();
                for (var i = 0; i <= that.doorCount - 1; i++) {
                    var door = Object.create(Door);
                    door.init(i);
                    that.doors.push(door);
                    fragment.appendChild(door.$el[0]);
                }

                that.$el[0].appendChild(fragment);

                that.jackpotDoor = that.doors[Math.floor(Math.random()*that.doors.length)];
                that.jackpotDoor.containsZonk = false;

                console.log("Jackpot:", that.jackpotDoor.number);

                $document.trigger('informAboutDoors', [that.doors]);
                $document.trigger('informAboutJackpotDoor', [that.jackpotDoor]);
            });
        },
        init: function ($el, doorCount) {
            this.$el = $el;
            this.doorCount = doorCount;
            this.bind();

            $document.trigger('reset_game');
        }
    }


    var Counter = {
        $el: null,
        $lost: null,
        $won: null,
        $percentage: null,
        isEnabled: false,
        loseCount: 0,
        winCount: 0,
        getAllGames: function() {
            return this.loseCount + this.winCount;
        },
        getWinChance: function() {
            return this.winCount / this.getAllGames() * 100;
        },
        bind: function() {
            var that = this;

            $document.on('player_loses', function() {
                if (that.isEnabled) {
                    that.loseCount++;
                    $document.trigger('update_counter');
                }
            });

            $document.on('player_wins', function() {
                if (that.isEnabled) {
                    that.winCount++;
                    $document.trigger('update_counter');
                }
            });

            $document.on('update_counter', function(){
                if (that.isEnabled) {
                    that.printStatus();
                    console.log(that.name, that.getWinChance());
                }
            });

        },
        printStatus: function() {
            console.log(this.winCount, this.loseCount, this.getWinChance());

            this.$won.html(this.winCount);
            this.$lost.html(this.loseCount);
            this.$percentage.html(Math.round( this.getWinChance() * 10 / 10).toString() + "%");
        },
        init: function($el) {
            this.$el = $el;

            this.$won = $el.find(".games_won");
            console.log('huh', this.$won);
            this.$lost = $el.find(".games_lost");
            this.$percentage = $el.find(".winning_percentage");

            console.log($el, this.$won, this.$lost, this.$percentage);

            this.bind();
        }
    }

    var stickCounter = {
        name: 'stick counter'
    }

    var changeCounter = {
        name: 'change counter'
    }

    $.extend(stickCounter, Counter);
    $.extend(changeCounter, Counter);

    var gameMaster = Object.create(GameMaster);
    var platform = Object.create(Platform);

    gameMaster.init(stickCounter, changeCounter);

    $document.ready(function () {
        var $game = $('.door_game');
        var $changeCounterEl = $('.change_door_counter');
        var $stickCounterEl = $('.stick_door_counter');

        console.log($changeCounterEl, $stickCounterEl);

        changeCounter.init($changeCounterEl);
        stickCounter.init($stickCounterEl);
        platform.init($game, 3);
    });
})(document, jQuery, alertify);
