interface IAchievementsSaver {
    [key: string]: { [key: string]: { completed: boolean, data: IAchievementData } }
}

Saver.addSavesScope("AchievementsScope",
    function read(scope: IAchievementsSaver) {
        //Detecting old saves //TODO: delete in next versions
        let amount = 0;
        let isOldSaves = true;
        for (let key in scope) {
            amount++;
            if (amount > 2) {
                isOldSaves = false;
                break;
            }

            if (key != "completed" && key != "data") {
                isOldSaves = false;
                break;
            }
        }
        if (isOldSaves) {
            isOldSaves = amount == 2;
        }

        if (isOldSaves) { //Convert old format to new one
            alert("old saves detected");
            // @ts-ignore
            const saves = <{ completed: { [key: string]: boolean }, data: { [key: string]: IAchievementData } }>scope;
            const newSaves: IAchievementsSaver = {};

            for (let key in saves.completed) {
                const parts = key.split("_");
                let data = newSaves[parts[0]];
                if (!data) {
                    data = newSaves[parts[0]] = {};
                }

                data[parts[1]] = {completed: saves.completed[key], data: {progress: 0, data: {}}};
            }

            for (let key in saves.data) {
                const parts = key.split("_");
                let data = newSaves[parts[0]];
                if (!data) {
                    data = newSaves[parts[0]] = {};
                }

                let data2 = data[parts[1]];
                if (!data2) {
                    data2 = data[parts[1]] = {completed: false, data: saves.data[key]};
                } else {
                    data2.data = saves.data[key];
                }
            }

            scope = newSaves;
        }

        for (let groupKey in scope) {
            const group = AchievementAPI.getGroup(groupKey);
            const data = scope[groupKey];
            if (group) {
                for (let key in data) {
                    const child = group.getChild(key);
                    const saved = data[key];
                    if (child) {
                        child.setCompleted(saved.completed);
                        child.setData(saved.data);
                        alert(`Read ${group.getUid()} ${child.getUid()}`);
                    } else {
                        Logger.Log(`Achievement with uid '${key}' not found. Skipping...`, "WARNING");
                    }
                }
            } else {
                Logger.Log(`Group with uid '${groupKey}' not found. Skipping...`, "WARNING");
            }
        }
    },
    function save() {
        const data: IAchievementsSaver = {};

        for (let groupKey in AchievementAPI.groups) {
            const group = AchievementAPI.groups[groupKey];
            const _data: { [key: string]: { completed: boolean, data: IAchievementData } } = {};

            for (let key in group.getChildren()) {
                const child = group.getChild(key);
                _data[key] = {
                    completed: child.isCompleted(),
                    data: child.getFullData()
                };
            }
            data[groupKey] = _data;
        }

        alert("save");
        return data;
    }
);