interface IAchievementsSaver {
    completed: { [key: string]: boolean };

    data: { [key: string]: IAchievementData };
}

Saver.addSavesScope("AchievementsScope",
    function read(scope: IAchievementsSaver) {
        AchievementsAPI.completed = scope.completed || {};
        AchievementsAPI.data = scope.data || {};
    },
    function save() {
        return {completed: AchievementsAPI.completed, data: AchievementsAPI.data};
    }
);