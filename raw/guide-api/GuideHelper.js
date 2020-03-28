// noinspection ES6ConvertVarToLetConst
var GuideHelper = {
    drawTextArray: function (array, x, y, globalSize, elements, section) {
        for (let i in array) {
            let line = array[i];
            let alignment = line.alignment;
            let text = line.text;
            let size = line.size || globalSize;
            let maxCharsInLine = Math.floor(310 / (size / 2));
            let separators = 0;

            if (text.length > maxCharsInLine) {
                for (let ch = 0; ch <= text.length; ch++) {
                    if (ch == 0 || ch % maxCharsInLine !== 0)
                        continue;

                    text = text.slice(0, ch) + "\n" + text.slice(ch, text.length);
                    separators++;
                }
            }

            let xp = x;

            elements[section + "_" + i] = {
                type: "text",
                x: x,
                y: y,
                text: text,
                font: {
                    color: line.color || android.graphics.Color.BLACK,
                    size: size,
                    bold: line.bold || false,
                    underline: line.underline || false
                },
                multiline: true
            };

            if (line.link) {
                elements[section + "_" + i].clicker = {
                    onClick: function () {
                        GuideAPI.openPage(GuideAPI.openedGuide.pages[line.link]);
                    }
                };
            }

            y += size * (separators > 0 ? separators + 2 : 1) + 5;
        }
    }

};

EXPORT("GuideHelper", GuideHelper);