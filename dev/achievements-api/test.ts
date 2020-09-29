IMPORT("AchievementsAPI");

AchievementAPI.registerGroup({
    unique: "test_group",
    name: "Test",
    background: "groups_bg.end",
    icon: VanillaBlockID.bedrock
});

AchievementAPI.registerAll("test_group", [
    {
        unique: "second",
        column: 3,
        row: 1,
        name: {
            text: "Second",
            translate: ""
        },
        item: VanillaItemID.diamond_pickaxe
    },
    {
        unique: "first",
        parent: "test_group:second",
        column: 2,
        row: 0,
        connection: Connection.VERTICAL,
        name: {
            text: "First",
            translate: ""
        },
        item: VanillaItemID.apple
    },
    {
        unique: "third",
        parent: "second",
        strongDependence: true,
        column: 4,
        row: 2,
        connection: Connection.VERTICAL,
        name: {
            text: "Third",
            translate: ""
        },
        item: VanillaItemID.diamond
    }
]);

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