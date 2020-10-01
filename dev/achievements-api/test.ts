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
        name: "achievements.test.second",
        item: VanillaItemID.diamond_pickaxe
    },
    {
        unique: "first",
        parent: "test_group:second",
        column: 2,
        row: 0,
        connection: Connection.VERTICAL,
        name: "achievements.test.first",
        item: VanillaItemID.apple
    },
    {
        unique: "third",
        parent: "second",
        strongDependence: true,
        column: 4,
        row: 2,
        connection: Connection.VERTICAL,
        name: "achievements.test.third",
        description: "achievements.test.third_desc",
        item: VanillaItemID.diamond
    }
]);
Translation.addTranslation("achievements.test.first", {en: "First Achievement"});
Translation.addTranslation("achievements.test.second", {en: "Second Achievement"});
Translation.addTranslation("achievements.test.third", {en: "Third Achievement"});
Translation.addTranslation("achievements.test.third_desc", {en: "Sample of description"});

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