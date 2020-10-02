class Achievement {
    private completed = false;
    private readonly _parent: Achievement | null = null;
    private _data: { progress: number, data: { [key: string]: any } } = {
        progress: 0, //TODO: move to another field when AchievementAPI.getData will removed
        data: {}
    };

    constructor(private _group: AchievementGroup,
                private _description: IAchievement) {
        const parent = _description.parent;
        if (parent) {
            if (typeof parent === "string") {
                const parts = parent.split(":");
                this._parent =
                    this.findParent(parts.length > 1 ? parts[0] : undefined, parts.length > 1 ? parts[1] : parts[0]);
            } else {
                this._parent = this.findParent(parent.groupUnique || _group.uid, parent.unique);
            }
        }

        if (typeof _description.name === "object") {
            _description.name = _description.name.translate || _description.name.text;
        }

        if (typeof _description.description === "object") {
            _description.description = _description.description.translate || _description.description.text;
        }

        if (typeof _description.item === "number") {
            _description.item = {
                id: _description.item
            };
        }

        _description.connection = _description.connection || Connection.HORIZONTAL;
    }

    give() {
        if (this.isCompleted) {
            return;
        }

        if (this._parent && !this._parent.isCompleted) {
            return; //Throw an exception? Hm...
        }

        if (this._description.progressMax && ++this._data.progress < this._description.progressMax) {
            return;
        }

        if (!this._description.notCompletePopup) {
            let item = this.icon;
            let title;
            let color;

            switch (this._description.type) {
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
                description: Translation.translate(this._description.name as string) || "",
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }

        this.completed = true;
        Callback.invokeCallback("onAchieve", this._group.description, this.description);
        Callback.invokeCallback("onAchievementCompleted", this);
    }

    reset() {
        this.completed = false;
        this._data.progress = 0;
        this._data.data = {};
    }

    /**
     * Show alert with information about achievement
     */
    showAlert() {
        let info = Translation.translate(this._description.name as string);

        if (this._description.progressMax) {
            info += `(${this.progress}/${this._description.progressMax})`;
        }

        if (this._description.description) {
            info += "\n" + Translation.translate(this._description.description as string);
        }

        alert(info);
    }

    private findParent(groupUID: string | undefined, uid: string) {
        let child: Achievement | null = null;
        if (!groupUID || groupUID == this.group.uid) {
            child = this.group.getChild(uid);
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

    /**
     * @return Is the achievement unlocked?
     */
    get isUnlocked() {
        return this._parent ? this._parent.isCompleted : true;
    }

    /**
     * @return Is the achievement completed?
     */
    get isCompleted() {
        return this.completed;
    }

    set isCompleted(value: boolean) {
        this.completed = value;
    }

    get strongDependence() {
        return this._description.strongDependence;
    }

    get texture() {
        let type;

        if (this.isCompleted) {
            type = "completed";
        } else if (this.isUnlocked) {
            type = "unlocked";
        } else {
            type = "locked";
        }

        return "achievement_bg." + (this._description.type || "default") + "_" + type;
    }

    get parent() {
        return this._parent;
    }

    get progress(): number {
        return this._data.progress;
    }

    get uid(): string {
        return this._description.unique;
    }

    get description(): IAchievement {
        return this._description;
    }

    get fullData() {
        return this._data;
    }

    set fullData(value: IAchievementData) {
        this._data = value;
    }

    get icon() {
        return this._description.item as IItemIcon;
    }

    get group(): AchievementGroup {
        return this._group;
    }

    get data() {
        return this._data.data;
    }
}