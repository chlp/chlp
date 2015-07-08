/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
            {name: 'Cameroon', continent: 'Africa'},
            {name :'Fiji Islands', continent: 'Oceania'},
            {name: 'Guatemala', continent: 'North America'},
            {name: 'Japan', continent: 'Asia'},
            {name: 'Yugoslavia', continent: 'Europe'},
            {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
            {name: 'Bamenda', country: 'Cameroon'},
            {name: 'Suva', country: 'Fiji Islands'},
            {name: 'Quetzaltenango', country: 'Guatemala'},
            {name: 'Osaka', country: 'Japan'},
            {name: 'Subotica', country: 'Yugoslavia'},
            {name: 'Zanzibar', country: 'Tanzania'},
        ],
        '/populations': [
            {count: 138000, name: 'Bamenda'},
            {count: 77366, name: 'Suva'},
            {count: 90801, name: 'Quetzaltenango'},
            {count: 2595674, name: 'Osaka'},
            {count: 100386, name: 'Subotica'},
            {count: 157634, name: 'Zanzibar'}
        ]
    };

    setTimeout(function () {
        var result = RESPONSES[url];
        if (!result) {
            return callback('Unknown url');
        }

        callback(null, result);
    }, Math.round(Math.random * 1000));
}

/**
 * Ваши изменения ниже
 */
var requests = ['/countries', '/cities', '/populations'],
    responses = {},
    i, request, name, interval;

/**
 * 1. Внутри цикла for не создается локальная область видимости,
 * поэтому для всех трех request'ов будет назначен один callback
 * (последний определенный, с request'ом 'populations').
 * Нужно в каждую getData передать собственный callback.
 *
 * Также внутри цикла функции callback переопределялась переменная i,
 * таким образом, в случае возможного последующего изменения логики
 * >        if (l.length == 3) {
 * выход из внешнего цикла
 * >for (i = 0; i < 3; i++) {
 * может произойти неправильно, т.к. i будет равняться
 * responses['/populations'].length.
 *
 * Аналогично i могут возникнуть проблемы еще и с K и с j, т.к. и они
 * беруться из глобальной области видимости, но каких-то явных
 * сценариев проблемы не могу представить.
 *
 * После учета выделенных проблем код заработает, но логике с
 * помещением результата в глобальную переменную responses
 * и обработке общего результата здесь явно не место, поэтому
 * вынесу ее в отдельную «агрегирующую» функцию aggregator
 */

/**
 * Получить страны на континенте по данным в ответе responses['/cities']
 * @param   {string} continent
 * @param   {object} responses
 * @returns {string[]}
 */
function getCountriesOnContinent(continent, responses) {
    var countries = [];

    if (typeof responses !== 'object' || !Array.isArray(responses['/countries'])) {
        return [];
    }

    responses['/countries'].forEach(function (countryObj) {
        if (countryObj.continent === continent) {
            countries.push(countryObj.name);
        }
    });

    return countries;
}

/**
 * Получить города в стране по данным в ответе responses['/cities']
 * @param   {string} country
 * @param   {object} responses
 * @returns {string[]}
 */
function getCitiesInCountry(country, responses) {
    var cities = [];

    if (typeof responses !== 'object' || !Array.isArray(responses['/cities'])) {
        return [];
    }

    responses['/cities'].forEach(function (cityObj) {
        if (cityObj.country === country) {
            cities.push(cityObj.name);
        }
    });

    return cities;
}

/**
 * Получить популяцию в городе по данным в ответе responses['/populations']
 * @param   {string} city
 * @param   {object} responses
 * @returns {string[]}
 */
function getPopulationInCity(city, responses) {
    var population = 0;

    if (typeof responses !== 'object' || !Array.isArray(responses['/populations'])) {
        return 0;
    }

    responses['/populations'].forEach(function (populationObj) {
        if (populationObj.name === city) {
            population += populationObj.count;
        }
    });

    return population;
}

/**
 * Обработать полученные результаты, слившиеся в экстазе в объекте responses
 * @param {object} responses
 * @param {number} requestsCount
 */
function aggregator(responses, requestsCount) {
    var responsesKey, responsesLength = 0,
        p = 0;

    for (responsesKey in responses) {
        ++responsesLength;
    }

    if (responsesLength === requestsCount) {
        getCountriesOnContinent('Africa', responses).forEach(function (country) {
            getCitiesInCountry(country, responses).forEach(function (city) {
                p += getPopulationInCity(city, responses);
            });
        });

        console.log('Total population in African cities: ' + p);
    }
}

/**
 * Получение функции callback для конкретного запроса
 * @param   {string} request
 * @param   {number} requestsCount
 * @param   {object} responses
 * @returns {function}
 */
function getCallbackFunction(request, requestsCount, responses) {
    return function (error, result) {
        responses[request] = result;
        aggregator(responses, requestsCount);
    };
}

for (i = 0; i < requests.length; i++) {
    request = requests[i];
    getData(request, getCallbackFunction(request, requests.length, responses));
}


/**
 * Запросить у пользователя наименование места и выплюнуть в консоль население.
 * Сначала проверяем страну с введенным местом.
 * Если страны нет, то ищем город.
 * Если население 0, то говорим о том, что населения по данному месту нет.
 * @param {responses} responses
 */
function promptCountryOrCity(responses) {
    var cities, p = 0;

    name = window.prompt('Введите название страны или города, а мы покажем численность населения.');

    cities = getCitiesInCountry(name, responses);
    if (cities.length !== 0) {
        cities.forEach(function (city) {
            p += getPopulationInCity(city, responses);
        });
        console.log('В стране ' + name + ' население ' + p);
        return; // -->
    }

    p = getPopulationInCity(name, responses);
    if (p !== 0) {
        console.log('В городе ' + name + ' население ' + p);
        return; // -->
    }

    console.log('В месте ' + name + ' население не найдено');
}

interval = setInterval(function () {
    var responsesKey, responsesLength = 0;
    for (responsesKey in responses) {
        ++responsesLength;
    }

    // Дожидаемся, когда придут все ответы
    if (responsesLength === requests.length) {
        clearInterval(interval);
        promptCountryOrCity(responses);
    }
}, 15);

