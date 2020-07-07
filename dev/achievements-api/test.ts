IMPORT("AchievementsAPI");

AchievementsAPI.registerGroup({
    unique: "test_group",
    name: "Test",
    icon: {
        id: VanillaBlockID.bedrock
    }
});

AchievementsAPI.register("test_group", {
    unique: "first",
    column: 0,
    row: 0,
    name: {
        text: "First",
        translate: ""
    },
    item: {
        id: VanillaItemID.apple
    }
});

AchievementsAPI.register("test_group", {
    unique: "second",
    parent: {
        unique: "first"
    },
    column: 1,
    row: 0,
    name: {
        text: "Second",
        translate: ""
    },
    item: {
        id: VanillaItemID.diamond_pickaxe
    }
});

AchievementsAPI.register("test_group", {
    unique: "third",
    parent: {
        unique: "second"
    },
    strongDependence: true,
    column: 2,
    row: 0,
    name: {
        text: "Third",
        translate: ""
    },
    item: {
        id: VanillaItemID.balloon
    }
});

Callback.addCallback("ItemUse", function () {
    if (!AchievementsAPI.isCompleted("test_group", "first")) {
        AchievementsAPI.give("test_group", "first");
        return;
    }

    if (!AchievementsAPI.isCompleted("test_group", "second")) {
        AchievementsAPI.give("test_group", "second");
        return;
    }

    if (!AchievementsAPI.isCompleted("test_group", "third")) {
        AchievementsAPI.give("test_group", "third");
        return;
    }
});