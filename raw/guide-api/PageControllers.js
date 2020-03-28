// noinspection ES6ConvertVarToLetConst
var PageControllers = {
    BASIC_PAGE: function (params, elements, container, section) {
        let globalSize = params.size || 13;

        if (section === "left")
            GuideHelper.drawTextArray(params.elements, 50, 40, globalSize, elements, section);
        else
            GuideHelper.drawTextArray(params.elements, 550, 40, globalSize, elements, section);
    },

    ITEM_PAGE: function (params, elements, container, section) {
        let globalSize = params.size || 13;
        let items = params.items;
        if (items) {
            let centerX = (section == "right" ? 450 : 500) / 2 - (items.length * 60);
            for (let index in items) {
                let item = items[index];
                if (item.id) {
                    let data = item.data || 0;
                    let x = section === "right" ? 660 : 140;

                    elements["slot_" + index + "_" + section] = {
                        type: "slot",
                        x: index == 0 ? x : x + centerX,
                        y: index == 0 ? 50 : 250,
                        size: index == 0 ? 200 : 60,
                        visual: true,
                        bitmap: "slot_empty",
                        isTransparentBackground: true
                    };
                    let slot = container.getSlot("slot_" + index + "_" + section);
                    slot.id = item.id;
                    slot.data = data;
                    slot.count = 1;

                    if (index > 0)
                        centerX += 60;
                }
            }
        }

        if (section === "left")
            GuideHelper.drawTextArray(params.elements, 50, items && items.length > 1 ? 310 : 260, globalSize, elements, section);
        else
            GuideHelper.drawTextArray(params.elements, 550, items && items.length > 1 ? 310 : 260, globalSize, elements, section);
    },

    OTO_RECIPE_PAGE: function (params, elements, container, section) {
        let globalSize = params.size || 13;
        let yp = 65;
        let xp = section == "left" ? 50 : 550;
        elements["oto_title_" + section] = {
            type: "text",
            x: xp,
            y: 40,
            text: params.title || "Furnace Recipe",
            font: {color: android.graphics.Color.BLACK, size: 20}
        };

        if (params.recipes) {
            for (let key in params.recipes) {
                let recipe = params.recipes[key];

                elements["slotInput_" + key + "_" + section] = {
                    type: "slot",
                    x: xp,
                    y: yp,
                    size: 70,
                    visual: true,
                    bitmap: "slot_empty",
                    isTransparentBackground: true
                };
                let slot_input = container.getSlot("slotInput_" + key + "_" + section);

                elements["oto_bar_" + key + "_" + section] = {
                    type: "image",
                    x: xp + 70,
                    y: yp + 10,
                    bitmap: params.bar_texture || "furnace_bar_guide",
                    scale: 3.2
                };

                elements["slotOutput_" + key + "_" + section] = {
                    type: "slot",
                    x: xp + 140,
                    y: yp,
                    size: 70,
                    visual: true,
                    bitmap: "slot_empty",
                    isTransparentBackground: true
                };
                let slot_output = container.getSlot("slotOutput_" + key + "_" + section);

                if (params.type === 0) {
                    slot_input.id = recipe.input.id;
                    slot_input.data = recipe.input.data || 0;
                    slot_input.count = recipe.input.count || 1;

                    slot_output.id = recipe.output.id;
                    slot_output.data = recipe.output.data || 0;
                    slot_output.count = recipe.output.count || 1;
                } else {
                    slot_input.id = recipe.id || 0;
                    slot_input.data = recipe.data || 0;
                    slot_input.count = recipe.count || 1;

                    var result = Recipes.getFurnaceRecipeResult(recipe.id, "iron");

                    if (result) {
                        slot_output.id = result.id;
                        slot_output.data = result.data;
                        slot_output.count = 1;
                    }
                }

                yp += 80;
            }
        }

        if (params.elements)
            GuideHelper.drawTextArray(params.elements, xp, yp, globalSize, elements, section);

    },

    GRID_3x3_PAGE: function (params, elements, container, section) {
        let globalSize = params.size || 13;
        let yp = 65;
        let xp = section == "left" ? 50 : 550;
        elements["grid_3x3_title_" + section] = {
            type: "text",
            x: xp,
            y: 50,
            text: params.title || "Workbench Recipe",
            font: {color: android.graphics.Color.BLACK, size: 20}
        };

        if (params.recipes) {
            for (let key in params.recipes) {
                let recipe = params.recipes[key];

                for (let i = 0; i < 3; i++) {
                    for (let k = 0; k < 3; k++) {
                        elements["slotInput_" + "_" + i + "_" + k + "_ " + key + "_" + section] = {
                            type: "slot",
                            x: xp + i * 60 + 5,
                            y: yp + k * 60 + 5,
                            size: 60,
                            visual: true
                        };
                        let slot = container.getSlot("slotInput_" + "_" + i + "_" + k + "_ " + key + "_" + section);
                        if (recipe.grid[i] && recipe.grid[k][i]) {
                            let item = recipe.materials[recipe.grid[k][i]];
                            if (item) {
                                slot.id = item.id;
                                slot.data = item.data || 0;
                                slot.count = item.count || 1;
                            }
                        }

                    }
                }

                elements["grid_3x3_bar_" + key + "_" + section] = {
                    type: "image",
                    x: xp + 195,
                    y: yp + 65,
                    bitmap: params.bar_texture || "furnace_bar_guide",
                    scale: 3.2
                };

                elements["grid_3x3_slotOutput_" + key + "_" + section] = {
                    type: "slot",
                    x: xp + 270,
                    y: yp + 65,
                    size: 60,
                    visual: true
                };
                let slot_output = container.getSlot("grid_3x3_slotOutput_" + key + "_" + section);
                let result = recipe.result;

                if (result) {
                    slot_output.id = result.id;
                    slot_output.data = result.data || 0;
                    slot_output.count = result.count || 1;
                }

                yp += 195;
            }
        }

        if (params.elements)
            GuideHelper.drawTextArray(params.elements, xp, yp, globalSize, elements, section);

    },

    ITEM_GRID_PAGE: function (params, elements, container, section) {
        let globalSize = params.size || 13;
        let yp = 65;
        let xp = section == "left" ? 40 : 550;
        let item_size = params.item_size || 60;
        let columns = params.columns || 6;
        elements["grid_page_title_" + section] = {
            type: "text",
            x: xp,
            y: 50,
            text: params.title || "Grid Page",
            font: {color: android.graphics.Color.BLACK, size: 20}
        };

        if (params.items) {
            let padding = (530 - item_size * columns) / columns + item_size;
            let xp2 = xp;
            let it = 0;
            for (let index in params.items) {
                let item = params.items[index];

                elements["grid_page_" + index + "_" + section] = {
                    type: "slot",
                    x: xp2,
                    y: yp,
                    size: item_size,
                    visual: true,
                    bitmap: "slot_empty",
                    isTransparentBackground: true
                };

                if (item.link) {
                    elements["grid_page_" + index + "_" + section].clicker = {
                        onClick: function () {
                            GuideAPI.openPage(GuideAPI.openedGuide.pages[item.link]);
                        }
                    };
                } else if (item.clicker) {
                    elements["grid_page_" + index + "_" + section].clicker = item.clicker;
                }

                let slot = container.getSlot("grid_page_" + index + "_" + section);
                slot.id = item.id;
                slot.data = item.data || 0;
                slot.count = item.count || 1;

                if (it == columns || index == params.items.length - 1) {
                    xp2 = xp;
                    yp += item_size + 10;
                    it = 0;
                } else {
                    xp2 += padding;
                    it++;
                }
            }
        }

        if (params.elements)
            GuideHelper.drawTextArray(params.elements, xp, yp, globalSize, elements, section);

    }
};

EXPORT("PageControllers", PageControllers);