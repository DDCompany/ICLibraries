let GUI = new UI.StandartWindow({
    standard: {
        header: {
            text: {
                text: "Baubles",
            }
        },
        inventory: {
            standard: true,
        },
        background: {
            standard: true,
        }
    },
    drawing: [],
    elements: {
        "player": {
            type: "image",
            bitmap: "baubles.player",
            scale: 1,
            x: 550,
            y: 80
        },

        "amulet": {
            type: "slot", x: 550 - 65, y: 85, bitmap: "baubles.slot.amulet",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.amulet;
            }
        },
        "ring0": {
            type: "slot", x: 550 - 65, y: 80 + 173 - 65, bitmap: "baubles.slot.ring",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.ring;
            }
        },
        "ring1": {
            type: "slot", x: 550 + 144 + 5, y: 80 + 173 - 65, bitmap: "baubles.slot.ring",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.ring;
            }
        },
        "belt": {
            type: "slot", x: 550 + 38 + 4, y: 80 + 175 + 15, bitmap: "baubles.slot.belt",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.belt;
            }
        },

        "head": {
            type: "slot", x: 550 + 144 + 5, y: 85, bitmap: "baubles.slot.head",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.head;
            }
        },
        "body": {
            type: "slot", x: 550 + 38 + 4, y: 80 + 55 + 5, bitmap: "baubles.slot.body",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.body;
            }
        },
        "charm": {
            type: "slot", x: 550 + 38 + 4, y: 80 + 55 + 5 + 60, bitmap: "baubles.slot.charm",
            isValid: function (id: number) {
                return Baubles.getType(id) === BaubleType.charm;
            }
        }
    }
});

let BUTTON_GUI = new UI.Window({
    location: {
        x: 10,
        y: UI.getScreenHeight() - 70,
        width: 60,
        height: 60
    },
    drawing: [],
    elements: {
        "btn": {
            type: "button",
            x: 0,
            y: 0,
            bitmap: "baubles.open_btn",
            bitmap2: "baubles.open_btn_pressed",
            scale: 1000 / 26,
            clicker: {
                onClick: function () {
                    Threading.initThread("Baubles UI open request", () => {
                        Baubles.openGui();
                    });
                }
            }
        }
    }
});
