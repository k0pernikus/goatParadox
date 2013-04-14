var Player = {
    selectedDoor: null,
    selectDoor: function () {
    },
    switch: function () {
    }
}

var GameMaster = {

}

Math.randomNumber = function (max) {
    return Math.round(Math.random() * max % max);
}


var Door = {
    $el: $('<a>', {
        class: 'door selectable'
    }),
    number: null,
    isSelected: false,
    containsZonk: true,
    bind: function () {
        var that = this;
        this.$el.on('click tap', function () {
            that.isSelected = true
        });
    },
    init: function () {
        this.$el = $('<a>', {
            class: 'door selectable'
        });
        return this;
    }
}

var Platform = {
    $el: null,
    doorCount: null,
    jackpotNumber: null,
    doors: [],
    init: function ($el, doorCount) {
        /* 27ms */
        /* 18ms */

        console.time('fragment');
        var fragment = document.createDocumentFragment();

        this.$el = $el;
        this.doorCount = doorCount;

        for (var i = 0; i <= doorCount - 1; i++) {
            var door = Object.create(Door);
            door.init();
            door.number = i;
            door.$el.html(i.toString());
            this.doors.push(door);

            fragment.appendChild(door.$el[0]);
        }

        this.$el[0].appendChild(fragment);

        this.jackpotNumber = Math.randomNumber(doorCount);
        this.doors[this.jackpotNumber].containsZonk = false;
        var t = console.timeEnd('fragment');
        console.log(t);
    }
}
$(document).ready(function () {
    var platform = Object.create(Platform);
    var $game = $('.door_game');
    platform.init($game, 100);
});
