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

AchievementAPI.register("test_group", {
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

AchievementAPI.register("test_group", {
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