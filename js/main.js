var Player = {
    selectedDoor: null,
    selectDoor: function() {},
    switch: function() {
    }
}

var GameMaster = {

}

Math.randomNumber = function(max) {
    return Math.round(Math.random() * 100 % 100) - 1;
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
    init: function(){
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
    init: function($el, doorCount) {
        this.$el = $el;
        this.doorCount = doorCount;

        for (var i = 0; i <= doorCount - 1; i++) {
            var door = Object.create(Door);
            door.init();
            door.number = i;
            door.$el.html(i.toString());
            this.doors.push(door);

            this.$el.append(door.$el);
        }

        this.jackpotNumber = Math.randomNumber(doorCount);
        this.doors[this.jackpotNumber].containsZonk = true;
    }
}
    $(document).ready(function(){
        var platform = Object.create(Platform);
        var $game = $('.door_game');
        platform.init($game, 100);
    });
