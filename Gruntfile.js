module.exports = function (grunt) {
    const COPYRIGHT = "©DDCompany (https://vk.com/forestry_pe)";
    const TERMS_OF_USE = `Условия использования:
      - Заперещено распространие библиотеки на сторонних источниках
        без ссылки на официальное сообщество(https://vk.com/forestry_pe)
      - Запрещено измение кода библиотеки
      - Запрещено явное копирование кода в другие библиотеки или моды
      - Используя библиотеку вы автоматически соглашаетесь с описанными
        выше условиями`;

    function getGuideAPIBanner() {
        return `/*
     _____         _      _         ___  ______  _____
    |  __ \\       (_)    | |       / _ \\ | ___ \\|_   _|
    | |  \\/ _   _  _   __| |  ___ / /_\\ \\| |_/ /  | |
    | | __ | | | || | / _\` | / _ \\|  _  ||  __/   | |
    | |_\\ \\| |_| || || (_| ||  __/| | | || |     _| |_
    \\____/ \\__,_||_| \\__,_| \\___|\\_| |_/\\_|     \\___/
                
    GuideAPI library
     
    ${TERMS_OF_USE}
             
    ${COPYRIGHT}
*/

`;
    }

    function getAchievementsAPIBanner() {
        return `/*
        _        _     _                                     _          _    ____ ___
       / \\   ___| |__ (_) _____   _____ _ __ ___   ___ _ __ | |_ ___   / \\  |  _ \\_ _|
      / _ \\ / __| '_ \\| |/ _ \\ \\ / / _ \\ '_ \` _ \\ / _ \\ '_ \\| __/ __| / _ \\ | |_) | |
     / ___ \\ (__| | | | |  __/\\ V /  __/ | | | | |  __/ | | | |_\\__ \\/ ___ \\|  __/| |
    /_/   \\_\\___|_| |_|_|\\___| \\_/ \\___|_| |_| |_|\\___|_| |_|\\__|___/_/   \\_\\_|  |___|

    AchievementsAPI library
     
    ${TERMS_OF_USE}
             
    ${COPYRIGHT}
*/

`;
    }

    function getBackpackAPIBanner() {
        return `/*
     ____             _                     _        _    ____ ___ 
    | __ )  __ _  ___| | ___ __   __ _  ___| | __   / \\  |  _ \\_ _|
    |  _ \\ / _\` |/ __| |/ / '_ \\ / _\` |/ __| |/ /  / _ \\ | |_) | | 
    | |_) | (_| | (__|   <| |_) | (_| | (__|   <  / ___ \\|  __/| | 
    |____/ \\__,_|\\___|_|\\_\\ .__/ \\__,_|\\___|_|\\_\\/_/   \\_\\_|  |___|
                                         
    BackpackAPI library
     
    ${TERMS_OF_USE}
             
    ${COPYRIGHT}
*/

`;
    }

    grunt.initConfig({
        concat: {
            guideAPI: {
                options: {
                    banner: getGuideAPIBanner(),
                },
                src: [
                    'raw/guide-api/header.js',
                    'raw/guide-api/GuideAPI.js',
                    'raw/guide-api/GuideHelper.js',
                    'raw/guide-api/PageControllers.js',
                ],
                dest: 'libs/GuideAPI.js',
            },

            achievementsAPI: {
                options: {
                    banner: getAchievementsAPIBanner(),
                },
                src: [
                    'raw/achievements-api/header.js',
                    'raw/achievements-api/AchievementAPI.js',
                    'raw/achievements-api/AchievementPopup.js',
                    'raw/achievements-api/translation.js',
                    'raw/achievements-api/commands.js',
                ],
                dest: 'libs/AchievementsAPI.js',
            }
        },

        ts: {
            tests: {
                tsconfig: "dev/tsconfig.json"
            },

            backpackAPI: {
                tsconfig: "raw/backpack-api/tsconfig.json"
            }
        },

        move: {
            declarations: {
                src: 'libs/*.d.ts',
                dest: 'dev/declarations/'
            }
        },

        "file-creator": {
            backpackAPIBanner: {
                "raw/backpack-api/banner.ts": function (fs, dist, done) {
                    fs.writeSync(dist, getBackpackAPIBanner());
                    done();
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-move');
    grunt.loadNpmTasks('grunt-file-creator');
    grunt.registerTask('guide-api', ['concat:guideAPI']);
    grunt.registerTask('achievements-api', ['concat:achievementsAPI']);
    grunt.registerTask('backpack-api', ['file-creator:backpackAPIBanner', 'ts:backpackAPI', 'move:declarations']);
    grunt.registerTask('tests', ['ts:tests']);
};