class Achievement {
    private completed = false;
    private readonly parent: Achievement | null = null;
    private data = {
        progress: 0, //TODO: move to another field when AchievementAPI.getData will removed
        data: {}
    };

    constructor(private group: AchievementGroup,
                private description: IAchievement) {
        const parent = description.parent;
        if (parent) {
            if (typeof parent === "string") {
                const parts = parent.split(":");
                this.parent =
                    this.findParent(parts.length > 1 ? parts[0] : undefined, parts.length > 1 ? parts[1] : parts[0]);
            } else {
                this.parent = this.findParent(parent.groupUnique || group.getUid(), parent.unique);
            }
        }

        if (typeof description.name === "object") {
            description.name = description.name.translate || description.name.text;
        }

        if (typeof description.description === "object") {
            description.description = description.description.translate || description.description.text;
        }

        if (typeof description.item === "number") {
            description.item = {
                id: description.item
            };
        }

        description.connection = description.connection || Connection.HORIZONTAL;
    }

    give() {
        if (this.isCompleted()) {
            return;
        }

        if (this.parent && !this.parent.isCompleted()) {
            return; //Throw an exception? Hm...
        }

        if (this.description.progressMax && ++this.data.progress < this.description.progressMax) {
            return;
        }

        if (!this.description.notCompletePopup) {
            let item = this.getIcon();
            let title;
            let color;

            switch (this.description.type) {
                case "challenge":
                    title = Translation.translate("message.achievementApi.challenge_complete");
                    color = android.graphics.Color.MAGENTA;
                    break;
                case "goal":
                    title = Translation.translate("message.achievementApi.goal_complete");
                    color = android.graphics.Color.YELLOW;
                    break;
                default:
                    title = Translation.translate("message.achievementApi.achievement_complete");
                    color = android.graphics.Color.YELLOW;
            }

            AchievementPopup.show({
                title: title,
                color: color,
                description: Translation.translate(this.description.name as string) || "",
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }

        this.completed = true;
        Callback.invokeCallback("onAchieve", this.group.getDescription(), this.getDescription());
        Callback.invokeCallback("onAchievementCompleted", this);
    }

    reset() {
        this.completed = false;
        this.data.progress = 0;
        this.data.data = {};
    }

    /**
     * Show alert with information about achievement
     */
    showAlert() {
        let info = Translation.translate(this.description.name as string);

        if (this.description.progressMax) {
            info += `(${this.getProgress()}/${this.description.progressMax})`;
        }

        if (this.description.description) {
            info += "\n" + Translation.translate(this.description.description as string);
        }

        alert(info);
    }

    /**
     * @return Is the achievement unlocked?
     */
    isUnlocked() {
        return this.parent ? this.parent.isCompleted() : true;
    }

    /**
     * @return Is the achievement completed?
     */
    isCompleted() {
        return this.completed;
    }

    isStrongDependence() {
        return this.description.strongDependence;
    }

    getTextureName() {
        let type;

        if (this.isCompleted()) {
            type = "completed";
        } else if (this.isUnlocked()) {
            type = "unlocked";
        } else {
            type = "locked";
        }

        return "achievement_bg." + (this.description.type || "default") + "_" + type;
    }

    getParent() {
        return this.parent;
    }

    getProgress(): number {
        return this.data.progress;
    }

    getUid(): string {
        return this.description.unique;
    }

    getDescription() {
        return this.description;
    }

    getFullData() {
        return this.data;
    }

    getIcon(): IItemIcon {
        return this.description.item as IItemIcon;
    }

    getGroup() {
        return this.group;
    }

    getData() {
        return this.data.data;
    }

    setCompleted(value: boolean) {
        this.completed = value;
    }

    setData(value: IAchievementData) {
        this.data = value;
    }

    private findParent(groupUID: string | undefined, uid: string) {
        let child: Achievement | null = null;
        if (!groupUID || groupUID == this.getGroup().getUid()) {
            child = this.getGroup().getChild(uid);
        } else {
            const otherGroup = AchievementAPI.groups[uid];
            if (otherGroup) {
                child = otherGroup.getChild(uid);
            } else {
                throw new IllegalArgumentException("Parent not found: group uid is invalid");
            }
        }

        if (child) {
            return child;
        } else {
            throw new IllegalArgumentException("Parent not found: achievement uid is invalid");
        }
    }
}