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
                    $document.trigger('openAllDoorsExceptJackpotAndSelectedDoor');
                } else {
                    $document.trigger('openAllDoorsExceptSelectedDoorAndOneRandomDoor');
                }

                $document.trigger('askForChange');
            }
        });

        $document.on('openAllDoorsExceptJackpotAndSelectedDoor', function () {
            that.remainingDoor = that.jackpotDoor;
            $.each(that.doors, function () {
                if (!this.isSelected && this !== that.remainingDoor) {
                    this.$el.removeClass('selectable');
                }
            });
        });

        $document.on('openAllDoorsExceptSelectedDoorAndOneRandomDoor', function () {
            do {
                var randomDoor = that.doors[Math.floor(Math.random()*that.doors.length)]
            } while (randomDoor === that.jackpotDoor && randomDoor.isSelected)

            that.remainingDoor = randomDoor;
            $.each(that.doors, function () {
                if (!this.isSelected && this !== that.remainingDoor) {
                    this.$el.removeClass('selectable');
                }
            });
        });

        $document.on('askForChange', function () {
            console.log();
            message = 'Do you want to stick with your choice?';
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
            console.log('You fool!');

            (that.selectedDoor === that.jackpotDoor) ? $document.trigger('player_wins') : $document.trigger('player_loses');
        });

        $document.on('changeToRemainingDoor', function () {
            (that.remainingDoor === that.jackpotDoor) ? $document.trigger('player_wins') : $document.trigger('player_loses');
        });

        $document.on('player_wins', function () {
            debugger;
            alertify.success('a winner is you!');
            $document.trigger('reset_game');
            delete that;
        });

        $document.on('player_loses', function () {
            debugger;
            alertify.error('a loser is you!');
            $document.trigger('reset_game');
            delete that;
        });
    }
}

var Door = {
    number: null,
    isSelected: false,
    containsZonk: true,
    $el: null,
    create$el: function () {
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
                console.log(i);
                var door = Object.create(Door);
                door.init(i);
                that.doors.push(door);
                fragment.appendChild(door.$el[0]);
            }

            that.$el[0].appendChild(fragment);

            that.jackpotDoor = that.doors[Math.floor(Math.random()*that.doors.length)];
            that.jackpotDoor.containsZonk = false;

            console.log("Jackpot:", that.jackpotDoor.number);

            var gameMaster = Object.create(GameMaster);
            gameMaster.bind();

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

$document.ready(function () {
    var platform = Object.create(Platform);
    var $game = $('.door_game');
    platform.init($game, 5);
});