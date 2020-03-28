// noinspection ES6ConvertVarToLetConst
var GuideAPI = {
    guides: {},
    container: new UI.Container(),
    nextLink: null,
    preLink: null,
    openedGuide: null,

    registerGuide: function (unique, params) {
        this.guides[unique] = params;

        if (params.item) {
            Item.registerUseFunction(params.item, function () {
                GuideAPI.openGuide(unique);
            });
        }
    },

    openGuide: function (unique) {
        let guide = this.guides[unique];
        if (guide) {
            this.openedGuide = guide;
            GuideAPI.openPage(guide.pages.default);
        }

    },

    openPage: function (page) {
        GuideAPI.nextLink = page.nextLink;
        GuideAPI.preLink = page.preLink;
        let guide = this.openedGuide;

        function addLinks(elements) {
            if (GuideAPI.nextLink) {
                elements["nextLink"] = {
                    type: "button",
                    x: 910,
                    y: UI.getScreenHeight() - 45,
                    bitmap: (guide.textures && guide.textures.nextLink) || "next_page",
                    scale: 3,
                    clicker: {
                        onClick: function () {
                            GuideAPI.arrowClick(GuideAPI.nextLink)
                        }
                    }
                };
            }

            if (GuideAPI.preLink) {
                elements["preLink"] = {
                    type: "button",
                    x: 50,
                    y: UI.getScreenHeight() - 45,
                    bitmap: (guide.textures && guide.textures.preLink) || "pre_page",
                    scale: 3,
                    clicker: {
                        onClick: function () {
                            GuideAPI.arrowClick(GuideAPI.preLink)
                        }
                    }
                };
            }
        }

        if (this.container.isOpened()) {
            let content = this.container.getGuiContent().elements;

            for (let i in content) {
                if (i !== "close")
                    content[i] = null;
            }

            if (page.right) page.right.controller(page.right, content, this.container, "right");
            if (page.left) page.left.controller(page.left, content, this.container, "left");
            addLinks(content)

            for (let key in this.center_text) {
                var elem = this.container.getElement(key);
                let defaultX = elem.x;

                elem.x += 450 / 2 - elem.elementRect.width();
                alert("elem alignment " + elem.x);
            }
        } else {
            let elements = {
                "close": {
                    type: "closeButton",
                    x: 930,
                    y: 10,
                    bitmap: (guide.textures && guide.textures.close) || "btn_close",
                    scale: 3
                }
            };
            let guideGUI = new UI.StandartWindow({
                standart: {
                    background: {
                        bitmap: (guide.textures && guide.textures.background) || "guide_background",
                        color: android.graphics.Color.argb(256, 0, 0, 0),
                    }
                },
                drawing: [],
                elements: elements
            });

            if (guide.debug)
                guideGUI.setDebugEnabled(true);

            if (page.right) page.right.controller(page.right, elements, this.container, "right");
            if (page.left) page.left.controller(page.left, elements, this.container, "left");
            addLinks(elements);

            this.container.openAs(guideGUI);
        }
    },

    arrowClick: function (link) {
        GuideAPI.openPage(GuideAPI.openedGuide.pages[link]);
    }
};

EXPORT("GuideAPI", GuideAPI);