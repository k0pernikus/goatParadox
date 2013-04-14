var $document = $(document);

var GameMaster = {
    doors: null,
    playerHasSelectedDoor: false,
    remainingDoor: false,
    selectedDoor: null,
    jackpotDoor: null,
    bind: function () {
        var that = this;

        $document.on('informAboutDoors', function (event, doors) {
            that.doors = doors;
        });

        $document.on('informAboutJackpotDoor', function (event, jackPotDoor) {
            that.jackpotDoor = jackPotDoor;
        }),

            $document.on('doorSelection', function (event, selectedDoor) {
                if (!that.playerHasSelectedDoor) {
                    that.selectedDoor = selectedDoor;
                    that.playerHasSelectedDoor = true;
                    console.log('door Selected', selectedDoor);
                    selectedDoor.$el.addClass('selectedByPlayer');

                    if (selectedDoor !== that.jackpotDoor) {
                        $document.trigger('openAllDoorsExceptJackpot');
                    } else {
                        console.log('fixme');
                    }

                    $document.trigger('askForChange');
                }
            });

        $document.on('openAllDoorsExceptJackpot', function () {
            $.each(that.doors, function () {
                if (!this.isSelected && this !== that.jackpotDoor) {
                    this.$el.removeClass('selectable');
                    that.remainingDoor = that.jackpotDoor;
                }
            });
        });

        $document.on('askForChange', function () {
            console.log('Do you wanna change?');
        });

        $document.on('stickWithSelectedDoor', function () {
            console.log('You fool!');

            if (that.selectedDoor === that.jackpotDoor) {
                document.trigger('player_wins');
            } else {
                $document.trigger('player_loses');
            }
        });

        $document.on('changeToRemainingDoor', function () {
            if (that.remainingDoor === that.jackpotDoor) {
                document.trigger('player_wins');
            } else {
                $document.trigger('player_loses');
            }
        });

        $document.on('player_wins', function () {
            $document.trigger('reset_game');
            console.log('a winner is you!');
        });

        $document.on('player_loses', function () {
            $document.trigger('reset_game');
            console.log('a loser is you!');
        });
    }
}

Math.randomNumber = function (max) {
    return Math.round(Math.random() * max % max);
}


var Door = {
    number: null,
    isSelected: false,
    containsZonk: true,
    createTag: function () {
        return $('<a>', {
            class: 'door selectable'
        }).clone(true);
    },

    bind: function () {
        var that = this;
        this.$el.on('click tap', function () {
            that.isSelected = true;
            console.log(this);

            $document.trigger('doorSelection', [that]);
        });
    },
    init: function (number) {
        this.number = number;
        this.$el = this.createTag();
        this.$el.html(this.number.toString());

        this.bind();
    }
}

var Platform = {
    doors: [],
    bind: function () {
        var that = this;
        $document.on('reset_game', function () {
            that.$el.html(null);
            that.doors = [];

            var fragment = document.createDocumentFragment();
            for (var i = 0; i <= that.doorCount - 1; i++) {
                console.log(i);
                var door = Object.create(Door);
                door.init(i);
                that.doors.push(door);
                fragment.appendChild(door.$el[0]);
            }

            that.$el[0].appendChild(fragment);

            that.jackpotNumber = Math.randomNumber(that.doorCount);
            console.log('huh', that.jackpotNumber);
            that.doors[that.jackpotNumber].containsZonk = false;

            var gameMaster = Object.create(GameMaster);
            gameMaster.bind();

            $document.trigger('informAboutDoors', [that.doors]);
            $document.trigger('informAboutJackpotDoor', [that.doors[that.jackpotNumber]]);
        });
    },
    init: function ($el, doorCount) {
        this.$el = $el;
        this.doorCount = doorCount;
        this.bind();

        $document.trigger('reset_game');
    }
}
$document.ready(function () {
    var platform = Object.create(Platform);

    var $game = $('.door_game');
    platform.init($game, 3);
});
