LIBRARY({
    name: "AchievementsAPI",
    version: 0,
    shared: true,
    api: "CoreEngine"
});

const IllegalArgumentException = java.lang.IllegalArgumentException;

function translateField(field: ITranslatable) {
    if (field.translate) {
        const translation = Translation.translate(field.translate);
        return translation === field.translate ? field.text : translation;
    }

    return field.text;
}