import UIElementSet = UI.UIElementSet;
import DrawingElement = UI.DrawingElement;

class AchievementsAPI {
    /**
     * Array of registered groups by <i>AchievementAPI.registerGroup</i>
     */
    static groups: { [key: string]: IAchievementGroup } = {};

    /**
     * Array of groups identifiers
     */
    static groupNames: string[] = [];

    /**
     * Amount of registered groups
     */
    static groupsAmount = 0;

    /**
     * Completed achievements. Key is 'groupUID_achievementUID'
     */
    static completed: { [key: string]: boolean } = {};

    /**
     * Information about achievements progress. Key is 'groupUID_achievementUID'
     */
    static data: { [key: string]: IAchievementData } = {};

    /**
     * Container of <i>groupsShowUI</i>
     */
    static containerOverlay = new UI.Container();

    /**
     * Container of achievements area window
     */
    static container = new UI.Container();

    /**
     * Container of <i>windowParent</i>
     */
    static parentContainer = new UI.Container();

    /**
     * Current group index
     */
    static currentIndex = 0;
    static windowArea: UI.Window | null = null;
    /**
     * Background window
     */
    static windowParent = new UI.Window({
        location: {
            x: 244,
            y: (UI.getScreenHeight() - 370) / 2,
            width: 512,
            height: 370
        },
        drawing: [
            {type: "color", color: android.graphics.Color.rgb(198, 198, 198)},
            {type: "frame", x: 0, y: 0, width: 1000, height: 725, bitmap: "achievements_frame", scale: 5},
            {
                type: "text",
                text: Translation.translate("achievementApi.achievements"),
                x: 80,
                y: 65,
                font: {size: 35, color: android.graphics.Color.DKGRAY}
            }
        ],
        elements: {
            "slotGroupIcon": {
                type: "slot",
                x: 75,
                y: 605,
                size: 100,
                visual: true,
                bitmap: "_default_slot_empty",
                isTransparentBackground: true
            },
            "textGroupName": {
                type: "text",
                x: 180,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY}
            },
            "btnClose": {
                type: "button",
                x: 910,
                y: 15,
                bitmap: "achievements_btn_close",
                bitmap2: "achievements_btn_close_hover",
                scale: 5,
                clicker: {
                    onClick: function () {
                        AchievementsAPI.windowParent.close();
                        AchievementsAPI.windowArea.close();
                    }
                }
            },
            "textPageIndex": {
                type: "text",
                x: 730,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY}
            },
            "btnNext": {
                type: "button",
                x: 860,
                y: 620,
                bitmap: "btn_achievements_next",
                bitmap2: "btn_achievements_next_hover",
                scale: 3,
                clicker: {
                    onClick: function () {
                        AchievementsAPI.currentIndex++;
                        AchievementsAPI.openAchievementsWindow();
                    }
                }
            },
            "btnPrevious": {
                type: "button",
                x: 640,
                y: 620,
                bitmap: "btn_achievements_previous",
                bitmap2: "btn_achievements_previous_hover",
                scale: 3,
                clicker: {
                    onClick: function () {
                        AchievementsAPI.currentIndex--;
                        AchievementsAPI.openAchievementsWindow();
                    }
                }
            }
        }
    })
    /**
     * Window with button that open achievements window
     */
    static groupsShowUI = new UI.Window({
        location: {
            x: 1000 / 2 - 80,
            y: 5,
            width: 45,
            height: 45
        },

        drawing: [
            {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
        ],

        elements: {
            "btn": {
                type: "button", x: 0, y: 0, bitmap: "btn_achievements", scale: 60, clicker: {
                    onClick: function () {
                        AchievementsAPI.currentIndex = 0;
                        AchievementsAPI.parentContainer.openAs(AchievementsAPI.windowParent);
                        AchievementsAPI.openAchievementsWindow();
                    }
                }
            }
        }
    });

    /**
     * Initialize windows
     */
    static init() {
        this.groupsShowUI.setAsGameOverlay(true);
        this.windowParent.setBlockingBackground(true);
    }

    /**
     * Register new group
     * @param group - description object
     */
    static registerGroup(group: IAchievementGroup) {
        let unique = group.unique;

        if (!unique) {
            Logger.Log("Unique is not set!", "ERROR");
            return;
        }

        if (this.groups[unique]) {
            Logger.Log("Group(" + unique + ") already registered!", "ERROR");
            return;
        }

        this.groups[unique] = group;
        this.groupsAmount++;
    }

    /**
     * Register new achievement
     * @param uid - group unique identifier
     * @param achievement - description object
     */
    static register(uid: string, achievement: IAchievement) {
        let group = this.groups[uid];
        let unique = achievement.unique;

        if (!group) {
            Logger.Log("Unique group id is not set", "ERROR");
            return;
        }

        if (!group.list)
            group.list = {};

        if (!unique || group.list[unique]) {
            Logger.Log("Achievement already registered or unique equals null", "ERROR");
            return;
        }

        let parent = achievement.parent;
        if (parent && !parent.groupUnique)
            parent.groupUnique = uid;

        group.list[unique] = achievement;
    }

    /**
     * Load groups and achievements from JSON file
     * @param path - path to JSON
     * @example <i>AchievementsAPI.loadFrom(\_\_dir\_\_ + "/achievements.json")</i>
     */
    static loadFrom(path: string) {
        let content = FileTools.ReadText(path);
        if (content) {
            let parsed = JSON.parse(content);

            let groups = parsed.groups;
            if (groups) {
                for (let key in groups)
                    AchievementsAPI.registerGroup(groups[key]);
            }

            let achievements = parsed.achievements;
            if (achievements) {
                for (let key in achievements) {
                    let achievementGroup = achievements[key];
                    for (let key2 in achievementGroup)
                        AchievementsAPI.register(key, achievementGroup[key2]);
                }
            }

            return;
        }

        Logger.Log("Error loading file " + path, "ERROR");
    }

    /**
     * @param group - group in which the achievement contains
     * @param achievement - achievement description object
     * @returns texture name
     */
    static getAchievementTexture(group: IAchievementGroup, achievement: IAchievement): string {
        let type;

        if (AchievementsAPI.isCompleted(group.unique, achievement.unique))
            type = "completed";
        else if (AchievementsAPI.isUnlocked_(group, achievement))
            type = "unlocked";
        else type = "locked";

        return "achievement_bg." + (achievement.type || "default") + "_" + type;
    }

    /**
     * @param achievement - description object
     * @param size - size of achievement icon
     * @returns x coordinate
     */
    static getAchievementX(achievement: IAchievement, size: number): number {
        return achievement.x || achievement.column * (size + 10);
    }

    /**
     * @param achievement - description object
     * @param size - size of achievement icon
     * @returns y coordinate
     */
    static getAchievementY(achievement: IAchievement, size: number): number {
        return achievement.y || achievement.row * (size + 10);
    }

    /**
     * @param groupUID - group identifier in which achievement contains
     * @param unique - achievement identifier
     * @returns Is the achievement completed?
     */
    static isCompleted(groupUID: string, unique: string): boolean {
        return this.completed[groupUID + "_" + unique];
    }

    /**
     * @param groupUID - group identifier in which achievement contains
     * @param unique - achievement identifier
     * @returns Is the achievement unlocked?
     */
    static isUnlocked(groupUID: string, unique: string) {
        let group = this.groups[groupUID];
        if (!group)
            return false;

        let achievement = group.list[unique];
        if (!achievement)
            return false;

        let parent = achievement.parent;
        if (parent)
            return this.isCompleted(parent.groupUnique || group.unique, parent.unique);

        return true;
    }

    /**
     * @param group - group description object
     * @param achievement - achievement description object
     * @returns Is the achievement unlocked?
     */
    static isUnlocked_(group: IAchievementGroup, achievement: IAchievement) {
        let parent = achievement.parent;

        if (parent)
            return this.isCompleted(parent.groupUnique || group.unique, parent.unique);

        return true;
    }

    static initGroupForWindow(group: IAchievementGroup) {
        let parentElements = this.windowParent.getContent().elements;
        parentElements["textPageIndex"].text = (this.currentIndex + 1) + "/" + this.groupsAmount;
        parentElements["textGroupName"].text = group.name || "";

        let slotIcon = this.parentContainer.getSlot("slotGroupIcon");
        let groupIcon = group.icon;

        if (groupIcon) {
            slotIcon.id = groupIcon.id || 0;
            slotIcon.data = groupIcon.data || 0;
            slotIcon.count = 1;
        } else {
            slotIcon.id = 0;
            slotIcon.data = 0;
            slotIcon.count = 1;
        }
    }

    static initAchievementsForWindow(group: IAchievementGroup, size: number, elements: UIElementSet) {
        let contentExist;
        for (let index in group.list) {
            let achievement = group.list[index];
            let parent = achievement.parent;

            if (parent) {
                if (!AchievementsAPI.isCompleted(parent.groupUnique, parent.unique) && achievement.strongDependence)
                    continue;
            }
            contentExist = true;

            let x = this.getAchievementX(achievement, size);
            let y = this.getAchievementY(achievement, size);

            elements[index] = {
                type: "slot",
                x: x,
                y: y,
                size: size,
                visual: true,
                bitmap: AchievementsAPI.getAchievementTexture(group, achievement),
                isTransparentBackground: true,
                clicker: {
                    onClick: function () {
                        AchievementsAPI.showAchievementInfo(group, achievement);
                    }
                }
            };

            let item = achievement.item || {id: 0, data: 0};

            let slot = this.container.getSlot(index);
            slot.id = item?.id ?? 0;
            slot.data = item?.data ?? 0;
            slot.count = 1;
        }

        return contentExist;
    }

    static initConditionsForWindow(group: IAchievementGroup, size: number, elements: UIElementSet) {
        let halfOfSize = size / 2;
        elements["lines"] = {
            type: "custom",
            z: -1,
            custom: {},

            onSetup: function () {
                this.paint = new android.graphics.Paint();
                this.paint.setColor(android.graphics.Color.WHITE);
                this.paint.setStyle(android.graphics.Paint.Style.STROKE);
                this.paint.setStrokeWidth(4);

                this.paint2 = new android.graphics.Paint();
                this.paint2.setColor(android.graphics.Color.BLACK);
                this.paint2.setStyle(android.graphics.Paint.Style.STROKE);
                this.paint2.setStrokeWidth(10);
            },

            onDraw: function (self: unknown, canvas: android.graphics.Canvas, scale: number) {
                if (!this.path) {
                    this.path = new android.graphics.Path();

                    for (let index in group.list) {
                        let achievement = group.list[index];
                        let parent = achievement.parent;
                        let parentItem;

                        if (!parent || parent.groupUnique !== group.unique ||
                            (!AchievementsAPI.isCompleted(group.unique, parent.unique) && achievement.strongDependence))
                            continue;

                        if (parentItem = group.list[parent.unique]) {
                            let x = AchievementsAPI.getAchievementX(achievement, size);
                            let y = AchievementsAPI.getAchievementY(achievement, size);
                            let _x = (x + halfOfSize) * scale;
                            let _y = (y + halfOfSize) * scale;
                            let parentX = AchievementsAPI.getAchievementX(parentItem, size);
                            let parentY = AchievementsAPI.getAchievementY(parentItem, size);
                            let _parentX = (parentX + halfOfSize) * scale;
                            let _parentY = (parentY + halfOfSize) * scale;

                            if (parentX === x || parentY === y) {
                                this.path.moveTo(_x, _y);
                                this.path.lineTo(_parentX, _parentY);
                            } else {
                                let x2 = _x + ((parentX < x ? -(halfOfSize + 5) : halfOfSize + 5) * scale);

                                this.path.moveTo(_x, _y);
                                this.path.lineTo(x2, _y);
                                this.path.lineTo(x2, _parentY);
                                this.path.lineTo(_parentX, _parentY);
                            }
                        }
                    }
                }

                canvas.drawPath(this.path, this.paint2);
                canvas.drawPath(this.path, this.paint);
            }
        };
    }

    static initBackgroundForWindow(drawing: DrawingElement[], bgTexture: string) {
        drawing.push({
            type: "custom",

            func: function (canvas: android.graphics.Canvas) {
                this.onDraw(canvas)
            },

            onDraw: function (canvas: android.graphics.Canvas) {
                let textureBitmap = android.graphics.Bitmap.createScaledBitmap(UI.TextureSource.get(bgTexture), 50, 50, false);

                for (let i = 0; i <= canvas.getWidth() / 50; i++) {
                    for (let k = 0; k <= canvas.getHeight() / 50; k++) {
                        canvas.drawBitmap(textureBitmap, i * 50, k * 50, null);
                    }
                }
            }
        });
    }

    /**
     * @param group - group description object
     * @param achievement - achievement description object
     * @returns progress
     */
    static getProgress(group: IAchievementGroup, achievement: IAchievement) {
        let data = this.data[group.unique + "_" + achievement.unique];

        if (!data)
            return 0;

        return data.progress;
    }

    /**
     * @param groupUID - group identifier
     * @param uid - achievement identifier
     * @returns custom data
     */
    static getData(groupUID: string, uid: string) {
        let data = this.data[groupUID + "_" + uid];

        if (!data)
            data = this.data[groupUID + "_" + uid] = {progress: 0, data: {}};

        return data;
    }

    /**
     * Open achievement window
     */
    static openAchievementsWindow() {
        if (this.currentIndex < 0)
            this.currentIndex = this.groupsAmount - 1;
        else if (this.currentIndex >= this.groupsAmount)
            this.currentIndex = 0;

        let group = this.groups[this.groupNames[AchievementsAPI.currentIndex]];
        let width = group.width || 600;
        let height = group.height || 250;
        let elements: UIElementSet = {};
        let drawing = [{type: "color", color: android.graphics.Color.rgb(0, 0, 0)}];

        this.initGroupForWindow(group);

        let size = group.size || 100;
        let contentExist = this.initAchievementsForWindow(group, size, elements);

        if (contentExist) {
            this.initConditionsForWindow(group, size, elements);

            if (group.bgTexture)
                this.initBackgroundForWindow(drawing, group.bgTexture);
        } else {
            width = 432;
            height = 260;

            let translated = Translation.translate("achievementApi.nothing");
            if (translated === "achievementApi.nothing")
                translated = "Nothing to Show :(";

            elements["nothing"] = {
                type: "text",
                x: 0,
                y: 200,
                text: translated,
                font: {size: 40, color: android.graphics.Color.WHITE}
            };
        }

        if (this.windowArea) {
            this.windowArea.close();
        }

        this.windowArea = new UI.Window({
            location: {
                x: 284,
                y: (UI.getScreenHeight() - 370) / 2 + 50,
                width: 432,
                height: 260,
                scrollX: width,
                scrollY: height
            },

            drawing: drawing,
            elements: elements
        });

        AchievementsAPI.container.openAs(this.windowArea);

        if (!contentExist) {
            elements["nothing"].x = (1000 - AchievementsAPI.container.getElement("nothing").elementRect.width()) / 2;
        }
    }

    /**
     * @param achievement - achievement description object
     * @param field
     * @returns translated string
     */
    static getLocalized(achievement: IAchievement, field: string): string {
        let obj = (<{ [key: string]: any }>achievement)[field];
        if (obj) {
            if (obj.translate) {
                let translated = Translation.translate(obj.translate);
                return translated === obj.translate ? obj.text : translated;
            }

            return obj.text;
        }

        return "";
    }

    /**
     * Show alert with information about achievement
     * @param group - group description object
     * @param achievement - achievement description object
     */
    static showAchievementInfo(group: IAchievementGroup, achievement: IAchievement) {
        let info = this.getLocalized(achievement, "name");

        if (achievement.progressMax) {
            info += "(" + this.getProgress(group, achievement) + "/" + achievement.progressMax + ")";
        }

        let description = this.getLocalized(achievement, "description");
        if (description)
            info += "\n" + description;

        alert(info);
    }

    /**
     * Give the achievement
     * @param groupUID - group identifier
     * @param uid - achievement identifier
     */
    static give(groupUID: string, uid: string) {
        let group = this.groups[groupUID];
        if (!group)
            return;

        let list = group.list;
        let achievement = list[uid];
        if (!achievement)
            return;

        if (this.isCompleted(groupUID, uid))
            return;

        let parent = achievement.parent;
        if (parent && !this.isCompleted(parent.groupUnique, parent.unique))
            return;

        let progressMax = achievement.progressMax;

        if (progressMax) {
            let progress = this.data[groupUID + "_" + uid];

            if (!progress)
                progress = this.data[groupUID + "_" + uid] = {progress: 0, data: {}};

            if (++progress.progress < progressMax)
                return;
            else this.removeDataFor(groupUID, uid)
        }

        if (!achievement.notCompletePopup) {
            let item = achievement.item;
            let title;
            let color;

            switch (achievement.type) {
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
                description: this.getLocalized(achievement, "name"),
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }

        this.completed[groupUID + "_" + uid] = true;
        Callback.invokeCallback("onAchieve", group, achievement);
    }

    /**
     * Give all achievements of the group
     * @param group - group description object
     * @returns Have achievements been gave?
     */
    static giveAllForGroup(group: IAchievementGroup) {
        if (!group)
            return false;

        for (let key in group.list) {
            let achievement = group.list[key];
            this.completed[group.unique + "_" + achievement.unique] = true;
            Callback.invokeCallback("onAchieve", group, achievement);
        }

        return true;
    }

    /**
     * Give all achievements
     */
    static giveAll() {
        for (let key in this.groups) {
            this.giveAllForGroup(this.groups[key]);
        }
    }

    /**
     * Remove information about achievement (progress and custom data)
     * @param groupUID - group identifier
     * @param uid - achievement identifier
     */
    static removeDataFor(groupUID: string, uid: string) {
        this.data[groupUID + "_" + uid] = null;
    }
}

AchievementsAPI.init();

Callback.addCallback("PostLoaded", function () {
    AchievementsAPI.groupNames = Object.keys(AchievementsAPI.groups);
});
Callback.addCallback("NativeGuiChanged", function (screenName: string) {
    if (screenName === "hud_screen" || screenName === "in_game_play_screen")
        AchievementsAPI.containerOverlay.openAs(AchievementsAPI.groupsShowUI);
    else AchievementsAPI.containerOverlay.close();
});

EXPORT("AchievementsAPI", AchievementsAPI);