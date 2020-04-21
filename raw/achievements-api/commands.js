Callback.addCallback("NativeCommand", function (str) {
    str = str.replace("/", "");
    let parts = str.split(" ");

    if (parts[0] === "ach" || parts[0] === "achievement") {
        switch (parts[1]) {
            case "giveAll":
                AchievementAPI.giveAll();
                Game.message("[AchievementsAPI] All achievements was gave");
                Game.prevent();
                return;
            case "give":
                if (!parts[2] || !AchievementAPI.giveAllForGroup(AchievementAPI.groups[parts[2]]))
                    return;

                Game.message("[AchievementsAPI] Achievements was gave!");
                Game.prevent();
                return;
            case "consumeAll":
                AchievementAPI.completed = {};
                Game.message("[AchievementsAPI] All achievements was consumed");
                Game.prevent();
        }
    }
});