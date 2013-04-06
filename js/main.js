Math.randomNumber = function(max) {
    return Math.round(Math.random() * 100 % 100) - 1;
}

var Player = {
    selectedDoor: null,
    selectDoor: function() {},
    switch: function() {

    }
}

var GameMaster = {

}

var Door = {
    $el: $('<a class="door selectable">'),
    number: null,
    isSelected: false,
    containsZonk: true,
    bind: function () {
        var that = that;

        this.$el.on('click tap', function () {
            that.isSelected = true
        });
    }
}

var Platform = {
    $el: null,
    doorCount: null,
    jackpotNumber: null,
    doors: [],
    init: function($el, doorCount) {
        this.$el = $el;
        this.doorCount = doorCount;

        for (var i = 0; i <= doorCount; i++) {
            var door = Object.create(Door);
            door.number = i;

            this.$el.insertAfter(door.$el);

            this.doors.push(door);
        }

        this.jackpotNumber = Math.randomNumber(doorCount);

        this.doors[this.jackpotNumber].containsZonk = true;
    }
}

platform = Object.create(Platform);

$game = $('.game');
platform.init($game, 100)
