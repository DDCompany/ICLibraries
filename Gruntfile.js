module.exports = function (grunt) {
    const BACKPACK_API = "raw/backpack-api/";
    const BAUBLES_API = "raw/baubles-api/";
    const COPYRIGHT = "©DDCompany (https://vk.com/forestry_pe)";
    const TERMS_OF_USE = `Условия использования:
      - Запрещено распространение библиотеки на сторонних источниках
        без ссылки на официальное сообщество(https://vk.com/forestry_pe)
      - Запрещено изменение кода библиотеки
      - Запрещено явное копирование кода в другие библиотеки или моды
      - Используя библиотеку вы автоматически соглашаетесь с описанными
        выше условиями`;

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

    function getBaublesAPIBanner() {
        return `/*
     ____              _     _                    _____ _____ 
    |  _ \\            | |   | |             /\\   |  __ \\_   _|
    | |_) | __ _ _   _| |__ | | ___  ___   /  \\  | |__) || |  
    |  _ < / _\` | | | | '_ \\| |/ _ \\/ __| / /\\ \\ |  ___/ | |  
    | |_) | (_| | |_| | |_) | |  __/\\__ \\/ ____ \\| |    _| |_ 
    |____/ \\__,_|\\__,_|_.__/|_|\\___||___/_/    \\_\\_|   |_____|                                                  
                                         
    BaublesAPI library
     
    ${TERMS_OF_USE}
             
    ${COPYRIGHT}
*/

`;
    }

    grunt.initConfig({
        ts: {
            tests: {
                tsconfig: "dev/tsconfig.json"
            },

            backpackAPI: {
                tsconfig: `${BACKPACK_API}tsconfig.json`
            },

            baublesAPI: {
                tsconfig: `${BAUBLES_API}tsconfig.json`
            }
        },

        move: {
            declarations: {
                src: 'libs/*.d.ts',
                dest: 'dev/declarations/'
            }
        },

        "file-creator": {
            generateBanners: {
                [`${BACKPACK_API}banner.ts`]: function (fs, dist, done) {
                    fs.writeSync(dist, getBackpackAPIBanner());
                    done();
                },

                [`${BAUBLES_API}banner.ts`]: function (fs, dist, done) {
                    fs.writeSync(dist, getBaublesAPIBanner());
                    done();
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-move');
    grunt.loadNpmTasks('grunt-file-creator');
    grunt.registerTask('generateBanners', ['file-creator:generateBanners']);
    grunt.registerTask('backpack-api', ['ts:backpackAPI', 'move:declarations']);
    grunt.registerTask('baubles-api', ['ts:baublesAPI', 'move:declarations']);
    grunt.registerTask('tests', ['ts:tests']);
};