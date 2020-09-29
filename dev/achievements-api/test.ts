IMPORT("AchievementsAPI");

AchievementAPI.registerGroup({
    unique: "test_group",
    name: "Test",
    bgTexture: "groups_bg.end",
    icon: {
        id: VanillaBlockID.bedrock
    }
});

AchievementAPI.register("test_group", {
    unique: "second",
    column: 3,
    row: 1,
    name: {
        text: "Second",
        translate: ""
    },
    item: {
        id: VanillaItemID.diamond_pickaxe
    }
});

AchievementAPI.register("test_group", {
    unique: "first",
    parent: {
        unique: "second"
    },
    column: 2,
    row: 0,
    connection: Connection.VERTICAL,
    name: {
        text: "First",
        translate: ""
    },
    item: {
        id: VanillaItemID.apple
    }
});


AchievementAPI.register("test_group", {
    unique: "third",
    parent: {
        unique: "second"
    },
    strongDependence: true,
    column: 4,
    row: 0,
    connection: Connection.VERTICAL,
    name: {
        text: "Third",
        translate: ""
    },
    item: {
        id: VanillaItemID.diamond
    }
});

Callback.addCallback("ItemUse", function () {
    if (!AchievementAPI.isCompleted("test_group", "first")) {
        AchievementAPI.give("test_group", "first");
        return;
    }

    if (!AchievementAPI.isCompleted("test_group", "second")) {
        AchievementAPI.give("test_group", "second");
        return;
    }

    if (!AchievementAPI.isCompleted("test_group", "third")) {
        AchievementAPI.give("test_group", "third");
        return;
    }
});